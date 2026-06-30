import { useState, useCallback } from "react";

export interface SyncEntitlementsResult {
  addedCount: number;
  removedCount: number;
  totalCount: number;
}

interface UseSyncRoleEntitlementsReturn {
  sync: (
    roleId: string,
    entitlementIds: string[]
  ) => Promise<SyncEntitlementsResult | null>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for synchronizing role entitlements using desired-state PUT.
 *
 * Calls:
 *   PUT /api/access-catalogue/roles/{roleId}/entitlements
 * with:
 *   { entitlementIds: [...] }
 *
 * The backend compares the desired entitlement list with the current DB state
 * and computes add/remove diff internally.
 *
 * This produces a single business audit event:
 *   "Business Role Entitlements Updated"
 */
export const useSyncRoleEntitlements = (): UseSyncRoleEntitlementsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sync = useCallback(
    async (
      roleId: string,
      entitlementIds: string[]
    ): Promise<SyncEntitlementsResult | null> => {
      if (!roleId) {
        setError("Role ID is required");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/access-catalogue/roles/${roleId}/entitlements`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entitlementIds }),
        });

        const json = await res.json();

        if (!res.ok) {
          setError(json?.error || json?.message || "Failed to sync entitlements");
          return null;
        }

        const data = json?.data;
        return {
          addedCount: Number(data?.addedCount || 0),
          removedCount: Number(data?.removedCount || 0),
          totalCount: Number(data?.totalCount || 0),
        };
      } catch (err: any) {
        setError(err.message || "Failed to sync entitlements");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { sync, isLoading, error };
};