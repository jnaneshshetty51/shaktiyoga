import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { razorpay } from '@/lib/razorpay';

/**
 * POST /api/payments/create-subscription
 * Creates a Razorpay auto-debit subscription for a recurring membership.
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

    if (!membership.razorpayPlanId) {
      return NextResponse.json(
        { error: 'This membership does not support auto-debit. Use one-time payment.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, razorpayCustomerId: true },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Create or reuse Razorpay customer
    let customerId = user.razorpayCustomerId;
    if (!customerId) {
      const customer = await razorpay.customers.create({
        name: user.name,
        email: user.email ?? '',
        contact: user.phone ?? '',
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { razorpayCustomerId: customerId },
      });
    }

    // Create Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: membership.razorpayPlanId,
      customer_notify: 1,
      quantity: 1,
      total_count: 12, // Max 12 billing cycles (1 year for monthly)
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      membership: {
        id: membership.id,
        name: membership.name,
        price: membership.price,
      },
      prefill: {
        name: user.name,
        email: user.email ?? '',
        contact: user.phone ?? '',
      },
    });
  } catch (error) {
    console.error('[api/payments/create-subscription]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
