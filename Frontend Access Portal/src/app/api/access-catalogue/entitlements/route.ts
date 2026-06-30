import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { _getAuthToken } from "@/lib/auth";

const API_BASE_URL = process.env.API_URL || "http://localhost:8081/api/v1";

/**
 * GET /api/access-catalogue/entitlements
 *
 * Accepted query params (all optional, forwarded as-is to the backend):
 *   page
 *   size
 *   sort
 *   resourceId
 *   search
 *   riskLevel
 *   lifecycle
 *   kind
 *   classified
 *   requestable
 *   hasOwner
 *   ownerId
 *   assignmentSource
 *   minAssignedUsers
 *   maxAssignedUsers
 *
 * Proxies to: GET {API_BASE_URL}/entitlements
 */
export async function GET(request: NextRequest) {
  try {
    const authToken = await _getAuthToken();
    if (!authToken) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };
    if (sessionId) headers["X-Session-Id"] = sessionId;

    const searchParams = request.nextUrl.searchParams;
    const queryParams = new URLSearchParams();

    const supportedParams = [
      "page",
      "size",
      "sort",
      "resourceId",
      "search",
      "riskLevel",
      "lifecycle",
      "kind",
      "classified",
      "requestable",
      "hasOwner",
      "ownerId",
      "assignmentSource",
      "minAssignedUsers",
      "maxAssignedUsers",
    ];

    for (const key of supportedParams) {
      const values = searchParams.getAll(key);
      for (const value of values) {
        if (value !== null && value !== "") {
          queryParams.append(key, value);
        }
      }
    }

    const queryString = queryParams.toString();
    const upstream = `${API_BASE_URL}/entitlements${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(upstream, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            (errorData as { message?: string }).message ||
            `Failed to fetch entitlements: ${response.status}`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
  } catch (err) {
    console.error("[entitlements route] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}