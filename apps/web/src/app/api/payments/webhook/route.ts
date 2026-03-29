import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature, generateInvoiceNumber } from '@/lib/razorpay';
import { sendPushToUser } from '@/lib/push';

// Must use raw body for HMAC verification — disable JSON parsing
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Read raw body as string for HMAC verification
  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature') ?? '';

  // Verify webhook signature
  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn('[webhook/razorpay] Invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event: { event: string; payload: any };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { event: eventName, payload } = event;

  try {
    switch (eventName) {
      // ─── One-time payment captured ────────────────────────────────────────
      case 'payment.captured': {
        const payment = payload.payment?.entity;
        if (!payment?.order_id) break;

        await prisma.payment.updateMany({
          where: { razorpayOrderId: payment.order_id, status: { in: ['PENDING'] } },
          data: {
            status: 'CAPTURED',
            razorpayPaymentId: payment.id,
            invoiceNumber: generateInvoiceNumber(),
          },
        });
        break;
      }

      // ─── Payment failed ───────────────────────────────────────────────────
      case 'payment.failed': {
        const payment = payload.payment?.entity;
        if (!payment?.order_id) break;

        const failedPayment = await prisma.payment.findFirst({
          where: { razorpayOrderId: payment.order_id },
          include: { user: { select: { expoPushToken: true, name: true } } },
        });

        await prisma.payment.updateMany({
          where: { razorpayOrderId: payment.order_id },
          data: {
            status: 'FAILED',
            failureReason: payment.error_description ?? 'Payment failed',
          },
        });

        if (failedPayment?.user.expoPushToken) {
          sendPushToUser(
            failedPayment.user.expoPushToken,
            'Payment failed',
            'Your payment could not be processed. Please try again.',
            { type: 'PAYMENT_FAILED', orderId: payment.order_id }
          ).catch(() => {});
        }
        break;
      }

      // ─── Subscription payment charged ─────────────────────────────────────
      case 'subscription.charged': {
        const sub = payload.subscription?.entity;
        const payment = payload.payment?.entity;
        if (!sub?.id || !payment?.id) break;

        // Find member with this Razorpay subscription ID
        const subscription = await prisma.subscription.findFirst({
          where: { billingProviderId: sub.id },
          include: { user: { select: { id: true, expoPushToken: true } } },
        });

        if (!subscription) break;

        // Record new payment
        const renewalDate = new Date();
        renewalDate.setMonth(renewalDate.getMonth() + 1);

        await prisma.payment.create({
          data: {
            userId: subscription.userId,
            subscriptionId: subscription.id,
            amount: payment.amount / 100,
            currency: payment.currency ?? 'INR',
            status: 'CAPTURED',
            razorpayPaymentId: payment.id,
            razorpaySubscriptionId: sub.id,
            invoiceNumber: generateInvoiceNumber(),
            description: 'Subscription renewal',
          },
        });

        // Extend subscription renewal date
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            renewalDate,
            status: 'ACTIVE',
          },
        });

        if (subscription.user.expoPushToken) {
          sendPushToUser(
            subscription.user.expoPushToken,
            'Membership renewed',
            'Your membership has been renewed successfully.',
            { type: 'SUBSCRIPTION_CHARGED' }
          ).catch(() => {});
        }
        break;
      }

      // ─── Subscription halted (payment failed 3+ times) ───────────────────
      case 'subscription.halted': {
        const sub = payload.subscription?.entity;
        if (!sub?.id) break;

        const subscription = await prisma.subscription.findFirst({
          where: { billingProviderId: sub.id },
          include: { user: { select: { expoPushToken: true } } },
        });

        if (!subscription) break;

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'PAUSED' },
        });

        if (subscription.user.expoPushToken) {
          sendPushToUser(
            subscription.user.expoPushToken,
            'Membership suspended',
            'We could not process your renewal payment. Please update your payment method.',
            { type: 'SUBSCRIPTION_HALTED' }
          ).catch(() => {});
        }
        break;
      }

      // ─── Subscription cancelled ───────────────────────────────────────────
      case 'subscription.cancelled': {
        const sub = payload.subscription?.entity;
        if (!sub?.id) break;

        await prisma.subscription.updateMany({
          where: { billingProviderId: sub.id },
          data: { status: 'CANCELLED', cancelledAt: new Date() },
        });
        break;
      }

      default:
        // Acknowledge other events without processing
        break;
    }
  } catch (err) {
    console.error(`[webhook/razorpay] Error handling ${eventName}:`, err);
    // Return 200 to Razorpay so it doesn't retry (we log for investigation)
  }

  return NextResponse.json({ received: true });
}
