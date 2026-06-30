import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const feature = body?.feature || "unknown";
    const prompt = String(body?.prompt ?? "").trim();
    let payload = body?.payload;

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch {}
    }

    const provider = payload?.provider || "GOOGLE_AI_STUDIO";

    console.log("provider:", provider);

    const llmBase = process.env.API_URL;
    const llmResponse = await fetch(`${llmBase}/llm/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ provider, prompt }),
    });

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text();
      return NextResponse.json(
        {
          success: false,
          error: `LLM API error: ${llmResponse.status} ${llmResponse.statusText}`,
          details: errorText,
        },
        { status: llmResponse.status }
      );
    }

    const llmData = await llmResponse.json();

    const now = new Date().toISOString();

    const promptTokens = llmData.promptTokens ?? null;
    const completionTokens = llmData.completionTokens ?? null;
    const tokensUsed =
      llmData.tokensUsed ??
      (typeof promptTokens === "number" && typeof completionTokens === "number"
        ? promptTokens + completionTokens
        : null) ??
      0;

    const response = {
      content: llmData.content || llmData.response || "No content received",
      provider: provider,
      feature: feature,
      model: llmData.model || "unknown",
      tokensUsed: Number(tokensUsed),
      promptTokens: promptTokens !== null ? Number(promptTokens) : null,
      completionTokens:
        completionTokens !== null ? Number(completionTokens) : null,
      timestamp: now,
      requestId: llmData.requestId,
      success: llmData.success,
      errorMessage: llmData.errorMessage,
      originalResponse: llmData,
    };

    return NextResponse.json({ success: llmData.success, response });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
