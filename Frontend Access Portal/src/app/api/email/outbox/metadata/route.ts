import { NextRequest, NextResponse } from "next/server";
import { _getAuthToken } from "@/lib/auth";

const API_URL = process.env.MOCK_DATA_API_URL;

// Get Email outbox metadata
export async function GET(request: NextRequest) {
  try {
    const token = await _getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }

    const url = `${API_URL}/email/outbox/metadata`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
    let data = await res.json();
    data = data.data;
    return NextResponse.json({ data: data });
  } catch (error) {
    console.error("Email Template GET proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}