import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getApiUrl } from '@/lib/api-proxy';

const API_URL = getApiUrl().replace('/api/v1', ''); // Remove /api/v1 suffix for this route

/**
 * Universal catch-all API proxy handler
 * Forwards ALL /api/* requests to the backend with cookies as headers
 */
async function handleRequest(request: NextRequest, method: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;
    const sessionId = cookieStore.get('session_id')?.value;

    // Extract the path after /api/
    const pathname = request.nextUrl.pathname;
    const backendPath = pathname.replace(/^\/api/, '/api/v1');
    
    // Build the full backend URL with query params
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const backendUrl = `${API_URL}${backendPath}${queryString ? `?${queryString}` : ''}`;

    // Build headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Forward session ID via custom header for session activity tracking
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    // Forward refresh token via custom header for session activity tracking
    if (refreshToken) {
      headers['X-Refresh-Token'] = refreshToken;
    }

    // Copy relevant headers from original request
    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    // Build fetch options
    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    // Include body for POST, PUT, PATCH, DELETE requests
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && request.body) {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    // Forward request to backend
    const response = await fetch(backendUrl, fetchOptions);

    // Handle 204 No Content responses (no body allowed)
    if (response.status === 204) {
      return new NextResponse(null, {
        status: 204,
      });
    }

    // Get response body
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch {
      responseData = responseText;
    }

    // Return response with same status
    return NextResponse.json(responseData || {}, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error(`Error proxying ${method} request to ${request.nextUrl.pathname}:`, error);
    return NextResponse.json(
      { 
        error: 'Proxy Error', 
        message: error instanceof Error ? error.message : 'Failed to proxy request to backend' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handleRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, 'PUT');
}

export async function PATCH(request: NextRequest) {
  return handleRequest(request, 'PATCH');
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request, 'DELETE');
}
