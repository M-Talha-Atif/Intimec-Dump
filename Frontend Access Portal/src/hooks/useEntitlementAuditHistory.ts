import { useState, useCallback, useEffect } from "react";
import type {
  EntitlementAuditHistoryEntry,
  PaginatedAuditHistoryResponse,
} from "@/types/entitlementAuditHistory";

/**
 * Fetches paginated audit history for an entitlement.
 */
async function fetchAuditHistory(
  entitlementId: string,
  page: number = 0,
  size: number = 10,
  action?: string
): Promise<PaginatedAuditHistoryResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (action) {
    params.set("action", action);
  }

  const res = await fetch(
    `/api/access-catalogue/entitlements/${entitlementId}/audit-history?${params.toString()}`
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Failed to fetch audit history (${res.status})`
    );
  }

  return res.json() as Promise<PaginatedAuditHistoryResponse>;
}

export interface UseEntitlementAuditHistoryResult {
  entries: EntitlementAuditHistoryEntry[];
  totalEntries: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  page: number;
  size: number;
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  refresh: () => void;
  actionFilter: string | undefined;
  setActionFilter: (action: string | undefined) => void;
}

/**
 * Hook for fetching entitlement audit history with pagination and action filtering.
 */
export function useEntitlementAuditHistory(
  entitlementId: string | null | undefined,
  defaultSize: number = 10
): UseEntitlementAuditHistoryResult {
  const [entries, setEntries] = useState<EntitlementAuditHistoryEntry[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSizeState] = useState(defaultSize);
  const [actionFilter, setActionFilterState] = useState<string | undefined>(
    undefined
  );

  const setSize = useCallback((newSize: number) => {
    setSizeState(newSize);
    setPage(0);
  }, []);

  const setActionFilter = useCallback((action: string | undefined) => {
    setActionFilterState(action);
    setPage(0);
  }, []);

  const loadHistory = useCallback(
    async (
      id: string,
      page: number,
      size: number,
      action?: string
    ) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchAuditHistory(id, page, size, action);
        setEntries(result.content);
        setTotalEntries(result.totalElements);
        setTotalPages(result.totalPages);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load audit history"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (entitlementId) {
      loadHistory(entitlementId, page, size, actionFilter);
    } else {
      setEntries([]);
      setTotalEntries(0);
      setTotalPages(0);
      setError(null);
    }
  }, [entitlementId, page, size, actionFilter, loadHistory]);

  const refresh = useCallback(() => {
    if (entitlementId) {
      loadHistory(entitlementId, page, size, actionFilter);
    }
  }, [entitlementId, page, size, actionFilter, loadHistory]);

  return {
    entries,
    totalEntries,
    totalPages,
    loading,
    error,
    page,
    size,
    setPage,
    setSize,
    refresh,
    actionFilter,
    setActionFilter,
  };
}