import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyPassword,
  signToken,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from '@/lib/auth';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Issue access token (15 minutes)
    const accessToken = await signToken(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      'access'
    );

    // Issue refresh token (30 days)
    const refreshToken = await signToken(
      { id: user.id, jti: crypto.randomUUID() },
      'refresh'
    );

    // Persist refresh token as a DeviceSession
    const ua = request.headers.get('user-agent') ?? undefined;
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ??
      request.headers.get('x-real-ip') ??
      undefined;

    await prisma.deviceSession.create({
      data: {
        userId: user.id,
        refreshToken,
        deviceType: 'web',
        userAgent: ua,
        ipAddress: ip,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const cookieStore = await cookies();
    cookieStore.set('token', accessToken, getAccessTokenCookieOptions());
    cookieStore.set('refresh_token', refreshToken, getRefreshTokenCookieOptions());

    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      message: 'Logged in successfully',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
