import { NextRequest, NextResponse } from "next/server";
import { _getAuthToken } from "@/lib/auth";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL || "http://localhost:8081/api/v1";

export async function POST(
  request: NextRequest,
  { params }: { params: { roleId: string } }
) {
  try {
    const token = await _getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { roleId } = params;

    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    if (sessionId) {
      headers["X-Session-ID"] = sessionId;
    }

    const backendResponse = await fetch(
      `${API_URL}/roles/${roleId}/permissions/bulk`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }
    );

    const data = await backendResponse.json();

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error("Error in bulk assign permissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
