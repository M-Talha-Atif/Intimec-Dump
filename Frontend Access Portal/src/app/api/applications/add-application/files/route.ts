import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Route through API gateway so it works in both local dev and Docker deployment
const API_URL = process.env.API_URL || "http://127.0.0.1:8089/api/v1";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;
    const authToken = await _getAuthToken();

    const headers: Record<string, string> = {
      Authorization: `Bearer ${authToken}`,
    };

    if (sessionId) {
      headers["X-Session-Id"] = sessionId;
    }

    const response = await fetch(`${API_URL}/connector-files`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { message: errorText || "Failed to list files" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
