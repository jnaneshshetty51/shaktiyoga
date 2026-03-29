import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

// ─── Token secrets ─────────────────────────────────────────────────────────────

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'change-this-to-a-strong-random-secret'
);

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'change-this-to-a-different-strong-random-secret'
);

const QR_SECRET = new TextEncoder().encode(
  process.env.QR_JWT_SECRET || 'change-this-to-a-qr-specific-secret'
);

function getSecret(type: TokenType) {
  switch (type) {
    case 'access': return ACCESS_SECRET;
    case 'refresh': return REFRESH_SECRET;
    case 'qr': return QR_SECRET;
  }
}

export type TokenType = 'access' | 'refresh' | 'qr';

// ─── Password helpers ──────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// ─── Token helpers ─────────────────────────────────────────────────────────────

const EXPIRY: Record<TokenType, string> = {
  access: '15m',
  refresh: '30d',
  qr: '12h',
};

export async function signToken(
  payload: Record<string, unknown>,
  type: TokenType = 'access'
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: type })
    .setIssuedAt()
    .setExpirationTime(EXPIRY[type])
    .sign(getSecret(type));
}

export async function verifyToken(
  token: string,
  type: TokenType = 'access'
): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(type));
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

// ─── Session helpers ───────────────────────────────────────────────────────────

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return await verifyToken(token, 'access');
}

export async function getRefreshTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('refresh_token')?.value ?? null;
}

// ─── Cookie helpers ────────────────────────────────────────────────────────────

export function getAccessTokenCookieOptions(maxAge = 60 * 15) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

export function getRefreshTokenCookieOptions(maxAge = 60 * 60 * 24 * 30) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/api/auth/refresh',
    maxAge,
  };
}
