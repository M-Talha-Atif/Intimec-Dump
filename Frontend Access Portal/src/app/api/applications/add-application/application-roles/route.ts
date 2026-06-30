import { _getAuthToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

const API_BASE_URL =
  process.env.MOCK_DATA_API_URL || "http://localhost:8090/api/v1";
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "0", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    if (Number.isNaN(page) || page < 0) {
      return NextResponse.json(
        { error: "Invalid 'page' parameter" },
        { status: 400 }
      );
    }

    if (Number.isNaN(size) || size <= 0) {
      return NextResponse.json(
        { error: "Invalid 'size' parameter" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${await _getAuthToken()}`,
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    const response = await fetch(
      `${API_BASE_URL}/applications/add-application/application-roles?${searchParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${await _getAuthToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Application Roles");
    }

    const applicationRolesData = await response.json();

    return NextResponse.json(applicationRolesData);
  } catch (error) {
    console.error("Error fetching application roles data:", error);
    return NextResponse.json(
      { error: "Failed to fetch application roles data" },
      { status: 500 }
    );
  }
}
