import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { isValidEntityType, IDENTITY_ENTITY_TYPE_ARRAY } from "@/constants/identity";
import { cookies } from "next/headers";

const ROLES_API_BASE_URL =
  process.env.API_URL || "http://localhost:8090/api/v1";

const AUTH_API_BASE_URL =
  process.env.API_URL || "http://localhost:8090/api/v1";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entityId: string; identityId: string }> }
) {
  try {
    const { entityId, identityId } = await params;

    if (!entityId || !identityId) {
      return NextResponse.json(
        { error: "entityId and identityId path parameters are required" },
        { status: 400 }
      );
    }

    if (!isValidEntityType(entityId)) {
      return NextResponse.json(
        {
          error: `Invalid entityId. Must be one of: ${IDENTITY_ENTITY_TYPE_ARRAY.join(", ")}`,
        },
        { status: 400 }
      );
    }

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

    // -------------------- STEP 1 --------------------
    const userLookupUrl = `${AUTH_API_BASE_URL}/users/by-identity/${identityId}`;

    const userResponse = await fetch(userLookupUrl, {
      method: "GET",
      headers,
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json().catch(() => ({}));

      // If no user account is linked to this identity, return an empty
      // roles response so the UI shows "No roles found" instead of an error.
      if (userResponse.status === 404) {
        return NextResponse.json(
          { data: [], count: 0, message: "No user account linked to this identity.", status: "OK" },
          { status: 200 }
        );
      }

      let errorMessage = errorData.message;
      if (userResponse.status === 401) {
        errorMessage = "Authentication required. Please log in again.";
      } else if (userResponse.status === 403) {
        errorMessage = "You don't have permission to resolve this identity.";
      } else if (!errorMessage) {
        errorMessage = `Failed to resolve identity to user: ${userResponse.status} ${userResponse.statusText}`;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: userResponse.status }
      );
    }

    const userData = await userResponse.json();
    const userId = userData.userId;

    if (!userId) {
      // No userId in response, treat as no roles available
      return NextResponse.json(
        { data: [], count: 0, message: "No user account linked to this identity.", status: "OK" },
        { status: 200 }
      );
    }

    // -------------------- STEP 2 --------------------
    const rolesUrl = `${ROLES_API_BASE_URL}/user-roles/user/${userId}`;

    const rolesResponse = await fetch(rolesUrl, {
      method: "GET",
      headers,
    });

    if (!rolesResponse.ok) {
      const errorData = await rolesResponse.json().catch(() => ({}));

      // If no roles found for this user, return empty response
      if (rolesResponse.status === 404) {
        return NextResponse.json(
          { data: [], count: 0, message: "No roles found for this identity.", status: "OK" },
          { status: 200 }
        );
      }

      let errorMessage = errorData.message;
      if (rolesResponse.status === 401) {
        errorMessage = "Authentication required. Please log in again.";
      } else if (rolesResponse.status === 403) {
        errorMessage = "You don't have permission to view roles for this identity.";
      } else if (!errorMessage) {
        errorMessage = `Failed to fetch identity roles: ${rolesResponse.status} ${rolesResponse.statusText}`;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: rolesResponse.status }
      );
    }

    const contentType = rolesResponse.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await rolesResponse.json();
      return NextResponse.json(data);
    } else {
      const text = await rolesResponse.text();
      return NextResponse.json({ message: text || "Success" });
    }
  } catch (error: unknown) {
    console.error("Error in GET /api/identity/[entityId]/[identityId]/roles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}