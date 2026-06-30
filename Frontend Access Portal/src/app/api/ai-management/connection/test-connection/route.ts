import { NextRequest, NextResponse } from "next/server";
import { _getAuthToken } from "@/lib/auth";

type Provider = "GOOGLE_AI_STUDIO" | "DEEPSEEK" | "MISTRAL" | "CUSTOM";

interface TestRequestBody {
  provider?: Provider;
  baseUrl?: string;
}

const DEFAULT_TIMEOUT_MS = 10000;

function createTimeoutSignal(ms = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  const clear = () => clearTimeout(timeoutId);
  return { signal: controller.signal, clear } as const;
}

async function performTest(provider: Provider | undefined, baseUrl?: string) {
  const started = Date.now();
  try {
    const { signal, clear } = createTimeoutSignal();
    const resolvedBase =
      (provider === "CUSTOM" ? baseUrl && baseUrl.trim() : undefined) ||
      (provider === "GOOGLE_AI_STUDIO"
        ? "https://generativelanguage.googleapis.com/v1"
        : "");

    if (!resolvedBase) {
      throw new Error(
        provider === "CUSTOM"
          ? "Missing baseUrl for custom provider"
          : "Unknown provider"
      );
    }

    const llmBase = process.env.API_URL;

    const res = await fetch(`${llmBase}/llm/test-provider`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider,
        ...(provider === "CUSTOM" && baseUrl ? { baseUrl } : {}),
      }),
      signal,
    });

    const latencyMs = Date.now() - started;
    clear();

    let error: string | undefined;
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        error = "Unauthorized – API key invalid or missing scopes";
      } else {
        const text = await res.text().catch(() => "");
        error = text || res.statusText;
      }
    }
    const response = await res.json();

    return {
      success: response.success,
      model: response.model,
      tokenUsed: response.tokenUsed,
      promptTokens: response.promptTokens,
      completionTokens: response.completionTokens,
      timestamp: response.timestamp,
      status: res.status,
      latencyMs,
      error,
      baseUrl: resolvedBase,
      provider: provider ?? null,
    };
  } catch (err: unknown) {
    console.error("Test connection error:", err);
    const latencyMs = Date.now() - started;
    const isAbort = err instanceof Error && err.name === "AbortError";
    const message =
      err instanceof Error
        ? isAbort
          ? "Request timed out"
          : err.message
        : "Unknown error";
    return {
      success: false,
      reachable: false,
      status: 0,
      latencyMs,
      error: message,
      baseUrl: baseUrl ?? null,
      provider: provider ?? null,
    } as const;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Gate with app auth (optional: remove if not required)
    const token = await _getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as Partial<TestRequestBody>;
    const provider = (body.provider as Provider | undefined) ?? undefined;
    const baseUrl = body.baseUrl?.trim();

    if (!provider) {
      return NextResponse.json(
        { error: "Missing provider (google_ai_studio or custom)" },
        { status: 400 }
      );
    }
    if (provider === "CUSTOM" && !baseUrl) {
      return NextResponse.json(
        { error: "Missing baseUrl for custom provider" },
        { status: 400 }
      );
    }

    const result = await performTest(provider, baseUrl);
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI connection test error (POST):", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
