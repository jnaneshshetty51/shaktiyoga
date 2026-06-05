import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || (payload.role !== 'admin' && payload.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const dbSubs = await prisma.subscription.findMany({
            include: { user: { select: { name: true } } },
            orderBy: { startDate: 'desc' }
        });

        const subscriptions = dbSubs.map(s => ({
            id: s.id,
            userId: s.userId,
            userName: s.user?.name || 'Unknown',
            plan: s.planType === 'EVERYDAY_YOGA' ? 'Everyday Yoga' : s.planType === 'YOGA_THERAPY' ? 'Yoga Therapy' : 'Trial',
            amount: s.amount,
            status: s.status === 'ACTIVE' ? 'Active' : s.status === 'CANCELLED' ? 'Cancelled' : s.status === 'PAUSED' ? 'Paused' : s.status === 'TRIAL' ? 'Trial' : 'Expired',
            renewalDate: s.renewalDate.toISOString().split('T')[0]
        }));

        return NextResponse.json({ subscriptions });
    } catch (error) {
        console.error('Admin subscriptions API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || (payload.role !== 'admin' && payload.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { userId, plan, amount, renewalDate, status } = body;

        if (!userId || !plan || amount === undefined || !renewalDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const dbPlanType = plan === 'Everyday Yoga' ? 'EVERYDAY_YOGA' : plan === 'Yoga Therapy' ? 'YOGA_THERAPY' : 'TRIAL';
        const dbStatus = status ? status.toUpperCase() : 'ACTIVE';

        const sub = await prisma.subscription.upsert({
            where: { userId },
            update: {
                planType: dbPlanType,
                amount: parseFloat(amount),
                renewalDate: new Date(renewalDate),
                status: dbStatus
            },
            create: {
                userId,
                planType: dbPlanType,
                amount: parseFloat(amount),
                renewalDate: new Date(renewalDate),
                status: dbStatus
            }
        });

        return NextResponse.json({ success: true, subscription: sub });
    } catch (error) {
        console.error('Failed to create/update subscription:', error);
        return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
    }
}
