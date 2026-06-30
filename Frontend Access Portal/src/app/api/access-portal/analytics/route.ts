import { NextRequest, NextResponse } from 'next/server';
import { _getAuthToken } from "@/lib/auth";

const BACKEND_URL = process.env.API_URL || 'http://localhost:8081';

function buildHeaders(authToken: string) {
    return {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
    };
}

/**
 * Parse backend error response and extract user-friendly message
 */
function parseBackendError(errorData: any, statusCode: number): string {
    if (errorData.message) return errorData.message;
    if (errorData.error) return errorData.error;
    if (errorData.details) return errorData.details;

    switch (statusCode) {
        case 400:
            return 'Invalid request. Please check your input.';
        case 401:
            return 'You are not authorized. Please login again.';
        case 403:
            return 'You do not have permission to perform this action.';
        case 404:
            return 'The requested resource was not found.';
        case 500:
            return 'Server error. Please try again later.';
        default:
            return 'An unexpected error occurred. Please try again.';
    }
}

/**
 * GET /api/access-portal/analytics
 * Get analytics data for the access portal
 */
export async function GET(request: NextRequest) {
    try {
        const authToken = await _getAuthToken();
        if (!authToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Extract query parameters
        const { searchParams } = new URL(request.url);
        const days = searchParams.get('days') || '30';

        console.log('[Analytics GET] Fetching analytics data:', { days });

        const response = await fetch(
            `${BACKEND_URL}/access-portal/analytics?days=${days}`,
            {
                method: 'GET',
                headers: buildHeaders(authToken),
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: await response.text() };
            }

            const userMessage = parseBackendError(errorData, response.status);
            console.error('[Analytics GET] Backend error:', {
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
        console.log('[Analytics GET] Success:', {
            totalRequests: data.data?.totalRequests,
            periodDays: data.data?.periodDays,
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('[Analytics GET] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch analytics data. Please try again.',
                details: String(error),
            },
            { status: 500 }
        );
    }
}