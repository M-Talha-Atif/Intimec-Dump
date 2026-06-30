import { _getAuthToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || "http://127.0.0.1:8090/api/v1";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ connId: string; objName: string }> }
) {
  const { connId, objName } = await params;
  const body = await request.json();
  const searchParams = request.nextUrl.searchParams;

  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${await _getAuthToken()}`,
  };
  
  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }

  const response = await fetch(
    `${API_BASE_URL}/connectors/${connId}/preview/${objName}?${searchParams.toString()}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { message: data?.message ?? "Failed to fetch preview" },
      { status: response.status }
    );
  }

  // Check if the response contains an error message even with 200 status
  if (data.message && data.message.includes("Failed to fetch schema")) {
    return NextResponse.json({ message: data.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
