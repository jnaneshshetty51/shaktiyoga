import { NextResponse } from 'next/server';
import { verifyToken, mapDatabaseRole } from '@/lib/auth';
import { cookies } from 'next/headers';

// Demo user IDs for fallback
const DEMO_USER_IDS = ['demo-admin-1', 'demo-teacher-1', 'demo-member-1'];

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ user: null });
        }

        const payload = await verifyToken(token);

        if (!payload) {
            return NextResponse.json({ user: null });
        }

        // Check if it's a demo user (token created without DB)
        if (DEMO_USER_IDS.includes(payload.id)) {
            return NextResponse.json({
                user: {
                    id: payload.id,
                    name: payload.name,
                    email: payload.email,
                    role: payload.role,
                }
            });
        }

        // Try database lookup for non-demo users
        let user = null;
        try {
            const { prisma } = await import('@/lib/prisma');
            user = await prisma.user.findUnique({
                where: { id: payload.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    phone: true,
                    country: true,
                    timezone: true,
                },
            });
        } catch (dbError) {
            console.log('Database unavailable, using token payload');
        }

        if (!user) {
            // Fallback to token payload if DB lookup fails
            return NextResponse.json({
                user: {
                    id: payload.id,
                    name: payload.name,
                    email: payload.email,
                    role: payload.role,
                }
            });
        }

        return NextResponse.json({
            user: {
                ...user,
                role: mapDatabaseRole(user.role)
            }
        });
    } catch (error) {
        console.error('Me API error:', error);
        return NextResponse.json({ user: null });
    }
}
