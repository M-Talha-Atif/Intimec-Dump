import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

// Get tenant statistics for a specific tenant
export async function GET() {
  try {
    const authToken = await _getAuthToken();
    if (!authToken) {
      return NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      );
    }
    console.log(
      "API Route - GET /api/identity/statistics"
    );


    const backendUrl = `${API_BASE_URL}/identity/statistics`;
    console.log("Making request to backend:", backendUrl);

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

      // Handle specific error cases
      let errorMessage = errorData.message;

      if (response.status === 404) {
        // Not found - tenant doesn't exist
        errorMessage = "Tenant not found. Please check the tenant ID.";
      } else if (response.status === 400) {
        // Bad request - validation errors
        errorMessage =
          errorData.message ||
          "Invalid request parameters. Please check tenant ID.";
      } else if (response.status === 401) {
        // Unauthorized
        errorMessage = "Authentication required. Please log in again.";
      } else if (response.status === 403) {
        // Forbidden
        errorMessage =
          "You don't have permission to view statistics for this tenant.";
      } else if (!errorMessage) {
        // Fallback for other errors
        errorMessage = `Failed to fetch tenant statistics: ${response.status} ${response.statusText}`;
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
      console.log("Tenant statistics response:", data);
      return NextResponse.json(data);
    } else {
      // Handle non-JSON responses (like 204 No Content or plain text)
      const text = await response.text();
      return NextResponse.json({ message: text || "Success" });
    }
  } catch (error: unknown) {
    console.error(
      "Error in GET /api/identity/statistics:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
