import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyToken,
  signToken,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from '@/lib/auth';
import { revokeRefreshToken, isRefreshTokenRevoked } from '@/lib/redis';
import crypto from 'crypto';
import { cookies } from 'next/headers';

// Refresh token is sent via httpOnly cookie at path /api/auth/refresh
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }

    // Check Redis blocklist
    if (await isRefreshTokenRevoked(refreshToken)) {
      return NextResponse.json({ error: 'Refresh token revoked' }, { status: 401 });
    }

    // Verify JWT signature and expiry
    const payload = await verifyToken(refreshToken, 'refresh');
    if (!payload || typeof payload.id !== 'string') {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    // Verify DeviceSession exists and is not revoked
    const session = await prisma.deviceSession.findUnique({
      where: { refreshToken },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session expired or revoked' }, { status: 401 });
    }

    // Load current user
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Rotate: revoke old refresh token, issue new pair
    await revokeRefreshToken(refreshToken);
    await prisma.deviceSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    const newAccessToken = await signToken(
      { id: user.id, email: user.email, role: user.role, name: user.name, phone: user.phone },
      'access'
    );

    const newRefreshToken = await signToken(
      { id: user.id, jti: crypto.randomUUID() },
      'refresh'
    );

    // Create new DeviceSession for the rotated refresh token
    await prisma.deviceSession.create({
      data: {
        userId: user.id,
        refreshToken: newRefreshToken,
        deviceType: session.deviceType,
        deviceId: session.deviceId,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    cookieStore.set('token', newAccessToken, getAccessTokenCookieOptions());
    cookieStore.set('refresh_token', newRefreshToken, getRefreshTokenCookieOptions());

    return NextResponse.json({
      message: 'Token refreshed',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('[auth/refresh] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
