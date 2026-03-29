import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/push';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cron/mark-no-shows
 * Marks confirmed bookings as NO_SHOW if the member didn't check in
 * within 30 minutes after class start time.
 */
export async function POST(request: Request) {
  const secret = request.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    // Find completed/past instances that haven't been marked yet
    const pastInstances = await prisma.classInstance.findMany({
      where: {
        date: { lte: thirtyMinutesAgo },
        status: { in: ['SCHEDULED', 'LIVE'] },
      },
      select: { id: true, date: true, capacity: true },
    });

    let totalNoShows = 0;
    let instancesProcessed = 0;

    for (const instance of pastInstances) {
      // Get all confirmed bookings for this instance
      const bookings = await prisma.classBooking.findMany({
        where: { instanceId: instance.id, status: 'CONFIRMED' },
        include: {
          user: { select: { id: true, name: true, expoPushToken: true } },
        },
      });

      // Get existing attendance records
      const attendanceIds = new Set(
        (
          await prisma.attendance.findMany({
            where: { instanceId: instance.id },
            select: { userId: true },
          })
        ).map((a) => a.userId)
      );

      const noShownUsers: { id: string; name: string; token?: string }[] = [];

      for (const booking of bookings) {
        if (!attendanceIds.has(booking.userId)) {
          // Create NO_SHOW attendance record
          await prisma.attendance
            .upsert({
              where: {
                userId_instanceId: { userId: booking.userId, instanceId: instance.id },
              },
              create: {
                userId: booking.userId,
                instanceId: instance.id,
                status: 'NO_SHOW',
                checkInMethod: 'AUTO',
              },
              update: { status: 'NO_SHOW' },
            })
            .catch(() => {}); // Skip duplicates

          noShownUsers.push({
            id: booking.userId,
            name: booking.user.name,
            token: booking.user.expoPushToken ?? undefined,
          });
          totalNoShows++;
        }
      }

      // Mark instance as COMPLETED
      await prisma.classInstance.update({
        where: { id: instance.id },
        data: { status: 'COMPLETED' },
      });

      // Send push to no-show members
      const tokens = noShownUsers
        .map((u) => u.token)
        .filter((t): t is string => Boolean(t));

      if (tokens.length > 0) {
        await sendPushNotification(
          tokens,
          'You missed a class',
          "We noticed you didn't attend today's class. See you next time!",
          { type: 'NO_SHOW', instanceId: instance.id }
        );
      }

      instancesProcessed++;
    }

    return NextResponse.json({
      cron: 'mark-no-shows',
      instancesProcessed,
      totalNoShows,
    });
  } catch (error) {
    console.error('[cron/mark-no-shows]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
