import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** POST /api/waitlist — join the waitlist for a full class */
export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { instanceId } = await request.json();
    if (!instanceId) {
      return NextResponse.json({ error: 'instanceId is required' }, { status: 400 });
    }

    const instance = await prisma.classInstance.findUnique({ where: { id: instanceId } });
    if (!instance) return NextResponse.json({ error: 'Class not found' }, { status: 404 });

    const maxPos = await prisma.waitlist.aggregate({
      where: { instanceId, status: 'WAITING' },
      _max: { position: true },
    });

    const position = (maxPos._max.position ?? 0) + 1;

    const entry = await prisma.waitlist.upsert({
      where: { userId_instanceId: { userId, instanceId } },
      create: { userId, instanceId, position, status: 'WAITING' },
      update: { status: 'WAITING' },
    });

    return NextResponse.json({ waitlist: entry, position }, { status: 201 });
  } catch (error) {
    console.error('[api/waitlist POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
