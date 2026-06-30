import { NextRequest, NextResponse } from "next/server";
import { _getAuthToken } from "@/lib/auth";
import { messages } from "react-querybuilder";
import { cookies } from 'next/headers';

const API_URL = `${process.env.API_URL}`;

// Get all Templates
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

    const url = `${API_URL}/notifications/template-managers/current`;
    
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
      console.error(`Email Template POST API Error (${res.status}):`, errorText);
      return NextResponse.json(
        {
          error: `Failed to post Email Template : ${res.status} ${res.statusText}`,
        },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json({ data: data });
  } catch (error) {
    console.error("Email Template GET proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Add template
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

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    const url = `${API_URL}/notifications/template-managers`;
    
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
      const errorText = await response.json();
      console.log(errorText);
      console.error(errorText.message);
      return NextResponse.json(
        {
          error: `${errorText.message.split(':')[1] || response.statusText}`,
        },
        { status: response.status }
      );
    }
    return NextResponse.json({ status: true });
  } catch (error) {
    console.error("Email Template GET proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
