"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader, StatCard, SectionCard } from "@/components/admin";
import { DataTable, Column, StatusBadge, Badge } from "@/components/admin";
import {
  FaUsers,
  FaDollarSign,
  FaCalendarCheck,
  FaUserPlus,
  FaArrowRight,
  FaClock,
  FaCheckCircle,
  FaComment,
  FaRupeeSign,
} from "react-icons/fa";

interface DashboardStats {
  activeMembers: number;
  mrr: number;
  trialUsers: number;
  pendingBookings: number;
  mrrChange: number;
  membersChange: number;
}

interface RecentActivity {
  id: string;
  type: "signup" | "booking" | "payment" | "trial";
  message: string;
  timestamp: string;
}

interface UpcomingBooking {
  id: string;
  memberName: string;
  type: string;
  date: string;
  time: string;
}

interface TopMember {
  id: string;
  name: string;
  email: string;
  plan: string;
  lastActive: string;
}

interface DashboardData {
  recentActivity: RecentActivity[];
  upcomingBookings: UpcomingBooking[];
  topMembers: TopMember[];
}

// Fallback data for when API fails
const FALLBACK_RECENT_ACTIVITY: RecentActivity[] = [
  { id: "1", type: "signup", message: "Sarah Johnson started a free trial", timestamp: "2 hours ago" },
  { id: "2", type: "payment", message: "Payment of ₹7,200 received from Mike Ross", timestamp: "4 hours ago" },
  { id: "3", type: "booking", message: "John Doe booked a therapy session for tomorrow", timestamp: "5 hours ago" },
  { id: "4", type: "trial", message: "Emma Wilson completed 3 trial classes", timestamp: "1 day ago" },
  { id: "5", type: "booking", message: "Robert Chen booked consultation call", timestamp: "1 day ago" },
];

const FALLBACK_UPCOMING_BOOKINGS: UpcomingBooking[] = [
  { id: "1", memberName: "Priya Sharma", type: "Therapy Session", date: "Today", time: "10:00 AM IST" },
  { id: "2", memberName: "Anita Patel", type: "Consultation", date: "Today", time: "11:30 AM IST" },
  { id: "3", memberName: "John Doe", type: "Therapy Session", date: "Tomorrow", time: "09:00 AM IST" },
  { id: "4", memberName: "Sarah Wilson", type: "Therapy Session", date: "Tomorrow", time: "02:00 PM IST" },
];

const FALLBACK_TOP_MEMBERS: TopMember[] = [
  { id: "1", name: "Priya Sharma", email: "priya@email.com", plan: "Yoga Therapy", lastActive: "Today" },
  { id: "2", name: "Mike Ross", email: "mike@email.com", plan: "Everyday Yoga", lastActive: "Today" },
  { id: "3", name: "Emma Wilson", email: "emma@email.com", plan: "Everyday Yoga", lastActive: "Yesterday" },
  { id: "4", name: "Robert Chen", email: "robert@email.com", plan: "Yoga Therapy", lastActive: "2 days ago" },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    activeMembers: 0,
    mrr: 0,
    trialUsers: 0,
    pendingBookings: 0,
    mrrChange: 0,
    membersChange: 0,
  });
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    recentActivity: FALLBACK_RECENT_ACTIVITY,
    upcomingBookings: FALLBACK_UPCOMING_BOOKINGS,
    topMembers: FALLBACK_TOP_MEMBERS
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stats and dashboard data in parallel
      const [statsResponse, dashboardResponse] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/dashboard")
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (dashboardResponse.ok) {
        const dashData = await dashboardResponse.json();
        setDashboardData(dashData);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const activityIcons: Record<string, React.ReactNode> = {
    signup: <FaUserPlus className="text-green-500" />,
    booking: <FaCalendarCheck className="text-blue-500" />,
    payment: <FaRupeeSign className="text-yellow-500" />,
    trial: <FaClock className="text-purple-500" />,
  };

  const quickActions = [
    { label: "Add Member", href: "/admin/users?action=add", icon: <FaUserPlus />, color: "bg-blue-500" },
    { label: "View Bookings", href: "/admin/bookings", icon: <FaCalendarCheck />, color: "bg-green-500" },
    { label: "Manage Content", href: "/admin/content", icon: <FaComment />, color: "bg-purple-500" },
    { label: "View Analytics", href: "/admin/analytics", icon: <FaDollarSign />, color: "bg-orange-500" },
  ];

  const memberColumns: Column<TopMember>[] = [
    {
      key: "name",
      header: "Member",
      render: (member) => (
        <div>
          <div className="font-medium text-gray-900">{member.name}</div>
          <div className="text-sm text-gray-500">{member.email}</div>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      render: (member) => <Badge variant={member.plan === "Yoga Therapy" ? "purple" : "info"}>{member.plan}</Badge>,
    },
    {
      key: "lastActive",
      header: "Last Active",
      render: (member) => (
        <span className="text-sm text-gray-500">{member.lastActive}</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your yoga studio today."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Members"
          value={loading ? "—" : stats.activeMembers}
          change={`+${stats.membersChange || 0}% from last month`}
          changeType="positive"
          trend="up"
          icon={<FaUsers className="w-5 h-5" />}
        />
        <StatCard
          title="Monthly Revenue"
          value={loading ? "—" : `$${stats.mrr.toLocaleString()}`}
          change={`${stats.mrrChange >= 0 ? '+' : ''}${stats.mrrChange || 0}% from last month`}
          changeType={stats.mrrChange >= 0 ? "positive" : "negative"}
          trend={stats.mrrChange >= 0 ? "up" : "down"}
          icon={<FaDollarSign className="w-5 h-5" />}
        />
        <StatCard
          title="Trial Users"
          value={loading ? "—" : stats.trialUsers}
          change="12 expiring soon"
          changeType="neutral"
          icon={<FaClock className="w-5 h-5" />}
        />
        <StatCard
          title="Pending Bookings"
          value={loading ? "—" : stats.pendingBookings}
          change="Action required"
          changeType="neutral"
          icon={<FaCalendarCheck className="w-5 h-5" />}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <SectionCard
            title="Quick Actions"
            subtitle="Common tasks to get started"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all group"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-shadow`}>
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{action.label}</span>
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-500">Latest updates</p>
            </div>
            <Link href="/admin/community" className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
              View all <FaArrowRight className="text-xs" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {dashboardData.recentActivity.map((activity) => (
              <div key={activity.id} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {activityIcons[activity.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">{activity.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Bookings & Top Members */}
      <div className="grid lg:grid-cols-2 gap-8 mt-8">
        {/* Upcoming Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Upcoming Sessions</h3>
              <p className="text-sm text-gray-500">Next 24 hours</p>
            </div>
            <Link href="/admin/bookings" className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
              View all <FaArrowRight className="text-xs" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {dashboardData.upcomingBookings.map((booking) => (
              <div key={booking.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <FaCalendarCheck className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{booking.memberName}</p>
                    <p className="text-sm text-gray-500">{booking.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{booking.date}</p>
                  <p className="text-sm text-gray-500">{booking.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Members */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Active Members</h3>
              <p className="text-sm text-gray-500">Most engaged members</p>
            </div>
            <Link href="/admin/users" className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
              View all <FaArrowRight className="text-xs" />
            </Link>
          </div>
          <DataTable
            columns={memberColumns}
            data={dashboardData.topMembers}
            emptyMessage="No active members yet"
          />
        </div>
      </div>
    </div>
  );
}
