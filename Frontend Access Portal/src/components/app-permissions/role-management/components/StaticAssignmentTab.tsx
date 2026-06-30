import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { UserSearchFilters } from "./UserSearchFilters";
import { UserResultsSummary } from "./UserResultsSummary";
import { UserList } from "./UserList";
import { UsersSearchAndFilters } from "./UsersSearchAndFilters";
import { UsersPagination } from "./UsersPagination";
import { useUserAssignmentContext } from "../contexts/UserAssignmentContext";
import { toast } from "sonner";
import { 
  fetchActiveWorkflows, 
  submitUserRoleAssignmentForApproval,
  Workflow
} from "../utils/userAssignmentUtils";

interface StaticAssignmentTabProps {
  roleId: string;
  onCancel: () => void;
  onSuccess?: () => void;
}

export const StaticAssignmentTab: React.FC<StaticAssignmentTabProps> = ({
  roleId,
  onCancel,
  onSuccess,
}) => {
  const {
    selectedUsers,
    resetFilters,
    fetchUsersForRole,
    isLoadingUsers,
    usersError,
    assignRole,
    setSelectedUsers,
    apiUsers,
    usersData,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
  } = useUserAssignmentContext();

  const [isAssigning, setIsAssigning] = useState(false);
  const [sendNotification, setSendNotification] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [showAssignConfirm, setShowAssignConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [initialUserIds, setInitialUserIds] = useState<string[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("");
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);

  // Fetch workflows when requireApproval changes
  useEffect(() => {
    if (requireApproval) {
      const loadWorkflows = async () => {
        setIsLoadingWorkflows(true);
        try {
          const wfs = await fetchActiveWorkflows();
          setWorkflows(wfs);
          // Auto-select first workflow if available
          if (wfs.length > 0 && !selectedWorkflow) {
            setSelectedWorkflow(wfs[0].id);
          }
        } catch (error) {
          console.error("Failed to load workflows:", error);
          toast.error("Failed to load workflows", {
            description: error instanceof Error ? error.message : "Unknown error"
          });
        } finally {
          setIsLoadingWorkflows(false);
        }
      };
      loadWorkflows();
    } else {
      setWorkflows([]);
      setSelectedWorkflow("");
    }
  }, [requireApproval]);

  // Fetch users when component mounts or roleId changes
  useEffect(() => {
    if (roleId) {
      fetchUsersForRole(roleId);
    }
  }, [roleId, fetchUsersForRole]);

  // Auto-select users who already have the role and store initial state
  useEffect(() => {
    if (!isLoadingUsers && apiUsers.length > 0) {
      const usersWithRole = apiUsers
        .filter((user) => user.hasRole)
        .map((user) => user.id);
      setSelectedUsers(usersWithRole);
      setInitialUserIds(usersWithRole);
    }
  }, [apiUsers, isLoadingUsers, setSelectedUsers]);

  // Check if selection has changed from initial state and calculate changes
  const { hasSelectionChanged, addedUsersCount, removedUsersCount } = useMemo(() => {
    const selectedSet = new Set(selectedUsers);
    const initialSet = new Set(initialUserIds);
    
    // Calculate newly added users (in selected but not in initial)
    const addedUsers = selectedUsers.filter(id => !initialSet.has(id));
    
    // Calculate removed users (in initial but not in selected)
    const removedUsers = initialUserIds.filter(id => !selectedSet.has(id));
    
    const hasChanged = addedUsers.length > 0 || removedUsers.length > 0;
    
    return {
      hasSelectionChanged: hasChanged,
      addedUsersCount: addedUsers.length,
      removedUsersCount: removedUsers.length
    };
  }, [selectedUsers, initialUserIds]);

  const handleAssignClick = () => {
    if (selectedUsers.length === 0) return;
    setShowAssignConfirm(true);
  };

  const handleConfirmAssign = async () => {
    setShowAssignConfirm(false);
    setIsAssigning(true);
    try {
      // Calculate only the newly added users (exclude users who already have the role)
      const initialSet = new Set(initialUserIds);
      const newlyAddedUsers = selectedUsers.filter(id => !initialSet.has(id));
      
      console.log("Newly added User IDs to assign:", newlyAddedUsers);
      console.log("Users who already had the role (excluded):", initialUserIds);

      // Only proceed if there are newly added users
      if (newlyAddedUsers.length === 0) {
        toast.info("No new users to assign", {
          description: "All selected users already have this role",
        });
        setIsAssigning(false);
        return;
      }

      // Check if approval is required and workflow is selected
      if (requireApproval && selectedWorkflow && selectedWorkflow !== "none") {
        // Submit for approval workflow - only newly added users
        const approvalResponse = await submitUserRoleAssignmentForApproval({
          userIds: newlyAddedUsers,
          roleId: roleId,
          workflowId: selectedWorkflow,
          justification: "User role assignment via role management",
          sendNotificationOnCompletion: sendNotification,
        });

        if (approvalResponse.success) {
          toast.success("Submitted for Approval", {
            description: "User role assignment has been submitted for approval workflow",
          });

          // Trigger refresh in parent to update badges
          onSuccess?.();

          // Reset filters and close
          resetFilters();
          onCancel();
        } else {
          toast.error("Failed to submit for approval", {
            description: approvalResponse.message,
          });
        }
      } else {
        // Direct assignment without approval - only newly added users
        const response = await assignRole({
          userIds: newlyAddedUsers,
          roleId: roleId,
          sendNotificationOnAssignment: sendNotification,
          requireApprovalBeforeAssignment: false,
        });

        // Check if operation was denied (403 returns null)
        if (response === null) {
          return;
        }

        // Show success message
        toast.success("Success", {
          description: `${response.data.summary.successCount} user(s) assigned successfully`,
        });

        // Trigger refresh in parent to update badges
        onSuccess?.();

        // Reset filters and close
        resetFilters();
        onCancel();
      }
    } catch (error) {
      console.error("Error assigning role:", error);
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to assign role",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCancelClick = () => {
    if (hasSelectionChanged) {
      setShowCancelConfirm(true);
    } else {
      onCancel();
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    resetFilters();
    onCancel();
  };

  // Show loading state
  if (isLoadingUsers) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Manual User Assignment</CardTitle>
          <CardDescription>
            Loading users for role assignment...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading users...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (usersError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Manual User Assignment</CardTitle>
          <CardDescription>
            Error loading users for role assignment
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="text-center">
            <p className="text-sm text-destructive mb-2">
              Failed to load users: {usersError.message}
            </p>
            <Button variant="outline" onClick={() => fetchUsersForRole(roleId)}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setCurrentPage(1);
  };

  // Get pagination data
  const totalPages = usersData?.totalPages || 1;
  const totalCount = usersData?.totalCount || 0;

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Manual User Assignment</CardTitle>
        <CardDescription>
          Select specific users to assign to this role. Changes take effect
          immediately.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <UsersSearchAndFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
          onClearFilters={handleClearFilters}
        />

        <UserList disableIfHasRole={true} />
        
        {/* Pagination */}
        {!isLoadingUsers && totalCount > 0 && (
          <UsersPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        )}
      </CardContent>
    </Card>

    {/* Actions Card */}
    <div className="mt-8 mb-8">
      <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {/* Send Notification */}
          <div className="flex items-center">
            <Label htmlFor="send-notification" className="mr-4">Send notification on assignment</Label>
            <Switch
              id="send-notification"
              checked={sendNotification}
              onCheckedChange={setSendNotification}
            />
          </div>

          {/* Require Approval */}
          <div className="flex items-center">
            <Label htmlFor="require-approval" className="mr-4">Require owner approval</Label>
            <Switch
              id="require-approval"
              checked={requireApproval}
              onCheckedChange={setRequireApproval}
            />
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Workflows Card - Only show when approval is required */}
    {requireApproval && (
    <div className="mt-8 mb-8">
    <Card>
      <CardHeader>
        <CardTitle>Approval Workflow</CardTitle>
        <CardDescription>
          Select a workflow to process the user role assignment approval
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="workflow">Assignment Workflow{requireApproval && " *"}</Label>
          <Select 
            value={selectedWorkflow} 
            onValueChange={setSelectedWorkflow}
            disabled={isLoadingWorkflows || workflows.length === 0}
          >
            <SelectTrigger id="workflow">
              <SelectValue placeholder={
                isLoadingWorkflows 
                  ? "Loading workflows..." 
                  : workflows.length === 0 
                  ? "No workflows available" 
                  : "Select a workflow"
              } />
            </SelectTrigger>
            <SelectContent>
              {workflows.map((workflow) => (
                <SelectItem key={workflow.id} value={workflow.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{workflow.name}</span>
                    {workflow.description && (
                      <span className="text-xs text-muted-foreground">
                        {workflow.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {requireApproval && !selectedWorkflow && (
            <p className="text-xs text-amber-600 mt-2">
              ⚠️ Please select a workflow for approval processing
            </p>
          )}
          {selectedWorkflow && (
            <p className="text-xs text-muted-foreground mt-2">
              Selected: {workflows.find(w => w.id === selectedWorkflow)?.name}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
    </div>
    )}
    </div>
    {/* Form Actions */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            {!hasSelectionChanged && (
              <span className="text-sm text-muted-foreground">
                No changes made
              </span>
            )}
            {requireApproval && !selectedWorkflow && hasSelectionChanged && (
              <span className="text-sm text-amber-600">
                ⚠️ Workflow required when approval is enabled
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleCancelClick} disabled={isAssigning}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignClick}
              disabled={!hasSelectionChanged || isAssigning || (requireApproval && !selectedWorkflow)}
            >
              {isAssigning
                ? requireApproval ? "Submitting..." : "Assigning..."
                : !hasSelectionChanged
                ? "No Changes"
                : requireApproval && !selectedWorkflow
                ? "Select Workflow"
                : addedUsersCount > 0 && removedUsersCount > 0
                ? `Update ${addedUsersCount + removedUsersCount} User${
                    addedUsersCount + removedUsersCount !== 1 ? "s" : ""
                  }`
                : addedUsersCount > 0
                ? requireApproval 
                  ? `Submit ${addedUsersCount} for Approval`
                  : `Assign ${addedUsersCount} User${addedUsersCount !== 1 ? "s" : ""}`
                : `Remove ${removedUsersCount} User${removedUsersCount !== 1 ? "s" : ""}`
              }
            </Button>
          </div>
        </div>


    {/* Assign Confirmation Dialog */}
    <AlertDialog open={showAssignConfirm} onOpenChange={setShowAssignConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm User Assignment</AlertDialogTitle>
          <AlertDialogDescription>
            {addedUsersCount > 0 && removedUsersCount > 0 ? (
              <>
                Are you sure you want to assign {addedUsersCount} new user{addedUsersCount !== 1 ? 's' : ''} and remove {removedUsersCount} user{removedUsersCount !== 1 ? 's' : ''} from this role?
              </>
            ) : addedUsersCount > 0 ? (
              <>
                Are you sure you want to assign {addedUsersCount} user{addedUsersCount !== 1 ? 's' : ''} to this role?
              </>
            ) : (
              <>
                Are you sure you want to remove {removedUsersCount} user{removedUsersCount !== 1 ? 's' : ''} from this role?
              </>
            )}
            {requireApproval && " This will require manager approval before taking effect."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmAssign}>
            {addedUsersCount > 0 && removedUsersCount > 0 ? 'Update Users' : addedUsersCount > 0 ? 'Assign Users' : 'Remove Users'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Cancel Confirmation Dialog */}
    <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard Changes</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel? Your selected users ({selectedUsers.length}) will not be assigned.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Continue Editing</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmCancel}               
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Discard Changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};
