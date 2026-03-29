import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushToUser } from '@/lib/push';

/**
 * DELETE /api/bookings/:id
 * Cancel a booking. Auto-promotes waitlist position 1 if within cancellation window.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const booking = await prisma.classBooking.findUnique({
      where: { id },
      include: {
        instance: {
          include: { batch: { select: { name: true } } },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (booking.status !== 'CONFIRMED') {
      return NextResponse.json({ error: 'Booking is not active' }, { status: 409 });
    }

    const cancellationWindowMs = 2 * 60 * 60 * 1000; // 2 hours
    const classStart = booking.instance.date.getTime();
    const now = Date.now();
    const isLateCancel = classStart - now < cancellationWindowMs;

    // Cancel the booking
    await prisma.classBooking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: isLateCancel ? 'Late cancellation' : 'User cancelled',
      },
    });

    // Decrement booking count on the instance
    await prisma.classInstance.update({
      where: { id: booking.instanceId },
      data: { attendanceCount: { decrement: 1 } },
    });

    // Promote the first person on the waitlist
    const firstWaiting = await prisma.waitlist.findFirst({
      where: { instanceId: booking.instanceId, status: 'WAITING' },
      orderBy: { position: 'asc' },
      include: { user: { select: { id: true, name: true, expoPushToken: true } } },
    });

    if (firstWaiting) {
      // Create a new confirmed booking for the promoted user
      await prisma.$transaction([
        prisma.classBooking.upsert({
          where: {
            userId_instanceId: {
              userId: firstWaiting.userId,
              instanceId: booking.instanceId,
            },
          },
          create: {
            userId: firstWaiting.userId,
            instanceId: booking.instanceId,
            status: 'CONFIRMED',
          },
          update: { status: 'CONFIRMED', cancelledAt: null, cancelReason: null },
        }),
        prisma.waitlist.update({
          where: { id: firstWaiting.id },
          data: { status: 'PROMOTED', notifiedAt: new Date() },
        }),
        prisma.classInstance.update({
          where: { id: booking.instanceId },
          data: { attendanceCount: { increment: 1 } },
        }),
      ]);

      // Notify promoted user
      if (firstWaiting.user.expoPushToken) {
        const classDate = new Date(booking.instance.date).toLocaleString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata',
        });

        sendPushToUser(
          firstWaiting.user.expoPushToken,
          'You got a spot!',
          `A spot opened up for ${booking.instance.batch.name} on ${classDate}. You're confirmed!`,
          { type: 'WAITLIST_PROMOTED', instanceId: booking.instanceId }
        ).catch(() => {});
      }
    }

    return NextResponse.json({
      message: 'Booking cancelled',
      lateCancel: isLateCancel,
      waitlistPromoted: Boolean(firstWaiting),
    });
  } catch (error) {
    console.error('[api/bookings/[id] DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
