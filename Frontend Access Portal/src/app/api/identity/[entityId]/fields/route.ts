import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { IDENTITY_ENTITY_TYPE_ARRAY, isValidEntityType } from "@/constants/identity";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

// Get all fields/attributes for a specific entity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  try {
    const { entityId } = await params;

    console.log("API Route - GET /api/identity/[entityId]/fields");
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

    const backendUrl = `${API_BASE_URL}/identity/schema/${entityId}`;
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
            `Failed to fetch entity fields: ${response.status} ${response.statusText}`,
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
      // Handle non-JSON responses (like 204 No Content or plain text)
      const text = await response.text();
      return NextResponse.json({ message: text || "Success" });
    }
  } catch (error: unknown) {
    console.error(
      "Error in GET /api/identity/[entityId]/fields:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Add a new field/attribute to a specific entity
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  try {
    const { entityId } = await params;

    console.log("API Route - POST /api/identity/[entityId]/fields");
    console.log("entityId:", entityId);

    if (!entityId) {
      return NextResponse.json(
        { error: "entityId path parameter is required" },
        { status: 400 }
      );
    }

    // Validate entityId
    const validEntities = ["employee", "non_employee", "non_human"];
    if (!validEntities.includes(entityId)) {
      return NextResponse.json(
        { error: `Invalid entityId. Must be one of: ${validEntities.join(", ")}` },
        { status: 400 }
      );
    }

    // Get the request body
    const body = await request.json();
    console.log("Request body:", body);

    const backendUrl = `${API_BASE_URL}/identity/schema/`;
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
    console.log(
      "Backend response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log("Backend error response:", errorData);
      console.log("Backend error status:", response.status);
      console.log("Backend error statusText:", response.statusText);

      // Handle specific error cases
      let errorMessage = errorData.message;

      if (response.status === 409) {
        // Conflict - likely duplicate system key
        errorMessage =
          "Can't create attribute with existing system key. Please use a different system key.";
      } else if (response.status === 400) {
        // Bad request - validation errors
        errorMessage =
          errorData.message ||
          "Invalid attribute data. Please check your input.";
      } else if (response.status === 401) {
        // Unauthorized
        errorMessage = "Authentication required. Please log in again.";
      } else if (response.status === 403) {
        // Forbidden
        errorMessage =
          "You don't have permission to create attributes for this entity.";
      } else if (!errorMessage) {
        // Fallback for other errors
        errorMessage = `Failed to create entity field: ${response.status} ${response.statusText}`;
      }

      return NextResponse.json(
        {
          error: errorMessage,
        },
        { status: response.status }
      );
    }

    // Check if response has content and is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log("Created field response:", data);
      return NextResponse.json(data);
    } else {
      // Handle non-JSON responses (like 204 No Content or plain text)
      const text = await response.text();
      return NextResponse.json({ message: text || "Success" });
    }
  } catch (error: unknown) {
    console.error(
      "Error in POST /api/identity/[entityId]/fields:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a field/attribute from a specific entity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  try {
    const { entityId } = await params;
    const { searchParams } = new URL(request.url);
    const attributeId = searchParams.get("attributeId");

    console.log("API Route - DELETE /api/identity/[entityId]/fields");
    console.log("entityId:", entityId);
    console.log("attributeId:", attributeId);

    if (!entityId) {
      return NextResponse.json(
        { error: "entityId path parameter is required" },
        { status: 400 }
      );
    }

    // Validate entityId
    const validEntities = ["employee", "non_employee", "non_human"];
    if (!validEntities.includes(entityId)) {
      return NextResponse.json(
        { error: `Invalid entityId. Must be one of: ${validEntities.join(", ")}` },
        { status: 400 }
      );
    }

    if (!attributeId) {
      return NextResponse.json(
        { error: "attributeId query parameter is required" },
        { status: 400 }
      );
    }

    const backendUrl = `${API_BASE_URL}/identity/schema/${attributeId}`;
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
    console.log(
      "Backend response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log("Backend error response:", errorData);
      console.log("Backend error status:", response.status);
      console.log("Backend error statusText:", response.statusText);

      // Handle specific error cases
      let errorMessage = errorData.message;

      if (response.status === 404) {
        // Not found - attribute doesn't exist
        errorMessage = "Attribute not found. It may have already been deleted.";
      } else if (response.status === 400) {
        // Bad request - validation errors
        errorMessage =
          errorData.message ||
          "Invalid request. Please check the attribute ID.";
      } else if (response.status === 401) {
        // Unauthorized
        errorMessage = "Authentication required. Please log in again.";
      } else if (response.status === 403) {
        // Forbidden
        errorMessage =
          "You don't have permission to delete attributes from this entity.";
      } else if (response.status === 409) {
        // Conflict - attribute might be in use
        errorMessage =
          "Can't delete attribute. It may be in use or required by the system.";
      } else if (!errorMessage) {
        // Fallback for other errors
        errorMessage = `Failed to delete attribute: ${response.status} ${response.statusText}`;
      }

      return NextResponse.json(
        {
          error: errorMessage,
        },
        { status: response.status }
      );
    }

    // Check if response has content and is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log("Delete field response:", data);
      return NextResponse.json(data);
    } else {
      // Handle non-JSON responses (like 204 No Content or plain text)
      const text = await response.text();
      return NextResponse.json({
        message: text || "Attribute deleted successfully",
      });
    }
  } catch (error: unknown) {
    console.error(
      "Error in DELETE /api/identity/[entityId]/fields:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update/patch a specific field/attribute in an entity
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  try {
    const { entityId } = await params;
    const { searchParams } = new URL(request.url);
    const attributeId = searchParams.get("attributeId");

    console.log("API Route - PATCH /api/identity/[entityId]/fields");
    console.log("entityId:", entityId);
    console.log("attributeId:", attributeId);

    if (!entityId) {
      return NextResponse.json(
        { error: "entityId path parameter is required" },
        { status: 400 }
      );
    }

    // Validate entityId
    const validEntities = ["employee", "non_employee", "non_human"];
    if (!validEntities.includes(entityId)) {
      return NextResponse.json(
        { error: `Invalid entityId. Must be one of: ${validEntities.join(", ")}` },
        { status: 400 }
      );
    }

    if (!attributeId) {
      return NextResponse.json(
        { error: "attributeId query parameter is required" },
        { status: 400 }
      );
    }

    // Get the request body
    const body = await request.json();
    console.log("Request body:", body);

    const backendUrl = `${API_BASE_URL}/identity/schema/${attributeId}`;
    console.log("Making PATCH request to backend:", backendUrl);

    const authToken = await _getAuthToken();
    console.log("Auth token available:", !!authToken);

    const response = await fetch(backendUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

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

      // Handle specific error cases
      let errorMessage = errorData.message;

      if (response.status === 404) {
        // Not found - attribute doesn't exist
        errorMessage = "Attribute not found. It may have been deleted.";
      } else if (response.status === 409) {
        // Conflict - likely duplicate system key or validation conflict
        errorMessage =
          "Can't update attribute. There might be a conflict with existing data.";
      } else if (response.status === 400) {
        // Bad request - validation errors
        errorMessage =
          errorData.message ||
          "Invalid attribute data. Please check your input.";
      } else if (response.status === 401) {
        // Unauthorized
        errorMessage = "Authentication required. Please log in again.";
      } else if (response.status === 403) {
        // Forbidden
        errorMessage =
          "You don't have permission to update attributes for this entity.";
      } else if (!errorMessage) {
        // Fallback for other errors
        errorMessage = `Failed to update attribute: ${response.status} ${response.statusText}`;
      }

      return NextResponse.json(
        {
          error: errorMessage,
        },
        { status: response.status }
      );
    }

    // Check if response has content and is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log("Updated field response:", data);
      return NextResponse.json(data);
    } else {
      // Handle non-JSON responses (like 204 No Content or plain text)
      const text = await response.text();
      return NextResponse.json({
        message: text || "Attribute updated successfully",
      });
    }
  } catch (error: unknown) {
    console.error(
      "Error in PATCH /api/identity/[entityId]/fields:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
