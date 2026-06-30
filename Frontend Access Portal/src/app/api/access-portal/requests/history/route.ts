import { NextRequest, NextResponse } from 'next/server';
import { _getAuthToken } from "@/lib/auth";

const BACKEND_URL = process.env.API_URL || "http://localhost:8081";

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
    if (errorData.message) {
        return errorData.message;
    }
    
    if (errorData.error) {
        return errorData.error;
    }

    switch (statusCode) {
        case 400:
            return 'Invalid request parameters.';
        case 401:
            return 'You are not authorized. Please login again.';
        case 403:
            return 'You do not have permission to view requests.';
        case 500:
            return 'Server error. Please try again later.';
        default:
            return 'Failed to fetch requests. Please try again.';
    }
}

/**
 * GET /api/access-portal/requests/history
 * Fetch access request history for current user
 * Query params: status, page, size
 */
export async function GET(request: NextRequest) {
    try {
        const authToken = await _getAuthToken();
        if (!authToken) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Extract query parameters
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status') || '';
        const page = searchParams.get('page') || '0';
        const size = searchParams.get('size') || '20';

        console.log('[Request History] Fetching requests:', {
            status: status || 'all',
            page,
            size,
        });

        // Build URL with query parameters
        const params = new URLSearchParams();
        if (status && status !== 'all') {
            params.append('status', status.toUpperCase().replace('-', '_'));
        }
        params.append('page', page);
        params.append('size', size);

        const url = `${BACKEND_URL}/access-portal/requests/history?${params.toString()}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: buildHeaders(authToken),
            cache: 'no-store',
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: await response.text() };
            }

            const userMessage = parseBackendError(errorData, response.status);

            console.error('[Request History] Backend error:', {
                status: response.status,
                data: errorData,
                userMessage,
            });

            return NextResponse.json(
                {
                    success: false,
                    error: userMessage,
                    statusCode: response.status,
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('[Request History] Success:', {
            totalItems: data.data?.totalItems || 0,
            currentPage: data.data?.currentPage || 0,
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('[Request History] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch requests. Please try again.',
                details: String(error),
            },
            { status: 500 }
        );
    }
}