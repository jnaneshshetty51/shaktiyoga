"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { ToastProvider, KeyboardShortcutsHelp, useCommandPalette } from "@/components/admin";
import { CommandPalette } from "@/components/admin/CommandPalette";
import {
  FaHome,
  FaUsers,
  FaCreditCard,
  FaCalendar,
  FaComments,
  FaEdit,
  FaCog,
  FaChartBar,
  FaChevronDown,
  FaChevronRight,
  FaTimes,
  FaUserPlus,
  FaUserCircle,
  FaSignOutAlt,
  FaBell,
  FaSearch,
} from "react-icons/fa";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  children?: { name: string; href: string }[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const navItems: NavItem[] = [
    { name: "Dashboard", href: "/admin", icon: <FaHome /> },
    { name: "Analytics", href: "/admin/analytics", icon: <FaChartBar /> },
    { 
      name: "CRM", 
      href: "/admin/users",
      icon: <FaUsers />,
      children: [
        { name: "Users & Members", href: "/admin/users" },
        { name: "Leads", href: "/admin/leads" },
        { name: "Subscriptions", href: "/admin/subscriptions" },
        { name: "Bookings", href: "/admin/bookings" },
      ]
    },
    { name: "Community", href: "/admin/community", icon: <FaComments /> },
    { 
      name: "Content", 
      href: "/admin/content",
      icon: <FaEdit />,
      badge: 3,
      children: [
        { name: "Blog Posts", href: "/admin/content" },
        { name: "Stories", href: "/admin/stories" },
        { name: "Programs", href: "/programs" },
      ]
    },
    { name: "Settings", href: "/admin/settings", icon: <FaCog /> },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const toggleExpand = (name: string) => {
    setExpandedItem(expandedItem === name ? null : name);
  };

  const { isOpen, setIsOpen } = useCommandPalette();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile/Tablet Overlay */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <CommandPalette isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Sidebar - Desktop (lg and above) */}
      <aside
        className={`w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col fixed h-full z-10 transition-transform duration-300 ease-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <span className="font-serif text-xl font-bold text-gray-900">Shakti</span>
              <span className="text-secondary">.</span>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-primary/5 text-primary"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-primary text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {expandedItem === item.name ? (
                        <FaChevronDown className="text-xs" />
                      ) : (
                        <FaChevronRight className="text-xs" />
                      )}
                    </div>
                  </button>
                  {expandedItem === item.name && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                            pathname === child.href
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-primary/5 text-primary"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    {item.name}
                  </span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-primary text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center text-secondary font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-800 truncate">{user?.name || 'Admin'}</div>
              <div className="text-xs text-gray-500 truncate">Super Admin</div>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Sign Out"
            >
              <FaSignOutAlt className="text-gray-400 text-sm" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile/Tablet Sidebar Drawer */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <span className="font-serif text-xl font-bold text-gray-900">Shakti</span>
              <span className="text-secondary">.</span>
            </div>
          </Link>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Close menu"
          >
            <FaTimes className="text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-primary/5 text-primary"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      {item.name}
                    </span>
                    {expandedItem === item.name ? (
                      <FaChevronDown className="text-xs" />
                    ) : (
                      <FaChevronRight className="text-xs" />
                    )}
                  </button>
                  {expandedItem === item.name && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                            pathname === child.href
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-primary/5 text-primary"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center text-secondary font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-800 truncate">{user?.name || 'Admin'}</div>
              <div className="text-xs text-gray-500 truncate">Super Admin</div>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FaSignOutAlt className="text-gray-400 text-sm" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Search (desktop) */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-xl flex-1 max-w-md">
              <FaSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="Search members, bookings..."
                className="bg-transparent border-none outline-none text-sm text-gray-700 w-full"
              />
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FaBell className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Quick Actions */}
              <Link
                href="/admin/users?action=add"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <FaUserPlus />
                <span>Add Member</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <ToastProvider>
        <div className="p-6 lg:p-8">
          {/* Breadcrumbs */}
          <div className="text-sm text-gray-500 mb-6">
            <Link href="/admin" className="hover:text-primary transition-colors">Home</Link>
            {pathname !== "/admin" && (
              <>
                <span className="mx-2">/</span>
                <span className="text-gray-900 capitalize">
                  {pathname.split('/').pop()?.replace(/-/g, ' ')}
                </span>
              </>
            )}
          </div>
          {children}
        </div>
        <KeyboardShortcutsHelp />
        </ToastProvider>
      </main>
    </div>
  );
}
