import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Demo data for bookings
const DEMO_BOOKINGS = [
    { id: '1', userId: '3', user: { id: '3', name: 'Meera Patel', email: 'meera@gmail.com' }, type: 'THERAPY_SESSION', status: 'CONFIRMED', date: new Date(Date.now() + 86400000).toISOString(), time: '09:00 AM', teacher: { id: '2', name: 'Anita Desai' }, notes: 'Focus on back pain relief', createdAt: new Date().toISOString() },
    { id: '2', userId: '4', user: { id: '4', name: 'Kavita Nair', email: 'kavita@gmail.com' }, type: 'CONSULTATION', status: 'PENDING', date: new Date(Date.now() + 86400000 * 2).toISOString(), time: '11:00 AM', teacher: { id: '1', name: 'Priya Sharma' }, notes: 'Initial consultation', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: '3', userId: '5', user: { id: '5', name: 'Ravi Kumar', email: 'ravi@gmail.com' }, type: 'SPECIAL_SESSION', status: 'CONFIRMED', date: new Date(Date.now() + 86400000 * 3).toISOString(), time: '04:00 PM', teacher: { id: '2', name: 'Anita Desai' }, notes: 'Trial session', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: '4', userId: '6', user: { id: '6', name: 'Lakshmi Reddy', email: 'lakshmi@gmail.com' }, type: 'THERAPY_SESSION', status: 'COMPLETED', date: new Date(Date.now() - 86400000).toISOString(), time: '10:00 AM', teacher: { id: '1', name: 'Priya Sharma' }, notes: 'Regular therapy session', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: '5', userId: '8', user: { id: '8', name: 'Deepa Menon', email: 'deepa@gmail.com' }, type: 'CONSULTATION', status: 'CONFIRMED', date: new Date(Date.now() + 86400000 * 4).toISOString(), time: '02:00 PM', teacher: { id: '1', name: 'Priya Sharma' }, notes: 'Follow-up consultation', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: '6', userId: '7', user: { id: '7', name: 'Suresh Iyer', email: 'suresh@gmail.com' }, type: 'THERAPY_SESSION', status: 'CANCELLED', date: new Date(Date.now() - 86400000 * 2).toISOString(), time: '09:00 AM', teacher: { id: '2', name: 'Anita Desai' }, notes: 'Session cancelled by user', createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
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

        return NextResponse.json({ bookings: DEMO_BOOKINGS });
    } catch (error) {
        console.error('Admin bookings API error:', error);
        return NextResponse.json({ bookings: DEMO_BOOKINGS });
    }
}
