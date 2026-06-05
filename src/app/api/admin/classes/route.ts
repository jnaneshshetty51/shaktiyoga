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

        const dbBatches = await prisma.classBatch.findMany({
            include: { teacher: { select: { name: true, id: true } } }
        });

        const classes = dbBatches.map(b => ({
            id: b.id,
            name: b.name,
            type: b.planType === 'EVERYDAY_YOGA' ? 'EVERYDAY_YOGA' : b.planType === 'YOGA_THERAPY' ? 'YOGA_THERAPY' : 'TRIAL',
            teacher: b.teacher,
            schedule: b.daysOfWeek.join(', '),
            time: b.timeSlot,
            duration: 60, // Dummy for now, could be added to schema later
            maxParticipants: 20, // Dummy
            enrolled: 0, // Would count from subscriptions/attendance ideally
            status: b.active ? 'ACTIVE' : 'INACTIVE',
        }));

        return NextResponse.json(classes);
    } catch (error) {
        console.error('Admin classes API error:', error);
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
        const { name, planType, daysOfWeek, timeSlot, teacherId, active } = body;

        if (!name || !planType || !daysOfWeek || !timeSlot) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const teacher = teacherId ? teacherId : (await prisma.user.findFirst({ where: { role: 'TEACHER' } }))?.id;

        if (!teacher) {
            return NextResponse.json({ error: 'No teacher found. Create a teacher first.' }, { status: 400 });
        }

        const newBatch = await prisma.classBatch.create({
            data: {
                name,
                planType: planType === 'EVERYDAY_YOGA' ? 'EVERYDAY_YOGA' : planType === 'YOGA_THERAPY' ? 'YOGA_THERAPY' : 'TRIAL',
                daysOfWeek: Array.isArray(daysOfWeek) ? daysOfWeek : daysOfWeek.split(',').map((d:string)=>d.trim()),
                timeSlot,
                teacherId: teacher,
                active: active !== undefined ? active : true
            }
        });

        return NextResponse.json({ success: true, class: newBatch });
    } catch (error) {
        console.error('Failed to create class:', error);
        return NextResponse.json({ error: 'Failed to create class' }, { status: 500 });
    }
}
