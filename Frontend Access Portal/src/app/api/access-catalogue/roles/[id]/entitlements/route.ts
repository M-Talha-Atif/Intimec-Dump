import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { _getAuthToken } from "@/lib/auth";

const BACKEND_URL = process.env.API_URL || "http://localhost:8081/api/v1";

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
 * GET /api/access-catalogue/roles/[id]/entitlements?page=0&size=10
 *
 * Proxies to:
 *   GET {BACKEND_URL}/access-roles/{roleId}/entitlements?page=0&size=10
 *
 * Returns paginated entitlements linked to the role.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id || id === "undefined") {
      return NextResponse.json(
        { error: "Missing role ID parameter" },
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

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "0";
    const size = searchParams.get("size") || "10";

    const upstream = `${BACKEND_URL}/access-roles/${id}/entitlements?page=${page}&size=${size}`;
    const response = await fetch(upstream, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            (json as { message?: string }).message ||
            (json as { error?: string }).error ||
            `Failed to fetch entitlements (${response.status})`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(json, { status: response.status });
  } catch (error) {
    console.error("[entitlements GET] Unexpected error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch entitlements",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/access-catalogue/roles/[id]/entitlements
 *
 * Desired-state sync endpoint.
 *
 * Accepts:
 *   { entitlementIds: string[] }
 *
 * Proxies to backend:
 *   PUT {BACKEND_URL}/access-roles/{roleId}/entitlements
 *
 * Backend computes add/remove diff internally and returns:
 *   { addedCount, removedCount, totalCount }
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id || id === "undefined") {
      return NextResponse.json(
        { error: "Missing role ID parameter" },
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

    const { entitlementIds } = await request.json();

    const upstream = `${BACKEND_URL}/access-roles/${id}/entitlements`;
    const response = await fetch(upstream, {
      method: "PUT",
      headers,
      body: JSON.stringify({ entitlementIds: entitlementIds || [] }),
    });

    const json = await response.json().catch(() => ({}));

    return NextResponse.json(json, { status: response.status });
  } catch (error) {
    console.error("[entitlements PUT] Unexpected error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to sync entitlements",
      },
      { status: 500 }
    );
  }
}