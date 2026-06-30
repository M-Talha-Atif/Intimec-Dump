import { _getAuthToken } from "@/lib/auth";
import { TaskRun } from "@/types/task";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || "http://localhost:8090/api/v1";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ taskid: string }> }
) {
  const { taskid } = await params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "0", 10);
  const size = parseInt(searchParams.get("size") || "10", 10);
  
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
    `${API_URL}/tasks/${taskid}/runs?page=${page}&size=${size}`,
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

  const output = {
    data: data.runs as TaskRun[],
    pagination: {
      page: data.pageNumber,
      size: data.pageSize,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
    },
  };

  return NextResponse.json(output);
}
