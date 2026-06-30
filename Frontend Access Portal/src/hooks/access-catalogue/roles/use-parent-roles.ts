import { useState, useCallback, useEffect } from "react";
import type { AccessRoleResponse, ApiResponse } from "@/types/access-roles";

/**
 * Fetches parent roles for a given role ID.
 */
export async function fetchParentRoles(
  roleId: string
): Promise<AccessRoleResponse[]> {
  const res = await fetch(`/api/access-catalogue/roles/${roleId}/parents`);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Failed to fetch parent roles (${res.status})`
    );
  }

  const json = await res.json();
  const apiResponse = json as ApiResponse<AccessRoleResponse[]>;
  return apiResponse.data;
}

export interface UseParentRolesResult {
  parentRoles: AccessRoleResponse[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Hook for fetching parent roles of a given role.
 * Automatically re-fetches when roleId changes.
 *
 * IMPORTANT: loading starts as true (when roleId is provided) so that
 * consumers don't see an empty parentRoles array before the fetch completes.
 */
export function useParentRoles(roleId: string | undefined): UseParentRolesResult {
  const [parentRoles, setParentRoles] = useState<AccessRoleResponse[]>([]);
  const [loading, setLoading] = useState(!!roleId);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!roleId) {
      setParentRoles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchParentRoles(roleId);
      setParentRoles(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load parent roles"
      );
      setParentRoles([]);
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    load();
  }, [load]);

  return { parentRoles, loading, error, refresh: load };
}