import { useState, useEffect, useCallback } from 'react';

// Types
export interface WorkflowAnalyticsOverview {
    timePeriod: string;
    totalWorkflows: number;
    activeWorkflows: number;
    draftWorkflows: number;
    deprecatedWorkflows: number;
    automatedWorkflows: number;
    manualWorkflows: number;
    successRate: number;
    averageExecutionTimeHours: number;
    failedExecutions: number;
    totalExecutions: number;
    successfulExecutions: number;
    highRiskWorkflows: number;
    aiDrivenWorkflows: number;
}

export interface MonthlyExecutionData {
    month: string;
    executions: number;
    failures: number;
}

export interface ExecutionTrend {
    monthCount: number;
    trend: MonthlyExecutionData[];
}

export interface ExecutionCategory {
    name: string;
    value: number;
    percentage: number;
}

export interface ExecutionDistribution {
    timePeriod: string;
    totalExecutions: number;
    distribution: ExecutionCategory[];
}

export interface CategoryData {
    name: string;
    count: number;
    percentage: number;
}

export interface CategoryDistribution {
    totalWorkflows: number;
    categoryCount: number;
    distribution: CategoryData[];
}

export interface WorkflowKpiEntry {
    id: string;
    name: string;
    category: string;
    status: string;
    triggerType: string;
    riskScore: number;
    executionCount: number;
    avgExecutionTimeHours?: number;
    description: string;
    version: string;
}

export interface KpiDrilldownResponse {
    kpiType: string;
    totalWorkflows: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    workflows: WorkflowKpiEntry[];
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

// Hook
export const useWorkflowAnalytics = () => {
    const [overview, setOverview] = useState<WorkflowAnalyticsOverview | null>(null);
    const [executionTrend, setExecutionTrend] = useState<ExecutionTrend | null>(null);
    const [executionDistribution, setExecutionDistribution] = useState<ExecutionDistribution | null>(null);
    const [categoryDistribution, setCategoryDistribution] = useState<CategoryDistribution | null>(null);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Individual loading states
    const [overviewLoading, setOverviewLoading] = useState<boolean>(false);
    const [trendLoading, setTrendLoading] = useState<boolean>(false);
    const [distributionLoading, setDistributionLoading] = useState<boolean>(false);
    const [categoryLoading, setCategoryLoading] = useState<boolean>(false);

    // Fetch analytics overview
    const fetchOverview = useCallback(async (timePeriod: string = 'LAST_30_DAYS') => {
        setOverviewLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/workflows/analytics/overview?timePeriod=${timePeriod}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch analytics overview');
            }

            const result: ApiResponse<WorkflowAnalyticsOverview> = await response.json();
            setOverview(result.data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Error fetching analytics overview:', err);
        } finally {
            setOverviewLoading(false);
        }
    }, []);

    // Fetch execution trend
    const fetchExecutionTrend = useCallback(async (monthCount: number = 6) => {
        setTrendLoading(true);

        try {
            const response = await fetch(`/api/workflows/analytics/execution-trend?monthCount=${monthCount}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch execution trend');
            }

            const result: ApiResponse<ExecutionTrend> = await response.json();
            setExecutionTrend(result.data);
        } catch (err) {
            console.error('Error fetching execution trend:', err);
        } finally {
            setTrendLoading(false);
        }
    }, []);

    // Fetch execution distribution
    const fetchExecutionDistribution = useCallback(async (timePeriod: string = 'LAST_30_DAYS') => {
        setDistributionLoading(true);

        try {
            const response = await fetch(`/api/workflows/analytics/execution-distribution?timePeriod=${timePeriod}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch execution distribution');
            }

            const result: ApiResponse<ExecutionDistribution> = await response.json();
            setExecutionDistribution(result.data);
        } catch (err) {
            console.error('Error fetching execution distribution:', err);
        } finally {
            setDistributionLoading(false);
        }
    }, []);

    // Fetch category distribution
    const fetchCategoryDistribution = useCallback(async () => {
        setCategoryLoading(true);

        try {
            const response = await fetch('/api/workflows/analytics/category-distribution');

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch category distribution');
            }

            const result: ApiResponse<CategoryDistribution> = await response.json();
            setCategoryDistribution(result.data);
        } catch (err) {
            console.error('Error fetching category distribution:', err);
        } finally {
            setCategoryLoading(false);
        }
    }, []);

    // Fetch KPI drilldown
    const fetchKpiDrilldown = useCallback(async (
        kpiType: string,
        page: number = 0,
        pageSize: number = 50,
        sortBy: string = 'name',
        sortDirection: string = 'ASC'
    ): Promise<KpiDrilldownResponse | null> => {
        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams({
                kpiType,
                page: page.toString(),
                pageSize: pageSize.toString(),
                sortBy,
                sortDirection,
            });

            const response = await fetch(`/api/workflows/analytics/kpi-drilldown?${queryParams}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch KPI drilldown');
            }

            const result: ApiResponse<KpiDrilldownResponse> = await response.json();
            return result.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Error fetching KPI drilldown:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch all analytics on mount
    useEffect(() => {
        fetchOverview();
        fetchExecutionTrend();
        fetchExecutionDistribution();
        fetchCategoryDistribution();
    }, [fetchOverview, fetchExecutionTrend, fetchExecutionDistribution, fetchCategoryDistribution]);

    return {
        overview,
        executionTrend,
        executionDistribution,
        categoryDistribution,
        loading,
        error,
        overviewLoading,    
        trendLoading,       
        distributionLoading,
        categoryLoading,   
        fetchOverview,
        fetchExecutionTrend,
        fetchExecutionDistribution,
        fetchCategoryDistribution,
        fetchKpiDrilldown,
    };
};