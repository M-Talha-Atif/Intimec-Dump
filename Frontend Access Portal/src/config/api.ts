/**
 * Centralized API configuration for backend services
 */

// Base URLs for different services
export const API_CONFIG = {
  // Application Permissions Service (Users, Roles, Permissions)
  PERMISSIONS_SERVICE: process.env.NEXT_PUBLIC_PERMISSIONS_SERVICE_URL || 'http://localhost:8095',
  
  // Workflows Service
  WORKFLOWS_SERVICE: process.env.NEXT_PUBLIC_WORKFLOWS_SERVICE_URL || 'http://localhost:8098',
  
  // Auth Service
  AUTH_SERVICE: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:8090',
  
  // Identity Service
  IDENTITY_SERVICE: process.env.NEXT_PUBLIC_IDENTITY_SERVICE_URL || 'http://localhost:8094',
  
  // Generic backend URL (for proxied requests)
  BACKEND: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8089',
} as const;

/**
 * Get authentication headers for API requests
 * Automatically retrieves JWT token from localStorage
 */
export const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

/**
 * Make an authenticated API request
 * @param url - Full URL or path (if using service base URL)
 * @param options - Fetch options
 * @param serviceBase - Optional service base URL from API_CONFIG
 */
export const authFetch = async (
  url: string,
  options: RequestInit = {},
  serviceBase?: string
): Promise<Response> => {
  const fullUrl = serviceBase ? `${serviceBase}${url}` : url;
  
  return fetch(fullUrl, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
};

/**
 * Common API error handling
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message?: string
  ) {
    super(message || `API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

/**
 * Handle API response and throw on error
 */
export const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, response.statusText, errorText);
  }
  
  return response.json();
};
