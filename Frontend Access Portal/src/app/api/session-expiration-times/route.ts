import { NextResponse } from 'next/server';

// This should match your backend's session control endpoint
const API_URL = process.env.API_URL || 'http://localhost:8081/api/v1';

export async function GET(request: Request) {
    try {
        // Get the auth token from the request cookies
        const cookieHeader = request.headers.get('cookie');
        const authToken = cookieHeader?.split(';')
            .find(c => c.trim().startsWith('auth_token='))
            ?.split('=')[1];

        if (!authToken) {
            // Return default values if no token
            return NextResponse.json({
                jwtExpirationMs: 15 * 60 * 1000, // 15 minutes default
                refreshTokenExpirationMs: 7 * 24 * 60 * 60 * 1000 // 7 days default
            });
        }

        // Call your backend API with authentication
        const cookieStore = request.headers;
        const sessionIdCookie = cookieHeader?.split(';')
            .find(c => c.trim().startsWith('session_id='))
            ?.split('=')[1];
        
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        };
        
        if (sessionIdCookie) {
            headers['X-Session-Id'] = sessionIdCookie;
        }
        
        const response = await fetch(`${API_URL}/session-control/expiration-times`, {
            headers
        });

        if (response.ok) {
            const data = await response.json();
            return NextResponse.json(data);
        } else {
            throw new Error('Backend API call failed');
        }
    } catch (error) {
        console.warn('Failed to fetch session expiration times:', error);
        // Return defaults on error
        return NextResponse.json({
            jwtExpirationMs: 15 * 60 * 1000, // 15 minutes default
            refreshTokenExpirationMs: 7 * 24 * 60 * 60 * 1000 // 7 days default
        });
    }
}