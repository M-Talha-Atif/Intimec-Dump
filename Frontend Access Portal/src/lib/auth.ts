// /lib/auth.ts - Simplified without background refresh logic
'use server';

import { cookies } from 'next/headers';
import * as jose from 'jose';
import type { JWTPayload } from 'jose';

// --- Configuration and Constants ---

const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const SESSION_ID_KEY = 'session_id';
const API_URL = process.env.API_URL || 'http://localhost:8181/api/v1';
const JWT_SECRET = process.env.JWT_SECRET;

// Buffer time before token expiration to trigger a refresh (e.g., 5 minutes)
const REFRESH_BUFFER_MS = 10 * 60 * 1000;
// A fixed, long duration for refresh tokens (e.g., 7 days)
const REFRESH_TOKEN_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

// --- Type Definitions ---

export interface AuthResponseData {
    token: string;
    expiresIn: number;
    refreshToken: string;
    sessionId: string;
}

export interface AuthResponse {
    status: number;
    data: AuthResponseData;
    timestamp: string;
}

export interface LoginCredentials {
    identifier: string;
    password: string;
}

export interface TokenStatus {
    isValid: boolean;
    isExpired: boolean;
    needsRefresh: boolean;
    expiresAt: number | null;
}

// Add new interface for dynamic expiration times
interface SessionExpirationTimes {
    jwtExpirationMs: number;
    refreshTokenExpirationMs: number;
}

// Cache for expiration times to avoid repeated API calls
let cachedExpirationTimes: SessionExpirationTimes | null = null;

// Automatic refresh timer management
let refreshTimer: NodeJS.Timeout | null = null;

// --- Core Private Helpers ---

/**
 * Fetches dynamic session expiration times from the backend
 */
async function _getSessionExpirationTimes(): Promise<SessionExpirationTimes> {
    // Return cached values if available
    if (cachedExpirationTimes) {
        return cachedExpirationTimes;
    }

    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(AUTH_TOKEN_KEY)?.value;
        
        if (!token) {
            // Fallback to defaults if no token
            return {
                jwtExpirationMs: 15 * 60 * 1000, // 15 minutes
                refreshTokenExpirationMs: 7 * 24 * 60 * 60 * 1000 // 7 days
            };
        }

        const response = await fetch(`${API_URL}/session-control/expiration-times`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            cachedExpirationTimes = await response.json();
            return cachedExpirationTimes!;
        }
    } catch (error) {
        console.warn('Failed to fetch session expiration times, using defaults:', error);
    }

    // Fallback to defaults
    const defaultTimes = {
        jwtExpirationMs: 15 * 60 * 1000, // 15 minutes (from your application-dev.properties)
        refreshTokenExpirationMs: 7 * 24 * 60 * 60 * 1000 // 7 days
    };
    
    cachedExpirationTimes = defaultTimes;
    return defaultTimes;
}

/**
 * Clear cached expiration times (call this after login/logout)
 */
function _clearExpirationCache(): void {
    cachedExpirationTimes = null;
}

/**
 * Decodes a JWT and returns its payload without verification.
 */
function getJwtPayload(token: string): JWTPayload | null {
    try {
        return jose.decodeJwt(token);
    } catch {
        console.error('Failed to decode JWT.');
        return null;
    }
}

/**
 * Sets the authentication and refresh tokens in secure, httpOnly cookies.
 * Used during login when both tokens are new.
 */
