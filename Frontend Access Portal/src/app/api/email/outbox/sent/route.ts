import { NextRequest, NextResponse } from "next/server";
import { _getAuthToken } from "@/lib/auth";
import { cookies } from 'next/headers';

const API_URL = process.env.MOCK_DATA_API_URL;

// Get Email outbox metadata
export async function GET(request: NextRequest) {
  try {
    const token = await _getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "20");

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    const url = `${API_URL}/email/outbox/sent?page=${page}&size=${size}`;
    
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
      console.error(`Email Template POST API Error (${res.status}):`, errorText);
      return NextResponse.json(
        {
          error: `Failed to post Email Template : ${res.status} ${res.statusText}`,
        },
        { status: res.status }
      );
    }
    let data = await res.json();
    data = data.data;
    return NextResponse.json({ data: data });
  } catch (error) {
    console.error("Email Template GET proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}