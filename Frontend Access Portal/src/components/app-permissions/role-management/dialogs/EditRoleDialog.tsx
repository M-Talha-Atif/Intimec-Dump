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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { InternalRole } from "@/types/roleManagement";
import {
  EditRoleProvider,
  useEditRoleContext,
} from "./contexts/EditRoleContext";
import {
  RiskWarningSection,
  RoleInfoSection,
  EditBasicInfoSection,
  EditScopeSelectionSection,
  EditSettingsSection,
  EditTagsSection,
  EditUsersSection,
  EditFormActions,
} from "./components";

interface EditRoleDialogProps {
  role: InternalRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateRole: (roleId: string, updates: Partial<InternalRole>) => Promise<boolean>;
  error?: string | null;
}

const EditRoleDialogTitle: React.FC = () => {
  const { isHighRisk } = useEditRoleContext();

  return (
    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
      Edit Role
      {isHighRisk && (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          High Risk
        </Badge>
      )}
    </DialogTitle>
  );
};

const EditRoleDialogContent: React.FC<{ error?: string | null }> = ({ error }) => {
  const [selectedWorkflow, setSelectedWorkflow] = React.useState<string>("");

  // Dummy workflow data
  const workflows = [
    { id: "wf-1", name: "Standard Approval Workflow", description: "Requires manager approval" },
    { id: "wf-2", name: "HR Review Workflow", description: "HR department review required" },
    { id: "wf-3", name: "Security Clearance Workflow", description: "Security team validation" },
    { id: "wf-4", name: "Executive Approval Workflow", description: "C-level approval required" },
    { id: "wf-5", name: "Compliance Check Workflow", description: "Compliance team review" },
  ];

  return (
    <>
      <DialogHeader>
        <EditRoleDialogTitle />
        <DialogDescription>
          Modify role permissions, settings, and configuration. Changes will be
          applied immediately.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <RiskWarningSection />
        <RoleInfoSection />
        
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Edit the core details of this role</CardDescription>
          </CardHeader>
          <CardContent>
            <EditBasicInfoSection error={error} />
          </CardContent>
        </Card>

        {/* Users */}
        <Card>
          <CardContent>
            <EditUsersSection />
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardContent>
            <EditSettingsSection />
          </CardContent>
        </Card>

        {/* Workflow */}
        <Card>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Workflow</h3>
                <p className="text-sm text-muted-foreground">
                  Select a workflow to be triggered when users are assigned to this role
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-workflow">Assignment Workflow</Label>
                <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                  <SelectTrigger id="edit-workflow">
                    <SelectValue placeholder="Select a workflow (optional)" />
                  </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Workflow</SelectItem>
                  {workflows.map((workflow) => (
                    <SelectItem key={workflow.id} value={workflow.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{workflow.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {workflow.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                {selectedWorkflow && selectedWorkflow !== "none" && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected: {workflows.find(w => w.id === selectedWorkflow)?.name}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardContent>
            <EditTagsSection />
          </CardContent>
        </Card>

        <EditFormActions />
      </div>
    </>
  );
};

// Inner component that has access to context
const EditRoleDialogInner: React.FC<{
  onOpenChange: (open: boolean) => void;
  error?: string | null;
}> = ({ onOpenChange, error }) => {
  const { hasChanges, onClose, resetForm } = useEditRoleContext();
  const [showDiscardConfirm, setShowDiscardConfirm] = React.useState(false);

  const handleOpenChange = (open: boolean) => {
    console.log('[EditRoleDialog] handleOpenChange - open:', open, 'hasChanges:', hasChanges);
    if (!open && hasChanges) {
      // User wants to close but has changes - show confirmation
      setShowDiscardConfirm(true);
    } else if (!open) {
      // No changes, close normally
      onOpenChange(false);
    }
  };

  const handleDiscardChanges = () => {
    setShowDiscardConfirm(false);
    resetForm();
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={true} onOpenChange={handleOpenChange}>
        <DialogContent 
          className="overflow-y-auto w-full"
        >
          <EditRoleDialogContent error={error} />
        </DialogContent>
      </Dialog>

      {/* Discard Changes Confirmation */}
      <AlertDialog
        open={showDiscardConfirm}
        onOpenChange={setShowDiscardConfirm}
      >
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
              This action cannot be undone.
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

export const EditRoleDialog: React.FC<EditRoleDialogProps> = ({
  role,
  open,
  onOpenChange,
  onUpdateRole,
  error,
}) => {
  if (!open) return null;

  return (
    <EditRoleProvider
      role={role}
      onUpdateRole={onUpdateRole}
      onClose={() => onOpenChange(false)}
    >
      <EditRoleDialogInner onOpenChange={onOpenChange} error={error} />
    </EditRoleProvider>
  );
};
