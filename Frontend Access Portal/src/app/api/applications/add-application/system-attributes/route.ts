import { _getAuthToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";
export async function GET(req: NextRequest) {
  try {
    // Fetch connectors
    const searchParams = req.nextUrl.searchParams;
    const url = `${API_BASE_URL}/identity/schema/${searchParams.get(
      "identityType"
    )}`;
    
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${await _getAuthToken()}`,
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }
    
    const response = await fetch(url, {
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch system attributes");
    }

    const systemAttributes = await response.json();
    console.log("System Attributes Data:", systemAttributes);
    return NextResponse.json(systemAttributes);
  } catch (error) {
    console.error("Error fetching system attributes data:", error);
    return NextResponse.json(
      { error: "Failed to fetch system attributes data" },
      { status: 500 }
    );
  }
}
