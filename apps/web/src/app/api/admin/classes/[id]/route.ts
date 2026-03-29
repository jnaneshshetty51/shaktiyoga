import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      planType,
      timeSlot,
      daysOfWeek,
      teacherId,
      capacity,
      durationMins,
      meetingLink,
      description,
      rrule,
      timezone,
      active,
    } = body;

    const batch = await prisma.classBatch.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(planType !== undefined && { planType }),
        ...(timeSlot !== undefined && { timeSlot }),
        ...(daysOfWeek !== undefined && { daysOfWeek }),
        ...(teacherId !== undefined && { teacherId }),
        ...(capacity !== undefined && { capacity }),
        ...(durationMins !== undefined && { durationMins }),
        ...(meetingLink !== undefined && { meetingLink }),
        ...(description !== undefined && { description }),
        ...(rrule !== undefined && { rrule }),
        ...(timezone !== undefined && { timezone }),
        ...(active !== undefined && { active }),
      },
      include: { teacher: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ batch });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Class batch not found' }, { status: 404 });
    }
    console.error('[admin/classes/[id] PUT]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Soft delete: set active = false
    await prisma.classBatch.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ message: 'Class batch deactivated' });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Class batch not found' }, { status: 404 });
    }
    console.error('[admin/classes/[id] DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
