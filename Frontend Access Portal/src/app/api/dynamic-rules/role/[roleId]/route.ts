import { NextRequest, NextResponse } from "next/server";
import { _getAuthToken } from "@/lib/auth";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8181";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const accessToken = await _getAuthToken();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized - No access token found" },
        { status: 401 }
      );
    }

    const { roleId } = await params;
    const apiUrl = `${API_BASE_URL}/api/v1/dynamic-rules/role/${roleId}`;

    console.log(`[Dynamic Rules API] Fetching dynamic rule for role: ${roleId}`);

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No dynamic rule exists for this role
        return NextResponse.json(
          { data: null, message: "No dynamic rule found for this role" },
          { status: 200 }
        );
      }

      const errorData = await response.json().catch(() => ({
        message: "Failed to fetch dynamic rule",
      }));

      console.error(
        `[Dynamic Rules API] Error fetching dynamic rule:`,
        response.status,
        errorData
      );

      return NextResponse.json(
        { error: errorData.message || "Failed to fetch dynamic rule" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[Dynamic Rules API] Successfully fetched dynamic rule for role ${roleId}`);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[Dynamic Rules API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
