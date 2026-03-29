import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/bookings/my
 * Returns the authenticated member's upcoming and past bookings.
 */
export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'upcoming' | 'past' | null (all)

    const now = new Date();

    const bookings = await prisma.classBooking.findMany({
      where: {
        userId,
        status: { in: ['CONFIRMED', 'CANCELLED', 'NO_SHOW', 'COMPLETED'] },
        ...(filter === 'upcoming' && { instance: { date: { gte: now }, status: { in: ['SCHEDULED', 'LIVE'] } } }),
        ...(filter === 'past' && { instance: { date: { lt: now } } }),
      },
      include: {
        instance: {
          include: {
            batch: {
              include: {
                teacher: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { instance: { date: filter === 'past' ? 'desc' : 'asc' } },
      take: 50,
    });

    const result = bookings.map((b) => ({
      id: b.id,
      status: b.status,
      bookedAt: b.bookedAt.toISOString(),
      cancelledAt: b.cancelledAt?.toISOString() ?? null,
      instance: {
        id: b.instance.id,
        batchName: b.instance.batch.name,
        planType: b.instance.batch.planType,
        date: b.instance.date.toISOString(),
        durationMins: b.instance.batch.durationMins,
        teacher: b.instance.batch.teacher.name,
        meetingLink: b.instance.meetingLink ?? b.instance.batch.meetingLink,
        instanceStatus: b.instance.status,
      },
    }));

    return NextResponse.json({ bookings: result });
  } catch (error) {
    console.error('[api/bookings/my GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
