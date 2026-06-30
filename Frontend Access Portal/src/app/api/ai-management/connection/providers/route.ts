import { NextResponse } from "next/server";
import { _getAuthToken } from "@/lib/auth";

export async function GET() {
  try {
    const token = await _getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }

    const llmBase = process.env.API_URL;

    const staticProviders = [
      "GOOGLE_AI_STUDIO",
      "DEEPSEEK",
      "MISTRAL",
      "CUSTOM",
    ];

    if (llmBase) {
      try {
        const res = await fetch(`${llmBase}/llm/providers`, {
          headers: { accept: "application/json" },
        });

        if (res.ok) {
          const data = await res.json();
          let providers = Array.isArray(data)
            ? data
            : data?.providers || data?.result || staticProviders;

          providers = Array.isArray(providers)
            ? [...providers, "CUSTOM"]
            : providers;

          return NextResponse.json({ success: true, providers });
        }
        console.warn(
          "LLM providers endpoint returned non-ok status",
          res.status
        );
      } catch (err) {
        console.warn("Failed to fetch providers from llmBase", err);
      }
    }

    return NextResponse.json({ success: true, providers: staticProviders });
  } catch (error) {
    console.error("Failed while fetching providers", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
