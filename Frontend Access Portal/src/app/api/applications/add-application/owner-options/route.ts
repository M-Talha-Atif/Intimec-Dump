import { _getAuthToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

const API_BASE_URL =
  process.env.API_URL || "http://localhost:8090/api/v1";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "0", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    const search = searchParams.get("search") || "";
    const identityType = searchParams.get("identityType") || "";

    if (Number.isNaN(page) || page < 0) {
      return NextResponse.json(
        { error: "Invalid 'page' parameter" },
        { status: 400 }
      );
    }

    if (Number.isNaN(size) || size <= 0) {
      return NextResponse.json(
        { error: "Invalid 'size' parameter" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${await _getAuthToken()}`,
    };

    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    // Use the same real users endpoint as the role wizard
    const response = await fetch(`${API_BASE_URL}/users/tenant`, { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }

    const body: { success?: boolean; users?: Record<string, unknown>[]; data?: Record<string, unknown>[] } = await response.json();
    const allUsers: Record<string, unknown>[] = Array.isArray(body)
      ? body
      : (body.users ?? body.data ?? []);

    // Transform UserDto → the shape useOwnerOptions expects
    let transformed = allUsers.map((u) => ({
      id: String(u.id ?? ""),
      name:
        u.displayName ||
        `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() ||
        String(u.username ?? u.email ?? ""),
      department: String(u.department ?? ""),
      status: String(u.status ?? "Active"),
      identityType: "employee" as const, // users from auth-service are platform users
      kind: "identity" as const,
    }));

    // Client-side search filter (backend /users/tenant has no search param)
    if (search) {
      const q = search.toLowerCase();
      transformed = transformed.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q)
      );
    }

    // Client-side identity type filter (all are "identity", skip group filter)
    if (identityType && identityType !== "all" && identityType !== "identity-groups") {
      transformed = transformed.filter((u) => u.identityType === identityType);
    }

    // Client-side pagination
    const totalElements = transformed.length;
    const totalPages = Math.ceil(totalElements / size);
    const pageData = transformed.slice(page * size, page * size + size);

    return NextResponse.json({
      data: pageData,
      pagination: {
        page,
        size,
        totalElements,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching users data:", error);
    return NextResponse.json(
      { error: "Failed to fetch users data" },
      { status: 500 }
    );
  }
}
