import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token');

    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the notification ID from the request body
    const { notificationId } = await request.json();

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Call the backend mark-as-viewed API
    const backendUrl = `${process.env.BACKEND_URL}/api/v1/user-notifications/mark-viewed/${notificationId}`;
    console.log('Server-side: Making backend call to:', backendUrl);
    
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

    console.log('Server-side: Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server-side: Backend error:', errorText);
      return NextResponse.json(
        { error: 'Failed to mark notification as viewed', details: errorText },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log('Server-side: Backend response data:', responseData);

    return NextResponse.json({ 
      success: true, 
      data: responseData 
    });

  } catch (error) {
    console.error('API Route: Error marking notification as viewed:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as viewed' },
      { status: 500 }
    );
  }
}
