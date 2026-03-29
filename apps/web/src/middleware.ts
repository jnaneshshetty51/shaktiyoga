import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'change-this-to-a-strong-random-secret'
);

// Routes that don't require authentication
const PUBLIC_PREFIXES = [
  '/_next',
  '/favicon.ico',
  '/api/auth/login',
  '/api/auth/otp',
  '/api/auth/refresh',
  '/api/payments/webhook',
  '/api/schedule',
  '/api/memberships',
  // Public pages
  '/',
  '/about',
  '/programs',
  '/blog',
  '/stories',
  '/contact',
  '/login',
  '/signup',
  '/trial',
  '/everyday-yoga',
  '/yoga-therapy',
  '/onboarding',
  '/welcome',
];

function isPublicPath(pathname: string): boolean {
  // Exact root match
  if (pathname === '/') return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Get access token from cookie
  const token = req.cookies.get('token')?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Verify access token
  let payload: { id?: string; role?: string; email?: string } | null = null;
  try {
    const { payload: p } = await jwtVerify(token, ACCESS_SECRET);
    payload = p as typeof payload;
  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Token expired or invalid' }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('token');
    return response;
  }

  // Admin-only route guard
  if (
    (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) &&
    payload?.role !== 'SUPER_ADMIN' &&
    payload?.role !== 'STAFF_ADMIN'
  ) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Inject user info as request headers (available in API route handlers)
  const requestHeaders = new Headers(req.headers);
  if (payload?.id) requestHeaders.set('x-user-id', String(payload.id));
  if (payload?.role) requestHeaders.set('x-user-role', String(payload.role));
  if (payload?.email) requestHeaders.set('x-user-email', String(payload.email));

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    // Admin pages and APIs
    '/admin/:path*',
    '/api/admin/:path*',
    // Member dashboard
    '/dashboard/:path*',
    // Protected API routes
    '/api/bookings/:path*',
    '/api/attendance/qr/:path*',
    '/api/attendance/manual',
    '/api/attendance/scan',
    '/api/payments/create-order',
    '/api/payments/create-subscription',
    '/api/payments/verify',
    '/api/payments/invoices/:path*',
    '/api/waitlist/:path*',
    '/api/users/:path*',
    '/api/subscriptions/:path*',
    '/api/admin/attendance/:path*',
    '/api/admin/memberships/:path*',
    '/api/admin/payments/:path*',
    '/api/admin/reports/:path*',
    '/api/admin/notifications/:path*',
  ],
};
