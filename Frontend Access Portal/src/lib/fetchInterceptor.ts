/**
 * Global fetch interceptor that automatically adds X-Session-Id header
 * This wraps the native fetch function to add session tracking
 */

// Store the original fetch
const originalFetch = window.fetch;

/**
 * Get sessionId from cookie
 */
function getSessionIdFromCookie(): string | null {
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
 * Enhanced fetch that adds X-Session-Id header automatically
 */
window.fetch = function (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const sessionId = getSessionIdFromCookie();

  // Only add header if sessionId exists
  if (sessionId) {
    const enhancedInit: RequestInit = {
      ...init,
      headers: {
        ...init?.headers,
        'X-Session-Id': sessionId,
      },
    };
    return originalFetch(input, enhancedInit);
  }

  // No sessionId, use original fetch
  return originalFetch(input, init);
};

// Log that interceptor is installed
console.log('[Session Interceptor] Installed - X-Session-Id will be added to all requests');
