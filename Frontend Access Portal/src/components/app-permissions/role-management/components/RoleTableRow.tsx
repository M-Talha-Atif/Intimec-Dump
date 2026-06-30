import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { InternalRole } from "@/types/roleManagement";
import { MoreVertical, Edit, Trash2, Copy, Loader2, Users } from "lucide-react";
import { RolePermissionsPopover } from "./RolePermissionsPopover";
import { RoleMembersPopover } from "./RoleMembersPopover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Button } from "@/components/ui/button";
import { useRoleManagementContext } from "../contexts/RoleManagementContext";
import { TruncatedText } from "./TruncatedText";

interface RoleTableRowProps {
  role: InternalRole;
  columns: {
    description: boolean;
    owners: boolean;
    users: boolean;
    permissions: boolean;
    tags: boolean;
    status: boolean;
    created: boolean;
    lastModified: boolean;
    createdBy: boolean;
  };
  isSelected?: boolean;
  onSelectChange?: (selected: boolean) => void;
}

import { getRiskColor, getTypeIcon } from "../utils/roleUtils";
import { shortDate } from "@/utils/dateFormat";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-500/10 text-green-700 dark:text-green-400";
    case "inactive":
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    case "archived":
      return "bg-red-500/10 text-red-700 dark:text-red-400";
    default:
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
  }
};

