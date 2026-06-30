import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { _getAuthToken } from "@/lib/auth";

const API_BASE_URL = process.env.API_URL || "http://localhost:8081/api/v1";

/**
 * GET /api/access-catalogue/entitlements/[id]/members
 *
 * Proxies to: GET {API_BASE_URL}/entitlements/:id/members
 * Returns: Paginated members list
 * 
 * Query params:
 *   page   - 0-based page index (default: 0)
 *   size   - page size (default: 20)
 *   sort   - Spring sort string
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Entitlement ID is required" },
        { status: 400 }
      );
    }

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

    // Forward pagination params
    const searchParams = request.nextUrl.searchParams;
    const queryParams = new URLSearchParams();

    const page = searchParams.get("page");
    const size = searchParams.get("size");
    const sort = searchParams.get("sort");

    if (page) queryParams.append("page", page);
    if (size) queryParams.append("size", size);
    if (sort) queryParams.append("sort", sort);

    const upstream = `${API_BASE_URL}/entitlements/${id}/members?${queryParams.toString()}`;

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
            `Failed to fetch entitlement members: ${response.status}`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
  } catch (err) {
    console.error("[entitlement members route] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}