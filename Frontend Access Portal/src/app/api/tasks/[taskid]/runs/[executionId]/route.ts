import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || "http://localhost:8090/api/v1";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ taskid: string; executionId: string }> }
) {
  const { taskid, executionId } = await params;
  
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
    `${API_URL}/tasks/${taskid}/runs/${executionId}`,
    {
      method: "GET",
      headers,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { message: data.message || "Failed to fetch task runs" },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}
