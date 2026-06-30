import { NextResponse } from "next/server";
import { _getAuthToken } from "@/lib/auth";
import { cookies } from 'next/headers';

const API_URL = `${process.env.API_URL}`;

// Pin or unpin notification based on the pin parameter
export async function PUT(request: Request, { params }: { params: { id: string, pin: string } }) {
  console.log('PUT /api/notifications/[id]/[pin] called with params:', params);
  try {
    const token = await _getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }
    const { id, pin } = await params;

    // Convert pin parameter to boolean
    const shouldPin = pin === 'true';

    // Construct the appropriate URL based on pin value
    const endpoint = shouldPin ? 'pin' : 'unpin';
    const url = `${API_URL}/user-notifications/${id}/${endpoint}`;

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    const res = await fetch(url, {
      method: "PUT",
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Notification ${endpoint} API Error (${res.status}):`, errorText);
      return NextResponse.json(
        {
          error: `Failed to ${endpoint} notification: ${res.status} ${res.statusText}`,
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      data: data,
      message: `Notification ${shouldPin ? 'pinned' : 'unpinned'} successfully`
    });
  } catch (error) {
    console.error("Notification pin/unpin proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}