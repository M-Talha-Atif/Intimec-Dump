import { useCallback } from 'react';

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
 * Custom hook that provides a fetch function with automatic X-Session-Id header
 * This enables the API Gateway to track session activity via gRPC
 * 
 * Usage:
 * ```tsx
 * const fetchWithSession = useFetchWithSession();
 * const response = await fetchWithSession('/api/users', { method: 'GET' });
 * ```
 */
export function useFetchWithSession() {
  return useCallback(
    async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
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
    },
    []
  );
}

/**
 * Helper hook to get current sessionId
 */
export function useSessionId(): string | null {
  return getSessionIdFromCookie();
}
