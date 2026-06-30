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

    // Get query parameters from the request
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("roleFilter");
    const moduleFilter = searchParams.get("moduleFilter");

    // Build the backend URL with query parameters
    const queryParams = new URLSearchParams();
    if (roleFilter) queryParams.append("roleFilter", roleFilter);
    if (moduleFilter) queryParams.append("moduleFilter", moduleFilter);

    const url = `${API_URL}/granular-permissions/hierarchy${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Hierarchy API Error (${response.status}):`,
        errorText
      );
      return NextResponse.json(
        { error: `Failed to fetch hierarchy: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Hierarchy proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
