// app/api/logs/search/route.ts

import { NextResponse } from "next/server";
import { _getAuthToken } from "@/lib/auth";
import { cookies } from 'next/headers';

// Get the API URL from environment variables for flexibility
const API_URL = process.env.API_URL || "http://localhost:8081";

export async function POST(request: Request) {
  try {
    // 1. Authenticate the request from your application
    const token = await _getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. Get the search query from the request body
    let searchQuery;
    try {
      searchQuery = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    console.log(
      "Forwarding query to logs API:",
      JSON.stringify(searchQuery, null, 2)
    );

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    // 3. Forward the query to the logs search endpoint
    const res = await fetch(`${API_URL}/logs/search`, {
      method: "POST",
      headers,
      body: JSON.stringify(searchQuery),
    });

    // 4. Handle the response from the logs API
    const responseData = await res.json();
    // console.log("Logs API response:", JSON.stringify(responseData, null, 2));
    if (!res.ok) {
      // If logs API returned an error, forward it to the client for better debugging
      console.error(`Logs API Error (${res.status}):`, responseData);
      return NextResponse.json(
        {
          error: "Failed to fetch from logs API",
          details: responseData.error || "Unknown logs API error",
        },
        { status: res.status }
      );
    }
    console.log("Response came")
    console.log(responseData)

    // 5. Return the successful response from logs API to the client
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Logs API proxy route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
