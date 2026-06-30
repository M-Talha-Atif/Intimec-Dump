import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { IDENTITY_ENTITY_TYPE_ARRAY, isValidEntityType } from "@/constants/identity";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

// Get all identities for a specific entity type
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  try {
    const { entityId } = await params;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "0";
    const size = searchParams.get("size") || "20";
    const sort = searchParams.get("sort") || "createdAt,desc";
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const department = searchParams.get("department") || "";

    console.log("API Route - GET /api/identity/[entityId]");
    console.log("entityId:", entityId);

    if (!entityId) {
      return NextResponse.json(
        { error: "entityId path parameter is required" },
        { status: 400 }
      );
    }

    // Validate entityId
    if (!isValidEntityType(entityId)) {
      return NextResponse.json(
        { error: `Invalid entityId. Must be one of: ${IDENTITY_ENTITY_TYPE_ARRAY.join(", ")}` },
        { status: 400 }
      );
    }

    const backendParams = new URLSearchParams({ page, size, sort });
    if (search) backendParams.set("search", search);
    if (status) backendParams.set("status", status);
    if (department) backendParams.set("department", department);

    const backendUrl = `${API_BASE_URL}/identity/list/${entityId}?${backendParams.toString()}`;
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
            `Failed to fetch ${entityId} identities: ${response.status} ${response.statusText}`,
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
      "Error in GET /api/identity/[entityId]:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new identity for a specific entity type
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  try {
    const { entityId } = await params;

    console.log("API Route - POST /api/identity/[entityId]");
    console.log("entityId:", entityId);

    if (!entityId) {
      return NextResponse.json(
        { error: "entityId path parameter is required" },
        { status: 400 }
      );
    }

    // Validate entityId
    if (!isValidEntityType(entityId)) {
      return NextResponse.json(
        { error: `Invalid entityId. Must be one of: ${IDENTITY_ENTITY_TYPE_ARRAY.join(", ")}` },
        { status: 400 }
      );
    }

    // Get the request body
    const body = await request.json();
    console.log("Request body:", body);

    const backendUrl = `${API_BASE_URL}/identity/${entityId}`;
    console.log("Making POST request to backend:", backendUrl);

    const authToken = await _getAuthToken();
    console.log("Auth token available:", !!authToken);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log("Backend error response:", errorData);

      let errorMessage = errorData.message;

      if (response.status === 400) {
        errorMessage = errorData.message || "Invalid identity data. Please check your input.";
      } else if (response.status === 401) {
        errorMessage = "Authentication required. Please log in again.";
      } else if (response.status === 403) {
        errorMessage = "You don't have permission to create identities.";
      } else if (response.status === 409) {
        errorMessage = "Identity with this information already exists.";
      } else if (!errorMessage) {
        errorMessage = `Failed to create ${entityId} identity: ${response.status} ${response.statusText}`;
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
      console.log("Created identity response:", data);
      return NextResponse.json(data);
    } else {
      // Handle non-JSON responses
      const text = await response.text();
      return NextResponse.json({ message: text || "Success" });
    }
  } catch (error: unknown) {
    console.error(
      "Error in POST /api/identity/[entityId]:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
