import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL || "http://localhost:8090/api/v1";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ taskid: string }> }
) {
  const { taskid } = await params;

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${await _getAuthToken()}`,
  };

  if (sessionId) {
    headers["X-Session-Id"] = sessionId;
  }

  const response = await fetch(`${API_URL}/tasks/${taskid}/pause`, {
    method: "POST",
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(
      { message: data?.message || "Failed to pause task" },
      { status: response.status }
    );
  }

  return new NextResponse(null, { status: 200 });
}
