import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken, mapDatabaseRole } from '@/lib/auth';
import { cookies } from 'next/headers';

// Demo credentials for when database is unavailable
const DEMO_USERS = [
  {
    id: 'demo-admin-1',
    email: 'admin@shaktiyoga.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'SUPER_ADMIN',
  },
  {
    id: 'demo-teacher-1',
    email: 'teacher@shaktiyoga.com',
    password: 'teacher123',
    name: 'Yoga Teacher',
    role: 'TEACHER',
  },
  {
    id: 'demo-member-1',
    email: 'member@shaktiyoga.com',
    password: 'member123',
    name: 'Yoga Member',
    role: 'MEMBER_EVERYDAY',
  },
];

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        let user: any = null;
        let isDemoLogin = false;

        // Try to fetch from database
        try {
            user = await prisma.user.findUnique({
                where: { email },
            });
        } catch (dbError) {
            // Database not available, use demo credentials
            console.log('Database unavailable, using demo authentication');
        }

        // If no user found in DB, check demo credentials
        if (!user) {
            const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
            if (demoUser) {
                isDemoLogin = true;
                user = demoUser;
            }
        } else {
            // Verify password for database user
            if (!user.passwordHash) {
                return NextResponse.json(
                    { error: 'Invalid credentials' },
                    { status: 401 }
                );
            }

            const isValid = await verifyPassword(password, user.passwordHash);
            if (!isValid) {
                return NextResponse.json(
                    { error: 'Invalid credentials' },
                    { status: 401 }
                );
            }
        }

        // Check if we have a valid user
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Map role to frontend expected format
        const mappedRole = mapDatabaseRole(user.role);

        // Create JWT token
        const token = await signToken({
            id: user.id,
            email: user.email,
            role: mappedRole,
            name: user.name,
        });

        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        // Return user data (excluding password)
        const { passwordHash, ...userWithoutPassword } = user;

        return NextResponse.json({
            user: { ...userWithoutPassword, role: mappedRole },
            message: isDemoLogin ? 'Logged in successfully (Demo Mode)' : 'Logged in successfully',
            isDemo: isDemoLogin,
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
