import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Users,
  Shield,
  ShieldCheck,
  ClipboardCheck,
  Loader2,
  Link,
} from "lucide-react";
import { toast } from "sonner";
import { RuleCondition } from "@/components/shared/VisualRuleBuilder";
import { useCreateAccessRole } from "@/hooks/access-catalogue/roles/use-create-access-role";
import type { CreateAccessRoleRequest } from "@/types/access-roles";
import { RoleFormState, INITIAL_ROLE_FORM } from "./types";

import BasicInfoTab from "./tabs/BasicInfoTab";
import OwnershipGovernanceTab from "./tabs/OwnershipGovernanceTab";
import EntitlementsTab from "./tabs/EntitlementsTab";
import ChildRolesTab from "./tabs/ChildRolesTab";
import RiskComplianceTab from "./tabs/RiskComplianceTab";
import ReviewSubmitTab from "./tabs/ReviewSubmitTab";

interface AddRoleWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleCreated?: () => void;
}

const STEPS = [
  { label: "Basic Info", icon: FileText },
  { label: "Ownership & Governance", icon: Users },
  { label: "Entitlements", icon: Shield },
  { label: "Child Roles", icon: Link },
  { label: "Risk & Compliance", icon: ShieldCheck },
  { label: "Review & Submit", icon: ClipboardCheck },
];

