// Route for the drilldown drawer -- fetches real paginated audit logs
// used when clicking KPI cards, chart bars, heatmap cells, actor rows
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

    // Forward all filter and pagination params to the audit logs endpoint
    const searchParams = request.nextUrl.searchParams;
    const queryParams = new URLSearchParams();

    const forwarded = [
      "page", "size", "event", "objectType", "risk",
      "status", "dateFrom", "dateTo", "search"
    ];

    forwarded.forEach((key) => {
      const val = searchParams.get(key);
      if (val) queryParams.append(key, val);
    });

    const response = await fetch(
      `${API_BASE_URL}/audit-logs?${queryParams.toString()}`,
      { method: "GET", headers, cache: "no-store" }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || `Failed to fetch audit logs: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
  } catch (err) {
    console.error("Audit drilldown error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}