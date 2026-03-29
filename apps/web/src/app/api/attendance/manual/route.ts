import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/attendance/manual
 * Teacher/admin marks attendance manually for a user.
 * Body: { userId, instanceId, status: 'PRESENT' | 'NO_SHOW' | 'EXCUSED' }
 */
export async function POST(request: Request) {
  const callerRole = request.headers.get('x-user-role');
  const callerId = request.headers.get('x-user-id');

  if (!['TEACHER', 'STAFF_ADMIN', 'SUPER_ADMIN'].includes(callerRole ?? '')) {
    return NextResponse.json({ error: 'Forbidden: teacher or admin role required' }, { status: 403 });
  }

  try {
    const { userId, instanceId, status = 'PRESENT' } = await request.json();

    if (!userId || !instanceId) {
      return NextResponse.json({ error: 'userId and instanceId are required' }, { status: 400 });
    }

    if (!['PRESENT', 'NO_SHOW', 'EXCUSED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const attendance = await prisma.attendance.upsert({
      where: { userId_instanceId: { userId, instanceId } },
      create: {
        userId,
        instanceId,
        status,
        checkInAt: status === 'PRESENT' ? new Date() : null,
        checkInMethod: 'MANUAL',
        markedBy: callerId ?? undefined,
      },
      update: {
        status,
        checkInAt: status === 'PRESENT' ? new Date() : null,
        checkInMethod: 'MANUAL',
        markedBy: callerId ?? undefined,
      },
    });

    return NextResponse.json({ attendance });
  } catch (error) {
    console.error('[api/attendance/manual POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
