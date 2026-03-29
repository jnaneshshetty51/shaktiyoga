import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPaymentSignature, generateInvoiceNumber } from '@/lib/razorpay';
import { sendPushToUser } from '@/lib/push';

/**
 * POST /api/payments/verify
 * Verifies Razorpay payment signature after checkout and activates membership.
 */
export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, membershipId } =
      await request.json();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !membershipId) {
      return NextResponse.json({ error: 'Missing required payment fields' }, { status: 400 });
    }

    // Verify HMAC signature
    const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const membership = await prisma.membership.findUnique({ where: { id: membershipId } });
    if (!membership) {
      return NextResponse.json({ error: 'Membership plan not found' }, { status: 404 });
    }

    const invoiceNumber = generateInvoiceNumber();
    const startDate = new Date();
    const renewalDate = new Date(startDate);
    renewalDate.setDate(renewalDate.getDate() + membership.durationDays);

    // Update payment record to CAPTURED
    await prisma.payment.updateMany({
      where: { razorpayOrderId, userId },
      data: {
        status: 'CAPTURED',
        razorpayPaymentId,
        razorpaySignature,
        invoiceNumber,
      },
    });

    // Upsert Subscription
    const newRole =
      membership.planType === 'EVERYDAY_YOGA' ? 'MEMBER_EVERYDAY' : 'MEMBER_THERAPY';

    await prisma.$transaction([
      prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          planType: membership.planType,
          amount: membership.price,
          currency: membership.currency,
          status: 'ACTIVE',
          startDate,
          renewalDate,
          billingProviderId: razorpayPaymentId,
        },
        update: {
          planType: membership.planType,
          amount: membership.price,
          status: 'ACTIVE',
          startDate,
          renewalDate,
          billingProviderId: razorpayPaymentId,
          cancelledAt: null,
          cancelReason: null,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
      }),
    ]);

    // Send push notification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { expoPushToken: true, name: true },
    });

    if (user?.expoPushToken) {
      sendPushToUser(
        user.expoPushToken,
        'Membership activated!',
        `Welcome! Your ${membership.name} membership is now active until ${renewalDate.toLocaleDateString('en-IN')}.`,
        { type: 'PAYMENT_SUCCESS', membershipId }
      ).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and membership activated',
      membership: {
        name: membership.name,
        planType: membership.planType,
        renewalDate: renewalDate.toISOString(),
      },
      invoiceNumber,
    });
  } catch (error) {
    console.error('[api/payments/verify]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
