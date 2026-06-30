import { useCallback } from "react";
import { toast } from "sonner";
import type { MutableRefObject } from "react";
import type { Role } from "@/types/roles";
import { useUpdateAccessRole } from "@/hooks/access-catalogue/roles/use-update-access-role";
import { useSyncRoleEntitlements } from "@/hooks/access-catalogue/roles/entitlements/useSyncRoleEntitlements";
import { useSyncRoleChildren } from "@/hooks/access-catalogue/roles/useSyncRoleChildren";
import { mapRoleToUpdatePayload } from "../utils/rolePayloadMappers";
import {
  hasMetadataChanged,
  haveEntitlementsChanged,
  haveChildrenChanged,
} from "../utils/roleEditorDiff";

/**
 * Result returned by the role editor save orchestrator.
 *
 * This keeps UI logic clean by summarizing what happened during save.
 */
export interface RoleEditorSaveResult {
  metadataUpdated: boolean;
  entitlementsUpdated: boolean;
  childrenUpdated: boolean;
  entitlementSyncFailed: boolean;
  childSyncFailed: boolean;
  childFailureMessages: string[];
  success: boolean;
}

interface UseRoleEditorSaveParams {
  allRoles: Role[];
  originalRole: Role;
  originalEntitlementIdsRef: MutableRefObject<string[]>;
  originalChildIdsRef: MutableRefObject<string[]>;
  setEditedRole: React.Dispatch<React.SetStateAction<Role>>;
  onSave: (updatedRole: Role) => Promise<void>;
}

/**
 * Frontend orchestration hook for role editor save behavior.
 *
 * Responsibilities:
 * - build update payloads
 * - detect what changed
 * - call only the relevant backend APIs
 * - handle partial child-role sync failures
 * - update original refs after successful persistence
 * - emit user-facing toast notifications
 *
 * This hook intentionally keeps:
 * - transport logic inside existing API hooks
 * - rendering logic inside RoleEditor.tsx
 *
 * @param params dependencies required for the save workflow
 * @returns save orchestrator and combined loading state
 */
export function useRoleEditorSave({
  allRoles,
  originalRole,
  originalEntitlementIdsRef,
  originalChildIdsRef,
  setEditedRole,
  onSave,
}: UseRoleEditorSaveParams) {
  const { update, isLoading: isUpdating, error: updateError } = useUpdateAccessRole();
  const { sync: syncEntitlements, isLoading: isSyncingEntitlements } = useSyncRoleEntitlements();
  const { sync: syncChildren, isLoading: isSyncingChildren } = useSyncRoleChildren();

  /**
   * Resolves a role name from the available role list.
   * Falls back to the raw ID if the role is not found locally.
   *
   * @param childId child role ID
   * @returns role name or ID fallback
   */
  const resolveChildName = useCallback(
    (childId: string): string => {
      const found = allRoles.find((r) => r.id === childId);
      return found?.name || childId;
    },
    [allRoles]
  );

  /**
   * Saves role metadata, entitlements, and child roles using
   * change-aware orchestration.
   *
   * Only relevant APIs are called:
   * - metadata API only when metadata changed
   * - entitlement sync only when entitlement IDs changed
   * - child sync only when child IDs changed
   *
   * @param editedRole current UI role state
   * @returns structured save result
   */
  const save = useCallback(
    async (editedRole: Role): Promise<RoleEditorSaveResult> => {
      const editedPayload = mapRoleToUpdatePayload(editedRole);
      const originalPayload = mapRoleToUpdatePayload(originalRole);

      const currentEntitlementIds: string[] = (editedRole as any).entitlementIds || [];
      const currentChildIds: string[] = (editedRole as any).childRoleIds || [];

      const metadataChanged = hasMetadataChanged(originalPayload, editedPayload);
      const entitlementsChanged = haveEntitlementsChanged(
        originalEntitlementIdsRef.current,
        currentEntitlementIds
      );
      const childrenChanged = haveChildrenChanged(
        originalChildIdsRef.current,
        currentChildIds
      );

      let metadataUpdated = false;
      let entitlementsUpdated = false;
      let childrenUpdated = false;
      let entitlementSyncFailed = false;
      let childSyncFailed = false;
      let childFailureMessages: string[] = [];

      // 1. Metadata update only when required
      if (metadataChanged) {
        const updateResult = await update(originalRole.id, editedPayload);
        if (!updateResult) {
          toast.error(updateError || "Failed to update role. Please try again.");
          return {
            metadataUpdated: false,
            entitlementsUpdated: false,
            childrenUpdated: false,
            entitlementSyncFailed: false,
            childSyncFailed: false,
            childFailureMessages: [],
            success: false,
          };
        }
        metadataUpdated = true;
      }

      // 2. Entitlement desired-state sync
      if (entitlementsChanged) {
        const entitlementResult = await syncEntitlements(
          originalRole.id,
          currentEntitlementIds
        );

        if (entitlementResult) {
          originalEntitlementIdsRef.current = [...currentEntitlementIds];
          entitlementsUpdated = true;
        } else {
          entitlementSyncFailed = true;
        }
      }

      // 3. Child-role desired-state sync
      if (childrenChanged) {
        const childResult = await syncChildren(originalRole.id, currentChildIds);

        if (!childResult) {
          childSyncFailed = true;
        } else {
          if (childResult.failed.length > 0) {
            childSyncFailed = true;

            const failedIds = new Set(childResult.failed.map((f) => f.childRoleId));
            childFailureMessages = childResult.failed.map((f) => {
              const childName = resolveChildName(f.childRoleId);
              return `"${childName}": ${f.reason}`;
            });

            // Keep UI aligned with persisted backend state
            const correctedIds = currentChildIds.filter((id) => !failedIds.has(id));
            setEditedRole((prev) => ({ ...prev, childRoleIds: correctedIds } as any));
            originalChildIdsRef.current = correctedIds;
          } else {
            originalChildIdsRef.current = [...currentChildIds];
            childrenUpdated = true;
          }
        }
      }

      // 4. Toast summary
      if (entitlementSyncFailed && childSyncFailed) {
        toast.warning("Role metadata saved, but entitlement and child role sync had issues.");
        childFailureMessages.forEach((msg) => {
          toast.error(`Child role not added: ${msg}`);
        });
      } else if (entitlementSyncFailed) {
        toast.warning("Role metadata saved, but entitlement sync failed. Please retry.");
      } else if (childSyncFailed) {
        if (childFailureMessages.length > 0) {
          childFailureMessages.forEach((msg) => {
            toast.error(`Child role not added: ${msg}`);
          });
          toast.warning(`Role "${editedRole.name}" updated with some child role failures.`);
        } else {
          toast.warning("Role metadata saved, but child role sync failed. Please retry.");
        }
      } else {
        toast.success(`Role "${editedRole.name}" updated successfully`);
      }

      await onSave(editedRole);

      return {
        metadataUpdated,
        entitlementsUpdated,
        childrenUpdated,
        entitlementSyncFailed,
        childSyncFailed,
        childFailureMessages,
        success: !entitlementSyncFailed && !childSyncFailed,
      };
    },
    [
      originalRole,
      originalEntitlementIdsRef,
      originalChildIdsRef,
      update,
      updateError,
      syncEntitlements,
      syncChildren,
      resolveChildName,
      setEditedRole,
      onSave,
    ]
  );

  return {
    save,
    isSaving: isUpdating || isSyncingEntitlements || isSyncingChildren,
  };
}