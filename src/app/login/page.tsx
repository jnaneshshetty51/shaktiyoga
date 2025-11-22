"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();

    const handleQuickLogin = (role: 'admin' | 'member_everyday' | 'member_therapy' | 'trial') => {
        login(role);
        if (role === 'admin') {
            router.push('/admin');
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-accent/30 py-20 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl border-t-4 border-primary">
                <div className="text-center mb-8">
                    <Link href="/" className="font-serif text-3xl font-bold text-primary tracking-wider">
                        Shakti Yoga
                    </Link>
                    <h2 className="mt-4 text-xl font-sans text-text/80">Welcome Back</h2>
                </div>

                <form className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-bold text-text/70 mb-1 uppercase tracking-wider">Email</label>
                        <input type="email" id="email" className="w-full p-3 border border-gray-200 rounded focus:outline-none focus:border-primary transition-colors" placeholder="your@email.com" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-bold text-text/70 mb-1 uppercase tracking-wider">Password</label>
                        <input type="password" id="password" className="w-full p-3 border border-gray-200 rounded focus:outline-none focus:border-primary transition-colors" placeholder="••••••••" />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center cursor-pointer">
                            <input type="checkbox" className="mr-2 text-primary focus:ring-primary" />
                            <span className="text-text/70">Remember me</span>
                        </label>
                        <a href="#" className="text-primary hover:text-secondary transition-colors">Forgot password?</a>
                    </div>

                    <button type="button" className="w-full py-3 bg-primary text-white font-bold uppercase tracking-widest rounded hover:bg-secondary transition-colors">
                        Log In
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-gray-100">
                    <p className="text-xs text-center text-gray-400 uppercase tracking-widest mb-4">Dev: Quick Login</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => handleQuickLogin('admin')} className="p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-bold">
                            Admin
                        </button>
                        <button onClick={() => handleQuickLogin('member_everyday')} className="p-2 text-xs bg-green-50 hover:bg-green-100 rounded text-green-700 font-bold">
                            Member (Everyday)
                        </button>
                        <button onClick={() => handleQuickLogin('member_therapy')} className="p-2 text-xs bg-purple-50 hover:bg-purple-100 rounded text-purple-700 font-bold">
                            Member (Therapy)
                        </button>
                        <button onClick={() => handleQuickLogin('trial')} className="p-2 text-xs bg-orange-50 hover:bg-orange-100 rounded text-orange-700 font-bold">
                            Trial User
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center text-sm text-text/60">
                    Don't have an account? <Link href="/signup" className="text-primary font-bold hover:text-secondary">Sign up</Link>
                </div>
            </div>
        </main>
    );
}
