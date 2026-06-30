import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { IDENTITY_ENTITY_TYPE_ARRAY, isValidEntityType } from "@/constants/identity";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

// Get schema (core + extended attributes) for a specific entity type
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entityType: string }> }
) {
  try {
    const { entityType } = await params;

    console.log("API Route - GET /api/identity/schema/[entityType]");
    console.log("entityType:", entityType);

    if (!entityType) {
      return NextResponse.json(
        { error: "entityType path parameter is required" },
        { status: 400 }
      );
    }

    // Validate entityType
    if (!isValidEntityType(entityType)) {
      return NextResponse.json(
        { error: `Invalid entityType. Must be one of: ${IDENTITY_ENTITY_TYPE_ARRAY.join(", ")}` },
        { status: 400 }
      );
    }

    const backendUrl = `${API_BASE_URL}/identity/schema/${entityType}`;
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

      let errorMessage = errorData.message;

      if (response.status === 404) {
        errorMessage = "Schema not found for this entity type.";
      } else if (response.status === 401) {
        errorMessage = "Authentication required. Please log in again.";
      } else if (response.status === 403) {
        errorMessage = "You don't have permission to view this schema.";
      } else if (!errorMessage) {
        errorMessage = `Failed to fetch schema: ${response.status} ${response.statusText}`;
      }

      return NextResponse.json(
        { error: errorMessage },
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
      "Error in GET /api/identity/schema/[entityType]:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new attribute for a specific entity type
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ entityType: string }> }
) {
  try {
    const { entityType } = await params;

    console.log("API Route - POST /api/identity/schema/[entityType]");
    console.log("entityType:", entityType);

    if (!entityType) {
      return NextResponse.json(
        { error: "entityType path parameter is required" },
        { status: 400 }
      );
    }

    // Validate entityType
    if (!isValidEntityType(entityType)) {
      return NextResponse.json(
        { error: `Invalid entityType. Must be one of: ${IDENTITY_ENTITY_TYPE_ARRAY.join(", ")}` },
        { status: 400 }
      );
    }

    const authToken = await _getAuthToken();
    console.log("Auth token available:", !!authToken);

    // Get request body
    const requestBody = await request.json();
    console.log("Request body:", requestBody);

    const backendUrl = `${API_BASE_URL}/identity/schema/${entityType}`;
    console.log("Making POST request to backend:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log("Backend error response:", errorData);

      let errorMessage = errorData.message;

      if (response.status === 409) {
        errorMessage = "An attribute with this system key already exists.";
      } else if (response.status === 401) {
        errorMessage = "Authentication required. Please log in again.";
      } else if (response.status === 403) {
        errorMessage = "You don't have permission to create attributes.";
      } else if (!errorMessage) {
        errorMessage = `Failed to create attribute: ${response.status} ${response.statusText}`;
      }
      // For 400 status, preserve the specific backend error message if available

      return NextResponse.json(
        { error: errorMessage },
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
      "Error in POST /api/identity/schema/[entityType]:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
