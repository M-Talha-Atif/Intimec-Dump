import { useState, useCallback } from "react";
import type {
  UpdateAccessRoleRequest,
  AccessRoleResponse,
  ApiResponse,
} from "@/types/access-roles";

/**
 * Updates an existing access role via the Next.js API route.
 *
 * @param id the role ID to update
 * @param payload the update role request body
 * @returns the updated role response from the backend
 * @throws Error if the request fails
 */
export async function updateAccessRole(
  id: string,
  payload: UpdateAccessRoleRequest
): Promise<AccessRoleResponse> {
  const res = await fetch(`/api/access-catalogue/roles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(
      (json as { error?: string }).error ||
        `Failed to update role (${res.status})`
    );
  }

  const apiResponse = json as ApiResponse<AccessRoleResponse>;
  return apiResponse.data;
}

/**
 * Hook for updating an access role with loading and error state management.
 */
export function useUpdateAccessRole() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (
      id: string,
      payload: UpdateAccessRoleRequest
    ): Promise<AccessRoleResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await updateAccessRole(id, payload);
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update role";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { update, isLoading, error };
}
