import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/attendance/:instanceId
 * Returns the full roster for a class instance:
 * all confirmed bookings with their attendance status.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  try {
    const { instanceId } = await params;

    const instance = await prisma.classInstance.findUnique({
      where: { id: instanceId },
      include: { batch: { select: { name: true, durationMins: true } } },
    });

    if (!instance) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    const bookings = await prisma.classBooking.findMany({
      where: { instanceId },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { bookedAt: 'asc' },
    });

    // Build a map of userId → attendance
    const attendanceRecords = await prisma.attendance.findMany({
      where: { instanceId },
    });
    const attendanceMap = new Map(attendanceRecords.map((a) => [a.userId, a]));

    const roster = bookings.map((b) => {
      const att = attendanceMap.get(b.userId);
      return {
        bookingId: b.id,
        user: b.user,
        bookingStatus: b.status,
        attendanceStatus: att?.status ?? null,
        checkInAt: att?.checkInAt?.toISOString() ?? null,
        checkInMethod: att?.checkInMethod ?? null,
      };
    });

    const present = roster.filter((r) => r.attendanceStatus === 'PRESENT').length;
    const noShow = roster.filter((r) => r.attendanceStatus === 'NO_SHOW').length;
    const notMarked = roster.filter((r) => r.attendanceStatus === null).length;

    return NextResponse.json({
      instance: {
        id: instance.id,
        className: instance.batch.name,
        date: instance.date.toISOString(),
        capacity: instance.capacity,
        status: instance.status,
      },
      roster,
      summary: { total: roster.length, present, noShow, notMarked },
    });
  } catch (error) {
    console.error('[admin/attendance/[instanceId] GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
