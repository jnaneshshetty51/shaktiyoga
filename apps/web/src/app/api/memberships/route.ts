import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/memberships
 * Public — returns all active membership plans.
 */
export async function GET() {
  try {
    const memberships = await prisma.membership.findMany({
      where: { isActive: true },
      orderBy: [{ planType: 'asc' }, { durationDays: 'asc' }],
    });

    return NextResponse.json({ memberships });
  } catch (error) {
    console.error('[api/memberships GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
