import { NextRequest, NextResponse } from "next/server";
import { _getAuthToken } from "@/lib/auth";
import { cookies } from 'next/headers';

const API_URL = `${process.env.API_URL}`;
const url = `${API_URL}/session-control`;

interface SessionControlsConfig {
  idleTimeoutMinutes: number;
  absoluteSessionLifetimeHours: number;
  forceLogoutOnPasswordChange: boolean;
}

interface ApiPayload {
  jwtExpirationMinutes: number;
  refreshTokenExpirationHours: number;
  forceLogoutOnPasswordChange: boolean;
}

const mapSessionControlsToApi = (
  config: SessionControlsConfig
): ApiPayload => ({
  jwtExpirationMinutes: config.idleTimeoutMinutes,
  refreshTokenExpirationHours: config.absoluteSessionLifetimeHours,
  forceLogoutOnPasswordChange: config.forceLogoutOnPasswordChange,
});


export async function GET(request: NextRequest) {
  try {
    const token = await _getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    const res = await fetch(url, {
      method: "GET",
      headers,
    })


    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Email Configurations  POST API Error (${res.status}):`, errorText);
      return NextResponse.json(
        {
          error: `Failed to post Email Configurations : ${res.status} ${res.statusText}`,
        },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json({ data: data });
  } catch (error) {
    console.error("Email Configurations  GET proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await _getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log(body);

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    const url = `${API_URL}/session-control`;
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Email Configurations  POST API Error (${response.status}):`, errorText);
      return NextResponse.json(
        {
          error: `Failed to post Email Configurations : ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }
    return NextResponse.json({ status: true });
  } catch (error) {
    console.error("Email Configurations  GET proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
export async function PUT(request: NextRequest) {
  try {
    const token = await _getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log(body);
    const mapped = mapSessionControlsToApi(body);
    console.log(mapped);

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    const url = `${API_URL}/session-control`;
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(mapped),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Email Configurations  POST API Error (${response.status}):`, errorText);
      return NextResponse.json(
        {
          error: `Failed to post Email Configurations : ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }
    return NextResponse.json({ status: true });
  } catch (error) {
    console.error("Email Configurations  GET proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
