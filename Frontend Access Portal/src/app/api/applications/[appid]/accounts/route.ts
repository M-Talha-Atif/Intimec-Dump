import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/server/apiFetch";

const API_BASE_URL = process.env.API_URL || "http://localhost:8081/api/v1";

export async function GET(
  req: NextRequest,
  { params }: { params: { appid: string } }
) {
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

  const { appid } = await params;

  try {
    const data = await apiFetch(
      `${API_BASE_URL}/applications/${appid}/accounts?${searchParams.toString()}`
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Accounts] Error fetching accounts from backend:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts", data: [], pagination: { page: 0, size, totalElements: 0, totalPages: 0 } },
      { status: 500 }
    );
  }
}
