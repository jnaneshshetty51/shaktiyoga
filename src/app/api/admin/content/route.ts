import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Demo data for content (stories, blog posts)
const DEMO_STORIES = [
    { id: '1', userId: '3', user: { id: '3', name: 'Meera Patel' }, title: 'How Yoga Changed My Life', content: 'I started yoga just to lose weight but it transformed me in ways I never imagined...', status: 'PUBLISHED', createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
    { id: '2', userId: '4', user: { id: '4', name: 'Kavita Nair' }, title: 'Finding Inner Peace Through Therapy', content: 'After my accident, I was depressed. Yoga therapy helped me recover not just physically but mentally...', status: 'PUBLISHED', createdAt: new Date(Date.now() - 86400000 * 20).toISOString() },
    { id: '3', userId: '5', user: { id: '5', name: 'Ravi Kumar' }, title: 'A Beginners Journey', content: 'Being a skeptic, I was hesitant to try yoga. Here is my experience as a complete beginner...', status: 'PENDING', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
];

const DEMO_BLOG_POSTS = [
    { id: '1', title: '5 Morning Yoga Poses for Beginners', slug: '5-morning-yoga-poses', excerpt: 'Start your day right with these simple yoga poses...', status: 'PUBLISHED', category: 'Yoga Basics', author: 'Priya Sharma', createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
    { id: '2', title: 'Understanding Yoga Therapy', slug: 'understanding-yoga-therapy', excerpt: 'A comprehensive guide to yoga therapy and its benefits...', status: 'PUBLISHED', category: 'Yoga Therapy', author: 'Priya Sharma', createdAt: new Date(Date.now() - 86400000 * 15).toISOString() },
    { id: '3', title: 'Meditation for Stress Relief', slug: 'meditation-for-stress-relief', excerpt: 'Simple meditation techniques to reduce stress...', status: 'DRAFT', category: 'Meditation', author: 'Anita Desai', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
];

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (token) {
            const payload = await verifyToken(token);
            if (!payload || (payload.role !== 'admin' && payload.role !== 'SUPER_ADMIN')) {
                // Ignore for now and return demo data
            }
        }

        return NextResponse.json({
            stories: DEMO_STORIES,
            blogPosts: DEMO_BLOG_POSTS,
            stats: {
                totalStories: DEMO_STORIES.length,
                publishedStories: DEMO_STORIES.filter(s => s.status === 'PUBLISHED').length,
                totalPosts: DEMO_BLOG_POSTS.length,
                publishedPosts: DEMO_BLOG_POSTS.filter(p => p.status === 'PUBLISHED').length,
            }
        });
    } catch (error) {
        console.error('Admin content API error:', error);
        return NextResponse.json({
            stories: DEMO_STORIES,
            blogPosts: DEMO_BLOG_POSTS,
        });
    }
}
