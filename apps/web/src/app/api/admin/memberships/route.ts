import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const memberships = await prisma.membership.findMany({
      orderBy: [{ planType: 'asc' }, { durationDays: 'asc' }],
    });
    return NextResponse.json({ memberships });
  } catch (error) {
    console.error('[admin/memberships GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      planType,
      durationDays,
      price,
      currency = 'INR',
      classesPerWeek,
      sessionsTotal,
      description,
      features = [],
      razorpayPlanId,
    } = body;

    if (!name || !planType || !durationDays || price === undefined) {
      return NextResponse.json(
        { error: 'name, planType, durationDays, and price are required' },
        { status: 400 }
      );
    }

    const membership = await prisma.membership.create({
      data: {
        name,
        planType,
        durationDays,
        price,
        currency,
        classesPerWeek,
        sessionsTotal,
        description,
        features,
        razorpayPlanId,
        isActive: true,
      },
    });

    return NextResponse.json({ membership }, { status: 201 });
  } catch (error) {
    console.error('[admin/memberships POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
