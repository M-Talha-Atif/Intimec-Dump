import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

// Get overall identity statistics for a specific tenant
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${await _getAuthToken()}`,
      "Content-Type": "application/json",
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }
    
    const response = await fetch(
      `${API_BASE_URL}/identity/statistics`,
      {
        method: "GET",
        headers,
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log(errorData);
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch identity statistics" },
        { status: response.status }
      );
    }

    // Check if response has content and is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // Handle non-JSON responses (like 204 No Content or plain text)
      const text = await response.text();
      return NextResponse.json({ message: text || "Success" });
    }
  } catch (error: unknown) {
    console.error("Error in GET /api/identity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
