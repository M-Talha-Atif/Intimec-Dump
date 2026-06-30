"use client";
import React, { useMemo } from "react";
import { usePermissionMatrixContext } from "../contexts";
import { GranularSettingsDrawer } from "../GranularSettingsDrawer";
import { TemplateSelector } from "../TemplateSelector";
import { BulkConfigDialog, BulkConfigItem } from "./BulkConfigDialog";
import { 
  bulkAssignPermissions, 
  submitBulkAssignmentForApproval, 
  submitBulkRevocationForApproval 
} from "../api/granular-permissions";
import { useToast } from "@/hooks/use-toast";

export const PermissionMatrixModals: React.FC = () => {
  const {
    selectedCell,
    showTemplates,
    showBulkDialog,
    selectedCells,
    selectedRole,
    bulkMode,
    filteredModules,
    actionNameToIdMap,
    setShowTemplates,
    closeBulkDialog,
    clearSelectedCells,
    applyTemplate,
    refetch,
  } = usePermissionMatrixContext();

  const { toast } = useToast();

  // Build bulk config items from selected cells
  const bulkConfigItems: BulkConfigItem[] = useMemo(() => {
    const items: BulkConfigItem[] = [];

    Array.from(selectedCells).forEach((cellKey) => {
      // Split on the LAST hyphen only (UUIDs contain hyphens!)
      const lastHyphenIndex = cellKey.lastIndexOf("-");
      const moduleId = cellKey.substring(0, lastHyphenIndex);
      const action = cellKey.substring(lastHyphenIndex + 1);

      // Find module name
      let moduleName = "";
      for (const group of filteredModules) {
        const module = group.modules.find((m) => m.moduleId === moduleId);
        if (module) {
          moduleName = module.label;
          break;
        }
      }

      // Get action ID from map
      const mapKey = `${moduleId}-${action}`;
      const actionId = actionNameToIdMap.get(mapKey) || "";

      if (actionId) {
        items.push({
          moduleId,
          moduleName,
          action,
          actionId,
          justification: "",
          conditionScript: "",
        });
      }
    });

    return items;
  }, [selectedCells, filteredModules, actionNameToIdMap]);

  const handleBulkSubmit = async (items: BulkConfigItem[]) => {
    try {
      const assignments = items.map((item) => ({
        actionId: item.actionId,
        justification: item.justification,
        conditionScript: item.conditionScript || null,
      }));

      const result = await bulkAssignPermissions(selectedRole, assignments);

      // Check if operation was denied (403 returns null)
      if (result === null) {
        return;
      }

      if (result.success) {
        toast({
          title: "Success",
          description: `Successfully assigned ${result.assignedCount} permissions`,
        });

        // Refresh permissions and clear selection
        await refetch();
        clearSelectedCells();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to assign permissions",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign permissions",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleBulkRevoke = async (actionIds: string[]) => {
    try {
      const response = await fetch(`/api/roles/${selectedRole}/permissions/bulk-revoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ actionIds }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: result.error || "Failed to revoke permissions",
          variant: "destructive",
        });
        throw new Error(result.error || "Failed to revoke permissions");
      }

      if (result.success) {
        toast({
          title: "Success",
          description: `Successfully revoked ${result.revokedCount} permissions`,
        });

        // Refresh permissions and clear selection
        await refetch();
        clearSelectedCells();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to revoke permissions",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to revoke permissions",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleBulkSubmitForApproval = async (items: BulkConfigItem[], workflowId: string) => {
    try {
      const assignments = items.map((item) => ({
        actionId: item.actionId,
        justification: item.justification,
        conditionScript: item.conditionScript || null,
      }));

      const result = await submitBulkAssignmentForApproval(selectedRole, {
        assignments,
        workflowId,
      });

      // Check if operation was denied (403 returns null)
      if (result === null) {
        return;
      }

      toast({
        title: "Submitted for Approval",
        description: `${result.assignmentCount} permissions submitted for approval`,
      });

      // Refresh permissions and clear selection
      await refetch();
      clearSelectedCells();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit for approval",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleBulkRevokeForApproval = async (actionIds: string[], justification: string, workflowId: string) => {
    try {
      const result = await submitBulkRevocationForApproval(selectedRole, {
        actionIds,
        justification,
        workflowId,
      });

      // Check if operation was denied (403 returns null)
      if (result === null) {
        return;
      }

      toast({
        title: "Submitted for Approval",
        description: `Revocation of ${actionIds.length} permissions submitted for approval`,
      });

      // Refresh permissions and clear selection
      await refetch();
      clearSelectedCells();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit revocation for approval",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <>
      {/* Granular Settings Drawer */}
      {selectedCell && <GranularSettingsDrawer />}

      {/* Template Selector */}
      {showTemplates && (
        <TemplateSelector
          onClose={() => setShowTemplates(false)}
          onApply={applyTemplate}
        />
      )}

      {/* Bulk Config Dialog */}
      <BulkConfigDialog
        open={showBulkDialog}
        onOpenChange={closeBulkDialog}
        items={bulkConfigItems}
        bulkMode={bulkMode}
        onSubmit={handleBulkSubmit}
        onRevoke={handleBulkRevoke}
        onSubmitForApproval={handleBulkSubmitForApproval}
        onRevokeForApproval={handleBulkRevokeForApproval}
      />
    </>
  );
};

