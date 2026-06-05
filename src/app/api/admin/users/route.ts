import { NextResponse } from 'next/server';
import { verifyToken, hashPassword } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Function to map DB role to frontend status
function getStatusFromRole(role: string): string {
    if (role === 'VISITOR') return 'Inactive';
    if (role === 'TRIAL') return 'Trial';
    return 'Active';
}

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

        // Fetch users from DB
        const dbUsers = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Map to expected frontend format
        const users = dbUsers.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: getStatusFromRole(user.role),
            plan: user.role.replace('MEMBER_', '').replace('_', ' '), // Fallback plan display
            lastLogin: user.lastLogin ? user.lastLogin.toISOString() : 'Never',
            joinedAt: user.createdAt.toISOString()
        }));

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Admin users API error:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
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
        const { name, email, role } = body;

        if (!name || !email || !role) {
            return NextResponse.json({ error: 'Name, email, and role are required' }, { status: 400 });
        }

        // Check if user already exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
        }

        // Generate a secure default password for admin-created users
        const defaultPassword = 'TempPassword123!';
        const passwordHash = await hashPassword(defaultPassword);

        // Create the user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                role,
                passwordHash,
                timezone: 'IST'
            }
        });

        return NextResponse.json({
            success: true,
            message: 'User created successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                status: getStatusFromRole(newUser.role),
                joinedAt: newUser.createdAt.toISOString()
            }
        });

    } catch (error) {
        console.error('Failed to create user:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
