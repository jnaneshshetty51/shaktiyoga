import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/payments/manual
 * Records a manual (cash/offline) payment for a member.
 * Requires STAFF_ADMIN or SUPER_ADMIN role.
 */
export async function POST(request: Request) {
  const userRole = request.headers.get('x-user-role');
  if (!['STAFF_ADMIN', 'SUPER_ADMIN'].includes(userRole ?? '')) {
    return NextResponse.json({ error: 'Forbidden: admin role required' }, { status: 403 });
  }

  const adminId = request.headers.get('x-user-id')!;

  try {
    const { identifier, amount, note } = await request.json();

    if (!identifier || !amount) {
      return NextResponse.json(
        { error: 'identifier (phone or email) and amount are required' },
        { status: 400 }
      );
    }

    const member = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: identifier },
          { email: identifier },
        ],
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const payment = await prisma.payment.create({
      data: {
        userId: member.id,
        amount: parseFloat(String(amount)),
        currency: 'INR',
        status: 'CAPTURED',
        invoiceNumber,
        metadata: {
          method: 'MANUAL',
          recordedBy: adminId,
          note: note ?? '',
        },
      },
    });

    return NextResponse.json({ payment, invoiceNumber }, { status: 201 });
  } catch (error) {
    console.error('[admin/payments/manual POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
