"use client";

import { useEffect, useState } from 'react';

interface FAQ {
    id: string;
    question: string;
    answer: string;
}

export default function FAQ() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);

    useEffect(() => {
        fetch('/api/content/faqs')
            .then(res => res.json())
            .then(data => setFaqs(data))
            .catch(err => console.error('Failed to fetch FAQs:', err));
    }, []);

    return (
        <section className="py-20 px-8 bg-background">
            <div className="max-w-3xl mx-auto">
                <h2 className="font-serif text-3xl md:text-4xl text-primary text-center mb-12">Frequently Asked Questions</h2>

                <div className="space-y-6">
                    {faqs.map((faq) => (
                        <div key={faq.id} className="border-b border-primary/10 pb-6">
                            <h3 className="font-serif text-lg text-text font-bold mb-2">{faq.question}</h3>
                            <p className="font-sans text-text/70 leading-relaxed">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
