import { NextRequest, NextResponse } from "next/server";
import { _getAuthToken } from "@/lib/auth";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL || "http://localhost:8081/api/v1";

/**
 * POST /api/roles/[roleId]/permissions/bulk-revoke
 * Revoke multiple permissions from a role in a single atomic transaction
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { roleId: string } }
) {
  try {
    const token = await _getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { roleId } = params;
    const { actionIds } = body;

    if (!actionIds || !Array.isArray(actionIds) || actionIds.length === 0) {
      return NextResponse.json(
        { error: "actionIds array is required and must not be empty" },
        { status: 400 }
      );
    }

    if (actionIds.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 permissions can be revoked at once" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    if (sessionId) {
      headers["X-Session-ID"] = sessionId;
    }

    // Call backend bulk revoke endpoint
    const backendUrl = `${API_URL}/roles/${roleId}/permissions/bulk-revoke`;
    
    const response = await fetch(backendUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ actionIds }),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in bulk revoke permissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
