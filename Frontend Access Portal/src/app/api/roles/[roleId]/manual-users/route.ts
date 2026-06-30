import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

export async function GET(
  request: Request,
  context: { params: Promise<{ roleId: string }> }
) {
  try {
    const { roleId } = await context.params;
    
    // Extract query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '10';
    const status = searchParams.get('status') || 'ALL';
    const search = searchParams.get('search') || '';
    
    console.log("Fetching manually assigned users for roleId:", roleId, "with params:", { page, size, status, search });

    const authToken = await _getAuthToken();
    console.log("Auth token available:", !!authToken);

    if (!authToken) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    // Build query string with pagination and filter parameters
    const queryParams = new URLSearchParams({
      page,
      size,
      status,
    });
    
    // Only add search if it's not empty
    if (search.trim()) {
      queryParams.append('search', search.trim());
    }

    const apiUrl = `${API_BASE_URL}/roles/${roleId}/manual-users?${queryParams.toString()}`;
    console.log("Making request to:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
    });

    console.log("API response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            errorData.message ||
            `Failed to fetch manually assigned users: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/roles/[roleId]/manual-users:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
