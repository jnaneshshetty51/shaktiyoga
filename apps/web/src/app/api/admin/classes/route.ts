import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

// Auth is handled by middleware — x-user-role header is injected

export async function GET() {
  try {
    const batches = await prisma.classBatch.findMany({
      include: {
        teacher: {
          select: { id: true, name: true },
        },
        _count: { select: { instances: true } },
      },
      orderBy: { timeSlot: 'asc' },
    });

    return NextResponse.json({
      batches: batches.map((b) => ({
        id: b.id,
        name: b.name,
        planType: b.planType,
        timeSlot: b.timeSlot,
        timezone: b.timezone,
        daysOfWeek: b.daysOfWeek,
        capacity: b.capacity,
        durationMins: b.durationMins,
        teacher: b.teacher,
        active: b.active,
        meetingLink: b.meetingLink,
        description: b.description,
        rrule: b.rrule,
        instanceCount: b._count.instances,
      })),
    });
  } catch (error) {
    console.error('[admin/classes GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      planType,
      timeSlot,
      daysOfWeek,
      teacherId,
      capacity = 30,
      durationMins = 60,
      meetingLink,
      description,
      rrule,
      timezone = 'Asia/Kolkata',
    } = body;

    if (!name || !planType || !timeSlot || !teacherId) {
      return NextResponse.json(
        { error: 'name, planType, timeSlot, and teacherId are required' },
        { status: 400 }
      );
    }

    // Verify teacher exists
    const teacher = await prisma.user.findFirst({
      where: { id: teacherId, role: { in: ['TEACHER', 'STAFF_ADMIN', 'SUPER_ADMIN'] } },
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const batch = await prisma.classBatch.create({
      data: {
        name,
        planType,
        timeSlot,
        daysOfWeek: daysOfWeek ?? [],
        teacherId,
        capacity,
        durationMins,
        meetingLink,
        description,
        rrule,
        timezone,
        active: true,
      },
      include: { teacher: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ batch }, { status: 201 });
  } catch (error) {
    console.error('[admin/classes POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
