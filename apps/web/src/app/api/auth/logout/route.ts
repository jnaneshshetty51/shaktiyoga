import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { revokeRefreshToken } from '@/lib/redis';

export async function POST() {
  const cookieStore = await cookies();

  // Revoke refresh token from Redis blocklist and mark DeviceSession as revoked
  const refreshToken = cookieStore.get('refresh_token')?.value;
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
    await prisma.deviceSession
      .updateMany({
        where: { refreshToken, revokedAt: null },
        data: { revokedAt: new Date() },
      })
      .catch(() => {
        // Non-critical if this fails
      });
  }

  cookieStore.delete('token');
  cookieStore.delete('refresh_token');

  return NextResponse.json({ message: 'Logged out successfully' });
}
