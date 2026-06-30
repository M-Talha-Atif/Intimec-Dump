import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { isValidEntityType, IDENTITY_ENTITY_TYPE_ARRAY } from "@/constants/identity";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

/**
 * Proxy route for fetching entitlements assigned to an identity across all accounts.
 * Forwards the request to the identity management backend at
 * GET /api/v1/identity/{identityId}/entitlements
 *
 * Supported query parameters forwarded to backend:
 *   - page: zero-based page index
 *   - size: items per page
 *   - search: text filter on entitlement displayName and description
 *   - sort: Spring Data sort format (e.g., "displayName,asc")
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entityId: string; identityId: string }> }
) {
  try {
    const { entityId, identityId } = await params;

    if (!entityId || !identityId) {
      return NextResponse.json(
        { error: "entityId and identityId path parameters are required" },
        { status: 400 }
      );
    }

    if (!isValidEntityType(entityId)) {
      return NextResponse.json(
        {
          error: `Invalid entityId. Must be one of: ${IDENTITY_ENTITY_TYPE_ARRAY.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Forward all supported query params to backend
    const searchParams = request.nextUrl.searchParams;
    const query = new URLSearchParams();

    const page = searchParams.get("page");
    const size = searchParams.get("size");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");

    query.append("page", page || "0");
    query.append("size", size || "10");
    if (search) query.append("search", search);
    if (sort) query.append("sort", sort);

    const backendUrl = `${API_BASE_URL}/identity/${identityId}/entitlements?${query.toString()}`;

    const authToken = await _getAuthToken();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    if (sessionId) {
      headers["X-Session-Id"] = sessionId;
    }

    const response = await fetch(backendUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      let errorMessage = errorData.message;
      if (response.status === 404) {
        errorMessage = "No entitlements found for this identity.";
      } else if (response.status === 401) {
        errorMessage = "Authentication required. Please log in again.";
      } else if (response.status === 403) {
        errorMessage =
          "You don't have permission to view entitlements for this identity.";
      } else if (!errorMessage) {
        errorMessage = `Failed to fetch identity entitlements: ${response.status} ${response.statusText}`;
      }

      return NextResponse.json(
        { error: errorMessage },
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
      "Error in GET /api/identity/[entityId]/[identityId]/entitlements:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}