import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Demo analytics data
const DEMO_ANALYTICS = {
    totalMembers: 247,
    activeMembers: 198,
    trialUsers: 49,
    mrr: 12840,
    mrrGrowth: 12.5,
    newMembersThisMonth: 23,
    newMembersGrowth: 8.3,
    classAttendanceRate: 78,
    attendanceChange: -2.1,
    conversionRate: 24.5,
    conversionChange: 3.2,
    revenueByMonth: [
      { month: "Jan", revenue: 9800 },
      { month: "Feb", revenue: 10400 },
      { month: "Mar", revenue: 11200 },
      { month: "Apr", revenue: 10800 },
      { month: "May", revenue: 11900 },
      { month: "Jun", revenue: 12840 },
    ],
    membersByPlan: [
      { plan: "Everyday Yoga", count: 142 },
      { plan: "Yoga Therapy", count: 56 },
    ],
    membersByCountry: [
      { country: "USA", count: 89 },
      { country: "India", count: 67 },
      { country: "UK", count: 34 },
      { country: "UAE", count: 28 },
      { country: "Australia", count: 19 },
      { country: "Others", count: 10 },
    ],
    topPerformingContent: [
      { title: "5 Yoga Poses for Stress Relief", views: 1240 },
      { title: "Morning Yoga Routine for Beginners", views: 980 },
      { title: "Understanding Yoga Therapy", views: 756 },
    ],
};

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (token) {
            const payload = await verifyToken(token);
            if (!payload || (payload.role !== 'admin' && payload.role !== 'SUPER_ADMIN')) {
                // Ignore for now
            }
        }

        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '30d';

        // In demo mode, always return demo data
        return NextResponse.json(DEMO_ANALYTICS);
    } catch (error) {
        console.error('Admin analytics API error:', error);
        return NextResponse.json(DEMO_ANALYTICS);
    }
}
