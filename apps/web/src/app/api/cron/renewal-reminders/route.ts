import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/push';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cron/renewal-reminders
 * Sends push notifications to members whose subscription expires in 7 days or 1 day.
 */
export async function POST(request: Request) {
  const secret = request.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();

    // 7 days from now (window: +6h to +30h for tolerance)
    const sevenDaysStart = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
    const sevenDaysEnd = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);

    // 1 day from now
    const oneDayStart = new Date(now.getTime() + 18 * 60 * 60 * 1000);
    const oneDayEnd = new Date(now.getTime() + 30 * 60 * 60 * 1000);

    // 7-day reminders
    const sevenDayExpiring = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        renewalDate: { gte: sevenDaysStart, lte: sevenDaysEnd },
      },
      include: {
        user: { select: { id: true, name: true, expoPushToken: true } },
      },
    });

    const sevenDayTokens = sevenDayExpiring
      .map((s) => s.user.expoPushToken)
      .filter((t): t is string => Boolean(t));

    if (sevenDayTokens.length > 0) {
      await sendPushNotification(
        sevenDayTokens,
        'Membership expiring in 7 days',
        'Your YogaStudio membership expires in 7 days. Renew now to keep your streak going!',
        { type: 'MEMBERSHIP_EXPIRING', daysLeft: 7 }
      );
    }

    // 1-day reminders
    const oneDayExpiring = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        renewalDate: { gte: oneDayStart, lte: oneDayEnd },
      },
      include: {
        user: { select: { id: true, name: true, expoPushToken: true } },
      },
    });

    const oneDayTokens = oneDayExpiring
      .map((s) => s.user.expoPushToken)
      .filter((t): t is string => Boolean(t));

    if (oneDayTokens.length > 0) {
      await sendPushNotification(
        oneDayTokens,
        'Membership expires tomorrow!',
        'Your membership expires tomorrow. Renew now to avoid any interruption.',
        { type: 'MEMBERSHIP_EXPIRING', daysLeft: 1 }
      );
    }

    return NextResponse.json({
      cron: 'renewal-reminders',
      sevenDayReminders: sevenDayTokens.length,
      oneDayReminders: oneDayTokens.length,
    });
  } catch (error) {
    console.error('[cron/renewal-reminders]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
