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

        const dbBookings = await prisma.booking.findMany({
            include: {
                user: { select: { name: true } },
                teacher: { select: { name: true } }
            },
            orderBy: { date: 'desc' }
        });

        const bookings = dbBookings.map(b => ({
            id: b.id,
            userId: b.userId,
            userName: b.user?.name || 'Unknown User',
            type: b.type === 'THERAPY_SESSION' ? 'Therapy' : b.type === 'CONSULTATION' ? 'Consultation' : 'Special Session',
            status: b.status === 'CONFIRMED' ? 'Confirmed' : b.status === 'CANCELLED' ? 'Cancelled' : b.status === 'COMPLETED' ? 'Completed' : 'Pending',
            date: b.date.toISOString().split('T')[0],
            time: b.date.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) + ' IST',
            teacher: b.teacher?.name || 'Unassigned'
        }));

        return NextResponse.json({ bookings });
    } catch (error) {
        console.error('Admin bookings API error:', error);
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
        const { userId, type, date, time, teacherId } = body;
        
        if (!userId || !type || !date || !time) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Parse date and time to create a single Date object
        const bookingDate = new Date(`${date}T${time}:00`);

        const teacher = teacherId ? teacherId : (await prisma.user.findFirst({ where: { role: 'TEACHER' } }))?.id;

        if (!teacher) {
            return NextResponse.json({ error: 'No teacher found. Please create a teacher user first.' }, { status: 400 });
        }

        const booking = await prisma.booking.create({
            data: {
                userId,
                teacherId: teacher,
                type: type === 'Therapy' ? 'THERAPY_SESSION' : 'CONSULTATION',
                status: 'CONFIRMED',
                date: bookingDate,
            }
        });

        return NextResponse.json({ success: true, booking });
    } catch (error) {
        console.error('Failed to create booking:', error);
        return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }
}
