import { NextResponse } from "next/server";
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
 * GET /api/access-portal/tiles/{tileId}
 */
export async function GET(
    _req: Request,
    { params }: { params: { tileId: string } }
) {
    try {
        const authToken = await _getAuthToken();
        if (!authToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const response = await fetch(
            `${API_BASE_URL}/access-portal/tiles/${params.tileId}`,
            {
                method: "GET",
                headers: buildHeaders(authToken),
                cache: "no-store",
            }
        );

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Tile GET error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/access-portal/tiles/{tileId}
 */
export async function PUT(
    request: Request,
    { params }: { params: { tileId: string } }
) {
    try {
        const authToken = await _getAuthToken();
        if (!authToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(
            `${API_BASE_URL}/access-portal/tiles/${params.tileId}`,
            {
                method: "PUT",
                headers: buildHeaders(authToken),
                body: JSON.stringify(body),
            }
        );

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Tile PUT error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/access-portal/tiles/{tileId}
 */
export async function DELETE(
    _req: Request,
    { params }: { params: { tileId: string } }
) {
    try {
        const authToken = await _getAuthToken();
        if (!authToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const response = await fetch(
            `${API_BASE_URL}/access-portal/tiles/${params.tileId}`,
            {
                method: "DELETE",
                headers: buildHeaders(authToken),
            }
        );

        if (response.status === 204) {
            return new NextResponse(null, { status: 204 });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Tile DELETE error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
