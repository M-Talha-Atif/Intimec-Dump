import { _getAuthToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

export async function GET(
  req: NextRequest,
  { params }: { params: { connId: string } }
) {
  const connectorId = (await params).connId;
  
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;
  
  const headers: Record<string, string> = {
    Authorization: `Bearer ${await _getAuthToken()}`,
  };
  
  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }
  
  const response = await fetch(
    `${API_BASE_URL}/connectors/${connectorId}/icon`,
    {
      headers,
    }
  );
  if (!response.ok) {
    const errorData = await response.json();
    return NextResponse.json(
      { error: errorData.message || "Failed to fetch applications" },
      { status: response.status }
    );
  }
  return new NextResponse(response.body, {
    status: 200,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "image/png",
      "Content-Length": response.headers.get("content-length") ?? "",
      "Cache-Control": "public, max-age=86400", // optional caching
    },
  });
}
