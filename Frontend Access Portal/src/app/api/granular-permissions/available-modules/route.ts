import { NextRequest, NextResponse } from "next/server";
import { _getAuthToken } from "@/lib/auth";
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || "http://localhost:8181/api/v1";

export async function GET(request: NextRequest) {
  try {
    const token = await _getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    const response = await fetch(`${API_URL}/granular-permissions/available-modules`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Available Modules API Error (${response.status}):`,
        errorText
      );
      return NextResponse.json(
        { error: `Failed to fetch available modules: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Available modules proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
