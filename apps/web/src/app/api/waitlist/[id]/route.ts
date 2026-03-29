import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** DELETE /api/waitlist/:id — leave the waitlist */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;

    const entry = await prisma.waitlist.findUnique({ where: { id } });
    if (!entry) return NextResponse.json({ error: 'Waitlist entry not found' }, { status: 404 });
    if (entry.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.waitlist.update({
      where: { id },
      data: { status: 'EXPIRED' },
    });

    return NextResponse.json({ message: 'Removed from waitlist' });
  } catch (error) {
    console.error('[api/waitlist/[id] DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
