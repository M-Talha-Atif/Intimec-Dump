import { useState, useCallback, useEffect } from "react";
import type { ApiResponse } from "@/types/access-roles";

/**
 * Shape of a single entitlement returned by the backend.
 * Matches EntitlementResponseDto from the Java service.
 */
export interface RoleEntitlementDto {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  type?: string;
  resourceId?: string;
  resourceName?: string;
  riskLevel?: string;
  assignmentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Paginated response wrapper matching Spring Page structure.
 */
export interface RoleEntitlementsPage {
  content: RoleEntitlementDto[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface UseFetchRoleEntitlementsParams {
  page?: number;
  size?: number;
}

export interface UseFetchRoleEntitlementsResult {
  entitlements: RoleEntitlementDto[];
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
 * Fetches paginated entitlements for a role.
 */
async function fetchRoleEntitlements(
  roleId: string,
  page: number,
  size: number
): Promise<RoleEntitlementsPage> {
  const res = await fetch(
    `/api/access-catalogue/roles/${roleId}/entitlements?page=${page}&size=${size}`
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Failed to fetch entitlements (${res.status})`
    );
  }

  const json = await res.json();
  const apiResponse = json as ApiResponse<RoleEntitlementsPage>;
  return apiResponse.data;
}

/**
 * Hook for fetching paginated entitlements linked to a role.
 * Re-fetches when roleId, page, or size changes.
 *
 * @param roleId the role UUID
 * @param params optional page and size overrides
 */
export function useFetchRoleEntitlements(
  roleId: string | undefined,
  params: UseFetchRoleEntitlementsParams = {}
): UseFetchRoleEntitlementsResult {
  const [page, setPage] = useState(params.page ?? 0);
  const [size, setSize] = useState(params.size ?? 50);
  const [data, setData] = useState<RoleEntitlementsPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!roleId) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchRoleEntitlements(roleId, page, size);
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load entitlements"
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [roleId, page, size]);

  useEffect(() => {
    load();
  }, [load]);

  const goToPage = useCallback((newPage: number) => setPage(newPage), []);
  const changePageSize = useCallback((newSize: number) => {
    setSize(newSize);
    setPage(0);
  }, []);

  return {
    entitlements: data?.content ?? [],
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