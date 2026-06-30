import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/server/apiFetch";
import { wrapRoute } from "@/lib/server/wrapRoute";

const API_BASE_URL = process.env.API_URL || "http://localhost:8081/api/v1";  // Fixed: Use API Gateway port
const MOCK_URL = process.env.MOCK_DATA_API_URL || "http://localhost:4000";

export const maxDuration = 60;

export const GET = wrapRoute(async () => {
  // Fetch connectors
  const [connectorsData, scopesData, departmentsData] = await Promise.all([
    apiFetch<{
      connectors: {
        id: string;
        label: string;
        bundle_version: string;
        iconUrl: string;
      }[];
    }>(`${API_BASE_URL}/connectors`),
    apiFetch<{
      scopes: { id: string; label: string }[];
    }>(`${MOCK_URL}/applications/add-application/scopes`),
    apiFetch<{
      departments: { id: string; label: string }[];
    }>(`${MOCK_URL}/applications/add-application/departments`),
  ]);

  return NextResponse.json({
    data: {
      connectors: [...connectorsData.connectors],
      scopes: [...scopesData.scopes],
      departments: [...departmentsData.departments],
      identityTypes: [
        {
          id: "employee",
          label: "Employee",
        },
        {
          id: "non_employee",
          label: "Non-Employee",
        },
        {
          id: "non_human",
          label: "Non-Human Identity",
        },
      ],
    },
  });
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    console.log("[Create Application] Sending request to backend...");
    console.log("[Create Application] API_BASE_URL:", API_BASE_URL);
    console.log("[Create Application] Full URL:", `${API_BASE_URL}/applications`);
    console.log("[Create Application] FormData keys:", Array.from(formData.keys()));
    
    // Log FormData values (excluding large files)
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`[Create Application] ${key}:`, `<File: ${value.name}, ${value.size} bytes>`);
      } else {
        console.log(`[Create Application] ${key}:`, value);
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55_000);
    let data: unknown;
    try {
      data = await apiFetch(`${API_BASE_URL}/applications`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    console.log("[Create Application] Success:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Create Application] Error:", error instanceof Error ? error.message : "Unknown error");
    const isTimeout = error instanceof Error && error.name === "AbortError";
    if (error && typeof error === 'object' && 'status' in error) {
      console.error("[Create Application] Error status:", (error as {status: unknown}).status);
    }
    return NextResponse.json(
      { error: isTimeout ? "Request timed out" : "Failed to create application", details: error instanceof Error ? error.message : "Unknown error" },
      { status: isTimeout ? 504 : 500 },
    );
  }
}
