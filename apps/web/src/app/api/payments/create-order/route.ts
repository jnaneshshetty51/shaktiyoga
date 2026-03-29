import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { razorpay, generateInvoiceNumber } from '@/lib/razorpay';

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order for a one-time membership purchase.
 */
export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { membershipId } = await request.json();
    if (!membershipId) {
      return NextResponse.json({ error: 'membershipId is required' }, { status: 400 });
    }

    const membership = await prisma.membership.findUnique({
      where: { id: membershipId, isActive: true },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Membership plan not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Amount in paise (1 INR = 100 paise)
    const amountPaise = Math.round(membership.price * 100);

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: membership.currency || 'INR',
      receipt: generateInvoiceNumber(),
      notes: {
        userId,
        membershipId,
        membershipName: membership.name,
      },
    });

    // Store pending payment in DB
    await prisma.payment.create({
      data: {
        userId,
        amount: membership.price,
        currency: membership.currency || 'INR',
        status: 'PENDING',
        razorpayOrderId: order.id,
        description: `Membership: ${membership.name}`,
        metadata: { membershipId, orderId: order.id },
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: amountPaise,
      currency: membership.currency || 'INR',
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      membership: {
        id: membership.id,
        name: membership.name,
        planType: membership.planType,
        durationDays: membership.durationDays,
      },
      prefill: {
        name: user.name,
        email: user.email ?? '',
        contact: user.phone ?? '',
      },
    });
  } catch (error) {
    console.error('[api/payments/create-order]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
