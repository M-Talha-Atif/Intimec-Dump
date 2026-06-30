import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shadowId: string }> }
) {
  try {
    const { shadowId } = await params;
    if (!shadowId) {
      return NextResponse.json({ message: "shadowId path parameter is required" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ?? "0";
    const size = searchParams.get("size") ?? "50";

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value ?? null;
    const sessionId = cookieStore.get("session_id")?.value ?? null;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };
    if (sessionId) headers["X-Session-Id"] = sessionId;

    const backendUrl = `${API_BASE_URL}/entitlements/by-shadow/${shadowId}?page=${page}&size=${size}`;
    const response = await fetch(backendUrl, { method: "GET", headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: (errorData as { message?: string }).message || `Backend error ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    return NextResponse.json({ message: `Proxy error: ${message}` }, { status: 500 });
  }
}
