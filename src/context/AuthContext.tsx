"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'visitor' | 'member_everyday' | 'member_therapy' | 'trial' | 'admin';

interface User {
    name: string;
    email: string;
    role: UserRole;
    credits?: number; // For therapy sessions
}

interface AuthContextType {
    user: User | null;
    login: (role: UserRole) => void;
    logout: () => void;
    isLoading: boolean;
    useCredit: () => boolean; // Returns true if credit was used, false if no credits
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check local storage on mount
        const storedRole = localStorage.getItem('shakti_user_role') as UserRole;
        const storedCredits = localStorage.getItem('shakti_user_credits');

        if (storedRole) {
            setUser({
                name: 'Jane Doe',
                email: 'jane@example.com',
                role: storedRole,
                credits: storedCredits ? parseInt(storedCredits) : (storedRole === 'member_therapy' ? 4 : 0)
            });
        }
        setIsLoading(false);
    }, []);

    const login = (role: UserRole) => {
        const initialCredits = role === 'member_therapy' ? 4 : 0;
        localStorage.setItem('shakti_user_role', role);
        localStorage.setItem('shakti_user_credits', initialCredits.toString());

        setUser({
            name: 'Jane Doe',
            email: 'jane@example.com',
            role,
            credits: initialCredits
        });
    };

    const logout = () => {
        localStorage.removeItem('shakti_user_role');
        localStorage.removeItem('shakti_user_credits');
        setUser(null);
    };

    const useCredit = () => {
        if (user && user.credits && user.credits > 0) {
            const newCredits = user.credits - 1;
            setUser({ ...user, credits: newCredits });
            localStorage.setItem('shakti_user_credits', newCredits.toString());
            return true;
        }
        return false;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading, useCredit }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
