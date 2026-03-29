import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name: name.trim() },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('[users/profile PUT]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
