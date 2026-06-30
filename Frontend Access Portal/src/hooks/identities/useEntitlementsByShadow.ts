import useSWR from "swr";
import { EntitlementDTO } from "@/types/identity";
import { getFetcher } from "@/hooks/applications/fetcher";

export interface EntitlementsByShadowResult {
  data: EntitlementDTO[];
  isLoading: boolean;
  error: unknown;
}

/**
 * Fetches entitlements assigned to a shadow (resource account).
 * Only fetches when `enabled` is true to avoid N+1 on un-expanded rows.
 */
export default function useEntitlementsByShadow(
  shadowId: string | null,
  enabled: boolean
): EntitlementsByShadowResult {
  const { data: response, isLoading, error } = useSWR(
    enabled && shadowId ? `/api/identity/entitlements/by-shadow/${shadowId}` : null,
    getFetcher("Failed to fetch entitlements for shadow")
  );

  // The backend returns a Spring Page: { content: [...], totalElements, ... }
  const data: EntitlementDTO[] = response?.content ?? response?.data ?? [];

  return { data, isLoading, error };
}
