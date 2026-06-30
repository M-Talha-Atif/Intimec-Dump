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

    // hour and timezone are required by the backend
    const hour        = searchParams.get("hour");
    const timezone    = searchParams.get("timezone");
    const sources     = searchParams.get("sources");
    const windowHours = searchParams.get("windowHours");
    const page        = searchParams.get("page");
    const size        = searchParams.get("size");

    if (hour)        queryParams.append("hour",        hour);
    if (timezone)    queryParams.append("timezone",    timezone);
    if (sources)     queryParams.append("sources",     sources);
    if (windowHours) queryParams.append("windowHours", windowHours);
    if (page)        queryParams.append("page",        page);
    if (size)        queryParams.append("size",        size);

    const response = await fetch(
      `${API_BASE_URL}/logs/analytics/error-volume-entries?${queryParams.toString()}`,
      { method: "GET", headers, cache: "no-store" }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            errorData.message ||
            `Failed to fetch error volume entries: ${response.status}`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
  } catch (err) {
    console.error("Error volume entries route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}