import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/server/apiFetch";

const API_BASE_URL = process.env.API_URL || "http://localhost:8081/api/v1";

// Increase max duration for edit/delete — multipart FormData + backend processing can be slow
export const maxDuration = 60; // seconds

export async function GET(
  _req: NextRequest,
  { params }: { params: { appid: string } }
) {
  try {
    const { appid } = await params;
    const data = await apiFetch(`${API_BASE_URL}/applications/${appid}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Get Application] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch application",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { appid: string } }
) {
  try {
    const { appid } = await params;
    await apiFetch.raw(`${API_BASE_URL}/applications/${appid}`, {
      method: "DELETE",
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[Delete Application] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete application",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { appid: string } }
) {
  try {
    const { appid } = await params;
    const formData = await req.formData();

    console.log("[Update Application] Sending PUT to backend...");
    console.log("[Update Application] Resource ID:", appid);
    console.log("[Update Application] FormData keys:", Array.from(formData.keys()));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55_000);
    try {
      const data = await apiFetch(`${API_BASE_URL}/applications/${appid}`, {
        method: "PUT",
        body: formData,
        signal: controller.signal,
      });
      console.log("[Update Application] Success:", data);
      return NextResponse.json(data);
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.error("[Update Application] Error:", error);
    const isTimeout = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      {
        error: isTimeout ? "Request timed out — backend is taking too long" : "Failed to update application",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
