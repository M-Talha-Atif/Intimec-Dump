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
 * GET /api/access-catalogue/entitlements/[id]/assignment-rule
 *
 * Fetches the assignment rule for a specific entitlement.
 * Returns null if no rule exists.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const headers = await getHeaders();
    if (!headers) {
      return NextResponse.json({ error: "No authentication token available" }, { status: 401 });
    }

    const upstream = `${API_BASE_URL}/entitlements/assignment-rules?size=100`;
    const response = await fetch(upstream, { method: "GET", headers, cache: "no-store" });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: (errorData as { message?: string }).message || `Failed to fetch rules: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rules = (data as { content?: Array<{ entitlementId: string }> }).content || [];
    const rule = rules.find((r: { entitlementId: string }) => r.entitlementId === id);

    return NextResponse.json(rule || null);
  } catch (err) {
    console.error("[assignment-rule GET] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/access-catalogue/entitlements/[id]/assignment-rule
 *
 * Creates a new assignment rule for this entitlement.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const headers = await getHeaders();
    if (!headers) {
      return NextResponse.json({ error: "No authentication token available" }, { status: 401 });
    }

    const body = await request.json();
    // Ensure entitlementId is set from the URL path
    (body as { entitlementId?: string }).entitlementId = id;

    const upstream = `${API_BASE_URL}/entitlements/assignment-rules`;
    const response = await fetch(upstream, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: (errorData as { message?: string }).message || `Failed to create rule: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json(), { status: 201 });
  } catch (err) {
    console.error("[assignment-rule POST] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/access-catalogue/entitlements/[id]/assignment-rule
 *
 * Updates the assignment rule for this entitlement.
 * Expects ruleId in the request body.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    const headers = await getHeaders();
    if (!headers) {
      return NextResponse.json({ error: "No authentication token available" }, { status: 401 });
    }

    const body = await request.json();
    const ruleId = (body as { ruleId?: string }).ruleId;

    if (!ruleId) {
      return NextResponse.json({ error: "ruleId is required in request body" }, { status: 400 });
    }

    // Remove ruleId from body before sending to backend
    const { ruleId: _, ...updateBody } = body as { ruleId?: string; [key: string]: unknown };

    const upstream = `${API_BASE_URL}/entitlements/assignment-rules/${ruleId}`;
    const response = await fetch(upstream, {
      method: "PUT",
      headers,
      body: JSON.stringify(updateBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: (errorData as { message?: string }).message || `Failed to update rule: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
  } catch (err) {
    console.error("[assignment-rule PUT] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/access-catalogue/entitlements/[id]/assignment-rule
 *
 * Toggles rule enabled/disabled state.
 * Expects { ruleId, enabled } in request body.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    const headers = await getHeaders();
    if (!headers) {
      return NextResponse.json({ error: "No authentication token available" }, { status: 401 });
    }

    const body = await request.json();
    const { ruleId, enabled } = body as { ruleId?: string; enabled?: boolean };

    if (!ruleId) {
      return NextResponse.json({ error: "ruleId is required" }, { status: 400 });
    }

    const upstream = `${API_BASE_URL}/entitlements/assignment-rules/${ruleId}`;
    const response = await fetch(upstream, {
      method: "PUT",
      headers,
      body: JSON.stringify({ enabled }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: (errorData as { message?: string }).message || `Failed to toggle rule: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
  } catch (err) {
    console.error("[assignment-rule PATCH] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}