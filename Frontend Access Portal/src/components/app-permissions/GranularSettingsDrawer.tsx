"use client";
import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  Eye,
  Code,
  User,
  FileText,
  Clock,
  Save,
  X,
  Trash2,
  Loader2,
} from "lucide-react";
import { assignPermissionToRole, updatePermissionForRole, deletePermissionFromRole, getPermissionDetails } from "./api/permission-management";
import { usePermissionMatrixContext } from "./contexts";
import { toast } from "sonner";

export const GranularSettingsDrawer: React.FC = () => {
  const { selectedCell, closeSelectedCell, permissions, selectedRole, refetch } =
    usePermissionMatrixContext();

  const [conditions, setConditions] = useState("");
  const [note, setNote] = useState("");
  const [activeTab, setActiveTab] = useState("conditions");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  
  // Approval workflow state
  const [requireApproval, setRequireApproval] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const [workflowValidationError, setWorkflowValidationError] = useState<string | null>(null);
  
  // Revocation approval state
  const [requireRevocationApproval, setRequireRevocationApproval] = useState(false);
  const [selectedRevocationWorkflowId, setSelectedRevocationWorkflowId] = useState<string>("");
  const [revocationWorkflows, setRevocationWorkflows] = useState<any[]>([]);
  const [isLoadingRevocationWorkflows, setIsLoadingRevocationWorkflows] = useState(false);
  const [revocationWorkflowValidationError, setRevocationWorkflowValidationError] = useState<string | null>(null);
  
  // Confirmation modals state
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  
  // Track initial data to detect changes
  const [initialData, setInitialData] = useState<{ 
    conditions: string; 
    note: string; 
    requireApproval: boolean; 
    workflowId: string;
    requireRevocationApproval: boolean;
    revocationWorkflowId: string;
  } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  if (!selectedCell) return null;

  const { moduleId, action, actionId } = selectedCell;
  
  // Get the current permission state
  const cellKey = `${moduleId}-${action}`;
  const currentPermission = permissions[selectedRole]?.[cellKey];
  const hasRole = currentPermission?.effect === "allow";

  // Create a unique key for this cell to force state reset
  const cellIdentifier = `${selectedRole}-${actionId}`;

  // Pre-fill the form if editing existing permission
  useEffect(() => {
    // Clear state immediately when cell changes
    setConditions("");
    setNote("");
    setRequireApproval(false);
    setSelectedWorkflowId("");
    setRequireRevocationApproval(false);
    setSelectedRevocationWorkflowId("");
    setIsFetchingDetails(false);
    setActiveTab("conditions");
    setHasUnsavedChanges(false);
    
    const fetchPermissionDetails = async () => {
      // Only fetch details if the permission actually exists (hasRole is true)
      if (hasRole && selectedRole && actionId) {
        setIsFetchingDetails(true);
        try {
          const details = await getPermissionDetails(selectedRole, actionId);
          const fetchedConditions = details.conditionScript || "";
          const fetchedNote = details.justification || "";
          
          setConditions(fetchedConditions);
          setNote(fetchedNote);
          setInitialData({ 
            conditions: fetchedConditions, 
            note: fetchedNote, 
            requireApproval: false, 
            workflowId: "",
            requireRevocationApproval: false,
            revocationWorkflowId: ""
          });
        } catch (error: any) {
          // Silently handle 404 errors - permission doesn't exist yet
          if (!error.message?.includes('404')) {
            console.error("Error fetching permission details:", error);
          }
          // Keep fields empty for new assignments
          setConditions("");
          setNote("");
          setInitialData({ 
            conditions: "", 
            note: "", 
            requireApproval: false, 
            workflowId: "",
            requireRevocationApproval: false,
            revocationWorkflowId: ""
          });
        } finally {
          setIsFetchingDetails(false);
        }
      } else {
        // New permission assignment - don't fetch, just initialize empty
        setInitialData({ 
          conditions: "", 
          note: "", 
          requireApproval: false, 
          workflowId: "",
          requireRevocationApproval: false,
          revocationWorkflowId: ""
        });
      }
    };

    fetchPermissionDetails();
  }, [selectedRole, actionId, hasRole]);
  
  // Fetch workflows when requireApproval becomes true
  useEffect(() => {
    if (requireApproval && !hasRole) {
      setIsLoadingWorkflows(true);
      setWorkflowValidationError(null);
      
      // Fetch event-based workflows that support permission.assigned events
      fetch('/api/workflows?size=100')
        .then(res => res.json())
        .then(data => {
          console.log('[GranularSettings] Raw API response:', data);
          
          let workflowList = [];
          if (Array.isArray(data)) {
            workflowList = data;
          } else if (data.data && Array.isArray(data.data.content)) {
            workflowList = data.data.content;
          } else if (data.content && Array.isArray(data.content)) {
            workflowList = data.content;
          }
          
          console.log('[GranularSettings] Fetched workflows:', workflowList);
          
          // Filter workflows that are:
          // 1. Event-based (triggerType = EVENT_BASED or event-based)
          // 2. Have permission.assigned in their eventTypes
          // 3. Status is ACTIVE only
          const permissionApprovalWorkflows = workflowList.filter((wf: any) => {
            const status = wf.status?.toUpperCase();
            const isActive = status === 'ACTIVE';
            const triggerType = wf.triggerType?.toUpperCase();
            const isEventBased = triggerType === 'EVENT_BASED' || triggerType === 'EVENT-BASED';
            const eventTypes = wf.eventConfig?.eventTypes || [];
            const hasPermissionAssigned = eventTypes.includes('permission.assigned');
            
            console.log(`[GranularSettings] Workflow "${wf.name}":`, {
              status: wf.status,
              isActive,
              triggerType: wf.triggerType,
              isEventBased,
              eventTypes,
              hasPermissionAssigned,
              willInclude: isActive && isEventBased && hasPermissionAssigned
            });
            
            return isActive && isEventBased && hasPermissionAssigned;
          });
          
          console.log('[GranularSettings] Filtered permission approval workflows:', permissionApprovalWorkflows);
          setWorkflows(permissionApprovalWorkflows);
          // Auto-select first workflow if available
          if (permissionApprovalWorkflows.length > 0 && !selectedWorkflowId) {
            setSelectedWorkflowId(permissionApprovalWorkflows[0].id);
          }
        })
        .catch(err => {
          console.error('Failed to fetch workflows:', err);
          setWorkflows([]);
          setWorkflowValidationError('Failed to load workflows. Please try again.');
        })
        .finally(() => setIsLoadingWorkflows(false));
    } else {
      setWorkflows([]);
      setWorkflowValidationError(null);
      setSelectedWorkflowId("");
    }
  }, [requireApproval, hasRole]);
  
  // Fetch revocation workflows when requireRevocationApproval becomes true
  useEffect(() => {
    if (requireRevocationApproval && hasRole) {
      setIsLoadingRevocationWorkflows(true);
      setRevocationWorkflowValidationError(null);
      
      // Fetch event-based workflows that support permission.revoked events
      fetch('/api/workflows?size=100')
        .then(res => res.json())
        .then(data => {
          console.log('[GranularSettings] Raw API response (revocation):', data);
          
          let workflowList = [];
          if (Array.isArray(data)) {
            workflowList = data;
          } else if (data.data && Array.isArray(data.data.content)) {
            workflowList = data.data.content;
          } else if (data.content && Array.isArray(data.content)) {
            workflowList = data.content;
          }
          
          console.log('[GranularSettings] Fetched workflows (revocation):', workflowList);
          
          // Filter workflows for permission.revoked
          const permissionRevocationWorkflows = workflowList.filter((wf: any) => {
            const status = wf.status?.toUpperCase();
            const isActive = status === 'ACTIVE';
            const triggerType = wf.triggerType?.toUpperCase();
            const isEventBased = triggerType === 'EVENT_BASED' || triggerType === 'EVENT-BASED';
            const eventTypes = wf.eventConfig?.eventTypes || [];
            const hasPermissionRevoked = eventTypes.includes('permission.revoked');
            
            console.log(`[GranularSettings] Workflow "${wf.name}" (revocation):`, {
              status: wf.status,
              isActive,
              triggerType: wf.triggerType,
              isEventBased,
              eventTypes,
              hasPermissionRevoked,
              willInclude: isActive && isEventBased && hasPermissionRevoked
            });
            
            return isActive && isEventBased && hasPermissionRevoked;
          });
          
          console.log('[GranularSettings] Filtered permission revocation workflows:', permissionRevocationWorkflows);
          setRevocationWorkflows(permissionRevocationWorkflows);
          // Auto-select first workflow if available
          if (permissionRevocationWorkflows.length > 0 && !selectedRevocationWorkflowId) {
            setSelectedRevocationWorkflowId(permissionRevocationWorkflows[0].id);
          }
        })
        .catch(err => {
          console.error('Failed to fetch revocation workflows:', err);
          setRevocationWorkflows([]);
          setRevocationWorkflowValidationError('Failed to load workflows. Please try again.');
        })
        .finally(() => setIsLoadingRevocationWorkflows(false));
    } else {
      setRevocationWorkflows([]);
      setRevocationWorkflowValidationError(null);
      setSelectedRevocationWorkflowId("");
    }
  }, [requireRevocationApproval, hasRole]);
  
  // Check for unsaved changes
  useEffect(() => {
    if (!initialData) return;
    
    const hasChanges = 
      conditions !== initialData.conditions || 
      note !== initialData.note ||
      requireApproval !== initialData.requireApproval ||
      selectedWorkflowId !== initialData.workflowId ||
      requireRevocationApproval !== initialData.requireRevocationApproval ||
      selectedRevocationWorkflowId !== initialData.revocationWorkflowId;
    setHasUnsavedChanges(hasChanges);
  }, [conditions, note, requireApproval, selectedWorkflowId, requireRevocationApproval, selectedRevocationWorkflowId, initialData]);

  // Handle save button click (shows confirmation)
  const handleSaveClick = () => {
    if (!note.trim()) {
      toast.error("Justification is required");
      return;
    }
    
    // Validate workflow selection if requireApproval is enabled
    if (requireApproval && !hasRole) {
      if (!selectedWorkflowId) {
        toast.error("Please select an approval workflow");
        setWorkflowValidationError("Please select a workflow");
        return;
      }
    }
    
    setShowSaveConfirm(true);
  };

  // Actual save after confirmation
  const handleConfirmSave = async () => {
    setIsLoading(true);
    setShowSaveConfirm(false);
    
    try {
      if (hasRole) {
        // Update existing permission
        const result = await updatePermissionForRole(selectedRole, actionId, {
          justification: note,
          conditionScript: conditions || undefined,
        });
        
        // Only show success if operation didn't return null (403 returns null)
        if (result !== null) {
          toast.success("Permission updated successfully");
          // Refresh the permissions data
          await refetch();
          closeSelectedCell();
        }
      } else {
        // Check if approval workflow is required
        if (requireApproval && selectedWorkflowId) {
          // Submit for approval
          const response = await fetch(`/api/roles/${selectedRole}/permissions/assign/submit-for-approval`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              actionId: actionId,
              justification: note,
              conditionScript: conditions || undefined,
              workflowId: selectedWorkflowId,
            }),
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            toast.error(result.error || "Failed to submit permission for approval");
            return;
          }
          
          toast.success("Permission submitted for approval", {
            description: "The permission will be assigned after approval by role owners"
          });
          
          // Refresh the permissions data
          await refetch();
          closeSelectedCell();
        } else {
          // Assign new permission immediately
          const result = await assignPermissionToRole(selectedRole, {
            actionId: actionId,
            justification: note,
            conditionScript: conditions || undefined,
          });
          
          // Only show success if operation didn't return null (403 returns null)
          if (result !== null) {
            toast.success("Permission assigned successfully");
            // Refresh the permissions data
            await refetch();
            closeSelectedCell();
          }
        }
      }
    } catch (error) {
      console.error("Error saving permission:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save permission");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete button click (shows confirmation)
  const handleDeleteClick = () => {
    // Validate revocation workflow selection if requireRevocationApproval is enabled
    if (requireRevocationApproval) {
      if (!selectedRevocationWorkflowId) {
        toast.error("Please select a revocation approval workflow");
        setRevocationWorkflowValidationError("Please select a workflow");
        return;
      }
    }
    setShowDeleteConfirm(true);
  };

  // Actual delete after confirmation
  const handleConfirmDelete = async () => {
    setIsLoading(true);
    setShowDeleteConfirm(false);
    
    try {
      // Check if revocation approval workflow is required
      if (requireRevocationApproval && selectedRevocationWorkflowId) {
        // Submit for revocation approval
        const response = await fetch(`/api/roles/${selectedRole}/permissions/revoke/submit-for-approval`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            actionId: actionId,
            justification: note || "Permission revocation request",
            workflowId: selectedRevocationWorkflowId,
          }),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          toast.error(result.error || "Failed to submit permission revocation for approval");
          return;
        }
        
        toast.success("Permission revocation submitted for approval", {
          description: "The permission will be revoked after approval by role owners"
        });
        
        // Refresh the permissions data
        await refetch();
        closeSelectedCell();
      } else {
        // Delete permission immediately
        const result = await deletePermissionFromRole(selectedRole, actionId);
        
        // Only show success if operation didn't return null (403 returns null)
        if (result !== null) {
          toast.success("Permission deleted successfully");
          // Refresh the permissions data
          await refetch();
          closeSelectedCell();
        }
      }
    } catch (error) {
      console.error("Error deleting permission:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete permission");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle close button click
  const handleCloseClick = () => {
    if (isLoading) {
      return;
    }
    
    // If there are unsaved changes, show discard confirmation
    if (hasUnsavedChanges) {
      setShowDiscardConfirm(true);
    } else {
      closeSelectedCell();
    }
  };
  
  // Discard changes and close
  const handleDiscardChanges = () => {
    setShowDiscardConfirm(false);
    closeSelectedCell();
  };
  
  // Keep editing (cancel discard)
  const handleKeepEditing = () => {
    setShowDiscardConfirm(false);
  };

  // Handle Sheet's built-in close (X button or overlay click)
  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      handleCloseClick();
    }
  };

  return (
    <Sheet key={cellIdentifier} open={true} onOpenChange={handleSheetOpenChange}>
      <SheetContent className="w-[600px] p-6 sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>
              {hasRole ? "Update" : "Assign"} Permission
            </span>
          </SheetTitle>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Badge variant="outline">{action}</Badge>
            {hasRole && (
              <Badge variant="default" className="bg-green-600">
                Has Permission
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {isFetchingDetails ? (
            <>
              {/* Skeleton for Tabs */}
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <div className="h-9 w-1/2 bg-gray-200 animate-pulse rounded" />
                  <div className="h-9 w-1/2 bg-gray-200 animate-pulse rounded" />
                </div>
                
                {/* Skeleton for Card */}
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="h-6 w-48 bg-gray-200 animate-pulse rounded" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                    <div className="h-32 bg-gray-200 animate-pulse rounded" />
                  </div>
                  <div className="h-16 bg-blue-50 border border-blue-200 rounded-lg" />
                </div>
              </div>

              {/* Skeleton for Notes Card */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="h-6 w-48 bg-gray-200 animate-pulse rounded" />
                <div className="h-24 bg-gray-200 animate-pulse rounded" />
              </div>

              {/* Skeleton for Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex space-x-2">
                  <div className="h-10 w-24 bg-gray-200 animate-pulse rounded" />
                  <div className="h-10 w-40 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="h-10 w-44 bg-gray-200 animate-pulse rounded" />
              </div>
            </>
          ) : (
            <>
          {/* Detailed Settings Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="conditions" className="text-xs">
                Rules
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs">
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="conditions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center space-x-2">
                    <Code className="h-4 w-4" />
                    <span>Conditional Rules (ABAC)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="conditions">Condition Script (Optional)</Label>
                    <Textarea
                      key={`conditions-${cellIdentifier}`}
                      id="conditions"
                      placeholder="e.g., user.email.endsWith('@gmail.com') || user.status == 'ACTIVE'"
                      value={conditions}
                      onChange={(e) => setConditions(e.target.value)}
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
                    <div className="text-sm font-medium text-blue-900">
                      Available Variables
                    </div>
                    <div className="text-xs text-blue-700 mt-1">
                      user.department, user.country, user.role, user.email, user.status, target.owner,
                      target.environment
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Permission Preview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium mb-2">
                        Effective Permission
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={hasRole ? "default" : "secondary"}>
                          {hasRole ? "HAS ACCESS" : "NO ACCESS"}
                        </Badge>
                        {conditions && (
                          <Badge variant="outline">Conditional</Badge>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="text-sm text-gray-600">
                      <p className="mb-2">
                        <strong>Action:</strong> {action}
                      </p>
                      <p>
                        {hasRole 
                          ? "This role currently has this permission. You can update the conditions or delete it."
                          : "This role does not have this permission. Assign it to grant access."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Notes & Justification</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                key={`note-${cellIdentifier}`}
                placeholder="Reason for this permission change..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Approval Workflow Section - Only for new assignments */}
          {!hasRole && (
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Require Owner Approval</Label>
                    <p className="text-xs text-muted-foreground">
                      Submit this permission for approval instead of immediate assignment
                    </p>
                  </div>
                  <Switch
                    checked={requireApproval}
                    onCheckedChange={(checked) => {
                      setRequireApproval(checked);
                      if (!checked) {
                        setSelectedWorkflowId("");
                        setWorkflowValidationError(null);
                      }
                    }}
                  />
                </div>

                {requireApproval && (
                  <div className="space-y-2">
                    <Label htmlFor="workflow">
                      Select Workflow
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    {isLoadingWorkflows ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2 text-sm text-muted-foreground">Loading workflows...</span>
                      </div>
                    ) : workflows.length === 0 ? (
                      <div className="text-sm text-muted-foreground py-2 p-3 border border-amber-200 bg-amber-50 rounded-lg">
                        No permission approval workflows found. Please create a workflow with event type "permission.assigned" first.
                      </div>
                    ) : (
                      <>
                        <Select
                          value={selectedWorkflowId}
                          onValueChange={(value) => {
                            setSelectedWorkflowId(value);
                            setWorkflowValidationError(null);
                          }}
                        >
                          <SelectTrigger id="workflow" className={workflowValidationError ? "border-destructive" : ""}>
                            <SelectValue placeholder="Select a workflow" />
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
                        {workflowValidationError && (
                          <p className="text-sm text-destructive mt-2">
                            {workflowValidationError}
                          </p>
                        )}
                        {selectedWorkflowId && !workflowValidationError && (
                          <p className="text-xs text-muted-foreground mt-2">
                            ✓ Selected: {workflows.find(w => w.id === selectedWorkflowId)?.name}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Revocation Approval Workflow Section - Only when editing existing permission */}
          {hasRole && (
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Require Owner Approval</Label>
                    <p className="text-xs text-muted-foreground">
                      Submit this revocation for approval instead of immediate deletion
                    </p>
                  </div>
                  <Switch
                    checked={requireRevocationApproval}
                    onCheckedChange={(checked) => {
                      setRequireRevocationApproval(checked);
                      if (!checked) {
                        setSelectedRevocationWorkflowId("");
                        setRevocationWorkflowValidationError(null);
                      }
                    }}
                  />
                </div>

                {requireRevocationApproval && (
                  <div className="space-y-2">
                    <Label htmlFor="revocation-workflow">
                      Select Workflow
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    {isLoadingRevocationWorkflows ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2 text-sm text-muted-foreground">Loading workflows...</span>
                      </div>
                    ) : revocationWorkflows.length === 0 ? (
                      <div className="text-sm text-muted-foreground py-2 p-3 border border-amber-200 bg-amber-50 rounded-lg">
                        No permission revocation workflows found. Please create a workflow with event type "permission.revoked" first.
                      </div>
                    ) : (
                      <>
                        <Select
                          value={selectedRevocationWorkflowId}
                          onValueChange={(value) => {
                            setSelectedRevocationWorkflowId(value);
                            setRevocationWorkflowValidationError(null);
                          }}
                        >
                          <SelectTrigger id="revocation-workflow" className={revocationWorkflowValidationError ? "border-destructive" : ""}>
                            <SelectValue placeholder="Select a workflow" />
                          </SelectTrigger>
                          <SelectContent>
                            {revocationWorkflows.map((workflow) => (
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
                        {revocationWorkflowValidationError && (
                          <p className="text-sm text-destructive mt-2">
                            {revocationWorkflowValidationError}
                          </p>
                        )}
                        {selectedRevocationWorkflowId && !revocationWorkflowValidationError && (
                          <p className="text-xs text-muted-foreground mt-2">
                            ✓ Selected: {revocationWorkflows.find(w => w.id === selectedRevocationWorkflowId)?.name}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCloseClick} disabled={isLoading}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              {hasRole && (
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteClick}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {requireRevocationApproval && selectedRevocationWorkflowId
                    ? "Submit Revocation for Approval"
                    : "Delete Permission"}
                </Button>
              )}
            </div>
            <Button onClick={handleSaveClick} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading 
                ? "Saving..." 
                : hasRole 
                  ? "Update Permission" 
                  : requireApproval && selectedWorkflowId
                    ? "Submit for Approval"
                    : "Assign Permission"}
            </Button>
          </div>
          
          {/* Save Confirmation Dialog */}
          <AlertDialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {hasRole 
                    ? "Update Permission" 
                    : requireApproval && selectedWorkflowId
                      ? "Submit for Approval"
                      : "Assign Permission"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {hasRole 
                    ? "Are you sure you want to update this permission for the role? This will modify the existing permission."
                    : requireApproval && selectedWorkflowId
                      ? "Are you sure you want to submit this permission assignment for approval? Role owners will be notified to approve the request."
                      : "Are you sure you want to assign this permission to the role? This will grant new access immediately."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmSave} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {hasRole 
                    ? "Update Permission" 
                    : requireApproval && selectedWorkflowId
                      ? "Submit for Approval"
                      : "Assign Permission"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {requireRevocationApproval && selectedRevocationWorkflowId
                    ? "Submit Revocation for Approval"
                    : "Delete Permission"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {requireRevocationApproval && selectedRevocationWorkflowId
                    ? "Are you sure you want to submit this permission revocation for approval? Role owners will be notified to approve the request."
                    : "Are you sure you want to delete this permission? This action cannot be undone and will remove the permission from this role immediately."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleConfirmDelete} 
                  disabled={isLoading}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {requireRevocationApproval && selectedRevocationWorkflowId
                    ? "Submit for Approval"
                    : "Delete Permission"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Discard Changes Confirmation */}
          <AlertDialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
                <AlertDialogDescription>
                  You have unsaved changes. Are you sure you want to close without saving?
                  Your changes will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={handleKeepEditing}>Keep Editing</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDiscardChanges}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Discard Changes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
