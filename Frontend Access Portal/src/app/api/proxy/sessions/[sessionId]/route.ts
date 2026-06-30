import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const authToken = await _getAuthToken();

    if (!authToken) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }

    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const apiUrl = `${API_BASE_URL}/auth/sessions/${sessionId}`;

    const cookieStore = await cookies();
    const currentSessionId = cookieStore.get('session_id')?.value;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };
    
    if (currentSessionId) {
      headers['X-Session-Id'] = currentSessionId;
    }

    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            errorData.error ||
            errorData.message ||
            `Failed to terminate session: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error terminating session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
