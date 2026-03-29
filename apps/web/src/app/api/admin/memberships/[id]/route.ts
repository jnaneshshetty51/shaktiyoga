import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name, planType, durationDays, price, currency,
      classesPerWeek, sessionsTotal, description, features,
      razorpayPlanId, isActive,
    } = body;

    const membership = await prisma.membership.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(planType !== undefined && { planType }),
        ...(durationDays !== undefined && { durationDays }),
        ...(price !== undefined && { price }),
        ...(currency !== undefined && { currency }),
        ...(classesPerWeek !== undefined && { classesPerWeek }),
        ...(sessionsTotal !== undefined && { sessionsTotal }),
        ...(description !== undefined && { description }),
        ...(features !== undefined && { features }),
        ...(razorpayPlanId !== undefined && { razorpayPlanId }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ membership });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 });
    }
    console.error('[admin/memberships/[id] PUT]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.membership.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ message: 'Membership plan deactivated' });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
