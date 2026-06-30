import { _getAuthToken } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";
import { cookies } from 'next/headers';

const API_URL = process.env.MOCK_DATA_API_URL || "http://localhost:4000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appid: string; configid: string }> }
) {
  const { appid, configid } = await params;
  console.log("Getting import config for appid:", appid);

  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;
  
  const headers: Record<string, string> = {
    Authorization: `Bearer ${await _getAuthToken()}`,
  };
  
  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }

  const response = await fetch(
    `${API_URL}/applications/${appid}/import/config/${configid}`,
    {
      headers,
    }
  );
  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          data.error ||
          `No config found for appid=${appid}, configid=${configid}`,
      },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ appid: string; configid: string }> }
) {
  const { appid, configid } = await params;
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
    `${API_URL}/applications/${appid}/import/config/${configid}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json(
      { error: data.error || "Failed to post import configuration" },
      { status: response.status }
    );
  }
  return NextResponse.json(data);
}
