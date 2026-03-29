import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { expandBatchDates, daysFromNow } from '@/lib/scheduling';

/**
 * POST /api/admin/schedule/generate
 * Generates ClassInstance records for the next N days for all active batches.
 * Skips instances that already exist (upsert by batchId + date).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const daysAhead = Number(body.daysAhead ?? 14);

    if (daysAhead < 1 || daysAhead > 60) {
      return NextResponse.json({ error: 'daysAhead must be between 1 and 60' }, { status: 400 });
    }

    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = daysFromNow(daysAhead);
    to.setHours(23, 59, 59, 999);

    const batches = await prisma.classBatch.findMany({
      where: { active: true },
    });

    let created = 0;
    let skipped = 0;

    for (const batch of batches) {
      const dates = expandBatchDates(
        {
          daysOfWeek: batch.daysOfWeek,
          rrule: batch.rrule,
          timeSlot: batch.timeSlot,
          timezone: batch.timezone,
        },
        from,
        to
      );

      for (const date of dates) {
        // Use upsert to avoid duplicates (by batchId + exact date)
        const startOfMinute = new Date(date);
        startOfMinute.setSeconds(0, 0);

        const existing = await prisma.classInstance.findFirst({
          where: {
            batchId: batch.id,
            date: startOfMinute,
          },
        });

        if (existing) {
          skipped++;
          continue;
        }

        await prisma.classInstance.create({
          data: {
            batchId: batch.id,
            date: startOfMinute,
            status: 'SCHEDULED',
            capacity: batch.capacity,
            meetingLink: batch.meetingLink,
          },
        });
        created++;
      }
    }

    return NextResponse.json({
      message: `Schedule generation complete`,
      created,
      skipped,
      batchesProcessed: batches.length,
      range: { from: from.toISOString(), to: to.toISOString() },
    });
  } catch (error) {
    console.error('[admin/schedule/generate]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
