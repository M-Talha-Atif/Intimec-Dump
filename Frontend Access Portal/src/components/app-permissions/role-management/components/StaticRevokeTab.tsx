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
  fetchRevokeWorkflows, 
  submitUserRoleRevocationForApproval,
  Workflow
} from "../utils/userAssignmentUtils";

interface StaticRevokeTabProps {
  roleId: string;
  onCancel: () => void;
  onSuccess?: () => void;
}

export const StaticRevokeTab: React.FC<StaticRevokeTabProps> = ({
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
    revokeRole,
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

  const [isRevoking, setIsRevoking] = useState(false);
  const [initialUserIds] = useState<string[]>([]);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [sendNotification, setSendNotification] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("");
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);

  // Fetch workflows when requireApproval changes
  useEffect(() => {
    if (requireApproval) {
      const loadWorkflows = async () => {
        setIsLoadingWorkflows(true);
        try {
          const wfs = await fetchRevokeWorkflows();
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

  // Don't auto-select users in revoke mode
  useEffect(() => {
    if (!isLoadingUsers && apiUsers.length > 0) {
      // Clear selections when switching to revoke tab
      setSelectedUsers([]);
    }
  }, [apiUsers, isLoadingUsers, setSelectedUsers]);

  // Check if any users are selected (for revoke, initial is always empty)
  const hasSelectionChanged = useMemo(() => {
    return selectedUsers.length > 0;
  }, [selectedUsers]);

  const handleRevokeClick = () => {
    if (selectedUsers.length === 0) return;
    setShowRevokeConfirm(true);
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

  const handleConfirmRevoke = async () => {
    setShowRevokeConfirm(false);
    setIsRevoking(true);
    try {
      console.log("Selected User IDs to revoke:", selectedUsers);

      // Strip the "revoke-" prefix if present
      const actualRoleId = roleId.startsWith("revoke-") 
        ? roleId.replace("revoke-", "") 
        : roleId;

      // Check if approval is required and workflow is selected
      if (requireApproval && selectedWorkflow && selectedWorkflow !== "none") {
        // Submit for approval workflow
        const approvalResponse = await submitUserRoleRevocationForApproval({
          userIds: selectedUsers,
          roleId: actualRoleId,
          workflowId: selectedWorkflow,
          justification: "User role revocation via role management",
          sendNotificationOnCompletion: sendNotification,
        });

        if (approvalResponse.success) {
          toast.success("Submitted for Approval", {
            description: "User role revocation has been submitted for approval workflow",
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
        // Direct revocation without approval
        const response = await revokeRole({
          userIds: selectedUsers,
          roleId: actualRoleId,
        });

        // Check if operation was denied (403 returns null)
        if (response === null) {
          return;
        }

        console.log("Revoke response:", response);

        // Show success message
        toast.success("Success", {
          description: `${response.totalSuccessful} user(s) revoked successfully${
            response.totalFailed > 0
              ? `, ${response.totalFailed} failed`
              : ""
          }`,
        });

        // Trigger refresh in parent to update badges
        onSuccess?.();

        // Reset filters and close
        resetFilters();
        onCancel();
      }
    } catch (error) {
      console.error("Error revoking role:", error);
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to revoke role",
      });
    } finally {
      setIsRevoking(false);
    }
  };

  // Show loading state
  if (isLoadingUsers) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Manual User Revocation</CardTitle>
          <CardDescription>
            Loading users for role revocation...
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
          <CardTitle className="text-lg">Manual User Revocation</CardTitle>
          <CardDescription>
            Error loading users for role revocation
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
          <CardTitle className="text-lg">Manual User Revocation</CardTitle>
          <CardDescription>
            Select specific users to revoke this role from. Changes take effect
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
          
          <Separator />
          
          <UserList filterByHasRole={true} />
          
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

      {/* Settings Card */}
      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revocation Settings</CardTitle>
            <CardDescription>
              Configure notification and approval options for this revocation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              {/* Send Notification */}
              <div className="flex items-center">
                <Label htmlFor="send-notification-revoke" className="mr-4">Send notification on revocation</Label>
                <Switch
                  id="send-notification-revoke"
                  checked={sendNotification}
                  onCheckedChange={setSendNotification}
                />
              </div>

              {/* Require Approval */}
              <div className="flex items-center">
                <Label htmlFor="require-approval-revoke" className="mr-4">Require owner approval</Label>
                <Switch
                  id="require-approval-revoke"
                  checked={requireApproval}
                  onCheckedChange={setRequireApproval}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows Card - Only show when approval is required */}
      {requireApproval && (
        <div className="mt-4 mb-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval Workflow</CardTitle>
              <CardDescription>
                Select a workflow to process the user role revocation approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="workflow-revoke">Revocation Workflow{requireApproval && " *"}</Label>
                <Select 
                  value={selectedWorkflow} 
                  onValueChange={setSelectedWorkflow}
                  disabled={isLoadingWorkflows || workflows.length === 0}
                >
                  <SelectTrigger id="workflow-revoke">
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

      {/* Form Actions - Outside Card */}
      <div className="flex justify-between items-center pt-4">
        <div className="flex flex-col gap-1">
          {!hasSelectionChanged && (
            <span className="text-sm text-muted-foreground">
              Select users to revoke their role
            </span>
          )}
          {requireApproval && !selectedWorkflow && hasSelectionChanged && (
            <span className="text-sm text-amber-600">
              ⚠️ Workflow required when approval is enabled
            </span>
          )}
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleCancelClick} disabled={isRevoking}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRevokeClick}
            disabled={!hasSelectionChanged || isRevoking || (requireApproval && !selectedWorkflow)}
          >
            {isRevoking
              ? requireApproval ? "Submitting..." : "Revoking..."
              : requireApproval && !selectedWorkflow
              ? "Select Workflow"
              : requireApproval
              ? `Submit ${selectedUsers.length} for Approval`
              : `Revoke from ${selectedUsers.length} User${
                  selectedUsers.length !== 1 ? "s" : ""
                }`}
          </Button>
        </div>
      </div>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={showRevokeConfirm} onOpenChange={setShowRevokeConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm User Revocation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {requireApproval ? 'submit for approval the' : ''} revoke {requireApproval ? 'of' : ''} the role from {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''}? 
              {requireApproval ? ' This will require approval before taking effect.' : ' This action will take effect immediately.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRevoke} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {requireApproval ? 'Submit for Approval' : 'Revoke Role'}
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
              Are you sure you want to cancel? Your selected users ({selectedUsers.length}) will not be revoked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
