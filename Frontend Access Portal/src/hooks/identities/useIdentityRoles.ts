import useSWR from "swr";
import { IdentityRolesResponse } from "@/types/identity-access";
import { getFetcher } from "@/hooks/applications/fetcher";

/**
 * Fetches all roles assigned to a given identity.
 * Delegates to the Next.js proxy route GET /api/identity/[entityId]/[identityId]/roles.
 *
 * @param entityId   the entity type slug (e.g., "employee", "non_employee")
 * @param identityId the UUID of the identity whose roles are requested
 * @returns SWR response containing IdentityRolesResponse with data array and count
 */
export default function useIdentityRoles(
  entityId: string | null,
  identityId: string | null
) {
  return useSWR<IdentityRolesResponse>(
    entityId && identityId
      ? `/api/identity/${entityId}/${identityId}/roles`
      : null,
    getFetcher("Failed to fetch identity roles")
  );
}