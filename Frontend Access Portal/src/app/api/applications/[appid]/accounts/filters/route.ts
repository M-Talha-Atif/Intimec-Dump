import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/server/apiFetch";

const API_BASE_URL = process.env.API_URL || "http://localhost:8081/api/v1";

export async function GET(
  req: NextRequest,
  { params }: { params: { appid: string } }
) {
  const { appid } = await params;

  try {
    const data = await apiFetch(
      `${API_BASE_URL}/applications/${appid}/accounts/filters`
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Account Filters] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch filters", situations: [], statuses: [] },
      { status: 500 }
    );
  }
}
