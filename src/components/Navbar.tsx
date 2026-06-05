"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FaChevronDown, FaGlobe } from 'react-icons/fa';
import { useCurrency } from '@/context/CurrencyContext';
import { useAuth } from '@/context/AuthContext';

interface Program {
    href: string;
    label: string;
}

// Default programs as fallback
const DEFAULT_PROGRAMS: Program[] = [
    { href: '/programs', label: 'All Programs' },
    { href: '/everyday-yoga', label: 'Everyday Yoga' },
    { href: '/yoga-therapy', label: 'Yoga Therapy' },
    { href: '/programs#Yoga Chikitsa', label: 'Yoga Therapy' },
    { href: '/programs#Pre & Post Natal Yoga', label: 'Pre & Post Natal' },
    { href: '/programs#Antaranga Yoga', label: 'Meditation' },
];

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProgramsOpen, setIsProgramsOpen] = useState(false);
    const { currency, toggleCurrency } = useCurrency();
    const { user, logout } = useAuth();
    const [programs, setPrograms] = useState<Program[]>(DEFAULT_PROGRAMS);

    useEffect(() => {
        // Fetch programs from API
        fetch('/api/content/programs')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    // Transform database programs to navbar format
                    const fetchedPrograms = data.slice(0, 6).map((p: any, index: number) => ({
                        href: `/programs${index === 0 ? '' : `#${p.title.toLowerCase().replace(/\s+/g, '-')}`}`,
                        label: p.subtitle || p.title
                    }));
                    setPrograms([
                        { href: '/programs', label: 'All Programs' },
                        ...fetchedPrograms
                    ]);
                }
            })
            .catch(err => console.error('Failed to fetch programs:', err));
    }, []);

    return (
        <nav className="flex justify-between items-center px-6 py-4 md:px-10 lg:px-16 bg-background/95 backdrop-blur-md sticky top-0 z-50 border-b border-black/5 shadow-sm">
            <Link href="/" className="font-serif text-2xl font-bold text-primary tracking-wider z-50 relative">
                Shakti Yoga
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-8 lg:gap-10 items-center">
                <Link href="/" className="font-sans text-sm text-text hover:text-primary hover:underline decoration-2 underline-offset-4 transition-all uppercase tracking-widest">
                    Home
                </Link>

                {/* Programs Dropdown */}
                <div className="relative group">
                    <button
                        className="flex items-center gap-1 font-sans text-sm text-text hover:text-primary transition-colors uppercase tracking-widest"
                        onMouseEnter={() => setIsProgramsOpen(true)}
                        onMouseLeave={() => setIsProgramsOpen(false)}
                    >
                        Programs <FaChevronDown className={`text-xs transition-transform duration-200 ${isProgramsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <div
                        className={`absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-black/5 overflow-hidden transition-all duration-200 ${isProgramsOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'}`}
                        onMouseEnter={() => setIsProgramsOpen(true)}
                        onMouseLeave={() => setIsProgramsOpen(false)}
                    >
                        {programs.map((program, index) => (
                            <Link
                                key={index}
                                href={program.href}
                                className="block px-5 py-3 text-sm text-text hover:bg-primary/5 hover:text-primary transition-colors border-b border-black/5 last:border-0"
                            >
                                {program.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <Link href="/about" className="font-sans text-sm text-text hover:text-primary hover:underline decoration-2 underline-offset-4 transition-all uppercase tracking-widest">
                    About
                </Link>
                <Link href="/stories" className="font-sans text-sm text-text hover:text-primary hover:underline decoration-2 underline-offset-4 transition-all uppercase tracking-widest">
                    Stories
                </Link>
                <Link href="/blog" className="font-sans text-sm text-text hover:text-primary hover:underline decoration-2 underline-offset-4 transition-all uppercase tracking-widest">
                    Blog
                </Link>
                <Link href="/contact" className="font-sans text-sm text-text hover:text-primary hover:underline decoration-2 underline-offset-4 transition-all uppercase tracking-widest">
                    Contact
                </Link>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
                <button
                    onClick={toggleCurrency}
                    className="flex items-center gap-1 font-sans text-xs font-bold text-text hover:text-primary transition-colors bg-black/5 px-2.5 py-1.5 rounded-md"
                    title={`Switch to ${currency === 'INR' ? 'USD' : 'INR'}`}
                >
                    <FaGlobe className="text-[10px]" /> {currency}
                </button>
                {user ? (
                    <>
                        <Link href={user.role === 'admin' || user.role === 'SUPER_ADMIN' || user.role === 'STAFF_ADMIN' ? '/admin' : '/dashboard'} className="font-sans text-sm font-bold text-text hover:text-primary transition-colors uppercase tracking-widest">
                            {user.role === 'admin' || user.role === 'SUPER_ADMIN' || user.role === 'STAFF_ADMIN' ? 'Admin Portal' : 'Dashboard'}
                        </Link>
                        <button onClick={logout} className="px-5 py-2.5 border border-primary text-primary font-sans text-sm font-bold uppercase tracking-widest rounded-full hover:bg-primary/5 transition-colors shadow-sm hover:shadow-md transform hover:scale-105 transition-transform">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login" className="font-sans text-sm font-bold text-text hover:text-primary transition-colors uppercase tracking-widest">
                            Login
                        </Link>
                        <Link href="/trial" className="px-5 py-2.5 bg-secondary text-white font-sans text-sm font-bold uppercase tracking-widest rounded-full hover:bg-primary transition-colors shadow-md hover:shadow-lg transform hover:scale-105 transition-transform">
                            Free Trial
                        </Link>
                    </>
                )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
                className="md:hidden z-50 relative p-2 -mr-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
            >
                <div className="w-6 h-5 flex flex-col justify-between">
                    <span className={`w-full h-0.5 bg-primary rounded-full transition-all duration-300 origin-center ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                    <span className={`w-full h-0.5 bg-primary rounded-full transition-all duration-300 ${isMenuOpen ? 'opacity-0 scale-0' : ''}`}></span>
                    <span className={`w-full h-0.5 bg-primary rounded-full transition-all duration-300 origin-center ${isMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`}></span>
                </div>
            </button>

            {/* Mobile Drawer */}
            <div className={`fixed inset-0 bg-background z-40 transition-transform duration-300 ease-out md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col pt-20 px-8 h-full overflow-y-auto">
                    <div className="flex flex-col gap-1">
                        <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-text hover:text-primary hover:bg-primary/5 px-4 py-3 rounded-lg transition-colors">
                            Home
                        </Link>
                        <div className="px-4 py-3">
                            <p className="text-xs uppercase tracking-widest text-primary font-bold mb-3">Programs</p>
                            <div className="pl-4 flex flex-col gap-1">
                                {programs.map((program, index) => (
                                    <Link
                                        key={index}
                                        href={program.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-base text-text/80 hover:text-primary py-2 transition-colors"
                                    >
                                        {program.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <Link href="/about" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-text hover:text-primary hover:bg-primary/5 px-4 py-3 rounded-lg transition-colors">
                            About
                        </Link>
                        <Link href="/stories" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-text hover:text-primary hover:bg-primary/5 px-4 py-3 rounded-lg transition-colors">
                            Stories
                        </Link>
                        <Link href="/blog" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-text hover:text-primary hover:bg-primary/5 px-4 py-3 rounded-lg transition-colors">
                            Blog
                        </Link>
                        <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-text hover:text-primary hover:bg-primary/5 px-4 py-3 rounded-lg transition-colors">
                            Contact
                        </Link>
                    </div>

                    <div className="mt-auto mb-8 space-y-4">
                        <button
                            onClick={toggleCurrency}
                            className="flex items-center justify-center gap-2 w-full py-3 text-center border border-gray-200 text-gray-600 font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <FaGlobe /> Currency: {currency}
                        </button>
                        {user ? (
                            <>
                                <Link href={user.role === 'admin' || user.role === 'SUPER_ADMIN' || user.role === 'STAFF_ADMIN' ? '/admin' : '/dashboard'} onClick={() => setIsMenuOpen(false)} className="block w-full py-3 text-center border-2 border-primary text-primary font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-primary/5 transition-colors">
                                    {user.role === 'admin' || user.role === 'SUPER_ADMIN' || user.role === 'STAFF_ADMIN' ? 'Admin Portal' : 'Dashboard'}
                                </Link>
                                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="flex items-center justify-center gap-2 w-full py-4 bg-gray-100 text-gray-700 font-bold uppercase tracking-widest rounded-lg hover:bg-gray-200 transition-colors shadow-lg">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block w-full py-3 text-center border-2 border-primary text-primary font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-primary/5 transition-colors">
                                    Login
                                </Link>
                                <Link href="/trial" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-4 bg-secondary text-white font-bold uppercase tracking-widest rounded-lg hover:bg-primary transition-colors shadow-lg">
                                    Start Free Trial
                                </Link>
                            </>
                        )}
                        <a
                            href="https://wa.me/917204050478"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-4 bg-green-500 text-white font-bold uppercase tracking-widest rounded-lg hover:bg-green-600 transition-colors"
                        >
                            <span>Chat on WhatsApp</span>
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
}
