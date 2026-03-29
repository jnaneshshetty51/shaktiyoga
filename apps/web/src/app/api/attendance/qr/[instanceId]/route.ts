import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateQrDataUrl } from '@/lib/qr';
import { isToday } from '@/lib/scheduling';

/**
 * GET /api/attendance/qr/:instanceId
 * Generates a QR code for a class instance.
 * Only accessible to TEACHER, STAFF_ADMIN, and SUPER_ADMIN.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  const userRole = request.headers.get('x-user-role');

  if (!['TEACHER', 'STAFF_ADMIN', 'SUPER_ADMIN'].includes(userRole ?? '')) {
    return NextResponse.json({ error: 'Forbidden: teacher or admin role required' }, { status: 403 });
  }

  try {
    const { instanceId } = await params;

    const instance = await prisma.classInstance.findUnique({
      where: { id: instanceId },
      include: {
        batch: { select: { name: true, durationMins: true } },
      },
    });

    if (!instance) {
      return NextResponse.json({ error: 'Class instance not found' }, { status: 404 });
    }

    if (instance.status === 'CANCELLED') {
      return NextResponse.json({ error: 'This class has been cancelled' }, { status: 409 });
    }

    const { qrDataUrl, token, expiresAt } = await generateQrDataUrl(
      instanceId,
      instance.date
    );

    return NextResponse.json({
      qrDataUrl,
      token,
      expiresAt: expiresAt.toISOString(),
      instanceId,
      className: instance.batch.name,
      classDate: instance.date.toISOString(),
    });
  } catch (error) {
    console.error('[api/attendance/qr/[instanceId] GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
