import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

/**
 * GET /api/identity/applications
 * Retrieves all applications/sources from the backend
 */
export async function GET() {
  try {
    console.log("API Route - GET /api/identity/applications");

    const authToken = await _getAuthToken();
    console.log("Auth token available:", !!authToken);

    // Build backend API URL
    const apiUrl = `${API_BASE_URL}/applications`;
    console.log("Making request to backend:", apiUrl);

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    // Call the actual backend API
    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log("Backend error response:", errorData);

      return NextResponse.json(
        {
          error:
            errorData.message ||
            `Failed to fetch applications: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Applications response:", data);
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Error in GET /api/identity/applications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
