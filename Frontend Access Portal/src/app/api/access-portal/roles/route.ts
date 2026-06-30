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

    if (sessionId) {
      headers["X-Session-Id"] = sessionId;
    }

    // Extract query parameters from the request
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "0";
    const size = searchParams.get("size") || "10";
    const search = searchParams.get("search") || "";
    const riskLevel = searchParams.get("riskLevel") || "";

    //  Build query string for backend API
    const queryParams = new URLSearchParams();
    queryParams.append("page", page);
    queryParams.append("size", size);
    if (riskLevel) {
      queryParams.append("riskLevel", riskLevel);
    }

    if (search) {
      queryParams.append("search", search);
    }

    // Roles API with query parameters
    const response = await fetch(
      `${API_BASE_URL}/roles?${queryParams.toString()}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            errorData.message ||
            `Failed to fetch roles: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    // console.log(data)
    return NextResponse.json(data);
  } catch (err) {
    console.error("Roles API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}