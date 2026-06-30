'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { _logout } from '@/lib/auth';

interface TokenStatus {
    isValid: boolean;
    isExpired: boolean;
    needsRefresh: boolean;
    expiresAt: number | null;
}

interface TokenRefreshProviderProps {
    children: React.ReactNode;
    checkInterval?: number; // in milliseconds
    onTokenExpired?: () => void;
}

export function TokenRefreshProvider({ 
    children, 
    checkInterval = 60000, // 1 minute
    onTokenExpired 
}: TokenRefreshProviderProps) {
    const router = useRouter();
    const refreshingRef = useRef(false);

    useEffect(() => {
        const checkAndRefreshToken = async () => {
            if (refreshingRef.current) return;

            try {
                const response = await fetch('/api/auth/status');
                const status: TokenStatus = await response.json();

                if (status.isExpired) {
                    // Token expired - trigger full logout with backend call
                    await _logout();
                    onTokenExpired?.();
                    router.push('/');
                    return;
                }

                if (status.needsRefresh && status.isValid) {
                    refreshingRef.current = true;
                    
                    try {
                        const refreshResponse = await fetch('/api/auth/refresh', {
                            method: 'POST',
                        });
                        
                        const refreshResult = await refreshResponse.json();
                        
                        if (!refreshResult.success) {
                            console.warn('Token refresh failed - logging out');
                            // Refresh failed - trigger full logout with backend call
                            await _logout();
                            onTokenExpired?.();
                            router.push('/');
                        }
                    } catch (error) {
                        console.error('Token refresh error:', error);
                    } finally {
                        refreshingRef.current = false;
                    }
                }
            } catch (error) {
                console.error('Token status check failed:', error);
            }
        };

        // Initial check
        checkAndRefreshToken();

        // Set up interval
        const interval = setInterval(checkAndRefreshToken, checkInterval);

        return () => clearInterval(interval);
    }, [checkInterval, onTokenExpired, router]);

    return <>{children}</>;
}