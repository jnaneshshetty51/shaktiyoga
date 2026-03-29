import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** GET /api/payments/my — member's payment history */
export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        razorpayPaymentId: true,
        invoiceNumber: true,
        invoiceUrl: true,
        description: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('[api/payments/my GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
