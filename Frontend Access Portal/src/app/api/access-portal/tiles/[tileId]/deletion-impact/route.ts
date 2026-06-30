// app/api/access-portal/tiles/[tileId]/deletion-impact/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { _getAuthToken } from "@/lib/auth";

const BACKEND_URL = process.env.API_URL || "http://localhost:8081";

function buildHeaders(authToken: string) {
    return {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
    };
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ tileId: string }> }
) {
    try {
        const { tileId } = await context.params;

        if (!tileId || tileId === 'undefined') {
            console.error('[TileDeletionImpact] Invalid tileId:', tileId);
            return NextResponse.json(
                { error: 'Invalid tileId' },
                { status: 400 }
            );
        }

        const authToken = await _getAuthToken();
        if (!authToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const backendUrl = `${BACKEND_URL}/access-portal/tiles/${tileId}/deletion-impact`;
        console.log('[TileDeletionImpact] Calling:', backendUrl);

        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: buildHeaders(authToken),
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[TileDeletionImpact] Backend error:', errorText);
            return NextResponse.json(
                { error: 'Failed to fetch deletion impact', details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('[TileDeletionImpact] Backend response:', JSON.stringify(data, null, 2));

        return NextResponse.json(data);
    } catch (error) {
        console.error('[TileDeletionImpact] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: String(error) },
            { status: 500 }
        );
    }
}