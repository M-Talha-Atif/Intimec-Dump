import useSWR from "swr";
import { IdentityStatistics } from "@/types/identity";
import { getFetcher } from "@/hooks/applications/fetcher";

/**
 * Fetches aggregate identity statistics across all types.
 * Delegates to the Next.js proxy route GET /api/identity (which proxies to /identity/statistics).
 */
export default function useIdentityStatistics() {
  return useSWR<IdentityStatistics>(
    "/api/identity",
    getFetcher("Failed to fetch identity statistics")
  );
}
