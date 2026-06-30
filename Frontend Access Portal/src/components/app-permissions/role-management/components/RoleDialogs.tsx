import React from "react";
import { CreateRoleWizard } from "../dialogs/CreateRoleWizard";
import { EditRoleDialog } from "../dialogs/EditRoleDialog";
import { UserAssignmentModal } from "../UserAssignmentModal";
import { BulkImportRolesWizard } from "../dialogs/BulkImportRolesWizard";
import { TemplateSelector } from "@/components/app-permissions/TemplateSelector";
import { useRoleManagementContext } from "../contexts/RoleManagementContext";

export const RoleDialogs: React.FC = () => {
  const {
    showCreateWizard,
    setShowCreateWizard,
    editingRole,
    setEditingRole,
    assigningUsersToRole,
    setAssigningUsersToRole,
    showBulkImportDialog,
    setShowBulkImportDialog,
    showTemplates,
    setShowTemplates,
    handleCreateRole,
    handleEditRole,
    handleAssignUsers,
    handleCreateRule,
    loadRoles,
    createRoleError,
    clearCreateRoleError,
    editRoleError,
    clearEditRoleError,
  } = useRoleManagementContext();

  const handleApplyTemplate = (templateId: string) => {
    // Handle template application logic here
    console.log("Applying template:", templateId);
    // You can add your logic to apply the template to role management
    setShowTemplates(false);
  };

  const handleCreateWizardOpenChange = (open: boolean) => {
    setShowCreateWizard(open);
    if (!open) {
      clearCreateRoleError();
    }
  };

  const handleEditDialogOpenChange = (open: boolean) => {
    if (!open) {
      setEditingRole(null);
      clearEditRoleError();
    }
  };

  return (
    <>
      <CreateRoleWizard
        open={showCreateWizard}
        onOpenChange={handleCreateWizardOpenChange}
        onCreateRole={handleCreateRole}
        error={createRoleError}
      />

      {editingRole && (
        <EditRoleDialog
          key={editingRole.id}
          role={editingRole}
          open={!!editingRole}
          onOpenChange={handleEditDialogOpenChange}
          onUpdateRole={handleEditRole}
          error={editRoleError}
        />
      )}

      {assigningUsersToRole && (
        <UserAssignmentModal
          roleId={assigningUsersToRole}
          open={!!assigningUsersToRole}
          onOpenChange={(open) => !open && setAssigningUsersToRole(null)}
          onAssignUsers={handleAssignUsers}
          onCreateRule={handleCreateRule}
          onSuccess={loadRoles}
        />
      )}

      <BulkImportRolesWizard
        open={showBulkImportDialog}
        onOpenChange={setShowBulkImportDialog}
        onImportComplete={loadRoles}
      />

      {showTemplates && (
        <TemplateSelector
          onClose={() => setShowTemplates(false)}
          onApply={handleApplyTemplate}
        />
      )}
    </>
  );
};
