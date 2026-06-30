import useSWR from "swr";
import { ShadowsByIdentityResponse } from "@/types/identity";
import { getFetcher } from "@/hooks/applications/fetcher";

/**
 * Fetches all shadow objects (linked resource accounts) for a given identity.
 * Delegates to the Next.js proxy route GET /api/identity/shadows/{identityId}.
 */
export default function useIdentityShadows(identityId: string | null) {
  return useSWR<ShadowsByIdentityResponse>(
    identityId ? `/api/identity/shadows/${identityId}` : null,
    getFetcher("Failed to fetch identity shadows")
  );
}
