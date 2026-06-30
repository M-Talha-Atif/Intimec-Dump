import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { _getAuthToken } from "@/lib/auth";

const BACKEND_URL = process.env.API_URL || 'http://localhost:8081';

async function getHeaders(): Promise<Record<string, string> | null> {
    const authToken = await _getAuthToken();
    if (!authToken) return null;

    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    const headers: Record<string, string> = {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
    };
    if (sessionId) headers["X-Session-Id"] = sessionId;

    return headers;
}

/**
 * GET /api/access-roles/[roleId]/entitlements/grouped
 *
 * Proxies the grouped (two-level paginated) entitlement request to the backend.
 * Query params: appPage, appSize, entPage, entSize
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { roleId: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const appPage = searchParams.get('appPage') || '0';
        const appSize = searchParams.get('appSize') || '5';
        const entPage = searchParams.get('entPage') || '0';
        const entSize = searchParams.get('entSize') || '10';

        const headers = await getHeaders();
        if (!headers) {
            return NextResponse.json(
                { error: "No authentication token available" },
                { status: 401 }
            );
        }

        const response = await fetch(
            `${BACKEND_URL}/api/v1/access-roles/${params.roleId}/entitlements/grouped?appPage=${appPage}&appSize=${appSize}&entPage=${entPage}&entSize=${entSize}`,
            { headers }
        );

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("[access-role grouped entitlements GET] Unexpected error:", error);
        return NextResponse.json(
            { error: 'Failed to fetch grouped role entitlements' },
            { status: 500 }
        );
    }
}