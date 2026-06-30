import { useState, useCallback } from "react";

/**
 * A single child role that failed to be added during desired-state sync.
 */
export interface FailedChildRole {
  childRoleId: string;
  reason: string;
}

/**
 * Result of a child role desired-state sync operation.
 *
 * The backend computes the diff between:
 * - current child roles in DB
 * - desired child roles sent by frontend
 *
 * Then returns:
 * - added: IDs actually added
 * - removed: IDs actually removed
 * - failed: IDs that could not be added (circular dependency, self-reference, etc.)
 * - totalCount: final total number of children after sync
 */
export interface SyncChildrenResult {
  /** IDs of children successfully added */
  added: string[];
  /** IDs of children successfully removed */
  removed: string[];
  /** Children that failed validation with per-child reasons */
  failed: FailedChildRole[];
  /** Final total number of child roles after sync */
  totalCount: number;
}

interface UseSyncRoleChildrenReturn {
  sync: (
    roleId: string,
    childRoleIds: string[]
  ) => Promise<SyncChildrenResult | null>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for synchronizing child role composition using desired-state PUT.
 *
 * Calls:
 *   PUT /api/access-catalogue/roles/{roleId}/children
 * with:
 *   { childRoleIds: [...] }
 *
 * The backend compares the desired list with the current DB state
 * and computes the diff internally.
 *
 * This produces a single business audit event:
 *   "Business Role Children Updated"
 */
export const useSyncRoleChildren = (): UseSyncRoleChildrenReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sync = useCallback(
    async (
      roleId: string,
      childRoleIds: string[]
    ): Promise<SyncChildrenResult | null> => {
      if (!roleId) {
        setError("Role ID is required");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/access-catalogue/roles/${roleId}/children`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ childRoleIds }),
        });

        const json = await res.json();

        // Backend may return 200 or 207 for partial failures
        if (!res.ok && res.status !== 207) {
          setError(json?.error || json?.message || "Failed to sync child roles");
          return null;
        }

        const data = json?.data;
        return {
          added: (data?.added || []).map(String),
          removed: (data?.removed || []).map(String),
          failed: (data?.failed || []).map((f: any) => ({
            childRoleId: String(f.childRoleId),
            reason: f.reason || "Unknown error",
          })),
          totalCount: Number(data?.totalCount || 0),
        };
      } catch (err: any) {
        setError(err.message || "Failed to sync child roles");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { sync, isLoading, error };
};