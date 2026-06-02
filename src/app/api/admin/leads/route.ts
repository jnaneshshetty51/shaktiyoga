import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Demo data for leads
const DEMO_LEADS = [
    { id: '1', name: 'Vikram Singh', email: 'vikram.s@gmail.com', phone: '+91 98765 43210', country: 'India', source: 'WEBSITE', status: 'NEW', notes: 'Interested in everyday yoga', trialRequestedAt: new Date().toISOString(), trialDate: null, trialAttended: false, createdAt: new Date().toISOString(), assignedTo: { id: '2', name: 'Anita Desai' }, _count: { activities: 2 } },
    { id: '2', name: 'Neha Gupta', email: 'neha.g@gmail.com', phone: '+91 87654 32109', country: 'India', source: 'WHATSAPP', status: 'CONTACTED', notes: 'Follow up next week', trialRequestedAt: new Date().toISOString(), trialDate: new Date(Date.now() + 86400000 * 3).toISOString(), trialAttended: false, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), assignedTo: { id: '2', name: 'Anita Desai' }, _count: { activities: 4 } },
    { id: '3', name: 'Arjun Nair', email: 'arjun.n@gmail.com', phone: '+91 76543 21098', country: 'USA', source: 'REFERRAL', status: 'TRIAL', notes: 'Referred by Meera Patel', trialRequestedAt: new Date(Date.now() - 86400000 * 3).toISOString(), trialDate: new Date(Date.now() - 86400000).toISOString(), trialAttended: true, createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), assignedTo: { id: '2', name: 'Anita Desai' }, _count: { activities: 6 } },
    { id: '4', name: 'Sunita Rao', email: 'sunita.r@gmail.com', phone: '+91 65432 10987', country: 'India', source: 'SOCIAL_MEDIA', status: 'CONVERTED', notes: 'Converted to member', trialRequestedAt: new Date(Date.now() - 86400000 * 14).toISOString(), trialDate: new Date(Date.now() - 86400000 * 7).toISOString(), trialAttended: true, createdAt: new Date(Date.now() - 86400000 * 20).toISOString(), assignedTo: { id: '1', name: 'Priya Sharma' }, _count: { activities: 8 } },
    { id: '5', name: 'Raj Malhotra', email: 'raj.m@gmail.com', phone: '+91 54321 09876', country: 'UK', source: 'WEBSITE', status: 'LOST', notes: 'Could not attend due to schedule conflict', trialRequestedAt: new Date(Date.now() - 86400000 * 7).toISOString(), trialDate: null, trialAttended: false, createdAt: new Date(Date.now() - 86400000 * 15).toISOString(), assignedTo: null, _count: { activities: 1 } },
    { id: '6', name: 'Pooja Shah', email: 'pooja.s@gmail.com', phone: '+91 43210 98765', country: 'India', source: 'WEBSITE', status: 'NEW', notes: ' inquiry about therapy programs', trialRequestedAt: new Date().toISOString(), trialDate: null, trialAttended: false, createdAt: new Date().toISOString(), assignedTo: null, _count: { activities: 0 } },
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
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        let leads = DEMO_LEADS;

        if (status && status !== 'all') {
            leads = leads.filter(l => l.status === status);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            leads = leads.filter(l =>
                l.name.toLowerCase().includes(searchLower) ||
                l.email.toLowerCase().includes(searchLower)
            );
        }

        return NextResponse.json(leads);
    } catch (error) {
        console.error('Admin leads API error:', error);
        return NextResponse.json(DEMO_LEADS);
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
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();

        // In demo mode, just return the created lead with an ID
        const newLead = {
            id: `demo-${Date.now()}`,
            ...body,
            createdAt: new Date().toISOString(),
            _count: { activities: 0 },
        };

        return NextResponse.json(newLead);
    } catch (error) {
        console.error('Admin leads POST API error:', error);
        return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
    }
}
