import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || 'http://localhost:8181/api/v1';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value; // Get refresh token from HTTP-only cookie

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Get pagination and search parameters from query string
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '25';
    const search = searchParams.get('search') || '';

    // Build query string with optional search
    const queryParams = new URLSearchParams({ page, size });
    if (search) {
      queryParams.append('search', search);
    }

    // Build headers
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    
    // Add refresh token to headers if available
    if (refreshToken) {
      headers['X-Refresh-Token'] = refreshToken;
    }

    // Forward the request to the backend with pagination and search
    const response = await fetch(`${API_URL}/auth/sessions?${queryParams.toString()}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      return NextResponse.json(
        { error: 'Failed to fetch sessions', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Get session IDs from request body
    const body = await request.json();
    const { sessionIds } = body;

    if (!sessionIds || !Array.isArray(sessionIds)) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'sessionIds array is required' },
        { status: 400 }
      );
    }

    // Forward the termination request to the backend
    const response = await fetch(`${API_URL}/auth/sessions/terminate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionIds }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      return NextResponse.json(
        { error: 'Failed to terminate sessions', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error terminating sessions:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to terminate sessions' },
      { status: 500 }
    );
  }
}
