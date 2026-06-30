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
    if (errorData.message) {
        return errorData.message;
    }
    
    if (errorData.error) {
        return errorData.error;
    }
    
    if (errorData.details) {
        return errorData.details;
    }

    switch (statusCode) {
        case 400:
            return 'Invalid request. Please check your input.';
        case 401:
            return 'You are not authorized. Please login again.';
        case 403:
            return 'You do not have permission to perform this action.';
        case 404:
            return 'Item not found in cart.';
        case 409:
            return 'Cannot remove this item. It may be part of a pending request.';
        case 500:
            return 'Server error. Please try again later.';
        default:
            return 'An unexpected error occurred. Please try again.';
    }
}

/**
 * DELETE /api/access-portal/cart/[cartId]
 * Remove item from cart
 */
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ cartId: string }> }
) {
    try {
        const { cartId } = await context.params;

        if (!cartId || cartId === 'undefined') {
            console.error('[Cart DELETE] Invalid cartId:', cartId);
            return NextResponse.json(
                { success: false, error: 'Invalid cart ID' },
                { status: 400 }
            );
        }

        const authToken = await _getAuthToken();
        if (!authToken) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        console.log('[Cart DELETE] Removing cart item:', cartId);

        const response = await fetch(`${BACKEND_URL}/access-portal/cart/${cartId}`, {
            method: 'DELETE',
            headers: buildHeaders(authToken),
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: await response.text() };
            }

            const userMessage = parseBackendError(errorData, response.status);

            console.error('[Cart DELETE] Backend error:', {
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
        console.log('[Cart DELETE] Success');

        return NextResponse.json(data);
    } catch (error) {
        console.error('[Cart DELETE] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to remove item from cart. Please try again.',
                details: String(error),
            },
            { status: 500 }
        );
    }
}