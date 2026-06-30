import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Add GET method for testing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('GET /api/notifications/[id] route called - TEST');
  return NextResponse.json({ message: 'Route is working', id: params.id });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('PUT /api/notifications/[id] route called for marking as viewed');
  console.log('Params received:', params);
  
  try {
    const notificationId = params.id;
    console.log('Notification ID from params:', notificationId);
    
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token');

    if (!authToken) {
      console.log('No auth token found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Use environment variables for backend URL
    const backendUrl = `${process.env.BACKEND_URL}/api/v1/user-notifications/mark-viewed/${notificationId}`;
    
    const sessionId = cookieStore.get('session_id')?.value;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken.value}`,
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Route: Backend error marking notification as viewed:', response.status, response.statusText, errorText);
      return NextResponse.json(
        { error: 'Failed to mark notification as viewed', details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Route: Error marking notification as viewed:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
