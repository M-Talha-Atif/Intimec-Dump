import { NextRequest, NextResponse } from 'next/server';
import { _getAuthToken } from "@/lib/auth";

const BACKEND_URL = process.env.API_URL  || 'http://localhost:8081';

function buildHeaders(authToken: string) {
    return {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
    };
}

/**
 * Parse backend error response
 */
function parseBackendError(errorData: any, statusCode: number): string {
    if (errorData.message) return errorData.message;
    if (errorData.error) return errorData.error;
    
    switch (statusCode) {
        case 401: return 'You are not authorized. Please login again.';
        case 403: return 'You do not have permission to view this request.';
        case 404: return 'Request not found.';
        case 500: return 'Server error. Please try again later.';
        default: return 'Failed to fetch request details. Please try again.';
    }
}

/**
 * GET /api/access-portal/requests/[requestId]/details
 * Fetch detailed information for a specific access request
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ requestId: string }> }
) {
    try {
        const { requestId } = await context.params;

        if (!requestId || requestId === 'undefined') {
            console.error('[Request Details] Invalid requestId:', requestId);
            return NextResponse.json(
                { error: 'Invalid request ID' },
                { status: 400 }
            );
        }

        const authToken = await _getAuthToken();
        if (!authToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = `${BACKEND_URL}/access-portal/access-requests/${requestId}/details`;
        console.log('[Request Details] Calling backend:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: buildHeaders(authToken),
            cache: 'no-store',
        });

        console.log('[Request Details] Backend response status:', response.status);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: await response.text() };
            }

            const userMessage = parseBackendError(errorData, response.status);
            console.error('[Request Details] Backend error:', errorData);

            return NextResponse.json(
                { success: false, error: userMessage, statusCode: response.status },
                { status: response.status }
            );
        }

        const data = await response.json();
        
        console.log('[Request Details] Success:', {
            requestId: data.data?.requestId || 'unknown',
            itemsCount: data.data?.items?.length || 0,
        });

        // console.log(data.data.auditLog)

        return NextResponse.json(data);
    } catch (error) {
        console.error('[Request Details] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch request details. Please try again.',
                details: String(error),
            },
            { status: 500 }
        );
    }
}