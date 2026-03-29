import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkOtpRateLimit, setOtp } from '@/lib/redis';

// ─── MSG91 OTP sender ─────────────────────────────────────────────────────────

async function sendSmsOtp(phone: string, otp: string): Promise<boolean> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID_OTP;
  const senderId = process.env.MSG91_SENDER_ID || 'YOGASF';

  if (!authKey || !templateId) {
    // Development fallback: log OTP to console
    console.log(`[OTP DEV] Phone: ${phone} → OTP: ${otp}`);
    return true;
  }

  try {
    const url = new URL('https://control.msg91.com/api/v5/otp');
    url.searchParams.set('template_id', templateId);
    url.searchParams.set('mobile', phone);
    url.searchParams.set('authkey', authKey);
    url.searchParams.set('otp', otp);
    url.searchParams.set('sender', senderId);

    const res = await fetch(url.toString(), { method: 'GET' });
    const data = await res.json();

    if (data.type === 'success') return true;

    console.error('[OTP] MSG91 error:', data);
    return false;
  } catch (err) {
    console.error('[OTP] MSG91 request failed:', err);
    return false;
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body as { phone?: string };

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Normalize phone to E.164 (assume +91 if no country code for India)
    const normalized = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;

    if (normalized.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    // Rate limit: max 3 OTPs per 10 minutes per phone
    const allowed = await checkOtpRateLimit(normalized);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many OTP requests. Please wait 10 minutes and try again.' },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const otp = String(crypto.randomInt(100000, 999999));

    // Store in Redis (5-minute TTL)
    await setOtp(normalized, otp);

    // Send via MSG91
    const sent = await sendSmsOtp(normalized, otp);
    if (!sent) {
      return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      // Only include OTP in development mode for testing
      ...(process.env.NODE_ENV === 'development' && { otp }),
    });
  } catch (error) {
    console.error('[auth/otp/send] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
