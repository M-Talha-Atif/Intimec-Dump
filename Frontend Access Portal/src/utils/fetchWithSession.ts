/**
 * Fetch wrapper that automatically adds X-Session-Id header to requests
 * This enables the API Gateway to track session activity via gRPC
 */

/**
 * Get sessionId from cookie (client-side only)
 */
function getSessionIdFromCookie(): string | null {
  if (typeof document === 'undefined') {
    return null; // Server-side
  }

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'session_id') {
      return value;
    }
  }
  return null;
}

/**
 * Enhanced fetch that adds X-Session-Id header for activity tracking
 */
export async function fetchWithSession(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const sessionId = getSessionIdFromCookie();

  // Clone init to avoid mutating the original
  const enhancedInit: RequestInit = {
    ...init,
    headers: {
      ...init?.headers,
      ...(sessionId ? { 'X-Session-Id': sessionId } : {}),
    },
  };

  return fetch(input, enhancedInit);
}

/**
 * Helper to get sessionId (useful for debugging)
 */
export function getSessionId(): string | null {
  return getSessionIdFromCookie();
}
