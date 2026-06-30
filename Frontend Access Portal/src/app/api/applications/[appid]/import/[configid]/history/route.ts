import { _getAuthToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.MOCK_DATA_API_URL || "http://localhost:4000";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ appid: string; configid: string }> }
) {
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

    const { appid, configid } = await params;
    const urlParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${await _getAuthToken()}`,
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    const response = await fetch(
      `${API_BASE_URL}/applications/${appid}/import/config/${configid}/history?${urlParams.toString()}`,
      {
        headers,
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message ?? "Failed to fetch Import history");
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
