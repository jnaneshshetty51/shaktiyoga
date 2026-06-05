"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import AuthDebug from "@/components/AuthDebug";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <CurrencyProvider>
                {children}
                <AuthDebug />
            </CurrencyProvider>
        </AuthProvider>
    );
}
