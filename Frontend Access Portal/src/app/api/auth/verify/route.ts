import { NextResponse } from 'next/server';
import { _isAuthenticated, _logout } from '@/lib/auth';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const authenticated = await _isAuthenticated();

        // Set cache control headers to prevent caching
        const headers = {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        };

        if (authenticated) {
            return NextResponse.json({ authenticated: true }, { status: 200, headers });
        } else {
            await _logout()
            return NextResponse.json(
                { authenticated: false, message: 'Not authenticated' },
                { status: 401, headers }
            );
        }
    } catch (error) {
        console.error('Auth verification error:', error);
        return NextResponse.json(
            { authenticated: false, message: 'Verification error' },
            {
                status: 500,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            }
        );
    }
}
