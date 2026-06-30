"use client";
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Info, X, Save, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";

export interface BulkConfigItem {
  moduleId: string;
  moduleName: string;
  action: string;
  actionId: string;
  justification: string;
  conditionScript: string;
}

export interface BulkConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: BulkConfigItem[];
  bulkMode: "assign" | "revoke";
  onSubmit: (items: BulkConfigItem[]) => Promise<void>;
  onRevoke?: (actionIds: string[]) => Promise<void>;
  onSubmitForApproval?: (items: BulkConfigItem[], workflowId: string) => Promise<void>;
  onRevokeForApproval?: (actionIds: string[], justification: string, workflowId: string) => Promise<void>;
}

export const BulkConfigDialog: React.FC<BulkConfigDialogProps> = ({
  open,
  onOpenChange,
  items,
  bulkMode,
  onSubmit,
  onRevoke,
  onSubmitForApproval,
  onRevokeForApproval,
}) => {
  const [activeTab, setActiveTab] = useState<"quick" | "individual">("quick");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<"quick" | "individual" | null>(null);

  // Quick apply state (same config for all)
  const [quickJustification, setQuickJustification] = useState("");
  const [quickCondition, setQuickCondition] = useState("");

  // Individual config state
  const [individualItems, setIndividualItems] = useState<BulkConfigItem[]>(items);

  // Approval workflow state
  const [requireApproval, setRequireApproval] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const [workflowValidationError, setWorkflowValidationError] = useState<string | null>(null);

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setActiveTab("quick");
      setQuickJustification("");
      setQuickCondition("");
      setIndividualItems(items.map(item => ({
        ...item,
        justification: "",
        conditionScript: "",
      })));
      setError(null);
      setIsSubmitting(false);
      setRequireApproval(false);
      setSelectedWorkflowId("");
      setWorkflows([]);
      setWorkflowValidationError(null);
    }
  }, [open, items]);

  // Fetch workflows when requireApproval changes
  React.useEffect(() => {
    if (requireApproval && open) {
      setIsLoadingWorkflows(true);
      setWorkflowValidationError(null);
      
      // Determine which event type to filter by
      const eventType = bulkMode === "assign" 
        ? "permission.bulk.assigned" 
        : "permission.bulk.revoked";
      
      fetch('/api/workflows?size=100')
        .then(res => res.json())
        .then(data => {
          let workflowList = [];
          if (Array.isArray(data)) {
            workflowList = data;
          } else if (data.data && Array.isArray(data.data.content)) {
            workflowList = data.data.content;
          } else if (data.content && Array.isArray(data.content)) {
            workflowList = data.content;
          }
          
          // Filter workflows for bulk operations
          const bulkWorkflows = workflowList.filter((wf: any) => {
            const status = wf.status?.toUpperCase();
            const isActive = status === 'ACTIVE';
            const triggerType = wf.triggerType?.toUpperCase();
            const isEventBased = triggerType === 'EVENT_BASED' || triggerType === 'EVENT-BASED';
            const eventTypes = wf.eventConfig?.eventTypes || [];
            const hasEventType = eventTypes.includes(eventType);
            
            return isActive && isEventBased && hasEventType;
          });
          
          setWorkflows(bulkWorkflows);
          // Auto-select first workflow if available
          if (bulkWorkflows.length > 0 && !selectedWorkflowId) {
            setSelectedWorkflowId(bulkWorkflows[0].id);
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
  }, [requireApproval, open, bulkMode]);

  // Show confirmation dialog before executing
  const handleQuickApplyClick = () => {
    // Validate first
    if (bulkMode === "revoke" && !quickJustification.trim()) {
      setError("Justification is required for revocation");
      return;
    }
    if (bulkMode === "assign" && !quickJustification.trim()) {
      setError("Justification is required");
      return;
    }
    if (requireApproval && !selectedWorkflowId) {
      setError("Please select an approval workflow");
      setWorkflowValidationError("Please select a workflow");
      return;
    }
    
    // Show confirmation
    setPendingAction("quick");
    setShowConfirmation(true);
  };

  const handleIndividualSubmitClick = () => {
    // Validate all items have justification
    const missingJustification = individualItems.some(
      item => !item.justification.trim()
    );

    if (missingJustification) {
      setError("All permissions must have a justification");
      return;
    }

    if (requireApproval && !selectedWorkflowId) {
      setError("Please select an approval workflow");
      setWorkflowValidationError("Please select a workflow");
      return;
    }

    // Show confirmation
    setPendingAction("individual");
    setShowConfirmation(true);
  };

  const handleConfirmAction = async () => {
    setShowConfirmation(false);
    if (pendingAction === "quick") {
      await executeQuickApply();
    } else if (pendingAction === "individual") {
      await executeIndividualSubmit();
    }
    setPendingAction(null);
  };

  const executeQuickApply = async () => {
    if (bulkMode === "revoke") {
      // Validate justification for revoke
      if (!quickJustification.trim()) {
        setError("Justification is required for revocation");
        return;
      }

      // Check if approval is required
      if (requireApproval) {
        if (!selectedWorkflowId) {
          setError("Please select an approval workflow");
          setWorkflowValidationError("Please select a workflow");
          return;
        }

        if (!onRevokeForApproval) {
          setError("Revoke approval handler not provided");
          return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
          const actionIds = items.map(item => item.actionId);
          await onRevokeForApproval(actionIds, quickJustification, selectedWorkflowId);
          toast.success("Bulk revocation submitted for approval", {
            description: `${items.length} permissions will be revoked after approval`
          });
          onOpenChange(false);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to submit revocation for approval");
        } finally {
          setIsSubmitting(false);
        }
        return;
      }

      // Immediate revoke without approval
      if (!onRevoke) {
        setError("Revoke handler not provided");
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const actionIds = items.map(item => item.actionId);
        await onRevoke(actionIds);
        toast.success(`${items.length} permissions revoked successfully`);
        onOpenChange(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to revoke permissions");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Assign mode validation
    if (!quickJustification.trim()) {
      setError("Justification is required");
      return;
    }

    // Check if approval is required
    if (requireApproval) {
      if (!selectedWorkflowId) {
        setError("Please select an approval workflow");
        setWorkflowValidationError("Please select a workflow");
        return;
      }

      if (!onSubmitForApproval) {
        setError("Approval handler not provided");
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const configuredItems = items.map(item => ({
          ...item,
          justification: quickJustification,
          conditionScript: quickCondition,
        }));

        await onSubmitForApproval(configuredItems, selectedWorkflowId);
        toast.success("Bulk assignment submitted for approval", {
          description: `${items.length} permissions will be assigned after approval`
        });
        onOpenChange(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit for approval");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Immediate assignment without approval
    setIsSubmitting(true);
    setError(null);

    try {
      const configuredItems = items.map(item => ({
        ...item,
        justification: quickJustification,
        conditionScript: quickCondition,
      }));

      await onSubmit(configuredItems);
      toast.success(`${items.length} permissions assigned successfully`);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign permissions");
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeIndividualSubmit = async () => {
    // Check if approval is required
    if (requireApproval) {
      if (!onSubmitForApproval) {
        setError("Approval handler not provided");
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        await onSubmitForApproval(individualItems, selectedWorkflowId);
        toast.success("Bulk assignment submitted for approval", {
          description: `${individualItems.length} permissions will be assigned after approval`
        });
        onOpenChange(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit for approval");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Immediate assignment without approval
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(individualItems);
      toast.success(`${individualItems.length} permissions assigned successfully`);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign permissions");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateIndividualItem = (
    index: number,
    field: "justification" | "conditionScript",
    value: string
  ) => {
    setIndividualItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px] flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl">
                {bulkMode === "assign" ? "Configure" : "Revoke"} {items.length} Permissions
              </SheetTitle>
              <SheetDescription className="mt-1">
                {bulkMode === "assign"
                  ? "Configure permissions for bulk assignment. All assignments will be applied atomically."
                  : "Revoke the selected permissions. This action will remove all permissions atomically."}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden px-6 py-4">
          {bulkMode === "revoke" ? (
            // Revoke Mode: Show confirmation
            <div className="space-y-4 h-full flex flex-col">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> You are about to revoke {items.length} permission{items.length !== 1 ? "s" : ""}.
                  This action cannot be undone.
                </AlertDescription>
              </Alert>

              {/* Justification for revocation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Revocation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="revoke-justification">
                      Justification <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="revoke-justification"
                      placeholder="Reason for revoking these permissions..."
                      value={quickJustification}
                      onChange={(e) => setQuickJustification(e.target.value)}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Provide a reason for revoking {items.length} permissions
                    </p>
                  </div>

                  <Separator className="my-4" />

                  {/* Approval Workflow Section for Revoke */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="require-revoke-approval">Require Owner Approval</Label>
                        <p className="text-xs text-muted-foreground">
                          Submit revocation for approval by role owners
                        </p>
                      </div>
                      <Switch
                        id="require-revoke-approval"
                        checked={requireApproval}
                        onCheckedChange={setRequireApproval}
                      />
                    </div>

                    {requireApproval && (
                      <div className="space-y-2">
                        <Label htmlFor="revoke-workflow-select">
                          Approval Workflow <span className="text-red-500">*</span>
                        </Label>
                        {isLoadingWorkflows ? (
                          <div className="flex items-center gap-2 p-2 border rounded">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">Loading workflows...</span>
                          </div>
                        ) : workflows.length === 0 ? (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              No active approval workflows found for bulk revocation.
                              Please create a workflow with trigger type "permission.bulk.revoked".
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <>
                            <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
                              <SelectTrigger id="revoke-workflow-select" className={workflowValidationError ? "border-red-500" : ""}>
                                <SelectValue placeholder="Select approval workflow" />
                              </SelectTrigger>
                              <SelectContent>
                                {workflows.map((wf: any) => (
                                  <SelectItem key={wf.id} value={wf.id}>
                                    {wf.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {workflowValidationError && (
                              <p className="text-xs text-red-500">{workflowValidationError}</p>
                            )}
                            {selectedWorkflowId && (
                              <p className="text-xs text-muted-foreground">
                                Selected: {workflows.find((wf: any) => wf.id === selectedWorkflowId)?.name}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="text-base">Permissions to Revoke</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {items.map((item, index) => (
                        <div
                          key={`${item.moduleId}-${item.action}`}
                          className="flex items-center justify-between p-3 border rounded-lg bg-destructive/5"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <div>
                              <div className="font-medium text-sm">{item.moduleName}</div>
                              <div className="text-xs text-muted-foreground capitalize">
                                {item.action}
                              </div>
                            </div>
                          </div>
                          <Badge variant="destructive" className="text-xs">Revoke</Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Assign Mode: Show tabs with configuration
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="quick">
                  Quick Apply
                  <Badge variant="secondary" className="ml-2">Same for All</Badge>
                </TabsTrigger>
                <TabsTrigger value="individual">
                  Configure Individually
                  <Badge variant="secondary" className="ml-2">{items.length} Items</Badge>
                </TabsTrigger>
              </TabsList>

            <TabsContent value="quick" className="flex-1 space-y-4 overflow-auto mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Apply Same Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="quick-justification">
                      Justification <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="quick-justification"
                      placeholder="e.g., Required for Q1 audit compliance"
                      value={quickJustification}
                      onChange={(e) => setQuickJustification(e.target.value)}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be applied to all {items.length} permissions
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quick-condition">
                      Condition Script <span className="text-muted-foreground">(Optional)</span>
                    </Label>
                    <Textarea
                      id="quick-condition"
                      placeholder="e.g., user.department == 'Finance'"
                      value={quickCondition}
                      onChange={(e) => setQuickCondition(e.target.value)}
                      rows={4}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty for unconditional access
                    </p>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Available Variables:</strong> user.department, user.country,
                      user.role, user.email, user.status
                    </AlertDescription>
                  </Alert>

                  <Separator className="my-4" />

                  {/* Approval Workflow Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="require-approval">Require Owner Approval</Label>
                        <p className="text-xs text-muted-foreground">
                          Submit for approval by role owners
                        </p>
                      </div>
                      <Switch
                        id="require-approval"
                        checked={requireApproval}
                        onCheckedChange={setRequireApproval}
                      />
                    </div>

                    {requireApproval && (
                      <div className="space-y-2">
                        <Label htmlFor="workflow-select">
                          Approval Workflow <span className="text-red-500">*</span>
                        </Label>
                        {isLoadingWorkflows ? (
                          <div className="flex items-center gap-2 p-2 border rounded">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">Loading workflows...</span>
                          </div>
                        ) : workflows.length === 0 ? (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              No active approval workflows found for bulk {bulkMode === "assign" ? "assignment" : "revocation"}.
                              Please create a workflow with trigger type "permission.bulk.{bulkMode === "assign" ? "assigned" : "revoked"}".
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <>
                            <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
                              <SelectTrigger id="workflow-select" className={workflowValidationError ? "border-red-500" : ""}>
                                <SelectValue placeholder="Select approval workflow" />
                              </SelectTrigger>
                              <SelectContent>
                                {workflows.map((wf: any) => (
                                  <SelectItem key={wf.id} value={wf.id}>
                                    {wf.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {workflowValidationError && (
                              <p className="text-xs text-red-500">{workflowValidationError}</p>
                            )}
                            {selectedWorkflowId && (
                              <p className="text-xs text-muted-foreground">
                                Selected: {workflows.find((wf: any) => wf.id === selectedWorkflowId)?.name}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Selected Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {items.map((item, index) => (
                        <div
                          key={`${item.moduleId}-${item.action}`}
                          className="flex items-center justify-between p-2 border rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <div>
                              <div className="font-medium text-sm">{item.moduleName}</div>
                              <div className="text-xs text-muted-foreground capitalize">
                                {item.action}
                              </div>
                            </div>
                          </div>
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="individual" className="flex-1 overflow-auto mt-0">
              <ScrollArea className="h-full">
                <div className="space-y-4 pr-4">
                  {individualItems.map((item, index) => (
                    <Card key={`${item.moduleId}-${item.action}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge>{index + 1}</Badge>
                            <CardTitle className="text-base">{item.moduleName}</CardTitle>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {item.action}
                          </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor={`justification-${index}`}>
                          Justification <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id={`justification-${index}`}
                          placeholder="Reason for this permission..."
                          value={item.justification}
                          onChange={(e) =>
                            updateIndividualItem(index, "justification", e.target.value)
                          }
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`condition-${index}`}>
                          Condition <span className="text-muted-foreground">(Optional)</span>
                        </Label>
                        <Textarea
                          id={`condition-${index}`}
                          placeholder="e.g., user.department == 'Finance'"
                          value={item.conditionScript}
                          onChange={(e) =>
                            updateIndividualItem(index, "conditionScript", e.target.value)
                          }
                          rows={3}
                          className="font-mono text-sm"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                  {/* Approval Workflow Section for Individual Tab */}
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-base">Approval Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="require-individual-approval">Require Owner Approval</Label>
                          <p className="text-xs text-muted-foreground">
                            Submit for approval by role owners
                          </p>
                        </div>
                        <Switch
                          id="require-individual-approval"
                          checked={requireApproval}
                          onCheckedChange={setRequireApproval}
                        />
                      </div>

                      {requireApproval && (
                        <div className="space-y-2">
                          <Label htmlFor="workflow-select-individual">
                            Approval Workflow <span className="text-red-500">*</span>
                          </Label>
                          {isLoadingWorkflows ? (
                            <div className="flex items-center gap-2 p-2 border rounded">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm text-muted-foreground">Loading workflows...</span>
                            </div>
                          ) : workflows.length === 0 ? (
                            <Alert variant="destructive">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                No active approval workflows found for bulk assignment.
                                Please create a workflow with trigger type "permission.bulk.assigned".
                              </AlertDescription>
                            </Alert>
                          ) : (
                            <>
                              <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
                                <SelectTrigger id="workflow-select-individual" className={workflowValidationError ? "border-red-500" : ""}>
                                  <SelectValue placeholder="Select approval workflow" />
                                </SelectTrigger>
                                <SelectContent>
                                  {workflows.map((wf: any) => (
                                    <SelectItem key={wf.id} value={wf.id}>
                                      {wf.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {workflowValidationError && (
                                <p className="text-xs text-red-500">{workflowValidationError}</p>
                              )}
                              {selectedWorkflowId && (
                                <p className="text-xs text-muted-foreground">
                                  Selected: {workflows.find((wf: any) => wf.id === selectedWorkflowId)?.name}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
        </Tabs>
          )}
        </div>

      {error && (
        <div className="px-6 py-2">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <Separator />
      <div className="px-6 py-4 flex items-center justify-between bg-muted/30">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          onClick={bulkMode === "revoke" ? handleQuickApplyClick : (activeTab === "quick" ? handleQuickApplyClick : handleIndividualSubmitClick)}
          disabled={isSubmitting}
          variant={bulkMode === "revoke" ? "destructive" : "default"}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isSubmitting ? (
            requireApproval ? "Submitting..." : (bulkMode === "revoke" ? "Revoking..." : "Assigning...")
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {requireApproval 
                ? `Submit ${items.length} ${bulkMode === "revoke" ? "Revocations" : "Assignments"} for Approval`
                : `${bulkMode === "revoke" ? "Revoke" : "Assign"} ${items.length} Permissions`
              }
            </>
          )}
        </Button>
      </div>
    </SheetContent>

    {/* Confirmation Dialog */}
    <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {requireApproval 
              ? `Submit ${bulkMode === "revoke" ? "Revocation" : "Assignment"} for Approval`
              : `${bulkMode === "revoke" ? "Revoke" : "Assign"} Permissions`
            }
          </AlertDialogTitle>
          <AlertDialogDescription>
            {requireApproval ? (
              bulkMode === "revoke" ? (
                <>
                  Are you sure you want to submit revocation of <strong>{items.length}</strong> permission{items.length !== 1 ? "s" : ""} for approval?
                  This will create an approval request that needs to be reviewed by role owners.
                </>
              ) : (
                <>
                  Are you sure you want to submit <strong>{items.length}</strong> permission{items.length !== 1 ? "s" : ""} for approval?
                  This will create an approval request that needs to be reviewed by role owners.
                </>
              )
            ) : (
              bulkMode === "revoke" ? (
                <>
                  Are you sure you want to revoke <strong>{items.length}</strong> permission{items.length !== 1 ? "s" : ""}?
                  This action will immediately remove the selected permissions from the role.
                </>
              ) : (
                <>
                  Are you sure you want to assign <strong>{items.length}</strong> permission{items.length !== 1 ? "s" : ""}?
                  This action will immediately grant the selected permissions to the role.
                </>
              )
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setPendingAction(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmAction}
            className={bulkMode === "revoke" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
          >
            {requireApproval 
              ? "Submit for Approval"
              : bulkMode === "revoke" ? "Revoke Permissions" : "Assign Permissions"
            }
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </Sheet>
);
};
