import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Settings, Loader2 } from "lucide-react";
import { RuleConditionsSection } from "./RuleConditionsSection";
import { RuleBuilderProvider } from "../contexts/RuleBuilderContext";
import { useRuleBuilderContext } from "../contexts/RuleBuilderContext";
import { toast } from "sonner";
import {
  DynamicRuleBackendRequest,
  DynamicRuleBackendResponse,
  ScheduleType,
} from "@/types/dynamicRuleBackend";

// Track if form has changes
const hasFormChanges = (
  currentData: any,
  originalData: any
): boolean => {
  return JSON.stringify(currentData) !== JSON.stringify(originalData);
};

interface DynamicAssignmentTabProps {
  roleId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

interface DynamicRuleFormProps {
  roleId: string;
  existingRule: DynamicRuleBackendResponse | null;
  onSave: (data: DynamicRuleBackendRequest) => void;
  onCancel: () => void;
  saving: boolean;
}

const DynamicRuleForm: React.FC<DynamicRuleFormProps> = ({
  roleId,
  existingRule,
  onSave,
  onCancel,
  saving,
}) => {
  const { scriptConditions, setScriptConditions, loadScriptConditions } = useRuleBuilderContext();

  // Clear error when script conditions change
  React.useEffect(() => {
    if (scriptConditions.trim()) {
      setConditionError("");
    }
  }, [scriptConditions]);
  // Better UX: When creating a new rule (no existing rule), default to inactive (false)
  // User should configure the rule first, then activate it
  const [ruleIsActive, setRuleIsActive] = useState(existingRule ? existingRule.ruleIsActive : false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("");

  // Dummy workflow data
  const workflows = [
    { id: "wf-1", name: "Standard Approval Workflow", description: "Requires manager approval" },
    { id: "wf-2", name: "HR Review Workflow", description: "HR department review required" },
    { id: "wf-3", name: "Security Clearance Workflow", description: "Security team validation" },
    { id: "wf-4", name: "Executive Approval Workflow", description: "C-level approval required" },
    { id: "wf-5", name: "Compliance Check Workflow", description: "Compliance team review" },
  ];
  const [sendNotification, setSendNotification] = useState(
    existingRule?.sendNotificationOnAssignment ?? false
  );
  const [requireApproval, setRequireApproval] = useState(
    existingRule?.requireApprovalBeforeAssignment ?? false
  );
  const [scheduleType, setScheduleType] = useState<ScheduleType>(
    existingRule?.scheduleType ?? "IMMEDIATE"
  );
  const [time, setTime] = useState<string>(existingRule?.time ?? "");
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [pendingRuleData, setPendingRuleData] = useState<DynamicRuleBackendRequest | null>(null);
  const [conditionError, setConditionError] = useState<string>("");

  // Track original state for change detection
  const [originalState] = useState({
    ruleIsActive: existingRule ? existingRule.ruleIsActive : false,
    sendNotification: existingRule?.sendNotificationOnAssignment ?? false,
    requireApproval: existingRule?.requireApprovalBeforeAssignment ?? false,
    scheduleType: existingRule?.scheduleType ?? "IMMEDIATE",
    time: existingRule?.time ?? "",
    scriptConditions: existingRule?.ruleConditionScript ?? "",
  });

  // Initialize script conditions and parse to visual conditions from existing rule
  useEffect(() => {
    if (existingRule?.ruleConditionScript) {
      loadScriptConditions(existingRule.ruleConditionScript);
    }
  }, [existingRule, loadScriptConditions]);

  // Check if form has changes
  const hasChanges = () => {
    const currentState = {
      ruleIsActive,
      sendNotification,
      requireApproval,
      scheduleType,
      time,
      scriptConditions,
    };
    return hasFormChanges(currentState, originalState);
  };

  const handleCancelClick = () => {
    if (hasChanges()) {
      setShowDiscardConfirm(true);
    } else {
      onCancel();
    }
  };

  const handleDiscardChanges = () => {
    setShowDiscardConfirm(false);
    onCancel();
  };

  const handleSubmit = () => {
    if (!scriptConditions.trim()) {
      setConditionError("Rule conditions are required. Please define at least one condition.");
      return;
    }

    if (scheduleType !== "IMMEDIATE" && !time) {
      alert("Please specify execution time for scheduled rules");
      return;
    }

    // Clear any previous errors
    setConditionError("");

    const ruleData: DynamicRuleBackendRequest = {
      roleId,
      ruleIsActive,
      ruleConditionScript: scriptConditions,
      sendNotificationOnAssignment: sendNotification,
      requireApprovalBeforeAssignment: requireApproval,
      scheduleType,
      time: scheduleType === "IMMEDIATE" ? null : time,
    };

    setPendingRuleData(ruleData);
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = () => {
    if (pendingRuleData) {
      onSave(pendingRuleData);
    }
    setShowSaveConfirm(false);
    setPendingRuleData(null);
  };

  return (
    <div className="space-y-6">
      {/* Rule Active Toggle at the top */}
      <Card>
        <CardContent className="">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="rule-active" className="text-base font-medium">
                Rule Active
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable this dynamic assignment rule
              </p>
            </div>
            <Switch
              id="rule-active"
              checked={ruleIsActive}
              onCheckedChange={setRuleIsActive}
            />
          </div>
        </CardContent>
      </Card>

      {/* Conditional Content with Smooth Transition */}
      <div
        className={`space-y-6 transition-all duration-300 ease-in-out ${
          ruleIsActive
            ? "opacity-100 max-h-[5000px]"
            : "opacity-0 max-h-0 overflow-hidden"
        }`}
      >
        {/* Rule Conditions Section */}
        <RuleConditionsSection error={conditionError} />

      {/* Actions */}
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
              <Label htmlFor="require-approval" className="mr-4">Require approval before assignment</Label>
              <Switch
                id="require-approval"
                checked={requireApproval}
                onCheckedChange={setRequireApproval}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Execution Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Schedule Type */}
          <div className="space-y-2">
            <Label htmlFor="schedule-type">Schedule Type</Label>
            <Select
              value={scheduleType}
              onValueChange={(value: ScheduleType) => {
                setScheduleType(value);
                if (value === "IMMEDIATE") {
                  setTime("");
                }
              }}
            >
              <SelectTrigger id="schedule-type">
                <SelectValue placeholder="Select schedule type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IMMEDIATE">Immediate</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Enhanced schedule type info with better visual hierarchy */}
            {scheduleType === "IMMEDIATE" && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 mt-2">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  ⚡ Real-Time Reconciliation
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Users matching the criteria will be automatically assigned or removed immediately based on any status changes.
                </p>
              </div>
            )}
          </div>

          {/* Time Picker (only for scheduled types) */}
          {scheduleType !== "IMMEDIATE" && (
            <div className="space-y-2">
              <Label htmlFor="schedule-time">Execution Time</Label>
              <Input
                id="schedule-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="HH:MM"
              />
              <p className="text-xs text-muted-foreground">
                Time when the rule should be evaluated (HH:MM format)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow</CardTitle>
          <CardDescription>
            Select a workflow to be triggered when users are assigned through this dynamic rule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="dynamic-workflow">Assignment Workflow</Label>
            <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
              <SelectTrigger id="dynamic-workflow">
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
        </CardContent>
      </Card>

      {/* Hidden submit button for triggering save from parent */}
      <button
        id="save-dynamic-rule-btn"
        type="button"
        onClick={handleSubmit}
        style={{ display: "none" }}
      />
      </div>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {existingRule ? "Update Dynamic Rule?" : "Create Dynamic Rule?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {existingRule
                ? "Are you sure you want to update this dynamic rule? Users will be automatically assigned or removed based on the new conditions."
                : "Are you sure you want to create this dynamic rule? Users matching the conditions will be automatically assigned this role."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>
              {existingRule ? "Update Rule" : "Create Rule"}
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

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancelClick}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={saving || (!existingRule && !ruleIsActive)}
          title={
            !existingRule && !ruleIsActive
              ? "Please activate the rule toggle above to create a dynamic rule"
              : ""
          }
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : existingRule ? (
            "Update Rule"
          ) : (
            "Create Rule"
          )}
        </Button>
      </div>
    </div>
  );
};

export const DynamicAssignmentTab: React.FC<DynamicAssignmentTabProps> = ({
  roleId,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingRule, setExistingRule] = useState<DynamicRuleBackendResponse | null>(null);

  // Fetch existing rule on mount
  useEffect(() => {
    const fetchExistingRule = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/dynamic-rules/role/${roleId}`);
        const data = await response.json();

        if (response.ok && data.data) {
          setExistingRule(data.data);
        }
      } catch (error) {
        console.error("Error fetching dynamic rule:", error);
        toast.error("Failed to fetch existing dynamic rule");
      } finally {
        setLoading(false);
      }
    };

    fetchExistingRule();
  }, [roleId, toast]);

  const handleSave = async (ruleData: DynamicRuleBackendRequest) => {
    try {
      setSaving(true);

      const endpoint = "/api/dynamic-rules";
      const method = existingRule ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ruleData),
      });

      // Check if operation was denied (403)
      if (response.status === 403) {
        // Global interceptor handles the toast
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to save dynamic rule");
      }

      toast.success(
        existingRule
          ? "Dynamic rule updated successfully"
          : "Dynamic rule created successfully"
      );

      // Trigger refresh to update badges
      onSuccess?.();

      onClose();
    } catch (error) {
      console.error("Error saving dynamic rule:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save dynamic rule");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {/* <Settings className="h-5 w-5" /> */}
          {existingRule ? "Edit" : "Create"} Dynamic Assignment Rule
        </CardTitle>
        <CardDescription>
          Configure automated rules to assign users based on their attributes.
          Rules are evaluated continuously and users are automatically assigned
          or removed based on changes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RuleBuilderProvider
          roleId={roleId}
          onSave={() => {}}
          rule={undefined}
        >
          <DynamicRuleForm
            roleId={roleId}
            existingRule={existingRule}
            onSave={handleSave}
            onCancel={onClose}
            saving={saving}
          />
        </RuleBuilderProvider>
      </CardContent>
    </Card>
  );
};
