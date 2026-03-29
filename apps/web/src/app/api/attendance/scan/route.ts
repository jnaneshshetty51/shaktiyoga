import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyQrToken } from '@/lib/qr';

/**
 * POST /api/attendance/scan
 * Called by the mobile app after scanning a class QR code.
 * Records the attendance as PRESENT with method QR_SCAN.
 */
export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { qrToken } = await request.json();

    if (!qrToken) {
      return NextResponse.json({ error: 'qrToken is required' }, { status: 400 });
    }

    // Verify QR JWT
    const qrPayload = await verifyQrToken(qrToken);
    if (!qrPayload) {
      return NextResponse.json({ error: 'Invalid or expired QR code' }, { status: 400 });
    }

    const { instanceId } = qrPayload;

    // Load instance
    const instance = await prisma.classInstance.findUnique({
      where: { id: instanceId },
      include: { batch: { select: { name: true } } },
    });

    if (!instance) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Verify user has a confirmed booking for this class
    const booking = await prisma.classBooking.findUnique({
      where: { userId_instanceId: { userId, instanceId } },
    });

    if (!booking || booking.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: 'You do not have a confirmed booking for this class' },
        { status: 403 }
      );
    }

    // Check for existing attendance
    const existing = await prisma.attendance.findUnique({
      where: { userId_instanceId: { userId, instanceId } },
    });

    if (existing?.status === 'PRESENT') {
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        checkInAt: existing.checkInAt?.toISOString(),
        message: 'Already checked in',
      });
    }

    // Record attendance
    const now = new Date();
    const attendance = await prisma.attendance.upsert({
      where: { userId_instanceId: { userId, instanceId } },
      create: {
        userId,
        instanceId,
        status: 'PRESENT',
        checkInAt: now,
        checkInMethod: 'QR_SCAN',
        qrToken,
      },
      update: {
        status: 'PRESENT',
        checkInAt: now,
        checkInMethod: 'QR_SCAN',
        qrToken,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    return NextResponse.json({
      success: true,
      alreadyCheckedIn: false,
      userName: user?.name ?? 'Member',
      checkInAt: now.toISOString(),
      instanceId,
      className: instance.batch.name,
    });
  } catch (error) {
    console.error('[api/attendance/scan POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
