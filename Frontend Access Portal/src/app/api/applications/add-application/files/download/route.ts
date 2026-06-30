import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || "http://127.0.0.1:8089/api/v1";

/**
 * GET /api/applications/add-application/files/download?path=/uploads/filename.properties
 * Downloads a connector file from the backend and returns its text content.
 */
export async function GET(request: NextRequest) {
  try {
    const filePath = request.nextUrl.searchParams.get("path");

    if (!filePath) {
      return NextResponse.json(
        { message: "Missing 'path' query parameter" },
        { status: 400 }
      );
    }

    // Extract just the filename from the path (e.g., "/uploads/foo.properties" → "foo.properties")
    const filename = filePath.split("/").pop();
    if (!filename) {
      return NextResponse.json(
        { message: "Invalid file path" },
        { status: 400 }
      );
    }

    const authToken = await _getAuthToken();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${authToken}`,
    };

    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    const backendUrl = `${API_URL}/connector-files/${encodeURIComponent(filename)}`;
    const response = await fetch(backendUrl, { method: "GET", headers });

    if (!response.ok) {
      return new NextResponse(null, { status: response.status });
    }

    const text = await response.text();
    return new NextResponse(text, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("[API Route] File download error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
