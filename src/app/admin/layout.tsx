"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user } = useAuth();

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: "📊" },
        { name: "Users", href: "/admin/users", icon: "👥" },
        { name: "Subscriptions", href: "/admin/subscriptions", icon: "💳" },
        { name: "Classes", href: "/admin/classes", icon: "🧘‍♀️" },
        { name: "Bookings", href: "/admin/bookings", icon: "📅" },
        { name: "Community", href: "/admin/community", icon: "💬" },
        { name: "Content", href: "/admin/content", icon: "📝" },
        { name: "Settings", href: "/admin/settings", icon: "⚙️" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-gray-100">
                    <Link href="/" className="font-serif text-2xl text-primary font-bold">
                        Shakti<span className="text-secondary">.</span>
                    </Link>
                    <div className="mt-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Admin Panel</div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? "bg-primary/5 text-primary"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-2">
                        <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center text-secondary font-bold text-xs">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-sm font-bold text-gray-800 truncate">{user?.name || 'Admin'}</div>
                            <div className="text-xs text-gray-500 truncate">Super Admin</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
