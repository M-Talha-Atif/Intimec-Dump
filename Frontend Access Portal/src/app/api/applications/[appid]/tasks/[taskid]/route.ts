import { _getAuthToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || "http://localhost:4000";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ appid: string; taskid: string }> }
) {
  const { appid, taskid } = await params;
  const url = new URL(`${API_URL}/applications/${appid}/tasks/${taskid}`);
  console.log("Deleting task with URL:", url.toString());
  
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${await _getAuthToken()}`,
  };
  
  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }
  
  const response = await fetch(url.toString(), {
    method: "DELETE",
    headers,
  });
  if (!response.ok) {
    const data = await response.json();
    return NextResponse.json(
      { message: data.message || "Failed to delete task" },
      { status: response.status }
    );
  }
  return NextResponse.json(
    { message: "Task deleted successfully" },
    { status: 200 }
  );
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ appid: string; taskid: string }> }
) {
  const { appid, taskid } = await params;
  const body = await request.json();
  
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
    `${API_URL}/applications/${appid}/tasks/${taskid}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    }
  );
  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json(
      { error: data.error || "Failed to update task" },
      { status: response.status }
    );
  }
  return NextResponse.json(data);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appid: string; taskid: string }> }
) {
  const { appid, taskid } = await params;
  
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;
  
  const headers: Record<string, string> = {
    Authorization: `Bearer ${await _getAuthToken()}`,
  };
  
  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }
  
  const response = await fetch(
    `${API_URL}/applications/${appid}/tasks/${taskid}`,
    {
      headers,
    }
  );
  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          data.error || `No task found for appid=${appid}, taskid=${taskid}`,
      },
      { status: response.status }
    );
  }
  return NextResponse.json(data);
}
