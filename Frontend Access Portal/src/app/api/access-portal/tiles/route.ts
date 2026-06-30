import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { _getAuthToken } from "@/lib/auth";

const API_BASE_URL =
    process.env.API_URL || "http://localhost:8081/api/v1";

function buildHeaders(authToken: string) {
    //   const cookieStore = cookies();

    const headers: Record<string, string> = {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
    };


    return headers;
}

/**
 * GET /api/access-portal/tiles
 * → List tiles (supports pagination)
 */
export async function GET(request: Request) {
    try {
        const authToken = await _getAuthToken();
        if (!authToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.toString();

        const response = await fetch(
            `${API_BASE_URL}/access-portal/tiles${query ? `?${query}` : ""}`,
            {
                method: "GET",
                headers: buildHeaders(authToken),
                cache: "no-store",
            }
        );

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Tiles GET error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/access-portal/tiles
 * → Create tile
 */
export async function POST(request: Request) {
    try {
        const authToken = await _getAuthToken();
        if (!authToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(
            `${API_BASE_URL}/access-portal/tiles`,
            {
                method: "POST",
                headers: buildHeaders(authToken),
                body: JSON.stringify(body),
            }
        );

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Tiles POST error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
