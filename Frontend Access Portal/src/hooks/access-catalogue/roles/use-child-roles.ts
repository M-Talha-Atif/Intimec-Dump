import { useState, useCallback, useEffect } from "react";
import type { AccessRoleResponse, ApiResponse } from "@/types/access-roles";

/**
 * Fetches child roles for a given parent role ID.
 */
export async function fetchChildRoles(
  roleId: string
): Promise<AccessRoleResponse[]> {
  const res = await fetch(`/api/access-catalogue/roles/${roleId}/children`);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Failed to fetch child roles (${res.status})`
    );
  }

  const json = await res.json();
  const apiResponse = json as ApiResponse<AccessRoleResponse[]>;
  return apiResponse.data;
}

export interface UseChildRolesResult {
  childRoles: AccessRoleResponse[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Hook for fetching child roles of a parent role.
 * Automatically re-fetches when roleId changes.
 *
 * IMPORTANT: loading starts as true (when roleId is provided) so that
 * consumers don't see an empty childRoles array before the fetch completes.
 */
export function useChildRoles(roleId: string | undefined): UseChildRolesResult {
  const [childRoles, setChildRoles] = useState<AccessRoleResponse[]>([]);
  const [loading, setLoading] = useState(!!roleId);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!roleId) {
      setChildRoles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchChildRoles(roleId);
      setChildRoles(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load child roles"
      );
      setChildRoles([]);
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    load();
  }, [load]);

  return { childRoles, loading, error, refresh: load };
}