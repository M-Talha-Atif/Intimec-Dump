import { NextRequest, NextResponse } from "next/server";
import { _getAuthToken } from "@/lib/auth";
import { messages } from "react-querybuilder";
import { cookies } from 'next/headers';

const API_URL = `${process.env.API_URL}`;

// Send test email
export async function POST(request: NextRequest) {
  try {
    const token = await _getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    const url = `${API_URL}/notifications/template-managers/test`;
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.json();
      console.log(errorText);
      console.error(errorText.message || errorText.error);
      return NextResponse.json(
        {
          error: errorText.message || errorText.error || response.statusText,
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Email Template GET proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
