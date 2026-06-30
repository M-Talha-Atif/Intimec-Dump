import { NextRequest, NextResponse } from 'next/server';

// Helper function to decode JWT and get expiry
function decodeJWTPayload(token: string): Record<string, any> | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = parts[1];
        const decoded = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

function getTokenExpiry(token: string): Date | null {
    const payload = decodeJWTPayload(token);
    if (!payload?.exp || typeof payload.exp !== 'number') return null;
    return new Date(1000 * payload.exp);
}

const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refresh');

    if (!token || !refreshToken) {
        // Redirect to login with error param
        return NextResponse.redirect(new URL('/?error=sso', request.url));
    }

    // Get expiry from JWT payload for auth token
    const tokenExpiry = getTokenExpiry(token);
    if (!tokenExpiry) {
        return NextResponse.redirect(new URL('/?error=invalid_token', request.url));
    }

    // Get expiry from JWT payload for refresh token (fallback: 7 days)
    let refreshExpiry = getTokenExpiry(refreshToken);
    if (!refreshExpiry) {
        refreshExpiry = new Date();
        refreshExpiry.setDate(refreshExpiry.getDate() + 7);
    }

    // Set cookies securely
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.cookies.set(AUTH_TOKEN_KEY, token, {
        expires: tokenExpiry,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
    response.cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
        expires: refreshExpiry,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
    return response;
}
