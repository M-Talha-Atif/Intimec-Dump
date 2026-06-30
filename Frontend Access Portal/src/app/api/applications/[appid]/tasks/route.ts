import { _getAuthToken } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || "http://localhost:4000";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ appid: string }> }
) {
  const { appid } = await params;
  console.log("Posting import config for appid:", appid);
  const body = await request.json();
  console.log(JSON.stringify(body));
  
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
    `${API_URL}/applications/${appid}/tasks`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json(
      { message: data.message || "Failed to post import configuration" },
      { status: response.status }
    );
  }
  return NextResponse.json(data);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appid: string }> }
) {
  const { appid } = await params;
  const url = new URL(
    `${API_URL}/applications/${appid}/tasks?page=0&size=100&sort=createdAt,desc`
  );
  
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
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json(
      { message: data.message || "Failed to get tasks configuration" },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}
