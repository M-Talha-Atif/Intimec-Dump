import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

// Map frontend identity type values to backend enum values
const toBackendIdentityType = (schemaId: string): string => {
  const map: Record<string, string> = {
    "employee": "EMPLOYEE",
    "non-employee": "NON_EMPLOYEE",
    "non-human": "NON_HUMAN",
  };
  return map[schemaId] ?? schemaId;
};

/**
 * GET /api/identity/mapping/policies/[schemaId]/correlation/rules
 * Retrieves correlation rules for a specific identity mapping policy schema
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schemaId: string }> }
) {
  try {
    const { schemaId } = await params;

    console.log(
      "API Route - GET /api/identity/mapping/policies/[schemaId]/correlation/rules"
    );
    console.log("schemaId:", schemaId);

    if (!schemaId) {
      return NextResponse.json(
        { error: "schemaId path parameter is required" },
        { status: 400 }
      );
    }

    // Map frontend identity type (e.g. "employee") to backend enum (e.g. "EMPLOYEE")
    const identityType = toBackendIdentityType(schemaId);
    const apiUrl = `${API_BASE_URL}/identity/mapping/policies/${identityType}/correlation/rules`;
    console.log("Making request to backend:", apiUrl);

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

    // Call the actual backend API
    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
    });

    console.log("Backend response status:", response.status);
    console.log(
      "Backend response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log("Backend error response:", errorData);

      return NextResponse.json(
        {
          error:
            errorData.message ||
            `Failed to fetch correlation rules : ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    // Check if response has content and is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log("correlation rules response:", data);
      return NextResponse.json(data);
    } else {
      // Handle non-JSON responses (like 204 No Content or plain text)
      const text = await response.text();
      return NextResponse.json({ message: text || "Success" });
    }
  } catch (error: unknown) {
    console.error(
      "Error in GET /api/identity/mapping/policies/[schemaId]/correlation/rules:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/identity/mapping/policies/[schemaId]/correlation/rules
 * Saves the full identity mapping policy (correlation rules + attribute mappings + sync reactions)
 * via the backend's all-in-one PUT /mapping/policies/{identityType}
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ schemaId: string }> }
) {
  try {
    const { schemaId } = await params;

    if (!schemaId) {
      return NextResponse.json(
        { error: "schemaId path parameter is required" },
        { status: 400 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const identityType = toBackendIdentityType(schemaId);
    const apiUrl = `${API_BASE_URL}/identity/mapping/policies/${identityType}`;

    const authToken = await _getAuthToken();

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            errorData.message ||
            `Failed to save correlation rules: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      const text = await response.text();
      return NextResponse.json({ message: text || "Success" });
    }
  } catch (error: unknown) {
    console.error(
      "Error in PUT /api/identity/mapping/policies/[schemaId]/correlation/rules:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
