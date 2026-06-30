"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { _isAuthenticated, _login, _logout, LoginCredentials } from '@/lib/auth';

export interface UseAuthReturn {
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    logout: () => Promise<void>;
}

export default function useAuth(): UseAuthReturn {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Function to check auth status from server
    const checkAuthStatus = async () => {
        try {
            const response = await fetch('/api/auth/status');
            const status = await response.json();
            const isAuthed = status.isValid;

            setIsAuthenticated(isAuthed);
            return isAuthed;
        } catch (error) {
            setIsAuthenticated(false);
            return false;
        }
    };

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = async () => {
            setIsLoading(true);
            await checkAuthStatus();
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (credentials: LoginCredentials): Promise<boolean> => {
        setIsLoading(true);
        setIsLoggingIn(true);
        setError(null);

        try {
            // Call the Next.js API route which will forward the browser's user agent
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Authentication failed');
            }

            // Re-check authentication status from server after successful login
            const isAuthed = await checkAuthStatus();

            if (isAuthed) {
                router.push('/dashboard');
                return true;
            } else {
                throw new Error('Authentication verification failed');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Login failed');
            setIsAuthenticated(false);
            return false;
        } finally {
            setIsLoading(false);
            setIsLoggingIn(false);
        }
    };

    const logout = async (): Promise<void> => {
        setIsLoading(true);
        try {
            setIsAuthenticated(false);
            await _logout();

            // Force page reload to clear all client-side state including React Query cache
            if (typeof window !== 'undefined') {
                window.location.href = '/';
            } else {
                router.push('/');
            }
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        isAuthenticated,
        isLoggingIn,  
        error,
        login,
        logout,
    };
}
