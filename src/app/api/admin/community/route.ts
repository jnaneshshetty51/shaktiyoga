import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Demo data for community/whatsapp groups
const DEMO_GROUPS = [
    { id: '1', name: 'Everyday Yoga Members', inviteLink: 'https://chat.whatsapp.com/abc123', members: 89, active: true, createdAt: new Date(Date.now() - 86400000 * 90).toISOString() },
    { id: '2', name: 'Yoga Therapy Group', inviteLink: 'https://chat.whatsapp.com/def456', members: 45, active: true, createdAt: new Date(Date.now() - 86400000 * 60).toISOString() },
    { id: '3', name: 'Morning Batch - 6AM', inviteLink: 'https://chat.whatsapp.com/ghi789', members: 32, active: true, createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
    { id: '4', name: 'Trial Users Group', inviteLink: 'https://chat.whatsapp.com/jkl012', members: 18, active: true, createdAt: new Date(Date.now() - 86400000 * 15).toISOString() },
    { id: '5', name: 'Old Members Community', inviteLink: 'https://chat.whatsapp.com/mno345', members: 12, active: false, createdAt: new Date(Date.now() - 86400000 * 180).toISOString() },
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

        return NextResponse.json({ groups: DEMO_GROUPS });
    } catch (error) {
        console.error('Admin community API error:', error);
        return NextResponse.json({ groups: DEMO_GROUPS });
    }
}
