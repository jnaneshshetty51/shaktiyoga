import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushToUser } from '@/lib/push';

export const dynamic = 'force-dynamic';

/**
 * POST /api/bookings
 * Book a class instance. Handles concurrency via Prisma transaction + raw lock.
 * Auto-adds to waitlist if at capacity.
 */
export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { instanceId } = body as { instanceId?: string };

    if (!instanceId) {
      return NextResponse.json({ error: 'instanceId is required' }, { status: 400 });
    }

    // Check instance exists and is bookable
    const instance = await prisma.classInstance.findUnique({
      where: { id: instanceId },
      include: { batch: { select: { name: true, planType: true, durationMins: true } } },
    });

    if (!instance) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    if (instance.status === 'CANCELLED') {
      return NextResponse.json({ error: 'This class has been cancelled' }, { status: 409 });
    }

    if (instance.date < new Date()) {
      return NextResponse.json({ error: 'Cannot book a past class' }, { status: 409 });
    }

    // Check for existing booking
    const existingBooking = await prisma.classBooking.findUnique({
      where: { userId_instanceId: { userId, instanceId } },
    });

    if (existingBooking?.status === 'CONFIRMED') {
      return NextResponse.json({ error: 'Already booked for this class' }, { status: 409 });
    }

    // Use a transaction with a raw SELECT FOR UPDATE to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Lock the ClassInstance row for the duration of this transaction
      await tx.$executeRaw`SELECT id FROM "ClassInstance" WHERE id = ${instanceId} FOR UPDATE`;

      const currentCount = await tx.classBooking.count({
        where: { instanceId, status: 'CONFIRMED' },
      });

      const isFull = currentCount >= instance.capacity;

      if (isFull) {
        // Add to waitlist
        const maxPosition = await tx.waitlist.aggregate({
          where: { instanceId, status: 'WAITING' },
          _max: { position: true },
        });

        const position = (maxPosition._max.position ?? 0) + 1;

        const waitlistEntry = await tx.waitlist.upsert({
          where: { userId_instanceId: { userId, instanceId } },
          create: { userId, instanceId, position, status: 'WAITING' },
          update: { status: 'WAITING', position },
        });

        return { waitlisted: true, position, waitlistId: waitlistEntry.id };
      }

      // Book the class
      const booking = await tx.classBooking.upsert({
        where: { userId_instanceId: { userId, instanceId } },
        create: { userId, instanceId, status: 'CONFIRMED' },
        update: { status: 'CONFIRMED', cancelledAt: null, cancelReason: null },
      });

      // Increment booking count
      await tx.classInstance.update({
        where: { id: instanceId },
        data: { attendanceCount: { increment: 1 } },
      });

      return { waitlisted: false, booking };
    });

    // Send confirmation push (non-blocking)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { expoPushToken: true },
    });

    if (user?.expoPushToken) {
      const classDate = new Date(instance.date).toLocaleString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      });

      if (result.waitlisted) {
        sendPushToUser(
          user.expoPushToken,
          'Added to waitlist',
          `You're #${result.position} on the waitlist for ${instance.batch.name} on ${classDate}`,
          { type: 'WAITLISTED', instanceId }
        ).catch(() => {});
      } else {
        sendPushToUser(
          user.expoPushToken,
          'Booking confirmed!',
          `Your spot for ${instance.batch.name} on ${classDate} is confirmed.`,
          { type: 'BOOKING_CONFIRMED', instanceId, bookingId: result.booking!.id }
        ).catch(() => {});
      }
    }

    return NextResponse.json(result, { status: result.waitlisted ? 202 : 201 });
  } catch (error) {
    console.error('[api/bookings POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
