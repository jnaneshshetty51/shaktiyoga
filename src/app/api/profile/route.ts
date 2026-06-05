import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || !payload.userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await request.json();
        const { firstName, lastName, phone, location, timezone, goals, medicalHistory, communicationPref } = body;

        // Update user basic info
        const updatedUser = await prisma.user.update({
            where: { id: payload.userId },
            data: {
                name: firstName && lastName ? `${firstName} ${lastName}` : undefined,
                phone: phone || undefined,
                country: location || undefined,
                timezone: timezone || undefined,
            },
            include: {
                profile: true
            }
        });

        // Update or create user profile
        if (goals || medicalHistory || communicationPref) {
            const profileData: any = {};
            if (goals) profileData.goals = goals;
            if (medicalHistory) profileData.medicalHistory = medicalHistory;
            if (communicationPref) profileData.communicationPref = communicationPref;

            if (updatedUser.profile) {
                await prisma.userProfile.update({
                    where: { userId: payload.userId },
                    data: profileData
                });
            } else {
                await prisma.userProfile.create({
                    data: {
                        userId: payload.userId,
                        ...profileData
                    }
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                country: updatedUser.country,
                timezone: updatedUser.timezone
            }
        });
    } catch (error: any) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update profile' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || !payload.userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            include: {
                profile: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                country: user.country,
                timezone: user.timezone,
                goals: user.profile?.goals || '',
                medicalHistory: user.profile?.medicalHistory || '',
                communicationPref: user.profile?.communicationPref || ''
            }
        });
    } catch (error: any) {
        console.error('Profile fetch error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}
