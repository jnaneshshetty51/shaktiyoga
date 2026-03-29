import { Redis } from 'ioredis';

// ─── Singleton Redis client ────────────────────────────────────────────────────

const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableOfflineQueue: false,
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

// ─── OTP helpers ──────────────────────────────────────────────────────────────

/** Store OTP in Redis with 5-minute TTL */
export async function setOtp(phone: string, code: string): Promise<void> {
  await redis.setex(`otp:${phone}`, 300, code);
}

/** Verify OTP — returns true and deletes key if correct, false otherwise */
export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const stored = await redis.get(`otp:${phone}`);
  if (!stored || stored !== code) return false;
  await redis.del(`otp:${phone}`);
  return true;
}

/** Check if OTP exists (for rate-limiting awareness) */
export async function otpExists(phone: string): Promise<boolean> {
  return (await redis.exists(`otp:${phone}`)) === 1;
}

// ─── OTP rate limiting ────────────────────────────────────────────────────────

const OTP_RATE_WINDOW = 10 * 60; // 10 minutes
const OTP_RATE_LIMIT = 3;

/**
 * Returns true if OTP send is allowed.
 * Increments counter and sets TTL on first request in the window.
 */
export async function checkOtpRateLimit(phone: string): Promise<boolean> {
  const key = `otp:ratelimit:${phone}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, OTP_RATE_WINDOW);
  }
  return count <= OTP_RATE_LIMIT;
}

// ─── Refresh token revocation ─────────────────────────────────────────────────

/** Revoke a refresh token (store in Redis blocklist for 30 days) */
export async function revokeRefreshToken(token: string): Promise<void> {
  await redis.setex(`revoked:${token}`, 60 * 60 * 24 * 30, '1');
}

/** Check if a refresh token has been revoked */
export async function isRefreshTokenRevoked(token: string): Promise<boolean> {
  return (await redis.exists(`revoked:${token}`)) === 1;
}

// ─── Schedule availability cache ─────────────────────────────────────────────

/** Cache class instance booking count (5-minute TTL) */
export async function cacheBookingCount(instanceId: string, count: number): Promise<void> {
  await redis.setex(`bookings:${instanceId}`, 300, String(count));
}

export async function getCachedBookingCount(instanceId: string): Promise<number | null> {
  const val = await redis.get(`bookings:${instanceId}`);
  return val !== null ? parseInt(val) : null;
}

export async function invalidateBookingCount(instanceId: string): Promise<void> {
  await redis.del(`bookings:${instanceId}`);
}
