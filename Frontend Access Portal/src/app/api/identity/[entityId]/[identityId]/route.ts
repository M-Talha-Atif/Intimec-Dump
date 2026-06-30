import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { IDENTITY_ENTITY_TYPE_ARRAY, isValidEntityType } from "@/constants/identity";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

// Get a specific identity by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entityId: string; identityId: string }> }
) {
  try {
    const { entityId, identityId } = await params;

    console.log("API Route - GET /api/identity/[entityId]/[identityId]");
    console.log("entityId:", entityId);
    console.log("identityId:", identityId);

    if (!entityId) {
      return NextResponse.json(
        { error: "entityId path parameter is required" },
        { status: 400 }
      );
    }

    if (!identityId) {
      return NextResponse.json(
        { error: "identityId path parameter is required" },
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

    // GET uses the flat /identity/{id} endpoint — entityType is only used for frontend routing
    const backendUrl = `${API_BASE_URL}/identity/${identityId}`;
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
        errorMessage = "Identity not found.";
      } else if (response.status === 401) {
        errorMessage = "Authentication required. Please log in again.";
      } else if (response.status === 403) {
        errorMessage = "You don't have permission to view this identity.";
      } else if (!errorMessage) {
        errorMessage = `Failed to fetch identity: ${response.status} ${response.statusText}`;
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
      "Error in GET /api/identity/[entityId]/[identityId]:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update a specific identity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ entityId: string; identityId: string }> }
) {
  try {
    const { entityId, identityId } = await params;

    console.log("API Route - PUT /api/identity/[entityId]/[identityId]");
    console.log("entityId:", entityId);
    console.log("identityId:", identityId);

    if (!entityId) {
      return NextResponse.json(
        { error: "entityId path parameter is required" },
        { status: 400 }
      );
    }

    if (!identityId) {
      return NextResponse.json(
        { error: "identityId path parameter is required" },
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

    // PUT uses type-specific paths: /employee/{id}, /non-employee/{id}, /non-human/{id}
    const backendEntitySlug = entityId.replace(/_/g, '-');
    const backendUrl = `${API_BASE_URL}/identity/${backendEntitySlug}/${identityId}`;
    console.log("Making PUT request to backend:", backendUrl);

    const authToken = await _getAuthToken();
    console.log("Auth token available:", !!authToken);

    const response = await fetch(backendUrl, {
      method: "PUT",
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

      if (response.status === 404) {
        errorMessage = "Identity not found.";
      } else if (response.status === 400) {
        errorMessage = errorData.message || "Invalid identity data. Please check your input.";
      } else if (response.status === 401) {
        errorMessage = "Authentication required. Please log in again.";
      } else if (response.status === 403) {
        errorMessage = "You don't have permission to update this identity.";
      } else if (response.status === 409) {
        errorMessage = "Update conflict. The identity may have been modified by another user.";
      } else if (!errorMessage) {
        errorMessage = `Failed to update identity: ${response.status} ${response.statusText}`;
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
      console.log("Updated identity response:", data);
      return NextResponse.json(data);
    } else {
      // Handle non-JSON responses
      const text = await response.text();
      return NextResponse.json({ message: text || "Success" });
    }
  } catch (error: unknown) {
    console.error(
      "Error in PUT /api/identity/[entityId]/[identityId]:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a specific identity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ entityId: string; identityId: string }> }
) {
  try {
    const { entityId, identityId } = await params;

    console.log("API Route - DELETE /api/identity/[entityId]/[identityId]");
    console.log("entityId:", entityId);
    console.log("identityId:", identityId);

    if (!entityId) {
      return NextResponse.json(
        { error: "entityId path parameter is required" },
        { status: 400 }
      );
    }

    if (!identityId) {
      return NextResponse.json(
        { error: "identityId path parameter is required" },
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

    // DELETE uses flat /identity/{id} endpoint
    const backendUrl = `${API_BASE_URL}/identity/${identityId}`;
    console.log("Making DELETE request to backend:", backendUrl);

    const authToken = await _getAuthToken();
    console.log("Auth token available:", !!authToken);

    const response = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log("Backend error response:", errorData);

      let errorMessage = errorData.message;

      if (response.status === 404) {
        errorMessage = "Identity not found.";
      } else if (response.status === 401) {
        errorMessage = "Authentication required. Please log in again.";
      } else if (response.status === 403) {
        errorMessage = "You don't have permission to delete this identity.";
      } else if (response.status === 409) {
        errorMessage = "Cannot delete identity. It may be referenced by other data.";
      } else if (!errorMessage) {
        errorMessage = `Failed to delete identity: ${response.status} ${response.statusText}`;
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
      console.log("Delete identity response:", data);
      return NextResponse.json(data);
    } else {
      // Handle non-JSON responses
      const text = await response.text();
      return NextResponse.json({ message: text || "Identity deleted successfully" });
    }
  } catch (error: unknown) {
    console.error(
      "Error in DELETE /api/identity/[entityId]/[identityId]:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
