import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { IDENTITY_ENTITY_TYPE_ARRAY, isValidEntityType } from "@/constants/identity";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

// Search identities across all entity types
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const entityId = searchParams.get("entityId");
    const page = searchParams.get("page") || "0";
    const size = searchParams.get("size") || "20";

    console.log("API Route - GET /api/identity/search");
    console.log("query:", query);
    console.log("entityId:", entityId);

    // Build the backend URL with query parameters
    let backendUrl = `${API_BASE_URL}/identity/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`;

    // Add entityId filter if provided
    if (entityId) {
      // Validate entityId
      if (!isValidEntityType(entityId)) {
        return NextResponse.json(
          { error: `Invalid entityId. Must be one of: ${IDENTITY_ENTITY_TYPE_ARRAY.join(", ")}` },
          { status: 400 }
        );
      }
      backendUrl += `&entityId=${entityId}`;
    }

    console.log("Making request to backend:", backendUrl);

    const authToken = await _getAuthToken();
    console.log("Auth token available:", !!authToken);

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    const response = await fetch(backendUrl, {
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
            `Failed to search identities: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    // Check if response has content and is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // Handle non-JSON responses
      const text = await response.text();
      return NextResponse.json({ message: text || "Success" });
    }
  } catch (error: unknown) {
    console.error(
      "Error in GET /api/identity/search:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
