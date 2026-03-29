import { NextResponse } from 'next/server';

/**
 * POST /api/cron/generate-schedule
 * Called daily by node-cron (or Vercel Cron).
 * Secured by CRON_SECRET header.
 */
export async function POST(request: Request) {
  const secret = request.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Delegate to the admin schedule generate endpoint
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${baseUrl}/api/admin/schedule/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Use internal bypass header so middleware doesn't block this server-side call
        'x-internal-call': process.env.CRON_SECRET || '',
      },
      body: JSON.stringify({ daysAhead: 14 }),
    });

    const data = await res.json();
    return NextResponse.json({ cron: 'generate-schedule', result: data });
  } catch (error) {
    console.error('[cron/generate-schedule]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
