/**
 * Centralized API proxy utilities for Next.js API routes
 * Automatically adds authentication and session tracking headers
 */

import { cookies } from 'next/headers';

// API Gateway URL (NOT direct service URLs) - ensures all requests go through permission checks
const API_URL = process.env.API_URL || 'http://localhost:8089/api/v1';

/**
 * Makes a fetch request to the backend API with automatic header injection.
 * Includes auth token and session ID from cookies.
 */
export async function proxyFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;
  const sessionId = cookieStore.get('session_id')?.value;

  // Build headers with automatic auth and session tracking
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }

  // Construct full URL
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

  // Make the request
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Gets the API base URL
 */
export function getApiUrl(): string {
  return API_URL;
}
