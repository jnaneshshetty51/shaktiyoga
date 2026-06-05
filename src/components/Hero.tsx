"use client";

import Image from 'next/image';
import Link from 'next/link';
import { FaArrowDown } from 'react-icons/fa';
import { useCurrency } from '@/context/CurrencyContext';
import { useEffect, useState } from 'react';

interface SiteStats {
    totalStudents: number;
    countriesCount: number;
    classesPerWeek: number;
    classTimeIST: string;
    hasWhatsAppSupport: boolean;
}

export default function Hero() {
    const { formatPrice } = useCurrency();
    const [stats, setStats] = useState<SiteStats | null>(null);

    useEffect(() => {
        fetch('/api/content/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error('Failed to fetch stats:', err));
    }, []);

    return (
        <section className="relative h-[92vh] min-h-[600px] w-full flex items-center justify-center text-center text-white overflow-hidden">
            {/* Background Image */}
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <Image
                    src="/hero.png"
                    alt="Peaceful yoga practice"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/50 via-black/30 to-black/60"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-8 px-6 md:px-12 max-w-5xl mx-auto">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-sm animate-fade-in">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="tracking-wide">Live from Udupi, India</span>
                </div>

                {/* Main Heading */}
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-wide leading-tight drop-shadow-2xl animate-fade-in">
                    Transform Your Body & Mind
                    <span className="block text-secondary mt-2">From Anywhere in the World</span>
                </h1>

                {/* Subheading */}
                <p className="font-sans text-lg md:text-xl lg:text-2xl font-light tracking-wide drop-shadow-lg max-w-3xl animate-fade-in">
                    Join daily live yoga classes (5 days/week) + personalized 1:1 yoga therapy sessions designed for NRIs and wellness seekers globally.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-4 animate-fade-in">
                    <Link href="/trial" className="group px-8 py-4 bg-secondary text-white font-bold uppercase tracking-widest rounded-full hover:bg-primary transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                        <span className="flex items-center justify-center gap-2">
                            Start Free Trial
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </span>
                    </Link>
                    <Link href="/yoga-therapy/start" className="group px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-sans text-sm uppercase tracking-widest rounded-full hover:bg-white hover:text-primary transition-all shadow-lg hover:shadow-xl">
                        <span className="flex items-center justify-center gap-2">
                            Book 1:1 Therapy
                            <span className="opacity-70">({formatPrice(9900)}/mo)</span>
                        </span>
                    </Link>
                </div>

                {/* Trust Indicators - Fetched from API */}
                <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-6 py-3 px-6 bg-black/20 backdrop-blur-sm rounded-full border border-white/10 text-xs md:text-sm animate-fade-in">
                    <span className="flex items-center gap-2">
                        <span className="text-green-400">✓</span> {stats?.classesPerWeek || 5} Live Classes/Week
                    </span>
                    <span className="hidden sm:inline">·</span>
                    <span className="flex items-center gap-2">
                        <span className="text-green-400">✓</span> Classes at {stats?.classTimeIST || '5:00 AM'} IST
                    </span>
                    <span className="hidden sm:inline">·</span>
                    <span className="flex items-center gap-2">
                        <span className="text-green-400">✓</span> WhatsApp Support
                    </span>
                </div>

                {/* Social Proof - Fetched from API */}
                <div className="flex items-center gap-3 mt-4 animate-fade-in">
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-10 h-10 rounded-full bg-primary/30 border-2 border-white/50 flex items-center justify-center text-xs font-bold">
                                {String.fromCharCode(64 + i)}
                            </div>
                        ))}
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-semibold">{stats?.totalStudents || 200}+ Students Worldwide</p>
                        <p className="text-xs opacity-70">NRIs from USA, UK, UAE, Australia</p>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
                <span className="text-xs uppercase tracking-widest opacity-60">Explore</span>
                <FaArrowDown className="text-lg opacity-60" />
            </div>
        </section>
    );
}
