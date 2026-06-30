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
    // Handle different error response formats
    if (errorData.message) {
        return errorData.message;
    }

    if (errorData.error) {
        return errorData.error;
    }

    if (errorData.details) {
        return errorData.details;
    }

    // Default messages based on status code
    switch (statusCode) {
        case 400:
            return 'Invalid request. Please check your input.';
        case 401:
            return 'You are not authorized. Please login again.';
        case 403:
            return 'You do not have permission to perform this action.';
        case 404:
            return 'The requested resource was not found.';
        case 409:
            return 'This item is already in your cart or has been requested.';
        case 500:
            return 'Server error. Please try again later.';
        default:
            return 'An unexpected error occurred. Please try again.';
    }
}

/**
 * POST /api/access-portal/cart
 * Add item to cart
 */
export async function POST(request: NextRequest) {
    try {
        const authToken = await _getAuthToken();
        if (!authToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        console.log('[Cart POST] Adding item to cart:', body);

        const response = await fetch(`${BACKEND_URL}/access-portal/cart`, {
            method: 'POST',
            headers: buildHeaders(authToken),
            body: JSON.stringify(body),
        });

        // if (!response.ok) {
        //     let errorData;
        //     const contentType = response.headers.get('content-type');

        //     // Try to parse JSON error response
        //     if (contentType && contentType.includes('application/json')) {
        //         try {
        //             errorData = await response.json();
        //         } catch (e) {
        //             errorData = { message: await response.text() };
        //         }
        //     } else {
        //         errorData = { message: await response.text() };
        //     }

        //     const userMessage = parseBackendError(errorData, response.status);

        //     console.error('[Cart POST] Backend error:', {
        //         status: response.status,
        //         data: errorData,
        //         userMessage,
        //     });

        //     // Return user-friendly error
        //     return NextResponse.json(
        //         {
        //             success: false,
        //             error: userMessage,
        //             statusCode: response.status,
        //         },
        //         { status: response.status }
        //     );
        // }

        const data = await response.json();

        
        // Handle non-OK responses
        if (!response.ok) {
            console.log('[Cart POST] Backend error:', {
                status: response.status,
                data,
            });

            // Return the exact error structure from backend
            return NextResponse.json(data, { status: response.status });
        }
        
        console.log('[Cart POST] Success:', data);

        return NextResponse.json(data);
    } catch (error) {
        console.error('[Cart POST] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to add item to cart. Please try again.',
                details: String(error),
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/access-portal/cart
 * Get cart items for current user
 */
export async function GET(request: NextRequest) {
    try {
        const authToken = await _getAuthToken();
        if (!authToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log('[Cart GET] Fetching cart items');

        const response = await fetch(`${BACKEND_URL}/access-portal/cart`, {
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

            console.error('[Cart GET] Backend error:', {
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
        console.log('[Cart GET] Success:', {
            itemCount: data.data?.items?.length || 0,
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('[Cart GET] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch cart items. Please try again.',
                details: String(error),
            },
            { status: 500 }
        );
    }
}