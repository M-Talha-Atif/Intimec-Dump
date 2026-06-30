import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

/**
 * GET /api/identity/mapping/policies/[schemaId]/synchronization/reactions
 * Retrieves synchronization reactions for a specific identity type and resource
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schemaId: string }> }
) {
  try {
    const { schemaId } = await params;
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get("resourceId");

    console.log(
      "API Route - GET /api/identity/mapping/policies/[schemaId]/synchronization/reactions"
    );
    console.log("schemaId (identityType):", schemaId);
    console.log("resourceId:", resourceId);

    if (!schemaId) {
      return NextResponse.json(
        { error: "schemaId path parameter is required" },
        { status: 400 }
      );
    }

    // Build backend API URL
    let apiUrl = `${API_BASE_URL}/identity/mapping/policies/${schemaId}/synchronization/reactions`;
    if (resourceId) {
      apiUrl += `?resourceId=${resourceId}`;
    }
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

    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", response.status, errorText);
      return NextResponse.json(
        { error: errorText || "Failed to fetch synchronization reactions" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching synchronization reactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/identity/mapping/policies/[schemaId]/synchronization/reactions
 * Updates synchronization reactions for a specific identity type and resource
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ schemaId: string }> }
) {
  try {
    const { schemaId } = await params;
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get("resourceId");
    const body = await request.json();

    console.log(
      "API Route - PUT /api/identity/mapping/policies/[schemaId]/synchronization/reactions"
    );
    console.log("schemaId (identityType):", schemaId);
    console.log("resourceId:", resourceId);
    console.log("Request body:", JSON.stringify(body));

    if (!schemaId) {
      return NextResponse.json(
        { error: "schemaId path parameter is required" },
        { status: 400 }
      );
    }

    // Build backend API URL
    let apiUrl = `${API_BASE_URL}/identity/mapping/policies/${schemaId}/synchronization/reactions`;
    if (resourceId) {
      apiUrl += `?resourceId=${resourceId}`;
    }
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

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", response.status, errorText);
      return NextResponse.json(
        { error: errorText || "Failed to update synchronization reactions" },
        { status: response.status }
      );
    }

    // PUT might return 204 No Content or JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating synchronization reactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
