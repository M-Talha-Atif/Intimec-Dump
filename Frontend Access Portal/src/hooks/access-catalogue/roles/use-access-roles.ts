import { useState, useCallback, useEffect } from "react";
import type { AccessRoleResponse, ApiResponse } from "@/types/access-roles";

export interface FetchAccessRolesParams {
  page?: number;
  size?: number;
  sort?: string;
  type?: string;
  status?: string;
}

export interface AccessRolesPage {
  content: AccessRoleResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

/**
 * Fetches paginated access roles from the API.
 */
export async function fetchAccessRoles(
  params: FetchAccessRolesParams = {}
): Promise<AccessRolesPage> {
  const { page = 0, size = 50, sort, type, status } = params;

  const query = new URLSearchParams();
  query.append("page", String(page));
  query.append("size", String(size));
  if (sort) query.append("sort", sort);
  if (type) query.append("type", type);
  if (status) query.append("status", status);

  const res = await fetch(`/api/access-catalogue/roles?${query.toString()}`);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Failed to fetch roles (${res.status})`
    );
  }

  const json = await res.json();
  // Backend wraps in ApiResponse — unwrap the data
  const apiResponse = json as ApiResponse<AccessRolesPage>;
  return apiResponse.data;
}

/**
 * Fetches a single access role by ID.
 */
export async function fetchAccessRoleById(
  id: string
): Promise<AccessRoleResponse> {
  const res = await fetch(`/api/access-catalogue/roles/${id}`);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Failed to fetch role ${id} (${res.status})`
    );
  }

  const json = await res.json();
  const apiResponse = json as ApiResponse<AccessRoleResponse>;
  return apiResponse.data;
}

export interface UseAccessRolesResult {
  roles: AccessRoleResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  goToPage: (page: number) => void;
  changePageSize: (size: number) => void;
  refresh: () => void;
}

/**
 * Hook for fetching and managing access roles with pagination.
 */
export function useAccessRoles(
  params: FetchAccessRolesParams = {}
): UseAccessRolesResult {
  const { sort, type, status } = params;

  const [page, setPage] = useState(params.page ?? 0);
  const [size, setSize] = useState(params.size ?? 50);
  const [data, setData] = useState<AccessRolesPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAccessRoles({ page, size, sort, type, status });
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load access roles"
      );
    } finally {
      setLoading(false);
    }
  }, [page, size, sort, type, status]);

  useEffect(() => {
    load();
  }, [load]);

  const goToPage = useCallback((newPage: number) => setPage(newPage), []);

  const changePageSize = useCallback((newSize: number) => {
    setSize(newSize);
    setPage(0);
  }, []);

  return {
    roles: data?.content ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    currentPage: data?.number ?? page,
    pageSize: data?.size ?? size,
    loading,
    error,
    goToPage,
    changePageSize,
    refresh: load,
  };
}