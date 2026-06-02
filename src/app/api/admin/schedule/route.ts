import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Demo data for schedule
const DEMO_SCHEDULE = [
    { id: '1', date: new Date().toISOString().split('T')[0], classId: '1', className: 'Morning Yoga - 6AM', teacher: { id: '2', name: 'Anita Desai' }, startTime: '06:00', endTime: '07:00', status: 'SCHEDULED', booked: 16, capacity: 20 },
    { id: '2', date: new Date().toISOString().split('T')[0], classId: '6', className: 'Beginner Batch', teacher: { id: '2', name: 'Anita Desai' }, startTime: '07:00', endTime: '07:45', status: 'SCHEDULED', booked: 10, capacity: 15 },
    { id: '3', date: new Date().toISOString().split('T')[0], classId: '3', className: 'Therapy Session - Morning', teacher: { id: '1', name: 'Priya Sharma' }, startTime: '09:00', endTime: '10:30', status: 'SCHEDULED', booked: 8, capacity: 10 },
    { id: '4', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], classId: '2', className: 'Evening Yoga - 5PM', teacher: { id: '2', name: 'Anita Desai' }, startTime: '17:00', endTime: '18:00', status: 'SCHEDULED', booked: 18, capacity: 20 },
    { id: '5', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], classId: '4', className: 'Therapy Session - Evening', teacher: { id: '1', name: 'Priya Sharma' }, startTime: '16:00', endTime: '17:30', status: 'SCHEDULED', booked: 7, capacity: 10 },
    { id: '6', date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], classId: '5', className: 'Weekend Special', teacher: { id: '2', name: 'Anita Desai' }, startTime: '08:00', endTime: '09:15', status: 'SCHEDULED', booked: 22, capacity: 25 },
];

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (token) {
            const payload = await verifyToken(token);
            if (!payload || (payload.role !== 'admin' && payload.role !== 'SUPER_ADMIN')) {
                // Ignore for now and return demo data
            }
        }

        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');

        let schedule = DEMO_SCHEDULE;
        if (date) {
            schedule = schedule.filter(s => s.date === date);
        }

        return NextResponse.json(schedule);
    } catch (error) {
        console.error('Admin schedule API error:', error);
        return NextResponse.json(DEMO_SCHEDULE);
    }
}
