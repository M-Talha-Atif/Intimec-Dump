import { _getAuthToken } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";
import { cookies } from 'next/headers';

const API_URL = `${process.env.BACKEND_URL}/api/v1`;

export async function POST(
  request: NextRequest,
  { params }: { params: { testEmailAddress: string } }
) {
  try {
    const token = await _getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }

    const { testEmailAddress } = await params;
    const body = await request.json();
    console.log(body);

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    const url = `${API_URL}/notifications/email-configurations/test?testEmailAddress=${testEmailAddress}`;

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
      const errorText = await response.text();
      console.error(`Test Email API Error (${response.status}):`, errorText);
      return NextResponse.json(
        { error: errorText || "Failed to send test email" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Test Email API proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
