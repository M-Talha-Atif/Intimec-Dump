import { useState, useCallback } from "react";
import { EntitlementResponseDto } from "@/types/entitlements";

export interface EntitlementUpdatePayload {
  displayName?: string;
  description?: string;
  lifecycle?: string;
  riskLevel?: string;
  kind?: string;
  riskReason?: string;
  requestable?: boolean;
  classification?: string[];
  identityType?: string;
  privilegeLevel?: string;
  ownerId?: string;
  requireApproval?: boolean;
  allowedAutomatedGrant?: boolean;
  maxDurationMs?: number;
  autoExpireDurationMs?: number;
}

export interface UseUpdateEntitlementReturn {
  updating: boolean;
  error: string | null;
  updateEntitlement: (
    id: string,
    payload: EntitlementUpdatePayload
  ) => Promise<EntitlementResponseDto>;
}

/**
 * Calls PUT /api/access-catalogue/entitlements/:id
 * to update governance metadata for an entitlement.
 */
export function useUpdateEntitlement(): UseUpdateEntitlementReturn {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateEntitlement = useCallback(
    async (
      id: string,
      payload: EntitlementUpdatePayload
    ): Promise<EntitlementResponseDto> => {
      setUpdating(true);
      setError(null);

      try {
        const res = await fetch(`/api/access-catalogue/entitlements/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          const message =
            errBody?.error || errBody?.message || `Update failed (${res.status})`;
          throw new Error(message);
        }

        const data: EntitlementResponseDto = await res.json();
        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(message);
        throw err;
      } finally {
        setUpdating(false);
      }
    },
    []
  );

  return { updating, error, updateEntitlement };
}