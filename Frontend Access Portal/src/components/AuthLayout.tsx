'use client';

import { _logout } from '@/lib/auth';
import { TokenRefreshProvider } from './TokenRefreshProvider';
import { useRouter } from 'next/navigation';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
    const router = useRouter();

    const handleTokenExpired = () => {
        console.log('Token expired, redirecting to login');
        // You could also clear any client-side state here
        sessionStorage.clear();
        _logout().then(() => {
            router.push('/');
        });
    };

    return (
        <TokenRefreshProvider
            checkInterval={30000} // Check half a minute
            onTokenExpired={handleTokenExpired}
        >
            {children}
        </TokenRefreshProvider>
    );
}