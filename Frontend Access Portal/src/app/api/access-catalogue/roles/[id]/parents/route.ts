import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { _getAuthToken } from "@/lib/auth";

const API_BASE_URL = process.env.API_URL || "http://localhost:8081/api/v1";

async function getHeaders(
  incomingRequest: NextRequest
): Promise<Record<string, string> | null> {
  const authToken = await _getAuthToken();
  if (!authToken) return null;

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;

  const tenantId =
    incomingRequest.headers.get("X-Tenant-Id") ||
    incomingRequest.headers.get("x-tenant-id") ||
    "";

  const headers: Record<string, string> = {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };

  if (sessionId) headers["X-Session-Id"] = sessionId;
  if (tenantId) headers["X-Tenant-Id"] = tenantId;

  return headers;
}

/**
 * GET /api/access-catalogue/roles/[id]/parents
 *
 * Proxies to: GET {API_BASE_URL}/access-roles/{roleId}/parents
 * Returns the list of parent roles for the given role.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || id === "undefined") {
      return NextResponse.json(
        { error: "Role ID is required" },
        { status: 400 }
      );
    }

    const headers = await getHeaders(request);
    if (!headers) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }

    const upstream = `${API_BASE_URL}/access-roles/${id}/parents`;
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
            `Failed to fetch parent roles (${response.status})`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
  } catch (err) {
    console.error("[parents GET] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}