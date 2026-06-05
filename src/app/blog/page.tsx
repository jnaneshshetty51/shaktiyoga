"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    date: string;
}

// Fallback blog posts for when API fails
const FALLBACK_POSTS: BlogPost[] = [
    {
        id: 'post_1',
        slug: 'yoga-for-back-pain',
        title: '5 Asanas to Relieve Lower Back Pain',
        excerpt: 'Discover gentle yoga poses that can help alleviate chronic back pain and improve spinal health.',
        category: 'Health',
        date: 'Nov 15, 2025'
    },
    {
        id: 'post_2',
        slug: 'travel-stress-relief',
        title: 'Yoga for Travel Stress & Jet Lag',
        excerpt: 'Simple breathing techniques and stretches to keep you grounded while traveling.',
        category: 'Travel',
        date: 'Nov 10, 2025'
    },
    {
        id: 'post_3',
        slug: 'mindfulness-at-work',
        title: 'Integrating Mindfulness into Your Work Day',
        excerpt: 'Small practices to stay focused and calm during a busy work day.',
        category: 'Mindfulness',
        date: 'Nov 05, 2025'
    }
];

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>(FALLBACK_POSTS);
    const [email, setEmail] = useState('');
    const [subscribing, setSubscribing] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        fetch('/api/content/posts')
            .then(res => res.json())
            .then(data => setPosts(data))
            .catch(err => console.error('Failed to fetch blog posts:', err));
    }, []);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setSubscribing(true);
        try {
            // In a real app, this would call an API to subscribe the email
            // For now, just simulate a successful subscription
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSubscribed(true);
            setEmail('');
        } catch (error) {
            console.error('Failed to subscribe:', error);
            alert('Failed to subscribe. Please try again.');
        } finally {
            setSubscribing(false);
        }
    };

    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="bg-secondary/10 py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="text-secondary font-bold uppercase tracking-widest text-sm mb-4 block">The Shakti Journal</span>
                    <h1 className="font-serif text-4xl md:text-5xl text-primary mb-6">Wisdom for Modern Life</h1>
                    <p className="text-lg text-text/70 max-w-2xl mx-auto">
                        Explore articles on yoga, mindfulness, health, and finding balance in a busy world.
                    </p>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {posts.map((post) => (
                        <article key={post.slug} className="group cursor-pointer">
                            <Link href={`/blog/${post.slug}`}>
                                <div className="bg-gray-100 aspect-[4/3] rounded-lg mb-6 overflow-hidden relative">
                                    {/* Placeholder for Image */}
                                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400 font-serif text-4xl group-hover:scale-105 transition-transform duration-500">
                                        {post.title.charAt(0)}
                                    </div>
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-bold uppercase tracking-widest text-secondary">
                                        {post.category}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="text-xs text-gray-500 uppercase tracking-widest">{post.date}</div>
                                    <h2 className="font-serif text-2xl text-gray-800 group-hover:text-primary transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-text/70 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                    <div className="pt-2 text-secondary font-bold uppercase tracking-widest text-xs group-hover:underline">
                                        Read Article →
                                    </div>
                                </div>
                            </Link>
                        </article>
                    ))}
                </div>
            </section>

            {/* Newsletter / CTA */}
            <section className="bg-primary text-white py-20 px-4">
                <div className="max-w-xl mx-auto text-center">
                    <h2 className="font-serif text-3xl mb-4">Join the Community</h2>
                    <p className="text-white/80 mb-8">
                        Get the latest articles, class updates, and daily inspiration delivered to your inbox.
                    </p>
                    {subscribed ? (
                        <div className="bg-white/10 p-6 rounded-lg">
                            <p className="text-lg font-bold">Thank you for subscribing!</p>
                            <p className="text-white/80 mt-2">Check your inbox to confirm your subscription.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubscribe} className="flex gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email address"
                                required
                                className="flex-1 px-4 py-3 rounded text-gray-800 focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={subscribing}
                                className="px-6 py-3 bg-secondary text-white font-bold uppercase tracking-widest rounded hover:bg-white hover:text-secondary transition-colors disabled:opacity-50"
                            >
                                {subscribing ? 'Subscribing...' : 'Subscribe'}
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
}
