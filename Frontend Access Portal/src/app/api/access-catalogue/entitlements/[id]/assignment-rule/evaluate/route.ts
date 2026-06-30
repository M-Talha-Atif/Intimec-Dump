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
 * POST /api/access-catalogue/entitlements/[id]/assignment-rule/evaluate
 *
 * Manually triggers evaluation of an assignment rule.
 * Expects { ruleId } in the request body.
 *
 * This is the only way to evaluate MANUAL rules. The backend evaluateRule
 * endpoint accepts any rule regardless of schedule type, so this works
 * for IMMEDIATE, CRON, and MANUAL rules.
 */
export async function POST(
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
      return NextResponse.json({ error: "ruleId is required" }, { status: 400 });
    }

    const upstream = `${API_BASE_URL}/entitlements/assignment-rules/${ruleId}/evaluate`;
    const response = await fetch(upstream, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: (errorData as { message?: string }).message || `Failed to evaluate rule: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
  } catch (err) {
    console.error("[assignment-rule evaluate POST] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}