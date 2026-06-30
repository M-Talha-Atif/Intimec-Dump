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
            return 'Invalid request. Please check all required fields are filled.';
        case 401:
            return 'You are not authorized. Please login again.';
        case 403:
            return 'You do not have permission to submit this request.';
        case 409:
            return 'Cart is empty. Please add items before submitting.';
        case 500:
            return 'Server error. Please try again later.';
        default:
            return 'Failed to submit request. Please try again.';
    }
}

/**
 * POST /api/access-portal/requests/submit
 * Submit access request from cart items
 */
export async function POST(request: NextRequest) {
    try {
        const authToken = await _getAuthToken();
        if (!authToken) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        
        console.log('[Submit Request] Submitting access request:', {
            itemCount: body.items?.length || 0,
            hasJustification: !!body.overallJustification,
        });

        const response = await fetch(`${BACKEND_URL}/access-portal/access-requests`, {
            method: 'POST',
            headers: buildHeaders(authToken),
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: await response.text() };
            }

            const userMessage = parseBackendError(errorData, response.status);

            console.error('[Submit Request] Backend error:', {
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
        console.log('[Submit Request] Success:', {
            requestId: data.data?.id || 'unknown',
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('[Submit Request] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to submit request. Please try again.',
                details: String(error),
            },
            { status: 500 }
        );
    }
}