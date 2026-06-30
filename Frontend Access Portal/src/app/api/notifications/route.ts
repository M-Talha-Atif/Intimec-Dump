import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// import { clsx } from 'react-querybuilder';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token');

    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch all notification types concurrently
    const baseUrl = process.env.API_URL;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken.value}`,
    };

    const [notificationsResponse, announcementsResponse, alertsResponse] = await Promise.all([
      fetch(`${baseUrl}/user-notifications/notifications`, { headers }),
      fetch(`${baseUrl}/user-notifications/announcements`, { headers }),
      fetch(`${baseUrl}/user-notifications/alerts`, { headers }),
    ]);

    // Check if any response failed
    if (!notificationsResponse.ok || !announcementsResponse.ok || !alertsResponse.ok) {
      const errors = [];
      if (!notificationsResponse.ok) errors.push(`notifications: ${notificationsResponse.status}`);
      if (!announcementsResponse.ok) errors.push(`announcements: ${announcementsResponse.status}`);
      if (!alertsResponse.ok) errors.push(`alerts: ${alertsResponse.status}`);

      return NextResponse.json(
        { error: 'Failed to fetch some notification types', details: errors.join(', ') },
        { status: 500 }
      );
    }

    // Parse all responses
    const [notifications, announcements, alerts] = await Promise.all([
      notificationsResponse.json(),
      announcementsResponse.json(),
      alertsResponse.json(),
    ]);

    // Combine all notifications into a single array
    const allNotifications = [
      ...(notifications || []),
      ...(announcements || []),
      ...(alerts || []),
    ];

    return NextResponse.json({ data: allNotifications });

  } catch (error) {
    console.error('API Route: Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  console.log('PUT /api/notifications route called - MARK AS VIEWED');

  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token');

    if (!authToken) {
      console.log('No auth token found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get notification ID from request body
    const { notificationId } = await request.json();
    console.log('Notification ID from request body:', notificationId);

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID required' },
        { status: 400 }
      );
    }

    console.log('API Route: Marking notification as viewed:', notificationId);

    // Use environment variables for backend URL
    const backendUrl = `${process.env.BACKEND_URL}/api/v1/user-notifications/mark-viewed/${notificationId}`;
    console.log('Making request to backend:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken.value}`,
      },
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Route: Backend error marking notification as viewed:', response.status, response.statusText, errorText);
      return NextResponse.json(
        { error: 'Failed to mark notification as viewed', details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('API Route: Successfully marked notification as viewed:', notificationId, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Route: Error marking notification as viewed:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
