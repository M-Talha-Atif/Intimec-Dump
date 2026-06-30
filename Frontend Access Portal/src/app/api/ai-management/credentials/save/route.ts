import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const providerInput = body?.provider as string | undefined;

    const apiKey = body?.apiKey as string | undefined;
    if (!providerInput) {
      return NextResponse.json(
        { error: "provider is required" },
        { status: 400 }
      );
    }
    const provider = providerInput.trim().toUpperCase().replace(/-/g, "_");
    if (!apiKey || apiKey.trim().length === 0) {
      return NextResponse.json(
        { error: "apiKey is required" },
        { status: 400 }
      );
    }

    const API_URL = process.env.API_URL;
    if (!API_URL) {
      return NextResponse.json(
        { error: "API_URL not configured" },
        { status: 500 }
      );
    }
    const apiBody = await JSON.stringify({
      provider,
      apiKey,
    });

    const res = await fetch(`${API_URL}/llm/providers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: apiBody,
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { error: errorData.message || "API request failed" },
        { status: res.status }
      );
    }

    const responseData = await res.json();
    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