async function _setAuthCookies(authData: AuthResponseData): Promise<void> {
    const cookieStore = await cookies();
    const tokenPayload = getJwtPayload(authData.token);

    if (!tokenPayload || typeof tokenPayload.exp !== 'number') {
        throw new Error('Invalid access token payload.');
    }

    // Get dynamic expiration times
    const { refreshTokenExpirationMs } = await _getSessionExpirationTimes();

    // Auth token - non-httpOnly so WebSocket and client can access it
    cookieStore.set(AUTH_TOKEN_KEY, authData.token, {
        expires: new Date(tokenPayload.exp * 1000),
        path: '/',
        httpOnly: false, // Allow JavaScript access for WebSocket
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });

    cookieStore.set(REFRESH_TOKEN_KEY, authData.refreshToken, {
        expires: new Date(Date.now() + refreshTokenExpirationMs), // Dynamic duration
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });

    // Store sessionId in non-httpOnly cookie so JavaScript can read it
    cookieStore.set(SESSION_ID_KEY, authData.sessionId, {
        expires: new Date(Date.now() + refreshTokenExpirationMs), // Same duration as refresh token
        path: '/',
        httpOnly: false, // Non-httpOnly so client can read it
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
}

/**
 * Updates only the access token cookie.
 * Used during token refresh when the refresh token stays the same.
 */
async function _updateAccessToken(token: string): Promise<void> {
    const cookieStore = await cookies();
    const tokenPayload = getJwtPayload(token);

    if (!tokenPayload || typeof tokenPayload.exp !== 'number') {
        throw new Error('Invalid access token payload.');
    }

    // Update auth token - non-httpOnly for WebSocket access
    cookieStore.set(AUTH_TOKEN_KEY, token, {
        expires: new Date(tokenPayload.exp * 1000),
        path: '/',
        httpOnly: false, // Allow JavaScript access for WebSocket
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
}

/**
 * Centralized login logic to avoid repetition.
 */
async function _performLogin(endpoint: string, credentials: LoginCredentials, userAgent?: string, clientIp?: string): Promise<{ success: boolean; error?: string }> {
    try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (userAgent) {
            headers['X-User-Agent'] = userAgent;
            console.log('[PerformLogin] Sending X-User-Agent header:', userAgent);
        } else {
            console.log('[PerformLogin] No user agent provided');
        }
        if (clientIp) {
            headers['X-Forwarded-For'] = clientIp;
            console.log('[PerformLogin] Sending X-Forwarded-For header:', clientIp);
        } else {
            console.log('[PerformLogin] No client IP provided');
        }
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.debug('Login failed with status:', response.status, 'Body:', errorBody);
            
            // Handle specific error cases
            if (response.status === 423) {
                // Account Locked - return user-friendly message without revealing lock time
                return { 
                    success: false, 
                    error: 'Account is temporarily locked due to multiple failed login attempts. Please try again in a few minutes .' 
                };
            }
            
            // Handle other authentication errors
            return { success: false, error: 'Invalid username or password.' };
        }

        const authResponse: AuthResponse = await response.json();
        await _setAuthCookies(authResponse.data);

        // Start automatic refresh after successful login
        // Note: Auto-refresh must be handled on the client side
        console.log('Login successful - client should start auto-refresh');

        return { success: true };
    } catch (error) {
        console.error('Login process error:', error);
        const isNetworkError = error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('network'));
        return {
            success: false,
            error: isNetworkError ? 'Could not connect to authentication service.' : 'An unexpected error occurred during login.',
        };
    }
}

// --- Public API ---

export async function _login(credentials: LoginCredentials, userAgent?: string, clientIp?: string): Promise<{ success: boolean; error?: string }> {
    _clearExpirationCache(); // Clear cache before login
    return _performLogin(`${API_URL}/auth/login`, credentials, userAgent, clientIp);
}

export async function _loginLDAP(credentials: LoginCredentials, userAgent?: string, clientIp?: string): Promise<{ success: boolean; error?: string }> {
    _clearExpirationCache(); // Clear cache before login
    return _performLogin(`${API_URL}/auth/ldap/login`, credentials, userAgent, clientIp);
}

export async function _logout(): Promise<{ success: boolean }> {
    // Stop automatic refresh first - handled on client side
    console.log('Logout - client should stop auto-refresh');
    _clearExpirationCache(); // Clear cache on logout
    
    const cookieStore = await cookies();
    const authToken = cookieStore.get(AUTH_TOKEN_KEY)?.value;
    const refreshToken = cookieStore.get(REFRESH_TOKEN_KEY)?.value;

    cookieStore.delete(AUTH_TOKEN_KEY);
    cookieStore.delete(REFRESH_TOKEN_KEY);
    cookieStore.delete(SESSION_ID_KEY);

    if (authToken) {
        fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                refreshToken: refreshToken // Send refresh token to logout from this device only
            }),
        }).catch(err => {
            console.warn('Backend logout call failed, but user is logged out locally.', err);
        });
    }

    return { success: true };
}

/**
 * Validates if the current session exists in the backend.
 * Used on frontend initialization to verify session validity.
 * 
 * @returns {Promise<{ valid: boolean }>} Whether the session is valid
 */
