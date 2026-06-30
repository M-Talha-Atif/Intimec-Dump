import { NextRequest, NextResponse } from "next/server";
import { _getAuthToken } from "@/lib/auth";
import { cookies } from 'next/headers';

const API_URL = `${process.env.API_URL}`;

// Get one template
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await _getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }
    const { id } = await params;

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    const url = `${API_URL}/notifications/template-managers/${id}`;
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    const res = await fetch(url, {
      method: "GET",
      headers,
    })


    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Email Templates GET API Error (${res.status}):`, errorText);
      return NextResponse.json(
        {
          error: `Failed to GET Email Templates: ${res.status} ${res.statusText}`,
        },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json({ data: data });
  } catch (error) {
    console.error("Email Template GET proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update template
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await _getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id } = await params;
    console.log(body);

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    const url = `${API_URL}/notifications/template-managers/${id}`;
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Email Template PUT API Error (${response.status}):`, errorText);
      return NextResponse.json(
        {
          error: `Failed to PUT Email Template : ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }
    return NextResponse.json({ status: true });
  } catch (error) {
    console.error("Email Template  PUT proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete template
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await _getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    const url = `${API_URL}/notifications/template-managers/${id}`;
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Email Template DELETE API Error (${response.status}):`, errorText);
      return NextResponse.json(
        {
          error: `Failed to DELETE Email Template : ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }
    return NextResponse.json({ status: true });
  } catch (error) {
    console.error("Email Template  DELETE proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


