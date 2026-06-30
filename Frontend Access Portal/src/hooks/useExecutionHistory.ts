import { useState, useCallback, useEffect } from "react";
import type {
  ExecutionHistoryResponse,
  ExecutionDetailResponse,
  PaginatedResponse,
} from "@/types/executionHistory";

/**
 * Fetches paginated execution history for an entitlement.
 */
async function fetchExecutionHistory(
  entitlementId: string,
  page: number = 0,
  size: number = 20
): Promise<PaginatedResponse<ExecutionHistoryResponse>> {
  const res = await fetch(
    `/api/access-catalogue/entitlements/${entitlementId}/execution-history?page=${page}&size=${size}`
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Failed to fetch execution history (${res.status})`
    );
  }

  return res.json() as Promise<PaginatedResponse<ExecutionHistoryResponse>>;
}

/**
 * Fetches paginated execution details (identity-level) for a specific run.
 */
async function fetchExecutionDetails(
  entitlementId: string,
  executionId: string,
  page: number = 0,
  size: number = 50
): Promise<PaginatedResponse<ExecutionDetailResponse>> {
  const res = await fetch(
    `/api/access-catalogue/entitlements/${entitlementId}/execution-history/${executionId}?page=${page}&size=${size}`
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Failed to fetch execution details (${res.status})`
    );
  }

  return res.json() as Promise<PaginatedResponse<ExecutionDetailResponse>>;
}

export interface UseExecutionHistoryResult {
  executions: ExecutionHistoryResponse[];
  totalExecutions: number;
  loadingExecutions: boolean;
  executionError: string | null;
  executionPage: number;
  executionSize: number;
  setExecutionPage: (page: number) => void;
  setExecutionSize: (size: number) => void;
  refreshExecutions: () => void;

  // Detail for a selected execution
  selectedExecution: ExecutionHistoryResponse | null;
  setSelectedExecution: (exec: ExecutionHistoryResponse | null) => void;
  details: ExecutionDetailResponse[];
  totalDetails: number;
  loadingDetails: boolean;
  detailError: string | null;
  detailPage: number;
  detailSize: number;
  setDetailPage: (page: number) => void;
  setDetailSize: (size: number) => void;
}

/**
 * Hook for fetching execution history and drill-down details per entitlement.
 */
export function useExecutionHistory(
  entitlementId: string | null | undefined,
  defaultExecutionSize: number = 20,
  defaultDetailSize: number = 50
): UseExecutionHistoryResult {
  // Execution list state
  const [executions, setExecutions] = useState<ExecutionHistoryResponse[]>([]);
  const [totalExecutions, setTotalExecutions] = useState(0);
  const [loadingExecutions, setLoadingExecutions] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [executionPage, setExecutionPage] = useState(0);
  const [executionSize, setExecutionSizeState] = useState(defaultExecutionSize);

  // Detail state
  const [selectedExecution, setSelectedExecution] =
    useState<ExecutionHistoryResponse | null>(null);
  const [details, setDetails] = useState<ExecutionDetailResponse[]>([]);
  const [totalDetails, setTotalDetails] = useState(0);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailPage, setDetailPage] = useState(0);
  const [detailSize, setDetailSizeState] = useState(defaultDetailSize);

  // Wrap size setters to reset page to 0
  const setExecutionSize = useCallback((size: number) => {
    setExecutionSizeState(size);
    setExecutionPage(0);
  }, []);

  const setDetailSize = useCallback((size: number) => {
    setDetailSizeState(size);
    setDetailPage(0);
  }, []);

  // Load execution history
  const loadExecutions = useCallback(
    async (id: string, page: number, size: number) => {
      setLoadingExecutions(true);
      setExecutionError(null);
      try {
        const result = await fetchExecutionHistory(id, page, size);
        setExecutions(result.content);
        setTotalExecutions(result.totalElements);
      } catch (err) {
        setExecutionError(
          err instanceof Error
            ? err.message
            : "Failed to load execution history"
        );
      } finally {
        setLoadingExecutions(false);
      }
    },
    []
  );

  useEffect(() => {
    if (entitlementId) {
      loadExecutions(entitlementId, executionPage, executionSize);
    } else {
      setExecutions([]);
      setTotalExecutions(0);
      setExecutionError(null);
    }
  }, [entitlementId, executionPage, executionSize, loadExecutions]);

  const refreshExecutions = useCallback(() => {
    if (entitlementId) loadExecutions(entitlementId, executionPage, executionSize);
  }, [entitlementId, executionPage, executionSize, loadExecutions]);

  // Load execution details when a run is selected
  const loadDetails = useCallback(
    async (entId: string, execId: string, page: number, size: number) => {
      setLoadingDetails(true);
      setDetailError(null);
      try {
        const result = await fetchExecutionDetails(entId, execId, page, size);
        setDetails(result.content);
        setTotalDetails(result.totalElements);
      } catch (err) {
        setDetailError(
          err instanceof Error
            ? err.message
            : "Failed to load execution details"
        );
      } finally {
        setLoadingDetails(false);
      }
    },
    []
  );

  useEffect(() => {
    if (entitlementId && selectedExecution) {
      loadDetails(entitlementId, selectedExecution.id, detailPage, detailSize);
    } else {
      setDetails([]);
      setTotalDetails(0);
      setDetailError(null);
    }
  }, [entitlementId, selectedExecution, detailPage, detailSize, loadDetails]);

  // Reset detail page when selecting a new execution
  useEffect(() => {
    setDetailPage(0);
  }, [selectedExecution]);

  return {
    executions,
    totalExecutions,
    loadingExecutions,
    executionError,
    executionPage,
    executionSize,
    setExecutionPage,
    setExecutionSize,
    refreshExecutions,
    selectedExecution,
    setSelectedExecution,
    details,
    totalDetails,
    loadingDetails,
    detailError,
    detailPage,
    detailSize,
    setDetailPage,
    setDetailSize,
  };
}