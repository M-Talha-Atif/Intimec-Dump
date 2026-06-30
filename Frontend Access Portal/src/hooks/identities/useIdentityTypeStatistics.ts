import useSWR from "swr";
import { IdentityTypeStatistics } from "@/types/identity";
import { getFetcher } from "@/hooks/applications/fetcher";
import { IdentityEntityType } from "@/constants/identity";

/**
 * Fetches statistics for a specific identity type (employee, non_employee, non_human).
 * Delegates to the Next.js proxy route GET /api/identity/statistics/{entityType}.
 */
export default function useIdentityTypeStatistics(
  entityType: IdentityEntityType | null
) {
  return useSWR<IdentityTypeStatistics>(
    entityType ? `/api/identity/statistics/${entityType}` : null,
    getFetcher("Failed to fetch identity type statistics")
  );
}
