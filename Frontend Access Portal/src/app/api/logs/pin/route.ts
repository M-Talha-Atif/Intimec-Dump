import { _getAuthToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

// Get all pinned loggers
export async function GET(request: NextRequest) {
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
    
    const response = await fetch(`${API_BASE_URL}/logs/pin`, {
      method: "GET",
      headers,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log(errorData);
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch pinned loggers" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in GET /api/logs/pin:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/logs/pin - Create a new pinned logger
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await _getAuthToken()}`,
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }
    
    const response = await fetch(`${API_BASE_URL}/logs/pin`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to create pinned logger" },
        { status: response.status }
      );
    }

    const data = await response.json();
    // console.log("Pinned log created:", data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in POST /api/logs/pin:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
