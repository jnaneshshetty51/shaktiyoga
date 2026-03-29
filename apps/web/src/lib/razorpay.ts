import Razorpay from 'razorpay';
import crypto from 'crypto';

// ─── Razorpay singleton client ────────────────────────────────────────────────

const globalForRazorpay = globalThis as unknown as { razorpay: Razorpay | undefined };

export const razorpay =
  globalForRazorpay.razorpay ??
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
  });

if (process.env.NODE_ENV !== 'production') globalForRazorpay.razorpay = razorpay;

// ─── Signature verification ───────────────────────────────────────────────────

/**
 * Verify Razorpay payment signature after checkout.
 * Called on POST /api/payments/verify
 */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(body)
    .digest('hex');
  return expectedSignature === razorpaySignature;
}

/**
 * Verify Razorpay webhook signature.
 * Must be called with the raw request body (string), not parsed JSON.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
    .update(rawBody)
    .digest('hex');
  return expectedSignature === signature;
}

/**
 * Verify Razorpay subscription payment signature.
 */
export function verifySubscriptionSignature(
  razorpayPaymentId: string,
  razorpaySubscriptionId: string,
  razorpaySignature: string
): boolean {
  const body = `${razorpayPaymentId}|${razorpaySubscriptionId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(body)
    .digest('hex');
  return expectedSignature === razorpaySignature;
}

// ─── Invoice number generation ────────────────────────────────────────────────

let invoiceCounter = 0;

export function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  invoiceCounter = (invoiceCounter + 1) % 10000;
  const seq = String(Date.now()).slice(-6);
  return `INV-${year}${month}-${seq}`;
}
