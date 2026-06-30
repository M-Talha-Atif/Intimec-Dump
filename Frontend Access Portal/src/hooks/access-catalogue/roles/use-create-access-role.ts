import { useState, useCallback } from "react";
import type {
  CreateAccessRoleRequest,
  AccessRoleResponse,
  ApiResponse,
} from "@/types/access-roles";

/**
 * Creates a new access role via the Next.js API route.
 *
 * @param payload the create role request body
 * @returns the created role response from the backend
 * @throws Error if the request fails
 */
export async function createAccessRole(
  payload: CreateAccessRoleRequest
): Promise<AccessRoleResponse> {
  const res = await fetch("/api/access-catalogue/roles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(
      (json as { error?: string }).error ||
        `Failed to create role (${res.status})`
    );
  }

  const apiResponse = json as ApiResponse<AccessRoleResponse>;
  return apiResponse.data;
}

/**
 * Hook for creating an access role with loading and error state management.
 */
export function useCreateAccessRole() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (
      payload: CreateAccessRoleRequest
    ): Promise<AccessRoleResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await createAccessRole(payload);
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create role";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { create, isLoading, error };
}