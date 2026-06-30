import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = searchParams.get("provider");
    if (!raw) {
      return NextResponse.json(
        { error: "provider is required" },
        { status: 400 }
      );
    }
    const provider = raw.trim().toUpperCase().replace(/-/g, "_");
    const res = await fetch(
      `${process.env.API_URL}/llm/providers/${provider}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { error: errorData.message || "API request failed" },
        { status: res.status }
      );
    }
    const status = await res.json();

    return NextResponse.json({
      provider,
      hasApiKey: status.success,
      updatedAt: status.updatedAt ?? null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
