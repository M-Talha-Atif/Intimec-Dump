import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.MOCK_DATA_API_URL;

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

  const queryParams = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  const { appid } = await params;

  const response = await fetch(
    `${API_URL}/applications/${appid}/ai-analysis?${queryParams.toString()}`
  );
  const data = await response.json();
  return NextResponse.json(data);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { appid: string } }
) {
  const { appid } = await params;

  const response = await fetch(`${API_URL}/applications/${appid}/ai-analysis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to start AI analysis" },
      { status: response.status }
    );
  }

  return NextResponse.json({ message: "AI analysis started successfully" });
}
