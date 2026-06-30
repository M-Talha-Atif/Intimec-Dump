import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

/**
 * GET /api/shadows
 * Proxies GET /api/v1/shadows with forwarded auth headers.
 * Supported query params: resourceId, objectClass, situation, linked, page, size
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const backendUrl = new URL(`${API_BASE_URL}/shadows`);

    // Forward all supported query params as-is
    for (const key of ["resourceId", "objectClass", "situation", "linked", "page", "size", "sort"]) {
      const val = searchParams.get(key);
      if (val !== null) backendUrl.searchParams.set(key, val);
    }

    const authToken = await _getAuthToken();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };
    if (sessionId) headers["X-Session-Id"] = sessionId;

    const response = await fetch(backendUrl.toString(), { method: "GET", headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Error in GET /api/shadows:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
