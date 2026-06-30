import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

const toBackendIdentityType = (schemaId: string): string => {
  const map: Record<string, string> = {
    employee: "EMPLOYEE",
    "non-employee": "NON_EMPLOYEE",
    "non-human": "NON_HUMAN",
  };
  return map[schemaId] ?? schemaId;
};

/**
 * DELETE /api/identity/mapping/policies/[schemaId]/correlation/rules/[ruleId]
 * Deletes a single correlation rule by its backend UUID. Triggers an audit DELETE event.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ schemaId: string; ruleId: string }> }
) {
  try {
    const { schemaId, ruleId } = await params;

    if (!schemaId || !ruleId) {
      return NextResponse.json(
        { error: "schemaId and ruleId path parameters are required" },
        { status: 400 }
      );
    }

    const identityType = toBackendIdentityType(schemaId);
    const apiUrl = `${API_BASE_URL}/identity/mapping/policies/${identityType}/correlation/rules/${ruleId}`;

    const authToken = await _getAuthToken();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    if (sessionId) {
      headers["X-Session-Id"] = sessionId;
    }

    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            errorData.message ||
            `Failed to delete correlation rule: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: "Correlation rule deleted" });
  } catch (error: unknown) {
    console.error(
      "Error in DELETE /api/identity/mapping/policies/[schemaId]/correlation/rules/[ruleId]:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
