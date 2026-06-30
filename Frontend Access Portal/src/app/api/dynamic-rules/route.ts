import { NextRequest, NextResponse } from "next/server";
import { _getAuthToken } from "@/lib/auth";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8181";

/**
 * GET /api/dynamic-rules - Get all dynamic rules (not typically used)
 * This endpoint is included for completeness but typically rules are fetched by roleId
 */
export async function GET(request: NextRequest) {
  try {
    const accessToken = await _getAuthToken();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized - No access token" },
        { status: 401 }
      );
    }

    const apiUrl = `${API_BASE_URL}/api/v1/dynamic-rules`;

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to fetch dynamic rules" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching dynamic rules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dynamic-rules - Create a new dynamic rule
 */
export async function POST(request: NextRequest) {
  try {
    const accessToken = await _getAuthToken();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized - No access token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("Creating dynamic rule with data:", JSON.stringify(body, null, 2));

    const apiUrl = `${API_BASE_URL}/api/v1/dynamic-rules`;

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    console.log("Backend response status:", response.status);
    const contentType = response.headers.get("content-type");
    console.log("Backend response content-type:", contentType);

    // Check if response is JSON
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.log("Backend response (non-JSON):", text);
      data = { message: text || "Unknown error" };
    }

    if (!response.ok) {
      console.error("Backend error response:", data);
      return NextResponse.json(
        { error: data.message || "Failed to create dynamic rule" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating dynamic rule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/dynamic-rules - Update an existing dynamic rule
 */
export async function PUT(request: NextRequest) {
  try {
    const accessToken = await _getAuthToken();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized - No access token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("Updating dynamic rule with data:", JSON.stringify(body, null, 2));

    const apiUrl = `${API_BASE_URL}/api/v1/dynamic-rules`;

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("Backend response status:", response.status);
    const contentType = response.headers.get("content-type");
    console.log("Backend response content-type:", contentType);

    // Check if response is JSON
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.log("Backend response (non-JSON):", text);
      data = { message: text || "Unknown error" };
    }

    if (!response.ok) {
      console.error("Backend error response:", data);
      return NextResponse.json(
        { error: data.message || "Failed to update dynamic rule" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating dynamic rule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
