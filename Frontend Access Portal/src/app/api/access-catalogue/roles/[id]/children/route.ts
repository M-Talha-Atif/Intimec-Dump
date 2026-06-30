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
 * GET /api/access-catalogue/roles/[id]/children
 *
 * Proxies to:
 *   GET {API_BASE_URL}/access-roles/{roleId}/children
 *
 * Returns the current child roles of the given parent role.
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

    const upstream = `${API_BASE_URL}/access-roles/${id}/children`;
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
            `Failed to fetch child roles (${response.status})`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(json, { status: response.status });
  } catch (err) {
    console.error("[children GET] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/access-catalogue/roles/[id]/children
 *
 * Desired-state sync endpoint.
 *
 * Accepts:
 *   { childRoleIds: string[] }
 *
 * Proxies to backend:
 *   PUT {API_BASE_URL}/access-roles/{roleId}/compositions
 *
 * Backend computes the diff:
 * - adds missing children
 * - removes children no longer present
 * - returns partial failures (207) if some adds are rejected
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const { childRoleIds } = await request.json();

    const upstream = `${API_BASE_URL}/access-roles/${id}/compositions`;
    const response = await fetch(upstream, {
      method: "PUT",
      headers,
      body: JSON.stringify({ childRoleIds: childRoleIds || [] }),
    });

    const json = await response.json().catch(() => ({}));

    return NextResponse.json(json, { status: response.status });
  } catch (error) {
    console.error("[children PUT] Unexpected error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to sync child roles",
      },
      { status: 500 }
    );
  }
}