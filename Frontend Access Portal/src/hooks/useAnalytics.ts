import { useState, useEffect, useCallback } from 'react';

export interface TopRequestedItem {
    itemId: string;
    itemName: string;
    requestCount: number;
}

export interface AnalyticsData {
    totalRequests: number;
    approvalRate: number;
    avgProcessingTimeHours: number;
    avgRiskScore: number;
    pendingCount: number;
    pendingPercentage: number;
    approvedCount: number;
    approvedPercentage: number;
    rejectedCount: number;
    rejectedPercentage: number;
    mostRequestedItems: TopRequestedItem[];
    periodDays: number;
}

function getErrorMessage(error: any): string {
    if (error?.error) return error.error;
    if (error?.message) return error.message;
    if (typeof error === 'string') return error;
    return 'An unexpected error occurred. Please try again.';
}

export const useAnalytics = (periodDays: number = 30) => {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch analytics data from backend
     */
    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('[useAnalytics] Fetching analytics:', { periodDays });

            const response = await fetch(
                `/api/access-portal/analytics?days=${periodDays}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = getErrorMessage(errorData);
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('[useAnalytics] Fetched analytics:', result);

            if (result.success && result.data) {
                setAnalytics(result.data);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('[useAnalytics] Fetch error:', err);
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            setAnalytics(null);
        } finally {
            setLoading(false);
        }
    }, [periodDays]);

    // Load analytics on mount and when periodDays changes
    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    return {
        analytics,
        loading,
        error,
        refetch: fetchAnalytics,
    };
};