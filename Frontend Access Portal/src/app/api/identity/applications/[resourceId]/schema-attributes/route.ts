import { _getAuthToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

/**
 * GET /api/identity/applications/[resourceId]/schema-attributes
 * Retrieves schema attributes for a specific application resource
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  try {
    const { resourceId } = await params;

    console.log(
      "API Route - GET /api/identity/applications/[resourceId]/schema-attributes"
    );
    console.log("resourceId:", resourceId);

    if (!resourceId) {
      return NextResponse.json(
        { error: "resourceId path parameter is required" },
        { status: 400 }
      );
    }

    // Build backend API URL - backend exposes /applications/{resourceId}/schema
    const schemaUrl = `${API_BASE_URL}/applications/${resourceId}/schema`;
    console.log("Making request to backend (object types):", schemaUrl);

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

    // Step 1: fetch available object types
    const objectTypesRes = await fetch(schemaUrl, { method: "GET", headers });

    // 404 means the application has no schema defined yet — return empty list
    if (objectTypesRes.status === 404) {
      return NextResponse.json([]);
    }

    if (!objectTypesRes.ok) {
      const errorData = await objectTypesRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || `Failed to fetch schema object types: ${objectTypesRes.status}` },
        { status: objectTypesRes.status }
      );
    }

    const objectTypes: { type: string; displayAttribute: string }[] =
      await objectTypesRes.json();

    if (!objectTypes || objectTypes.length === 0) {
      return NextResponse.json([]);
    }

    // Step 2: pick "account" object type if present, otherwise use the first one
    const preferred = objectTypes.find(
      (ot) => ot.type?.toLowerCase() === "account"
    );
    const objectType = (preferred ?? objectTypes[0]).type;
    const attrUrl = `${API_BASE_URL}/applications/${resourceId}/schema/${encodeURIComponent(objectType)}`;
    console.log("Making request to backend (attributes):", attrUrl);

    // Step 3: fetch attributes for the selected object type
    const response = await fetch(attrUrl, { method: "GET", headers });

    // 404 means no attributes found for this object type — return empty list
    if (response.status === 404) {
      return NextResponse.json([]);
    }

    console.log("Backend response status:", response.status);
    console.log(
      "Backend response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log("Backend error response:", errorData);
      console.log("Backend error status:", response.status);
      console.log("Backend error statusText:", response.statusText);

      return NextResponse.json(
        {
          error:
            errorData.message ||
            `Failed to fetch schema attributes: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    // Check if response has content and is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log("Schema attributes response:", data);
      return NextResponse.json(data);
    } else {
      // Handle non-JSON responses (like 204 No Content or plain text)
      const text = await response.text();
      return NextResponse.json({ message: text || "Success" });
    }
  } catch (error: unknown) {
    console.error(
      "Error in GET /api/identity/applications/[resourceId]/schema-attributes:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
