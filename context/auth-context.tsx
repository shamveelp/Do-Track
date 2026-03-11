import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        // Initial fetch of session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (loading) return;

        // segments[0] can be '(tabs)', 'onboarding', 'login', 'signup', 'otp', or undefined
        const firstSegment = segments[0] as string | undefined;
        const inAuthGroup = firstSegment === '(tabs)' || firstSegment === 'add-transaction';
        const isSplash = firstSegment === undefined;
        const isPublicAuthPage = ['onboarding', 'login', 'signup', 'otp'].includes(firstSegment || '');

        if (session) {
            // If we're logged in, we shouldn't be on splash or public auth pages
            if (isSplash || isPublicAuthPage) {
                router.replace('/(tabs)');
            }
        } else {
            // If we're NOT logged in, we shouldn't be in the protected app area
            if (inAuthGroup) {
                router.replace('/onboarding');
            } else if (isSplash) {
                // After splash, if not logged in, go to onboarding
                router.replace('/onboarding');
            }
        }
    }, [session, loading, segments]);

    const signOut = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        setLoading(false);
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
