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

    const kpiType = searchParams.get("kpiType");
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");
    const sortBy = searchParams.get("sortBy");
    const sortDirection = searchParams.get("sortDirection");

    if (!kpiType) {
      return NextResponse.json(
        { error: "kpiType parameter is required" },
        { status: 400 }
      );
    }

    if (kpiType) queryParams.append("kpiType", kpiType);
    if (page) queryParams.append("page", page);
    if (pageSize) queryParams.append("pageSize", pageSize);
    if (sortBy) queryParams.append("sortBy", sortBy);
    if (sortDirection) queryParams.append("sortDirection", sortDirection);

    const response = await fetch(
      `${API_BASE_URL}/workflows/analytics/kpi-drilldown?${queryParams.toString()}`,
      { method: "GET", headers, cache: "no-store" }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            errorData.message ||
            `Failed to fetch KPI drilldown: ${response.status}`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
  } catch (err) {
    console.error("KPI drilldown route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}