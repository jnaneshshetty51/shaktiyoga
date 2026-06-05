"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useEffect, useState } from "react";

interface CommunityGroup {
    id: string;
    name: string;
    role: string;
    whatsappLink: string;
    pinnedMessage: string;
}

// Fallback groups for when API fails
const FALLBACK_GROUPS: CommunityGroup[] = [
    {
        id: 'everyday',
        name: 'Everyday Yoga Batch A',
        role: 'member_everyday',
        whatsappLink: 'https://chat.whatsapp.com/mock-everyday-link',
        pinnedMessage: "Welcome! Tomorrow's class focuses on hip openers. Bring a strap!"
    },
    {
        id: 'therapy',
        name: 'Therapy Circle',
        role: 'member_therapy',
        whatsappLink: 'https://chat.whatsapp.com/mock-therapy-link',
        pinnedMessage: 'Reminder: Dr. Rao is available for Q&A this Saturday at 5 PM IST.'
    },
    {
        id: 'trial',
        name: 'New Joiners & Trial',
        role: 'trial',
        whatsappLink: 'https://chat.whatsapp.com/mock-trial-link',
        pinnedMessage: "Hope you enjoyed your first class! Feel free to ask any questions here."
    }
];

export default function DashboardPage() {
    const { user, isLoading } = useAuth();
    const [groups, setGroups] = useState<CommunityGroup[]>(FALLBACK_GROUPS);

    useEffect(() => {
        fetch('/api/community/groups')
            .then(res => res.json())
            .then(data => setGroups(data))
            .catch(err => console.error('Failed to fetch community groups:', err));
    }, []);

    if (isLoading) return <div className="p-20 text-center">Loading dashboard...</div>;
    if (!user) return <div className="p-20 text-center">Please log in.</div>;

    // Find community group based on role - handle both lowercase and uppercase role formats
    const userRole = user.role?.toUpperCase() || user.role;
    const communityGroup = groups.find(g => {
        const groupRole = g.role?.toUpperCase() || g.role;
        return groupRole === userRole || groupRole === userRole.replace('MEMBER_', '');
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-serif text-3xl text-primary mb-2">Namaste, {user.name}</h1>
                    <p className="text-text/60">Welcome to your sanctuary.</p>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-sm font-bold text-text/40 uppercase tracking-widest">Current Plan</div>
                    <div className="text-lg font-serif text-secondary capitalize">{user.role.replace('member_', '').replace('_', ' ')}</div>
                </div>
            </div>

            {/* Community Banner */}
            {communityGroup && (
                <div className="bg-green-50 border border-green-100 rounded-lg p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🌿</span>
                            <h3 className="font-bold text-lg text-green-800">{communityGroup.name}</h3>
                        </div>
                        <p className="text-sm text-green-700 mb-4">
                            Join our WhatsApp group for daily class links, motivation, and community updates.
                        </p>
                        {communityGroup.pinnedMessage && (
                            <div className="bg-white/60 p-3 rounded border border-green-100 text-sm text-green-800 italic">
                                " {communityGroup.pinnedMessage} "
                            </div>
                        )}
                    </div>
                    <a
                        href={communityGroup.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-green-600 text-white font-bold uppercase tracking-widest rounded hover:bg-green-700 transition-colors shadow-md whitespace-nowrap flex items-center gap-2"
                    >
                        <span>Join WhatsApp</span>
                        <span>→</span>
                    </a>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
                {/* Quick Actions & Widgets */}
                <div className="md:col-span-2 grid gap-6">
                    {/* Next Class Widget - Would normally fetch from API */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-primary/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-bl uppercase tracking-widest">
                            Live in 15 mins
                        </div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-serif text-xl text-gray-800 mb-1">
                                    {user.role === 'member_therapy' ? '1:1 Therapy Session' : 'Vinyasa Flow'}
                                </h3>
                                <p className="text-sm text-text/70">Today, 6:00 PM - 6:45 PM IST</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button className="flex-1 py-3 bg-primary text-white font-bold uppercase tracking-widest rounded hover:bg-secondary transition-colors shadow-md animate-pulse">
                                Join Live Class
                            </button>
                            <Link href="/dashboard/classes" className="px-6 py-3 border border-gray-200 text-gray-600 font-bold uppercase tracking-widest rounded hover:bg-gray-50 transition-colors">
                                View Schedule
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-primary/20 transition-colors">
                        <h3 className="font-serif text-xl text-gray-800 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/dashboard/consultations" className="p-4 bg-gray-50 rounded hover:bg-primary/5 transition-colors text-center group">
                                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💬</div>
                                <div className="font-bold text-gray-700">Consultations</div>
                            </Link>
                            {user.role === 'member_therapy' ? (
                                <Link href="/dashboard/therapy/book" className="p-4 bg-gray-50 rounded hover:bg-primary/5 transition-colors text-center group">
                                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📅</div>
                                    <div className="font-bold text-gray-700">Book Session</div>
                                </Link>
                            ) : (
                                <Link href="/dashboard/classes" className="p-4 bg-gray-50 rounded hover:bg-primary/5 transition-colors text-center group">
                                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📅</div>
                                    <div className="font-bold text-gray-700">Book Class</div>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar / Profile Preview */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden relative">
                            {/* Placeholder Avatar */}
                            <div className="absolute inset-0 flex items-center justify-center text-2xl text-gray-400 font-serif">
                                {user.name.charAt(0)}
                            </div>
                        </div>
                        <h3 className="font-bold text-center text-gray-800">{user.name}</h3>
                        <p className="text-center text-xs text-gray-500 uppercase tracking-widest mb-6">{user.email}</p>

                        <Link href="/dashboard/profile" className="block w-full py-2 text-center border border-gray-200 text-gray-600 text-sm font-bold uppercase tracking-widest rounded hover:bg-gray-50 transition-colors">
                            Edit Profile
                        </Link>
                    </div>

                    {user.role === 'member_therapy' && (
                        <div className="bg-secondary/5 p-6 rounded-lg border border-secondary/10">
                            <h3 className="font-bold text-secondary mb-2">Therapy Credits</h3>
                            <div className="text-3xl font-bold text-gray-800 mb-1">{user.credits ?? 0}</div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Sessions Remaining</p>
                            <Link href="/dashboard/therapy/book" className="text-sm text-secondary font-bold hover:underline">
                                Book Now →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
