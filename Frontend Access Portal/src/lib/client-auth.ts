/**
 * Client-side utility functions for accessing cookies and tokens
 */

/**
 * Get a cookie value by name on the client side
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    console.log('getCookie: Running on server side, returning null');
    return null; // Server-side rendering
  }
  
  console.log('getCookie: Looking for cookie:', name);
  console.log('getCookie: All cookies:', document.cookie);
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift() || null;
    console.log('getCookie: Found cookie value:', cookieValue ? 'YES' : 'NO');
    return cookieValue;
  }
  console.log('getCookie: Cookie not found');
  return null;
}

/**
 * Get the auth token from cookies on the client side
 */
export function getClientAuthToken(): string | null {
  console.log('getClientAuthToken: Attempting to get auth token...');
  const token = getCookie('auth_token');
  console.log('getClientAuthToken: Token found:', !!token);
  return token;
}

/**
 * Get the refresh token from cookies on the client side
 */
export function getClientRefreshToken(): string | null {
  return getCookie('refresh_token');
}

/**
 * Check if user is authenticated based on client-side cookie
 */
export function isClientAuthenticated(): boolean {
  const token = getClientAuthToken();
  return token !== null && token.length > 0;
}