export async function _validateSession(): Promise<{ valid: boolean }> {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get(AUTH_TOKEN_KEY)?.value;
        const sessionId = cookieStore.get(SESSION_ID_KEY)?.value;

        if (!authToken || !sessionId) {
            return { valid: false };
        }

        const response = await fetch(`${API_URL}/auth/validate-session`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-Session-Id': sessionId,
            },
        });

        if (!response.ok) {
            return { valid: false };
        }

        const data = await response.json();
        return { valid: data.valid };
    } catch (error) {
        console.error('Session validation failed:', error);
        return { valid: false };
    }
}

export async function _refreshToken(): Promise<{ success: boolean }> {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_KEY)?.value;

    if (!refreshToken) {
        return { success: false };
    }
    try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            const { isValid, isExpired, needsRefresh, expiresAt } = await _getTokenStatus()
            if (isExpired)
                console.error('Token refresh failed on the backend.');
            else if (isValid) {
                if (needsRefresh)
                    console.warn('Token refresh not needed, but backend returned an error.');
                else
                    console.info('Token is still valid, no refresh needed.');
                return { success: true };
            }
            else
                console.error('Token refresh failed with unexpected status:', { isValid, isExpired, needsRefresh, expiresAt });
            
            return { success: false }; // Added missing return
        }

        const authResponse: AuthResponse = await response.json();
        _clearExpirationCache(); // Clear cache before updating token
        
        // Only update the access token, keep the existing refresh token
        await _updateAccessToken(authResponse.data.token);

        // Schedule next auto-refresh for the new token - handled on client side
        console.log('Token refresh successful - client should reschedule auto-refresh');

        return { success: true };
    } catch (error) {
        console.error('Token refresh error:', error);
        await _logout();
        return { success: false };
    }
}

/**
 * Gets the current token status without performing any refresh
 */
export async function _getTokenStatus(): Promise<TokenStatus> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(AUTH_TOKEN_KEY)?.value;

        if (!token) {
            return { isValid: false, isExpired: true, needsRefresh: false, expiresAt: null };
        }

        const payload = getJwtPayload(token);
        if (!payload || typeof payload.exp !== 'number') {
            return { isValid: false, isExpired: true, needsRefresh: false, expiresAt: null };
        }

        // Get dynamic expiration times for adaptive refresh buffer (with fallback)
        let jwtExpirationMs = 15 * 60 * 1000; // Default: 15 minutes
        try {
            const expirationTimes = await _getSessionExpirationTimes();
            jwtExpirationMs = expirationTimes.jwtExpirationMs;
        } catch (error) {
            console.warn('Failed to get session expiration times, using default:', error);
        }
        
        const dynamicRefreshBuffer = Math.min(jwtExpirationMs * 0.1, 10 * 60 * 1000); // 10% of token lifetime or 10 minutes max

        const now = Date.now();
        const expiresAt = payload.exp * 1000;
        const isExpired = now >= expiresAt;
        const needsRefresh = (expiresAt - now) < dynamicRefreshBuffer;

        // Only verify if not expired
        let isValid = false;
        if (!isExpired && JWT_SECRET) {
            try {
                const secret = new TextEncoder().encode(JWT_SECRET);
                await jose.jwtVerify(token, secret);
                isValid = true;
            } catch (error) {
                console.error('JWT Verification Failed:', error);
            }
        }

        return { isValid, isExpired, needsRefresh, expiresAt };
    } catch (error) {
        console.error('Error getting token status:', error);
        return { isValid: false, isExpired: true, needsRefresh: false, expiresAt: null };
    }
}

/**
 * Simple auth check without any refresh logic
 */
export async function _isAuthenticated(): Promise<boolean> {
    const status = await _getTokenStatus();
    return status.isValid;
}

/**
 * Gets current user from token without refresh
 */
export async function _getCurrentUser(): Promise<JWTPayload | null> {
    const status = await _getTokenStatus();
    if (!status.isValid) return null;

    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_TOKEN_KEY)?.value;
    return token ? getJwtPayload(token) : null;
}

/**
 * Gets the current auth token from cookies
 */
export async function _getAuthToken(): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        return cookieStore.get('auth_token')?.value || null;
    } catch {
        return null;
    }
}