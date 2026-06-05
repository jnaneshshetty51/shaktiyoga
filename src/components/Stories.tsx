"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Testimonial {
    id: string;
    authorName: string;
    location: string | null;
    planType: string | null;
    quote: string;
    rating: number;
    imageUrl: string | null;
}

export default function Stories() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

    useEffect(() => {
        fetch('/api/content/testimonials')
            .then(res => res.json())
            .then(data => setTestimonials(data.slice(0, 3))) // Show only 3
            .catch(err => console.error('Failed to fetch testimonials:', err));
    }, []);

    return (
        <section className="py-20 px-8 bg-accent/30">
            <div className="max-w-6xl mx-auto">
                <h2 className="font-serif text-3xl md:text-4xl text-primary text-center mb-16">Stories of Transformation</h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((story) => (
                        <div key={story.id} className="bg-white p-8 rounded-lg shadow-md border border-primary/5 flex flex-col">
                            <div className="text-secondary text-4xl font-serif mb-4">"</div>
                            <p className="font-sans text-text/80 italic mb-6 flex-grow">
                                {story.quote}
                            </p>
                            <div className="mt-auto">
                                <p className="font-serif font-bold text-primary">{story.authorName.split(' ')[0]} {story.authorName.split(' ')[1]?.[0]}.</p>
                                <p className="font-sans text-xs text-text/60 uppercase tracking-wider">{story.location || 'Global'}</p>
                                {story.planType && (
                                    <span className="inline-block mt-2 px-2 py-1 bg-accent text-secondary text-[10px] font-bold uppercase tracking-widest rounded">
                                        {story.planType.replace('_', ' ')}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link href="/stories" className="inline-block text-primary font-sans font-bold uppercase tracking-widest text-sm hover:text-secondary transition-colors border-b border-primary hover:border-secondary pb-1">
                        View All Stories
                    </Link>
                </div>
            </div>
        </section>
    );
}
