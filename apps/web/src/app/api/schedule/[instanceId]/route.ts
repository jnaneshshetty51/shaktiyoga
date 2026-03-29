import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  try {
    const { instanceId } = await params;
    const userId = request.headers.get('x-user-id');

    const inst = await prisma.classInstance.findUnique({
      where: { id: instanceId },
      include: {
        batch: {
          include: {
            teacher: { select: { id: true, name: true } },
          },
        },
        _count: {
          select: {
            classBookings: { where: { status: 'CONFIRMED' } },
          },
        },
        ...(userId && {
          classBookings: {
            where: { userId, status: { in: ['CONFIRMED'] } },
            select: { id: true },
            take: 1,
          },
          waitlist: {
            where: { userId, status: 'WAITING' },
            select: { id: true, position: true },
            take: 1,
          },
        }),
      },
    });

    if (!inst) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const bookedCount = inst._count.classBookings;
    const userBooking = userId ? (inst as any).classBookings?.[0] : null;
    const waitlistEntry = userId ? (inst as any).waitlist?.[0] : null;

    return NextResponse.json({
      instance: {
        id: inst.id,
        batchId: inst.batchId,
        batchName: inst.batch.name,
        planType: inst.batch.planType,
        date: inst.date.toISOString(),
        durationMins: inst.batch.durationMins,
        teacher: inst.batch.teacher.name,
        teacherId: inst.batch.teacher.id,
        capacity: inst.capacity,
        bookedCount,
        isFull: bookedCount >= inst.capacity,
        meetingLink: inst.meetingLink ?? inst.batch.meetingLink,
        status: inst.status,
        description: inst.batch.description,
        isUserBooked: userId ? Boolean(userBooking) : undefined,
        userBookingId: userBooking?.id,
        userWaitlistPosition: waitlistEntry?.position,
      },
    });
  } catch (error) {
    console.error('[api/schedule/[instanceId] GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
