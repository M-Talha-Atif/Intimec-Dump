import useSWR from "swr";
import { IdentityDTO } from "@/types/identity";
import { getFetcher } from "@/hooks/applications/fetcher";
import { IdentityEntityType } from "@/constants/identity";

/**
 * Fetches a single identity by entity type and identity ID.
 * Delegates to the Next.js proxy route GET /api/identity/{entityType}/{identityId}.
 */
export default function useIdentity(
  entityType: IdentityEntityType | null,
  identityId: string | null
) {
  return useSWR<IdentityDTO>(
    entityType && identityId
      ? `/api/identity/${entityType}/${identityId}`
      : null,
    getFetcher("Failed to fetch identity details")
  );
}
