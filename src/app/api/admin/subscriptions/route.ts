import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Demo data for subscriptions
const DEMO_SUBSCRIPTIONS = [
    { id: '1', userId: '3', user: { id: '3', name: 'Meera Patel', email: 'meera@gmail.com' }, planType: 'EVERYDAY_YOGA', status: 'ACTIVE', amount: 1500, startDate: new Date(Date.now() - 86400000 * 60).toISOString(), endDate: new Date(Date.now() + 86400000 * 30).toISOString(), autoRenew: true, createdAt: new Date(Date.now() - 86400000 * 60).toISOString() },
    { id: '2', userId: '4', user: { id: '4', name: 'Kavita Nair', email: 'kavita@gmail.com' }, planType: 'YOGA_THERAPY', status: 'ACTIVE', amount: 3000, startDate: new Date(Date.now() - 86400000 * 30).toISOString(), endDate: new Date(Date.now() + 86400000 * 60).toISOString(), autoRenew: true, createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
    { id: '3', userId: '5', user: { id: '5', name: 'Ravi Kumar', email: 'ravi@gmail.com' }, planType: 'EVERYDAY_YOGA', status: 'TRIAL', amount: 0, startDate: new Date(Date.now() - 86400000 * 3).toISOString(), endDate: new Date(Date.now() + 86400000 * 4).toISOString(), autoRenew: false, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: '4', userId: '6', user: { id: '6', name: 'Lakshmi Reddy', email: 'lakshmi@gmail.com' }, planType: 'EVERYDAY_YOGA', status: 'ACTIVE', amount: 1500, startDate: new Date(Date.now() - 86400000 * 90).toISOString(), endDate: new Date(Date.now() + 86400000 * 90).toISOString(), autoRenew: true, createdAt: new Date(Date.now() - 86400000 * 90).toISOString() },
    { id: '5', userId: '8', user: { id: '8', name: 'Deepa Menon', email: 'deepa@gmail.com' }, planType: 'YOGA_THERAPY', status: 'ACTIVE', amount: 3000, startDate: new Date(Date.now() - 86400000 * 45).toISOString(), endDate: new Date(Date.now() + 86400000 * 45).toISOString(), autoRenew: true, createdAt: new Date(Date.now() - 86400000 * 45).toISOString() },
    { id: '6', userId: '9', user: { id: '9', name: 'Geeta Krishnan', email: 'geeta@gmail.com' }, planType: 'EVERYDAY_YOGA', status: 'CANCELLED', amount: 1500, startDate: new Date(Date.now() - 86400000 * 180).toISOString(), endDate: new Date(Date.now() - 86400000 * 90).toISOString(), autoRenew: false, createdAt: new Date(Date.now() - 86400000 * 180).toISOString() },
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

        return NextResponse.json(DEMO_SUBSCRIPTIONS);
    } catch (error) {
        console.error('Admin subscriptions API error:', error);
        return NextResponse.json(DEMO_SUBSCRIPTIONS);
    }
}
