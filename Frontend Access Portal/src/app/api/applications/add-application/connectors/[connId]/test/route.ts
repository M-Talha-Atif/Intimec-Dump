import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";
export async function POST(
  request: Request,
  { params }: { params: { connId: string } }
) {
  const { connId } = await params;
  const body = await request.json();

  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${await _getAuthToken()}`,
  };
  
  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }

  const response = await fetch(
    `${API_BASE_URL}/connectors/${connId}/test`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json(
      {
        data: {
          status: "fail"
        },
        message: data?.message ?? "Failed to test connector"
      },
      { status: response.status }
    );
  }

  return NextResponse.json({
    data: {
      status: data.success ? "success" : "fail"
    },
    message: data.message || "Connection successful."
  }, { status: data.success ? 200 : 500 });
}