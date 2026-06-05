"use client";

import { useEffect, useState } from 'react';

interface Benefit {
    id: string;
    icon: string;
    title: string;
    description: string;
}

export default function WhyUs() {
    const [benefits, setBenefits] = useState<Benefit[]>([]);

    useEffect(() => {
        fetch('/api/content/why-us')
            .then(res => res.json())
            .then(data => setBenefits(data))
            .catch(err => console.error('Failed to fetch benefits:', err));
    }, []);

    return (
        <section className="py-20 px-8 bg-primary text-white">
            <div className="max-w-6xl mx-auto text-center">
                <h2 className="font-serif text-3xl md:text-4xl mb-12">Why Shakti Yoga Kendra?</h2>

                <div className="grid md:grid-cols-3 gap-12">
                    {benefits.map((benefit) => (
                        <div key={benefit.id} className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6 text-2xl">
                                {benefit.icon}
                            </div>
                            <h3 className="font-serif text-xl mb-4">{benefit.title}</h3>
                            <p className="font-sans text-white/80 leading-relaxed">
                                {benefit.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