export const RoleTableRow: React.FC<RoleTableRowProps> = ({
  role,
  columns,
  isSelected = false,
  onSelectChange,
}) => {
  const { setEditingRole, handleDeleteRole, handleCopyRole, deletingRoleId } = useRoleManagementContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCopyConfirm, setShowCopyConfirm] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);

  const isDeleting = deletingRoleId === role.id;

  const handleEditClick = () => {
    setEditingRole(role);
    setDropdownOpen(false);
  };

  const handleCopyClick = () => {
    setShowCopyConfirm(true);
    setDropdownOpen(false);
  };

  const handleConfirmCopy = () => {
    handleCopyRole(role.id);
    setShowCopyConfirm(false);
  };

  const handleDeleteClick = async () => {
    setShowDeleteConfirm(true);
    setDropdownOpen(false);

    // Fetch workflows if role requires approval
    if (role.requireOwnerApproval) {
      setIsLoadingWorkflows(true);
      try {
        const response = await fetch("/api/workflows?size=100");
        if (response.ok) {
          const data = await response.json();

          // Handle wrapped response structure: { success, data: { content: [...] } }
          let workflowList: any[] = [];
          if (Array.isArray(data)) {
            workflowList = data;
          } else if (data.data && Array.isArray(data.data.content)) {
            workflowList = data.data.content;
          } else if (data.content && Array.isArray(data.content)) {
            workflowList = data.content;
          }

          // Filter workflows that are:
          // 1. Event-based (triggerType = EVENT_BASED)
          // 2. Have role.deleted in their eventTypes
          // 3. Status is ACTIVE
          const roleDeleteWorkflows = workflowList.filter((wf: any) => {
            const status = wf.status?.toUpperCase();
            const isActive = status === "ACTIVE";
            const triggerType = wf.triggerType?.toUpperCase();
            const isEventBased =
              triggerType === "EVENT_BASED" || triggerType === "EVENT-BASED";
            const eventTypes = wf.eventConfig?.eventTypes || [];
            const hasRoleDeleted = eventTypes.includes("role.deleted");

            return isActive && isEventBased && hasRoleDeleted;
          });

          setWorkflows(roleDeleteWorkflows);

          // Auto-select first workflow if only one exists
          if (roleDeleteWorkflows.length === 1) {
            setSelectedWorkflowId(roleDeleteWorkflows[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch workflows:", error);
      } finally {
        setIsLoadingWorkflows(false);
      }
    }
  };

  const handleConfirmDelete = () => {
    handleDeleteRole(role.id, selectedWorkflowId || undefined);
    setShowDeleteConfirm(false);
    setSelectedWorkflowId("");
    setWorkflows([]);
  };

  const isSystemRole = role.type === "SYSTEM";
  const TypeIcon = getTypeIcon(role.type);

  return (
    <TableRow>
      <TableCell className="w-10">
        <div className="flex items-center justify-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelectChange}
            disabled={isSystemRole}
            className="border-1"
            title={isSystemRole ? "SYSTEM roles cannot be selected for deletion" : undefined}
          />
        </div>
      </TableCell>
      <TableCell className="font-medium">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <TypeIcon className="h-4 w-4 text-muted-foreground" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="center">
                  {role.type}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-sm font-semibold">
              <TruncatedText text={role.name} maxLength={50} />
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            <Badge variant={getRiskColor(role.riskLevel)} className="w-fit text-xs">
              {role.riskLevel}
            </Badge>
            {role.hasManualAssignments && (
              <Badge 
                variant="outline" 
                className="text-[10px] px-1.5 py-0 h-5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-2.5 w-2.5 mr-0.5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                Manual
              </Badge>
            )}
            {role.hasDynamicRules && (
              <Badge 
                variant="outline" 
                className="text-[10px] px-1.5 py-0 h-5 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-2.5 w-2.5 mr-0.5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Dynamic
              </Badge>
            )}
          </div>
        </div>
      </TableCell>

      {columns.description && (
        <TableCell className="max-w-xs">
          <span className="text-sm text-muted-foreground line-clamp-2">
            {role.description}
          </span>
        </TableCell>
      )}

      {columns.owners && (
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {role.ownersData && role.ownersData.length > 0 ? (
              role.ownersData.slice(0, 2).map((owner) => (
                <Badge key={owner.id} variant="outline" className="text-xs">
                  {owner.displayName ||
                    `${owner.firstName} ${owner.lastName}`}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                {role.owner}
              </span>
            )}
            {role.ownersData && role.ownersData.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{role.ownersData.length - 2}
              </Badge>
            )}
          </div>
        </TableCell>
      )}

      {columns.users && (
        <TableCell>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <RoleMembersPopover roleId={role.id} userCount={role.userCount}>
              <span className="text-sm">{role.userCount || 0}</span>
            </RoleMembersPopover>
          </div>
        </TableCell>
      )}

      {columns.permissions && (
        <TableCell>
            <RolePermissionsPopover
              roleId={role.id}
              permissionsCount={role.permissionsCount}
            >
              <span className="text-sm">{role.permissionsCount || 0}</span>
            </RolePermissionsPopover>
        </TableCell>
      )}

      {columns.tags && (
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {role.tags && role.tags.length > 0 ? (
              <>
                {role.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {role.tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{role.tags.length - 2}
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-sm text-muted-foreground">-</span>
            )}
          </div>
        </TableCell>
      )}

      {columns.status && (
        <TableCell>
          <Badge
            variant="default"
            className={
              role.isActive
                ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                : "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
            }
          >
            {role.isActive ? "Active" : "Inactive"}
          </Badge>
        </TableCell>
      )}

      {columns.created && (
        <TableCell>
          <span className="text-sm">{shortDate(role.created)}</span>
        </TableCell>
      )}

      {columns.lastModified && (
        <TableCell>
          <span className="text-sm">{shortDate(role.lastModified)}</span>
        </TableCell>
      )}

      {columns.createdBy && (
        <TableCell>
          <span className="text-sm">{role.createdByName || "-"}</span>
        </TableCell>
      )}

      <TableCell className="w-10">
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isDeleting}>
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreVertical className="h-4 w-4" />
              )}
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEditClick} disabled={isDeleting}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyClick} disabled={isDeleting}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDeleteClick} 
              className="text-destructive" 
              disabled={isDeleting || isSystemRole}
              title={isSystemRole ? "SYSTEM roles cannot be deleted" : undefined}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>

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

      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={(open) => {
          setShowDeleteConfirm(open);
          if (!open) {
            setSelectedWorkflowId("");
            setWorkflows([]);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {role.requireOwnerApproval
                ? "Submit Role for Deletion"
                : "Delete Role"}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            {role.requireOwnerApproval ? (
              <>
                <AlertDialogDescription>
                  Submit the role &ldquo;
                  <TruncatedText
                    text={role.name}
                    maxLength={48}
                    className="font-semibold text-foreground"
                  />
                  &rdquo; for deletion approval?
                  <br />
                  <br />
                  The role owner(s) will receive an approval request. The role
                  will only be deleted after approval is granted.
                </AlertDialogDescription>

                <div className="space-y-2">
                  <label
                    htmlFor="workflow"
                    className="text-sm font-medium text-foreground"
                  >
                    Deletion Workflow <span className="text-destructive">*</span>
                  </label>
                  {isLoadingWorkflows ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2 text-sm text-muted-foreground">
                        Loading workflows...
                      </span>
                    </div>
                  ) : workflows.length === 0 ? (
                    <div className="text-sm text-destructive py-2">
                      No active role deletion workflows found. Please activate
                      a workflow with event type "role.deleted" first.
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
                          {workflow.name}
                          {workflow.description
                            ? `- ${workflow.description}`
                            : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </>
            ) : (
              <AlertDialogDescription>
                Are you sure you want to delete the role &ldquo;
                <TruncatedText
                  text={role.name}
                  maxLength={48}
                  className="font-semibold text-foreground"
                />
                &rdquo;? <br /> This action cannot be undone and will remove all
                permissions associated with this role.
              </AlertDialogDescription>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={
                isDeleting ||
                (role.requireOwnerApproval && !selectedWorkflowId)
              }
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
    </TableRow>
  );
};

export const RoleTableRowSkeleton: React.FC<{
  columns: RoleTableRowProps["columns"];
}> = ({ columns }) => {
  return (
    <TableRow>
      <TableCell>
        <div className="h-4 w-4 bg-muted animate-pulse rounded" />
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          <div className="h-4 bg-muted animate-pulse rounded w-32" />
          <div className="h-5 bg-muted animate-pulse rounded w-16" />
        </div>
      </TableCell>
      {columns.description && (
        <TableCell>
          <div className="h-4 bg-muted animate-pulse rounded w-48" />
        </TableCell>
      )}
      {columns.owners && (
        <TableCell>
          <div className="h-6 bg-muted animate-pulse rounded w-24" />
        </TableCell>
      )}
      {columns.users && (
        <TableCell>
          <div className="h-4 bg-muted animate-pulse rounded w-12" />
        </TableCell>
      )}
      {columns.permissions && (
        <TableCell>
          <div className="h-4 bg-muted animate-pulse rounded w-12" />
        </TableCell>
      )}
      {columns.tags && (
        <TableCell>
          <div className="flex gap-1">
            <div className="h-6 bg-muted animate-pulse rounded w-16" />
            <div className="h-6 bg-muted animate-pulse rounded w-16" />
          </div>
        </TableCell>
      )}
      {columns.status && (
        <TableCell>
          <div className="h-6 bg-muted animate-pulse rounded w-16" />
        </TableCell>
      )}
      {columns.created && (
        <TableCell>
          <div className="h-4 bg-muted animate-pulse rounded w-20" />
        </TableCell>
      )}
      {columns.lastModified && (
        <TableCell>
          <div className="h-4 bg-muted animate-pulse rounded w-20" />
        </TableCell>
      )}
      {columns.createdBy && (
        <TableCell>
          <div className="h-4 bg-muted animate-pulse rounded w-24" />
        </TableCell>
      )}
      <TableCell>
        <div className="h-8 w-8 bg-muted animate-pulse rounded" />
      </TableCell>
    </TableRow>
  );
};
