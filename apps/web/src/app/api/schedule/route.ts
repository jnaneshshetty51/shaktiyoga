import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { daysFromNow } from '@/lib/scheduling';
import type { ClassInstanceDTO } from '@yogastudio/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/schedule
 * Public endpoint — returns upcoming class instances.
 *
 * Query params:
 *   from     ISO date string (default: today)
 *   to       ISO date string (default: 7 days from now)
 *   planType EVERYDAY_YOGA | YOGA_THERAPY | TRIAL
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const from = searchParams.get('from')
      ? new Date(searchParams.get('from')!)
      : new Date();

    const to = searchParams.get('to')
      ? new Date(searchParams.get('to')!)
      : daysFromNow(7);

    const planType = searchParams.get('planType') as
      | 'EVERYDAY_YOGA'
      | 'YOGA_THERAPY'
      | 'TRIAL'
      | null;

    // Get requesting user ID from middleware-injected header (null if public)
    const userId = request.headers.get('x-user-id');

    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    const instances = await prisma.classInstance.findMany({
      where: {
        date: { gte: from, lte: to },
        status: { in: ['SCHEDULED', 'LIVE'] },
        ...(planType && { batch: { planType } }),
      },
      include: {
        batch: {
          include: {
            teacher: { select: { id: true, name: true } },
          },
        },
        _count: {
          select: {
            classBookings: {
              where: { status: { in: ['CONFIRMED'] } },
            },
          },
        },
        // If user is logged in, check their booking status
        ...(userId && {
          classBookings: {
            where: { userId, status: { in: ['CONFIRMED'] } },
            select: { id: true, status: true },
            take: 1,
          },
          waitlist: {
            where: { userId, status: 'WAITING' },
            select: { position: true },
            take: 1,
          },
        }),
      },
      orderBy: { date: 'asc' },
    });

    const result: ClassInstanceDTO[] = instances.map((inst) => {
      const bookedCount = inst._count.classBookings;
      const isFull = bookedCount >= inst.capacity;
      const startTime = new Date(inst.date).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      });
      const endMs = inst.date.getTime() + inst.batch.durationMins * 60 * 1000;
      const endTime = new Date(endMs).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      });

      const userBooking = userId
        ? (inst as any).classBookings?.[0] ?? null
        : null;
      const waitlistEntry = userId
        ? (inst as any).waitlist?.[0] ?? null
        : null;

      return {
        id: inst.id,
        batchId: inst.batchId,
        batchName: inst.batch.name,
        planType: inst.batch.planType,
        date: inst.date.toISOString(),
        startTime,
        endTime,
        durationMins: inst.batch.durationMins,
        teacher: inst.batch.teacher.name,
        teacherId: inst.batch.teacher.id,
        capacity: inst.capacity,
        bookedCount,
        isFull,
        meetingLink: inst.meetingLink ?? inst.batch.meetingLink,
        status: inst.status,
        isUserBooked: userId ? Boolean(userBooking) : undefined,
        userBookingId: userBooking?.id,
        userWaitlistPosition: waitlistEntry?.position,
      };
    });

    return NextResponse.json({ instances: result });
  } catch (error) {
    console.error('[api/schedule GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
