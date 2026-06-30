import { useState, useEffect, useCallback } from "react";
import { Application } from "@/types/application";

interface UseApplicationListOptions {
  page?: number;
  size?: number;
  search?: string;
  autoFetch?: boolean;
}

interface UseApplicationListResult {
  applications: Application[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  goToPage: (page: number) => void;
  changePageSize: (size: number) => void;
  setSearch: (search: string) => void;
  refresh: () => void;
}

/**
 * Standalone applications list hook for embedded components.
 * Unlike useApplications (URL-param driven), this is fully state-controlled
 * so it can be used inside modals, wizards, and pickers without affecting the URL.
 */
export function useApplicationList(
  options: UseApplicationListOptions = {}
): UseApplicationListResult {
  const {
    page: initialPage = 0,
    size: initialSize = 10,
    search: initialSearch = "",
    autoFetch = true,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [search, setSearchState] = useState(initialSearch);
  const [applications, setApplications] = useState<Application[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("size", String(size));
      if (search.trim()) {
        params.set("filter_search", search.trim());
      }

      const res = await fetch(`/api/applications?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error || `Failed to fetch applications (${res.status})`
        );
      }

      const json = await res.json();
      setApplications(json.content || []);
      setTotalElements(json.totalElements || 0);
      setTotalPages(json.totalPages || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load applications");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [page, size, search]);

  useEffect(() => {
    if (autoFetch) {
      load();
    }
  }, [autoFetch, load]);

  const goToPage = useCallback((newPage: number) => setPage(newPage), []);

  const changePageSize = useCallback((newSize: number) => {
    setSize(newSize);
    setPage(0);
  }, []);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPage(0);
  }, []);

  return {
    applications,
    totalElements,
    totalPages,
    currentPage: page,
    pageSize: size,
    loading,
    error,
    goToPage,
    changePageSize,
    setSearch,
    refresh: load,
  };
}