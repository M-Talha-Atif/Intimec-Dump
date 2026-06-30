import useSWR from "swr";
import { IdentityEntitlementsResponse } from "@/types/identity-access";
import { getFetcher } from "@/hooks/applications/fetcher";

/**
 * Fetches paginated entitlements assigned to a given identity across all accounts.
 * Supports server-side search (on displayName and description) and sorting.
 *
 * @param entityId   the entity type slug (e.g., "employee", "non_employee")
 * @param identityId the UUID of the identity whose entitlements are requested
 * @param page       zero-based page index for server-side pagination
 * @param size       number of items per page
 * @param search     optional text to filter entitlements by displayName or description
 * @param sort       optional Spring Data sort string (e.g., "entitlementName,asc")
 * @returns SWR response containing IdentityEntitlementsResponse (Spring Data Page shape)
 */
export default function useIdentityEntitlements(
  entityId: string | null,
  identityId: string | null,
  page: number = 0,
  size: number = 10,
  search?: string,
  sort?: string
) {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("size", String(size));
  if (search) params.append("search", search);
  if (sort) params.append("sort", sort);

  return useSWR<IdentityEntitlementsResponse>(
    entityId && identityId
      ? `/api/identity/${entityId}/${identityId}/entitlements?${params.toString()}`
      : null,
    getFetcher("Failed to fetch identity entitlements")
  );
}