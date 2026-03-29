import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/push';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, meetingLink, cancelledReason, notifyMembers } = body;

    const instance = await prisma.classInstance.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(meetingLink !== undefined && { meetingLink }),
        ...(cancelledReason !== undefined && { cancelledReason }),
      },
      include: {
        batch: { select: { name: true } },
      },
    });

    // If cancelling, optionally notify all booked members
    if (status === 'CANCELLED' && notifyMembers) {
      const bookings = await prisma.classBooking.findMany({
        where: { instanceId: id, status: 'CONFIRMED' },
        include: {
          user: { select: { expoPushToken: true, name: true } },
        },
      });

      const tokens = bookings
        .map((b) => b.user.expoPushToken)
        .filter((t): t is string => Boolean(t));

      if (tokens.length > 0) {
        const classDate = new Date(instance.date).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          timeZone: 'Asia/Kolkata',
        });
        await sendPushNotification(
          tokens,
          'Class Cancelled',
          `${instance.batch.name} on ${classDate} has been cancelled. ${cancelledReason ? `Reason: ${cancelledReason}` : ''}`.trim(),
          { type: 'CLASS_CANCELLED', instanceId: id }
        );
      }

      // Mark bookings as cancelled
      await prisma.classBooking.updateMany({
        where: { instanceId: id, status: 'CONFIRMED' },
        data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: 'Class cancelled' },
      });
    }

    return NextResponse.json({ instance });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }
    console.error('[admin/schedule/instances/[id] PUT]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
