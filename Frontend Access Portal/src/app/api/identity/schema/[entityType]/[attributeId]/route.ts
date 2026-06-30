import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { IDENTITY_ENTITY_TYPE_ARRAY, isValidEntityType } from "@/constants/identity";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

// Get an attribute definition for a specific entity type by system key
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ entityType: string; attributeId: string }> }
) {
    try {
        const { entityType, attributeId } = await params;

        console.log("API Route - GET /api/identity/schema/[entityType]/[attributeId]");
        console.log("entityType:", entityType);
        console.log("attributeId:", attributeId);

        if (!entityType) {
            return NextResponse.json(
                { error: "entityType path parameter is required" },
                { status: 400 }
            );
        }

        if (!attributeId) {
            return NextResponse.json(
                { error: "attributeId path parameter is required" },
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

        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;
        
        const headers: Record<string, string> = {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
        };
        
        if (sessionId) {
            headers['X-Session-Id'] = sessionId;
        }

        const backendUrl = `${API_BASE_URL}/identity/schema/${entityType}/${encodeURIComponent(attributeId)}`;
        console.log("Making GET request to backend:", backendUrl);

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
                errorMessage = "Attribute definition not found.";
            } else if (response.status === 401) {
                errorMessage = "Authentication required. Please log in again.";
            } else if (response.status === 403) {
                errorMessage = "You don't have permission to access this attribute definition.";
            } else if (!errorMessage) {
                errorMessage = `Failed to get attribute definition: ${response.status} ${response.statusText}`;
            }

            return NextResponse.json(
                { error: errorMessage },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error(
            "Error in GET /api/identity/schema/[entityType]/[attributeId]:",
            error
        );
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Update an attribute definition for a specific entity type
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ entityType: string; attributeId: string }> }
) {
    try {
        const { entityType, attributeId } = await params;

        console.log("API Route - PUT /api/identity/schema/[entityType]/[attributeId]");
        console.log("entityType:", entityType);
        console.log("attributeId:", attributeId);

        if (!entityType) {
            return NextResponse.json(
                { error: "entityType path parameter is required" },
                { status: 400 }
            );
        }

        if (!attributeId) {
            return NextResponse.json(
                { error: "attributeId path parameter is required" },
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

        const backendUrl = `${API_BASE_URL}/identity/schema/${entityType}/${encodeURIComponent(attributeId)}`;
        console.log("Making PUT request to backend:", backendUrl);

        const response = await fetch(backendUrl, {
            method: "PUT",
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

            if (response.status === 404) {
                errorMessage = "Attribute definition not found.";
            } else if (response.status === 401) {
                errorMessage = "Authentication required. Please log in again.";
            } else if (response.status === 403) {
                errorMessage = "You don't have permission to update this attribute definition.";
            } else if (!errorMessage) {
                errorMessage = `Failed to update attribute definition: ${response.status} ${response.statusText}`;
            }
            // For 400 status, preserve the specific backend error message if available

            return NextResponse.json(
                { error: errorMessage },
                { status: response.status }
            );
        }

        // The API spec indicates a 200 response with the updated definition
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error(
            "Error in PUT /api/identity/schema/[entityType]/[attributeId]:",
            error
        );
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Delete an attribute definition for a specific entity type
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ entityType: string; attributeId: string }> }
) {
    try {
        const { entityType, attributeId } = await params;

        console.log("API Route - DELETE /api/identity/schema/[entityType]/[attributeId]");
        console.log("entityType:", entityType);
        console.log("attributeId:", attributeId);

        if (!entityType) {
            return NextResponse.json(
                { error: "entityType path parameter is required" },
                { status: 400 }
            );
        }

        if (!attributeId) {
            return NextResponse.json(
                { error: "attributeId path parameter is required" },
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

        const backendUrl = `${API_BASE_URL}/identity/schema/${entityType}/${encodeURIComponent(attributeId)}`;
        console.log("Making DELETE request to backend:", backendUrl);

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
                errorMessage = "Attribute definition not found.";
            } else if (response.status === 401) {
                errorMessage = "Authentication required. Please log in again.";
            } else if (response.status === 403) {
                errorMessage = "You don't have permission to delete this attribute definition.";
            } else if (!errorMessage) {
                errorMessage = `Failed to delete attribute definition: ${response.status} ${response.statusText}`;
            }

            return NextResponse.json(
                { error: errorMessage },
                { status: response.status }
            );
        }

        // According to the API spec, DELETE returns 204 No Content
        // But for consistency with frontend expectations, return a success message
        return NextResponse.json(
            { message: "Attribute definition deleted successfully" },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error(
            "Error in DELETE /api/identity/schema/[entityType]/[attributeId]:",
            error
        );
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}