import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Demo data for class batches
const DEMO_CLASSES = [
    { id: '1', name: 'Morning Yoga - 6AM', type: 'EVERYDAY_YOGA', teacher: { id: '2', name: 'Anita Desai' }, schedule: 'Mon-Sat', time: '06:00 AM', duration: 60, maxParticipants: 20, enrolled: 16, status: 'ACTIVE', createdAt: new Date(Date.now() - 86400000 * 90).toISOString() },
    { id: '2', name: 'Evening Yoga - 5PM', type: 'EVERYDAY_YOGA', teacher: { id: '2', name: 'Anita Desai' }, schedule: 'Mon-Sat', time: '05:00 PM', duration: 60, maxParticipants: 20, enrolled: 18, status: 'ACTIVE', createdAt: new Date(Date.now() - 86400000 * 90).toISOString() },
    { id: '3', name: 'Therapy Session - Morning', type: 'YOGA_THERAPY', teacher: { id: '1', name: 'Priya Sharma' }, schedule: 'Mon, Wed, Fri', time: '09:00 AM', duration: 90, maxParticipants: 10, enrolled: 8, status: 'ACTIVE', createdAt: new Date(Date.now() - 86400000 * 60).toISOString() },
    { id: '4', name: 'Therapy Session - Evening', type: 'YOGA_THERAPY', teacher: { id: '1', name: 'Priya Sharma' }, schedule: 'Tue, Thu, Sat', time: '04:00 PM', duration: 90, maxParticipants: 10, enrolled: 7, status: 'ACTIVE', createdAt: new Date(Date.now() - 86400000 * 60).toISOString() },
    { id: '5', name: 'Weekend Special', type: 'EVERYDAY_YOGA', teacher: { id: '2', name: 'Anita Desai' }, schedule: 'Sat, Sun', time: '08:00 AM', duration: 75, maxParticipants: 25, enrolled: 22, status: 'ACTIVE', createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
    { id: '6', name: 'Beginner Batch', type: 'EVERYDAY_YOGA', teacher: { id: '2', name: 'Anita Desai' }, schedule: 'Mon, Wed, Fri', time: '07:00 AM', duration: 45, maxParticipants: 15, enrolled: 10, status: 'ACTIVE', createdAt: new Date(Date.now() - 86400000 * 15).toISOString() },
];

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (token) {
            const payload = await verifyToken(token);
            if (!payload || (payload.role !== 'admin' && payload.role !== 'SUPER_ADMIN')) {
                // Ignore for now and return demo data
            }
        }

        return NextResponse.json(DEMO_CLASSES);
    } catch (error) {
        console.error('Admin classes API error:', error);
        return NextResponse.json(DEMO_CLASSES);
    }
}
