import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { _getAuthToken } from "@/lib/auth";

const API_BASE_URL = process.env.API_URL || "http://localhost:8081/api/v1";

async function getHeaders(): Promise<Record<string, string> | null> {
  const authToken = await _getAuthToken();
  if (!authToken) return null;

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };
  if (sessionId) headers["X-Session-Id"] = sessionId;

  return headers;
}

/**
 * GET /api/access-catalogue/entitlements/[id]
 *
 * Proxies to: GET {API_BASE_URL}/entitlements/:id
 * Returns: EntitlementResponseDto
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Entitlement ID is required" },
        { status: 400 }
      );
    }

    const headers = await getHeaders();
    if (!headers) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }

    const upstream = `${API_BASE_URL}/entitlements/${id}`;
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
            `Failed to fetch entitlement: ${response.status}`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
  } catch (err) {
    console.error("[entitlement by id GET] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/access-catalogue/entitlements/[id]
 *
 * Proxies to: PUT {API_BASE_URL}/entitlements/:id
 * Updates governance metadata for an entitlement.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Entitlement ID is required" },
        { status: 400 }
      );
    }

    const headers = await getHeaders();
    if (!headers) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const upstream = `${API_BASE_URL}/entitlements/${id}`;
    const response = await fetch(upstream, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            (errorData as { message?: string }).message ||
            `Failed to update entitlement: ${response.status}`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
  } catch (err) {
    console.error("[entitlement by id PUT] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}