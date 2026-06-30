"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { CreateRoleData } from "@/types/roleManagement";
import { CreateRoleProvider, useCreateRoleContext } from "./contexts/CreateRoleContext";
import {
  BasicInfoSection,
  SettingsSection,
  TagsSection,
  UsersSection,
} from "./components";

interface CreateRoleWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRole: (data: CreateRoleData) => Promise<boolean>;
  error?: string | null;
}

const CreateRoleWizardContent: React.FC<{ 
  error?: string | null;
  workflowValidationError: string | null;
  setWorkflowValidationError: (error: string | null) => void;
}> = ({ error, workflowValidationError, setWorkflowValidationError }) => {
  const { formData, updateFormData } = useCreateRoleContext();
  const [workflows, setWorkflows] = React.useState<any[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = React.useState(false);

  // Fetch workflows when requireOwnerApproval becomes true
  React.useEffect(() => {
    if (formData.requireOwnerApproval) {
      setIsLoadingWorkflows(true);
      setWorkflowValidationError(null);
      
      // Fetch event-based workflows that support role.created events
      // Note: Backend doesn't filter by triggerType yet, so we filter client-side
      // Fetch ALL workflows first to see what's available (don't filter by status)
      fetch('/api/workflows?size=100')
        .then(res => res.json())
        .then(data => {
          console.log('[CreateRoleWizard] Raw API response:', data);
          
          // Handle wrapped response structure: { success, data: { content: [...] } }
          let workflowList = [];
          if (Array.isArray(data)) {
            workflowList = data;
          } else if (data.data && Array.isArray(data.data.content)) {
            workflowList = data.data.content;
          } else if (data.content && Array.isArray(data.content)) {
            workflowList = data.content;
          }
          
          console.log('[CreateRoleWizard] Fetched workflows:', workflowList);
          console.log('[CreateRoleWizard] Workflow details:', workflowList.map((wf: any) => ({
            id: wf.id,
            name: wf.name,
            status: wf.status,
            triggerType: wf.triggerType,
            eventConfig: wf.eventConfig
          })));
          
          // Filter workflows that are:
          // 1. Event-based (triggerType = EVENT_BASED or event-based)
          // 2. Have role.created in their eventTypes
          // 3. Status is ACTIVE only
          const roleCreationWorkflows = workflowList.filter((wf: any) => {
            const status = wf.status?.toUpperCase();
            const isActive = status === 'ACTIVE';
            const triggerType = wf.triggerType?.toUpperCase();
            const isEventBased = triggerType === 'EVENT_BASED' || triggerType === 'EVENT-BASED';
            const eventTypes = wf.eventConfig?.eventTypes || [];
            const hasRoleCreated = eventTypes.includes('role.created');
            
            console.log(`[CreateRoleWizard] Workflow "${wf.name}":`, {
              status: wf.status,
              isActive,
              triggerType: wf.triggerType,
              isEventBased,
              eventTypes,
              hasRoleCreated,
              willInclude: isActive && isEventBased && hasRoleCreated
            });
            
            return isActive && isEventBased && hasRoleCreated;
          });
          
          console.log('[CreateRoleWizard] Filtered role creation workflows:', roleCreationWorkflows);
          setWorkflows(roleCreationWorkflows);
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
      updateFormData({ workflowId: undefined });
    }
  }, [formData.requireOwnerApproval]);

  // Validate selected workflow structure
  const validateWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`);
      const workflowData = await response.json();
      
      // Unwrap if response is wrapped in success envelope
      const workflow = workflowData.data || workflowData;
      
      console.log('[CreateRoleWizard] Validating workflow:', workflow);
      
      // Check if workflow has approval node (either single or multi)
      // For event-based role creation, both are valid:
      // - approval.single: works when role has exactly 1 owner
      // - approval.multi with approverType=role_owner: works with any number of owners (1 or more)
      const nodes = workflow.nodes || [];
      console.log('[CreateRoleWizard] Workflow nodes:', nodes);
      
      const hasApprovalNode = nodes.some((node: any) => {
        const isSingleApproval = node.type === 'approval.single';
        // Check both node.data.approverType and node.config.approverType for compatibility
        const approverType = node.data?.approverType || node.config?.approverType;
        const isMultiApprovalWithRoleOwner = node.type === 'approval.multi' && approverType === 'role_owner';
        const isValid = isSingleApproval || isMultiApprovalWithRoleOwner;
        
        console.log(`[CreateRoleWizard] Node "${node.data?.label || node.name}": type=${node.type}, approverType=${approverType}, isValid=${isValid}`);
        return isValid;
      });
      
      if (!hasApprovalNode) {
        setWorkflowValidationError(
          'This workflow is not configured for role creation approval. ' +
          'Please ensure it contains either a "Single Approver" node or a "Multi Approver" node with dynamic approver resolution.'
        );
        return false;
      }
      
      setWorkflowValidationError(null);
      return true;
    } catch (err) {
      console.error('Failed to validate workflow:', err);
      setWorkflowValidationError('Failed to validate workflow. Please try again.');
      return false;
    }
  };

  // Validate workflow when selection changes
  React.useEffect(() => {
    if (formData.workflowId && formData.requireOwnerApproval) {
      validateWorkflow(formData.workflowId);
    }
  }, [formData.workflowId]);

  return (
    <div className="space-y-4">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Define the core details of your role</CardDescription>
        </CardHeader>
        <CardContent>
          <BasicInfoSection error={error} />
        </CardContent>
      </Card>

      {/* Users */}
      <Card>
        <CardContent>
          <UsersSection />
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardContent>
          <SettingsSection />
        </CardContent>
      </Card>

      {/* Workflow - Only show if requireOwnerApproval is true */}
      {formData.requireOwnerApproval && (
        <Card>
          <CardHeader>
            <CardTitle>Approval Workflow</CardTitle>
            <CardDescription>
              Select a workflow for role creation approval by designated owners
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workflow">
                  Role Creation Workflow 
                  <span className="text-destructive ml-1">*</span>
                </Label>
                {isLoadingWorkflows ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading workflows...</span>
                  </div>
                ) : workflows.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-2">
                    No role creation workflows found. Please create a workflow with event type "role.created" first.
                  </div>
                ) : (
                  <>
                    <Select 
                      value={formData.workflowId || ""} 
                      onValueChange={(value) => updateFormData({ workflowId: value })}
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
                    {formData.workflowId && !workflowValidationError && (
                      <p className="text-xs text-muted-foreground mt-2">
                        ✓ Selected: {workflows.find(w => w.id === formData.workflowId)?.name}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      <Card>
        <CardContent>
          <TagsSection />
        </CardContent>
      </Card>
    </div>
  );
};

// Form Actions with confirmation
const CreateRoleFormActions: React.FC<{
  onShowCreateConfirm: () => void;
  onCancel: () => void;
  isFormValid: boolean;
}> = ({ onShowCreateConfirm, onCancel, isFormValid }) => {
  const { formData } = useCreateRoleContext();
  
  return (
    <div className="flex justify-end space-x-3 pt-4">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        onClick={onShowCreateConfirm}
        disabled={!isFormValid}
      >
        {formData.requireOwnerApproval ? 'Submit for Approval' : 'Create Role'}
      </Button>
    </div>
  );
};

// Inner component with context access
const CreateRoleWizardInner: React.FC<{
  onOpenChange: (open: boolean) => void;
  onCreateRole: (data: CreateRoleData) => Promise<boolean>;
  error?: string | null;
}> = ({ onOpenChange, onCreateRole, error }) => {
  const { formData, resetForm, handleSubmit, isFormValid } = useCreateRoleContext();
  const [showCreateConfirm, setShowCreateConfirm] = React.useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [workflowValidationError, setWorkflowValidationError] = React.useState<string | null>(null);

  // Compute effective form validity including workflow validation
  const isEffectivelyValid = isFormValid && !workflowValidationError;

  // Check if form has any data
  const hasFormData = () => {
    return (
      (formData?.name && formData.name.trim() !== "") ||
      (formData?.description && formData.description.trim() !== "") ||
      !!formData?.type
    );
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && hasFormData()) {
      // User wants to close but has data - show discard confirmation
      setShowDiscardConfirm(true);
    } else if (!open) {
      // No data, close normally
      onOpenChange(false);
    }
  };

  const handleCancelClick = () => {
    if (hasFormData()) {
      setShowDiscardConfirm(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleDiscardChanges = () => {
    setShowDiscardConfirm(false);
    resetForm();
    onOpenChange(false);
  };

  const handleConfirmCreate = async () => {
    setIsSubmitting(true);
    setShowCreateConfirm(false);
    
    try {
      await handleSubmit(onCreateRole);
    } catch (err) {
      // Silently catch any errors that escape - they're already handled in state
    }
    
    setIsSubmitting(false);
  };

  return (
    <>
      <Dialog open={true} onOpenChange={handleOpenChange}>
        <DialogContent className="overflow-y-auto w-full">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Create New Role
            </DialogTitle>
            <DialogDescription>
              Define a new role with specific permissions, scopes, and settings
              for your organization.
            </DialogDescription>
          </DialogHeader>
          
          <CreateRoleWizardContent 
            error={error} 
            workflowValidationError={workflowValidationError}
            setWorkflowValidationError={setWorkflowValidationError}
          />

          {/* Form Actions */}
          <CreateRoleFormActions
            onShowCreateConfirm={() => setShowCreateConfirm(true)}
            onCancel={handleCancelClick}
            isFormValid={isEffectivelyValid}
          />
        </DialogContent>
      </Dialog>

      {/* Create Confirmation Dialog */}
      <AlertDialog open={showCreateConfirm} onOpenChange={setShowCreateConfirm}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {formData.requireOwnerApproval ? 'Submit Role for Approval' : 'Create Role'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {formData.requireOwnerApproval
                ? 'This role will be submitted for approval workflow. The role will not be created until the workflow completes successfully.'
                : 'Are you sure you want to create this role? The role will be created with the specified permissions and settings.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCreate}
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {formData.requireOwnerApproval ? 'Submitting...' : 'Creating...'}
                </>
              ) : (
                formData.requireOwnerApproval ? "Submit for Approval" : "Create Role"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discard Changes Confirmation Dialog */}
      <AlertDialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close without
              creating the role? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
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
  );
};

export const CreateRoleWizard: React.FC<CreateRoleWizardProps> = ({
  open,
  onOpenChange,
  onCreateRole,
  error,
}) => {
  if (!open) return null;

  return (
    <CreateRoleProvider
      onCreateRole={onCreateRole}
      onClose={() => onOpenChange(false)}
    >
      <CreateRoleWizardInner 
        onOpenChange={onOpenChange} 
        onCreateRole={onCreateRole}
        error={error}
      />
    </CreateRoleProvider>
  );
};
