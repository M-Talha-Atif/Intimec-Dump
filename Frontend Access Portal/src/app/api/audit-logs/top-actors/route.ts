import { _getAuthToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.API_URL || "http://localhost:8081/api/v1";

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

    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const range = searchParams.get("range");
    const limit = searchParams.get("limit");

    if (dateFrom) queryParams.append("dateFrom", dateFrom);
    if (dateTo) queryParams.append("dateTo", dateTo);
    if (range) queryParams.append("range", range);
    if (limit) queryParams.append("limit", limit);

    const response = await fetch(
      `${API_BASE_URL}/audit-logs/analytics/top-actors?${queryParams.toString()}`,
      { method: "GET", headers, cache: "no-store" }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || `Failed to fetch top actors: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
  } catch (err) {
    console.error("Audit analytics top actors error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}