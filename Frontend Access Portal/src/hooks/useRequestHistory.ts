import { useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Backend request item structure
 */
export interface BackendRequestItem {
    id: string;
    itemId: string;
    itemName: string;
    itemType: string;
    requestTarget: string;
    beneficiaryUserId?: string;
    justification: string;
    validityDays: number;
    urgency: string;
}

/**
 * Backend request structure
 */
export interface BackendAccessRequest {
    id: string;
    requestedByUserId: string;
    requestedByUserName: string;
    overallJustification: string;
    status: string;
    requestedAt: string;
    items: BackendRequestItem[];
}

/**
 * Paginated response structure
 */
export interface PaginatedRequestResponse {
    items: BackendAccessRequest[];
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

/**
 * Extract user-friendly error message
 */
function getErrorMessage(error: any): string {
    if (error?.error) {
        return error.error;
    }

    if (error?.message) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return 'Failed to fetch requests. Please try again.';
}

/**
 * Hook for fetching access request history
 */
export const useRequestHistory = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch request history with pagination and filtering
     */
    const fetchRequestHistory = useCallback(async (
        status: string = 'all',
        page: number = 0,
        size: number = 20
    ): Promise<PaginatedRequestResponse | null> => {
        setLoading(true);
        setError(null);

        try {
            // Build query parameters
            const params = new URLSearchParams();
            if (status && status !== 'all') {
                // Convert to uppercase for backend enum
                const backendStatus = status.toUpperCase();
                params.append('status', backendStatus);
            }

            params.append('page', page.toString());
            params.append('size', size.toString());

            console.log('[useRequestHistory] Fetching requests:', {
                status,
                page,
                size,
            });

            const response = await fetch(`/api/access-portal/access-requests/history?${params.toString()}`, {
                cache: 'no-store',
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = getErrorMessage(errorData);
                throw new Error(errorMessage);
            }

            const data = await response.json();

            const responsePage = data.data;


            console.log('[useRequestHistory] Success:', {
                totalItems: responsePage?.totalElements || 0,
                itemsCount: responsePage?.content?.length || 0,
            });

            const result: PaginatedRequestResponse = {
                items: (responsePage?.content || []).map((req: any) => ({
                    id: req.requestId,
                    requestedByUserId: req.requestedByUserId ?? '',
                    requestedByUserName: req.requestedByUserName ?? 'You',
                    overallJustification: req.overallJustification,
                    status: req.status,
                    requestedAt: req.requestedAt,
                    items: req.items ?? [],
                })),
                currentPage: responsePage?.number ?? 0,
                pageSize: responsePage?.size ?? size,
                totalItems: responsePage?.totalElements ?? 0,
                totalPages: responsePage?.totalPages ?? 0,
                hasNext: !(responsePage?.last ?? true),
                hasPrevious: !(responsePage?.first ?? true),
            };


            return result;
        } catch (err) {
            console.error('[useRequestHistory] Error:', err);
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);

            toast.error('Failed to load requests', {
                description: errorMessage,
            });

            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        fetchRequestHistory,
        loading,
        error,
    };
};