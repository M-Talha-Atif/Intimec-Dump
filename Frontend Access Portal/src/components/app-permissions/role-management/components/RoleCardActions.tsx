import React, { useState } from "react";
import {
  Edit,
  Trash2,
  Users,
  MoreHorizontal,
  Loader2,
  Copy,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApplicationPermissions } from "../../contexts/ApplicationPermissionsContext";
import { usePermissionMatrixContext } from "../../contexts/PermissionMatrixContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { InternalRole } from "@/types/roleManagement";
import { useRoleManagementContext } from "../contexts/RoleManagementContext";
import { TruncatedText } from "./TruncatedText";

interface RoleCardActionsProps {
  role: InternalRole;
}

export const RoleCardActions: React.FC<RoleCardActionsProps> = ({ role }) => {
  const {
    setEditingRole,
    handleDeleteRole,
    handleCopyRole,
    setAssigningUsersToRole,
    deletingRoleId,
  } = useRoleManagementContext();
  const { setActiveTab } = useApplicationPermissions();
  const {
    setSelectedRole,
    setBulkEditMode,
    setBulkMode,
    setSelectedCells,
    permissions,
    allActions,
    filteredModules,
    refetch,
    modules,
    fetchPermissionsForRole,
  } = usePermissionMatrixContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCopyConfirm, setShowCopyConfirm] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);

  const isDeleting = deletingRoleId === role.id;
  const isSystemRole = role.type === "SYSTEM";

  const handleEditClick = () => {
    setEditingRole(role);
    setDropdownOpen(false); // Close dropdown when opening dialog
  };

  const handleCopyClick = () => {
    setShowCopyConfirm(true);
    setDropdownOpen(false); // Close dropdown when opening dialog
  };

  const handleConfirmCopy = () => {
    handleCopyRole(role.id);
    setShowCopyConfirm(false);
  };

  const handleDeleteClick = async () => {
    console.log('Role requireOwnerApproval:', role.requireOwnerApproval);
    console.log('Full role object:', role);
    console.log('All role keys:', Object.keys(role));
    console.log('requireOwnerApproval in role?', 'requireOwnerApproval' in role);
    console.log('role.requireOwnerApproval type:', typeof role.requireOwnerApproval);
    setShowDeleteConfirm(true);
    setDropdownOpen(false); // Close dropdown when opening dialog
    
    // Fetch workflows if role requires approval
    if (role.requireOwnerApproval) {
      setIsLoadingWorkflows(true);
      try {
        const response = await fetch('/api/workflows?size=100');
        if (response.ok) {
          const data = await response.json();
          console.log('[RoleCardActions] Raw API response:', data);
          
          // Handle wrapped response structure: { success, data: { content: [...] } }
          let workflowList = [];
          if (Array.isArray(data)) {
            workflowList = data;
          } else if (data.data && Array.isArray(data.data.content)) {
            workflowList = data.data.content;
          } else if (data.content && Array.isArray(data.content)) {
            workflowList = data.content;
          }
          
          console.log('[RoleCardActions] Fetched workflows:', workflowList);
          
          // Filter workflows that are:
          // 1. Event-based (triggerType = EVENT_BASED)
          // 2. Have role.deleted in their eventTypes
          // 3. Status is ACTIVE
          const roleDeleteWorkflows = workflowList.filter((wf: any) => {
            const status = wf.status?.toUpperCase();
            const isActive = status === 'ACTIVE';
            const triggerType = wf.triggerType?.toUpperCase();
            const isEventBased = triggerType === 'EVENT_BASED' || triggerType === 'EVENT-BASED';
            const eventTypes = wf.eventConfig?.eventTypes || [];
            const hasRoleDeleted = eventTypes.includes('role.deleted');
            
            console.log(`[RoleCardActions] Workflow "${wf.name}":`, {
              status: wf.status,
              isActive,
              triggerType: wf.triggerType,
              isEventBased,
              eventTypes,
              hasRoleDeleted,
              willInclude: isActive && isEventBased && hasRoleDeleted
            });
            
            return isActive && isEventBased && hasRoleDeleted;
          });
          
          console.log('[RoleCardActions] Filtered role deletion workflows:', roleDeleteWorkflows);
          setWorkflows(roleDeleteWorkflows);
          
          // Auto-select first workflow if only one exists
          if (roleDeleteWorkflows.length === 1) {
            setSelectedWorkflowId(roleDeleteWorkflows[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch workflows:', error);
      } finally {
        setIsLoadingWorkflows(false);
      }
    }
  };

  const handleConfirmDelete = () => {
    handleDeleteRole(role.id, selectedWorkflowId || undefined);
    setShowDeleteConfirm(false);
    setSelectedWorkflowId("");
  };

  const handleAssignPermissions = async () => {
    // Set the role first, then navigate
    setSelectedRole(role.id);
    // Ensure bulk mode is off and no cells are selected
    setBulkEditMode(false);
    setBulkMode("");
    setSelectedCells(new Set());
    setActiveTab("granular-matrix");
    // Trigger fetch to load permissions for this role
    await refetch();
  };

  const handleRevokePermissions = async () => {
    // Navigate to granular matrix tab
    setBulkEditMode(true);
    setBulkMode("revoke");
    setActiveTab("granular-matrix");
    
    // Set the role and fetch permissions for this specific role
    setSelectedRole(role.id);
    const freshModules = await fetchPermissionsForRole(role.id);
    
    // Get all cells that have permissions by reading directly from the fresh data
    const cellsWithPermissions = new Set<string>();
    
    // Read from the fresh modules data returned by fetch
    if (freshModules && freshModules.length > 0) {
      freshModules.forEach((module: any) => {
        module.pages.forEach((page: any) => {
          page.actions.forEach((action: any) => {
            // Check if this action has the role permission
            if (action.hasRole) {
              const cellKey = `${page.id}-${action.name}`;
              cellsWithPermissions.add(cellKey);
            }
          });
        });
      });
    }

    // Pre-select all cells with permissions
    setSelectedCells(cellsWithPermissions);
  };

  // Check if role has any permissions - use role's permission count from the role object
  // Since permissions might not be loaded yet in the matrix context
  const hasPermissions = role.permissionsCount > 0;

  return (
    <>
      <div className="flex flex-col gap-1.5 mt-4 pt-4 border-t">
        <div className="flex gap-1.5 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAssigningUsersToRole(role.id)}
            disabled={isDeleting}
            className="flex-1 h-8 text-xs px-2"
          >
            <Users className="h-3 w-3 mr-1" />
            Assign Users
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAssigningUsersToRole(`revoke-${role.id}`)}
            disabled={isDeleting}
            className="flex-1 h-8 text-xs px-2"
          >
            <Users className="h-3 w-3 mr-1" />
            Revoke Users
          </Button>
        </div>
        <div className="flex gap-1.5 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAssignPermissions}
            disabled={isDeleting}
            className="flex-1 h-8 text-xs px-2"
          >
            <Plus className="h-3 w-3 mr-1" />
            Assign Permissions
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRevokePermissions}
            disabled={isDeleting || !hasPermissions}
            className="flex-1 h-8 text-xs px-2"
            title={!hasPermissions ? "No permissions to revoke" : "Revoke Permissions"}
          >
            <Minus className="h-3 w-3 mr-1" />
            Revoke Permissions
          </Button>
        </div>
        <div className="flex justify-end">

        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isDeleting}>
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreHorizontal className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleEditClick} disabled={isDeleting}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyClick} disabled={isDeleting}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDeleteClick}
              className="text-destructive"
              disabled={isDeleting || isSystemRole}
              title={isSystemRole ? "SYSTEM roles cannot be deleted" : undefined}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={showCopyConfirm} onOpenChange={setShowCopyConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Copy Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to copy the role &ldquo;<TruncatedText text={role.name} maxLength={48} className="font-semibold text-foreground" />&rdquo;?<br/> This will create a new role with the same properties and owners.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCopy}>
              Copy Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {role.requireOwnerApproval ? "Submit Role for Deletion" : "Delete Role"}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            {role.requireOwnerApproval ? (
              <>
                <AlertDialogDescription>
                  Submit the role &ldquo;<TruncatedText text={role.name} maxLength={48} className="font-semibold text-foreground" />&rdquo; for deletion approval?
                  <br />
                  <br />
                  The role owner(s) will receive an approval request. The role will only be deleted after approval is granted.
                </AlertDialogDescription>
                
                <div className="space-y-2">
                  <label htmlFor="workflow" className="text-sm font-medium text-foreground">
                    Deletion Workflow <span className="text-destructive">*</span>
                  </label>
                  {isLoadingWorkflows ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2 text-sm text-muted-foreground">Loading workflows...</span>
                    </div>
                  ) : workflows.length === 0 ? (
                    <div className="text-sm text-destructive py-2">
                      No active role deletion workflows found. Please activate a workflow with event type "role.deleted" first.
                    </div>
                  ) : (
                    <select
                      id="workflow"
                      value={selectedWorkflowId}
                      onChange={(e) => setSelectedWorkflowId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="">Select a workflow</option>
                      {workflows.map((workflow: any) => (
                        <option key={workflow.id} value={workflow.id}>
                          {workflow.name} {workflow.description ? `- ${workflow.description}` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </>
            ) : (
              <AlertDialogDescription>
                Are you sure you want to delete the role &ldquo;<TruncatedText text={role.name} maxLength={48} className="font-semibold text-foreground" />&rdquo;?
                <br />
                <br />
                This action cannot be undone and will remove all permissions associated with this role.
              </AlertDialogDescription>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting || (role.requireOwnerApproval && !selectedWorkflowId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {role.requireOwnerApproval ? "Submitting..." : "Deleting..."}
                </>
              ) : (
                role.requireOwnerApproval ? "Submit for Approval" : "Delete Role"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