const AddRoleWizard: React.FC<AddRoleWizardProps> = ({ open, onOpenChange, onRoleCreated }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<RoleFormState>({ ...INITIAL_ROLE_FORM });
  const [ruleConditions, setRuleConditions] = useState<RuleCondition[]>([]);
  const [ruleLogic, setRuleLogic] = useState<"AND" | "OR">("AND");
  const [ruleScript, setRuleScript] = useState("");
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const { create, isLoading, error } = useCreateAccessRole();

  /**
   * Entitlement name cache: lives in the parent so it survives
   * tab switches (EntitlementsTab unmounts/remounts as user navigates steps).
   * Maps entitlement UUID → displayName.
   */
  const entitlementNameCache = useRef<Map<string, string>>(new Map());

  const update = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

   const canNext = (): boolean => {
    if (step === 0) return !!(form.name && form.type && form.description);
    if (step === 1) return !!form.ownerId;
    if (step === 2) return form.entitlements.length > 0;
    return true;
  };

  const stepComplete = (i: number): boolean => {
    if (i === 0) return !!(form.name && form.type && form.description);
    if (i === 1) return !!form.ownerId;
    if (i === 2) return form.entitlements.length > 0;
    if (i === 3) return (form.childRoleIds || []).length > 0;
    if (i === 4) return true;
    return false;
  };

  /**
   * Checks if the form has any user-entered data worth preserving.
   * Used to decide whether to show the discard confirmation dialog.
   */
  const hasUnsavedChanges = (): boolean => {
    return !!(
      form.name.trim() ||
      form.description.trim() ||
      form.type ||
      form.ownerId ||
      form.entitlements.length > 0 ||
      (form.childRoleIds || []).length > 0 ||
      form.classification.length > 0 ||
      form.complianceTags.length > 0 ||
      form.businessUnit ||
      ruleConditions.length > 0 ||
      ruleScript.trim()
    );
  };

  const buildPayload = (): CreateAccessRoleRequest => ({
    name: form.name.trim(),
    description: form.description.trim(),
    type: form.type.toLowerCase().replace(" role", ""),
    businessUnit: form.businessUnit || undefined,
    classification: form.classification.length > 0 ? form.classification : undefined,
    complianceTags: form.complianceTags.length > 0 ? form.complianceTags : undefined,
    riskLevel: form.riskLevel.toLowerCase(),
    ownerId: form.ownerId || undefined,
    status: form.status || "Enabled",
    requestable: form.requestable,
    requireApproval: form.approvalWorkflow !== "auto",
    certificationSchedule: form.certSchedule,
    entitlementIds: form.entitlements.length > 0 ? form.entitlements : undefined,
    childRoleIds: (form.childRoleIds || []).length > 0 ? form.childRoleIds : undefined,
  });

  /**
   * Resets all wizard state to initial values.
   * Called after successful creation or when user confirms discard.
   */
  const resetForm = () => {
    setStep(0);
    setForm({ ...INITIAL_ROLE_FORM });
    setRuleConditions([]);
    setRuleScript("");
    setRuleLogic("AND");
    entitlementNameCache.current.clear();
  };

  /**
   * Intercepts dialog close attempts.
   * If the form has unsaved changes, shows a confirmation dialog.
   * Otherwise, closes and resets immediately.
   */
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && hasUnsavedChanges()) {
      setShowDiscardConfirm(true);
      return;
    }

    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  /**
   * User confirmed discard: reset everything and close.
   */
  const handleDiscardChanges = () => {
    setShowDiscardConfirm(false);
    resetForm();
    onOpenChange(false);
  };

  /**
   * User chose to keep editing: just close the confirmation dialog.
   */
  const handleKeepEditing = () => {
    setShowDiscardConfirm(false);
  };

  const handleSubmit = async () => {
    const payload = buildPayload();
    const result = await create(payload);

    if (result) {
      toast.success(`Role "${form.name}" created successfully`);
      onOpenChange(false);
      resetForm();
      onRoleCreated?.();
    } else {
      toast.error(error || "Failed to create role. Please try again.");
    }
  };

  /**
   * Handles the Cancel / Back button in the footer.
   * On step 0 Cancel, checks for unsaved changes before closing.
   */
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      handleOpenChange(false);
    }
  };

  return (
    <>
      {/* Discard Changes Confirmation */}
      <AlertDialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in this role wizard. Are you sure you want to close?
              All entered data will be lost.
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

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
          <div className="flex h-full">
            {/* Vertical stepper sidebar */}
            <div className="w-56 bg-muted/50 border-r p-4 flex flex-col gap-1 shrink-0">
              <DialogHeader className="pb-3">
                <DialogTitle className="text-base font-semibold">Add New Role</DialogTitle>
              </DialogHeader>
              {STEPS.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => i < step && setStep(i)}
                  className={`flex items-center gap-2.5 p-2 rounded-md text-left text-xs transition-colors ${
                    i === step
                      ? "bg-primary text-primary-foreground font-medium"
                      : i < step
                        ? "text-foreground hover:bg-muted cursor-pointer"
                        : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                      i < step
                        ? "bg-primary/20 text-primary"
                        : i === step
                          ? "bg-primary-foreground/20"
                          : "border"
                    }`}
                  >
                    {i < step && stepComplete(i) ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <s.icon className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6">
                {step === 0 && <BasicInfoTab form={form} update={update} />}
                {step === 1 && <OwnershipGovernanceTab form={form} update={update} />}
                {step === 2 && (
                  <EntitlementsTab
                    form={form}
                    update={update}
                    nameCache={entitlementNameCache}
                  />
                )}
                {step === 3 && <ChildRolesTab form={form} update={update} />}
                {step === 4 && (
                  <RiskComplianceTab
                    form={form}
                    update={update}
                    ruleConditions={ruleConditions}
                    onRuleConditionsChange={setRuleConditions}
                    ruleLogic={ruleLogic}
                    onRuleLogicChange={setRuleLogic}
                    ruleScript={ruleScript}
                    onRuleScriptChange={setRuleScript}
                  />
                )}
                {step === 5 && <ReviewSubmitTab form={form} error={error} />}
              </div>

              <div className="flex justify-between p-4 border-t">
                <Button
                  variant="outline"
                  disabled={isLoading}
                  onClick={handleBack}
                >
                  {step > 0 ? (
                    <>
                      <ChevronLeft className="h-4 w-4 mr-1" /> Back
                    </>
                  ) : (
                    "Cancel"
                  )}
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Creating...
                      </>
                    ) : (
                      "Create Role"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddRoleWizard;