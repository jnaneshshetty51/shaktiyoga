import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/users/push-token
 * Saves the Expo push token for the authenticated user.
 * Called by the mobile app after login.
 */
export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { token, deviceType } = await request.json();

    if (!token || !token.startsWith('ExponentPushToken[')) {
      return NextResponse.json({ error: 'Invalid Expo push token' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { expoPushToken: token },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/users/push-token POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/users/push-token
 * Clears push token when user disables notifications.
 */
export async function DELETE(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { expoPushToken: null },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/users/push-token DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
