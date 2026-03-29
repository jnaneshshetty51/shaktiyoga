import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyOtp } from '@/lib/redis';
import {
  signToken,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from '@/lib/auth';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, code, deviceId, deviceType } = body as {
      phone?: string;
      code?: string;
      deviceId?: string;
      deviceType?: 'ios' | 'android' | 'web';
    };

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone and OTP code are required' }, { status: 400 });
    }

    // Normalize phone
    const normalized = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;

    // Verify OTP from Redis
    const isValid = await verifyOtp(normalized, code);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
    }

    // Upsert user by phone number
    const user = await prisma.user.upsert({
      where: { phone: normalized },
      create: {
        phone: normalized,
        phoneVerified: true,
        name: normalized, // Will be updated during onboarding
        role: 'TRIAL',
      },
      update: {
        phoneVerified: true,
        lastLogin: new Date(),
      },
    });

    // Issue tokens
    const accessToken = await signToken(
      { id: user.id, phone: user.phone, role: user.role, name: user.name },
      'access'
    );

    const refreshToken = await signToken(
      { id: user.id, jti: crypto.randomUUID() },
      'refresh'
    );

    // Create DeviceSession
    const ua = request.headers.get('user-agent') ?? undefined;
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ??
      request.headers.get('x-real-ip') ??
      undefined;

    await prisma.deviceSession.create({
      data: {
        userId: user.id,
        refreshToken,
        deviceType: deviceType ?? 'web',
        deviceId: deviceId,
        userAgent: ua,
        ipAddress: ip,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const cookieStore = await cookies();
    cookieStore.set('token', accessToken, getAccessTokenCookieOptions());
    cookieStore.set('refresh_token', refreshToken, getRefreshTokenCookieOptions());

    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      message: 'Logged in successfully',
    });
  } catch (error) {
    console.error('[auth/otp/verify] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
