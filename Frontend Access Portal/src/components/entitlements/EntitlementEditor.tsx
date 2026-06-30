import * as React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import { EntitlementResponseDto } from "@/types/entitlements";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Save,
  X,
  Eye,
  AlertTriangle,
  Zap,
  LayoutDashboard,
  ShieldCheck,
  Link,
  Code,
  Target,
  UserCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import EntitlementOverviewEditor from "./editor/EntitlementOverviewEditor";
import EntitlementAttributesEditor from "./editor/EntitlementAttributesEditor";
import EntitlementRelationshipsEditor from "./editor/EntitlementRelationshipsEditor";
import EntitlementScriptingEditor, {
  type ScriptingEditorHandle,
} from "./editor/EntitlementScriptingEditor";
import EntitlementRiskEditor from "./editor/EntitlementRiskEditor";
import EntitlementOwnerEditor from "./editor/EntitlementOwnerEditor";
import EntitlementAIAssistant from "./editor/EntitlementAIAssistant";
import EntitlementImpactSimulator from "./editor/EntitlementImpactSimulator";
import {
  useUpdateEntitlement,
  EntitlementUpdatePayload,
} from "@/hooks/useUpdateEntitlement";
import { useToast } from "@/hooks/use-toast";

interface EntitlementEditorProps {
  entitlement: EntitlementResponseDto;
  allEntitlements: EntitlementResponseDto[];
  onSave: (updatedEntitlement: EntitlementResponseDto) => Promise<void>;
  onCancel: () => void;
  onSelectEntitlement: (entitlement: EntitlementResponseDto) => void;
}

const EntitlementEditor: React.FC<EntitlementEditorProps> = ({
  entitlement,
  allEntitlements,
  onSave,
  onCancel,
  onSelectEntitlement,
}) => {
  const [editedEntitlement, setEditedEntitlement] =
    useState<EntitlementResponseDto>(entitlement);
  const [hasGovernanceChanges, setHasGovernanceChanges] = useState(false);
  const [hasRuleChanges, setHasRuleChanges] = useState(false);
  const [showImpactSimulation, setShowImpactSimulation] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();
  const { updating, updateEntitlement } = useUpdateEntitlement();

  const scriptingRef = useRef<ScriptingEditorHandle>(null);

  // Combined dirty check
  const hasChanges = hasGovernanceChanges || hasRuleChanges;

  // Sync edited state when the parent passes a new entitlement
  useEffect(() => {
    setEditedEntitlement(entitlement);
    setHasGovernanceChanges(false);
    setValidationErrors([]);
  }, [entitlement]);

  const hasOwner =
    !!editedEntitlement.ownerId ||
    !!(editedEntitlement.attributes?.owner as string);
  const hasClassification =
    (editedEntitlement.classification ?? []).length > 0;
  const isActive =
    !editedEntitlement.lifecycle ||
    editedEntitlement.lifecycle === "Active";
  const hasReviews = false;

  const entitlementHealthScore =
    [hasOwner, hasClassification, isActive, hasReviews].filter(Boolean)
      .length * 25;

  // Unified save — governance + rules
  const handleSave = useCallback(async () => {
    const errors: string[] = [];
    if (!editedEntitlement.displayName?.trim())
      errors.push("Entitlement name is required");
    if (!editedEntitlement.resourceName?.trim())
      errors.push("Resource is required");

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      // 1. Save governance fields
      let updatedFromServer = editedEntitlement;

      if (hasGovernanceChanges) {
        const payload: EntitlementUpdatePayload = {
          displayName: editedEntitlement.displayName,
          description: editedEntitlement.description,
          lifecycle: editedEntitlement.lifecycle,
          riskLevel: editedEntitlement.riskLevel,
          riskReason: editedEntitlement.riskReason,
          requestable: editedEntitlement.requestable,
          kind: editedEntitlement.kind,
          classification: editedEntitlement.classification,
          privilegeLevel: editedEntitlement.privilegeLevel,
          ownerId: editedEntitlement.ownerId,
        };

        updatedFromServer = await updateEntitlement(
          editedEntitlement.id,
          payload
        );
      }

      // 2. Save assignment rules (if dirty)
      if (scriptingRef.current?.isDirty) {
        await scriptingRef.current.save();
      }

      setEditedEntitlement(updatedFromServer);
      setHasGovernanceChanges(false);
      setValidationErrors([]);

      toast({
        title: "Entitlement Updated",
        description: `${updatedFromServer.displayName} has been successfully updated.`,
      });

      await onSave(updatedFromServer);
    } catch {
      toast({
        title: "Save Failed",
        description:
          "Unable to save changes. Please try again.",
        variant: "destructive",
      });
    }
  }, [editedEntitlement, hasGovernanceChanges, updateEntitlement, onSave, toast]);

  const handleEntitlementChange = useCallback(
    (updatedFields: Partial<EntitlementResponseDto>) => {
      setEditedEntitlement((prev) => ({ ...prev, ...updatedFields }));
      setHasGovernanceChanges(true);
    },
    []
  );

  const handleCancelClick = useCallback(() => {
    if (hasChanges) {
      setShowDiscardDialog(true);
    } else {
      onCancel();
    }
  }, [hasChanges, onCancel]);

  const handleDiscardChanges = useCallback(() => {
    setShowDiscardDialog(false);
    setEditedEntitlement(entitlement);
    setHasGovernanceChanges(false);
    setValidationErrors([]);
    setShowImpactSimulation(false);
    // Discard rule changes too
    scriptingRef.current?.discard();
    onCancel();
  }, [entitlement, onCancel]);

  const isSaving = updating || (scriptingRef.current?.isSaving ?? false);

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <CardTitle className="text-2xl">
                    {editedEntitlement.displayName}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge
                      variant="outline"
                      className="border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                    >
                      <Zap className="h-3 w-3 mr-1" /> Editing
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        editedEntitlement.lifecycle === "Active"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {editedEntitlement.lifecycle ?? "Unknown"}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={cn(
                        entitlementHealthScore >= 75
                          ? "text-emerald-700"
                          : entitlementHealthScore >= 50
                            ? "text-amber-700"
                            : "text-destructive"
                      )}
                    >
                      Health: {entitlementHealthScore}%
                    </Badge>
                    {hasChanges && (
                      <Badge
                        variant="outline"
                        className="border-destructive/30 bg-destructive/10 text-destructive"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" /> Unsaved
                        Changes
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowImpactSimulation(true)}
                  className="flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Preview Impact</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelClick}
                  disabled={isSaving}
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  className="flex items-center space-x-2"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          {validationErrors.length > 0 && (
            <CardContent className="pt-0">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc pl-4">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          )}
        </Card>

        <EntitlementAIAssistant
          entitlement={editedEntitlement}
          allEntitlements={allEntitlements}
        />

        {showImpactSimulation && (
          <EntitlementImpactSimulator
            originalEntitlement={entitlement}
            editedEntitlement={editedEntitlement}
            isOpen={showImpactSimulation}
            onClose={() => setShowImpactSimulation(false)}
          />
        )}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="attributes">
              <ShieldCheck className="mr-2 h-4 w-4" /> Attributes
            </TabsTrigger>
            <TabsTrigger value="owners">
              <UserCircle className="mr-2 h-4 w-4" /> Owners
            </TabsTrigger>
            <TabsTrigger value="relationships">
              <Link className="mr-2 h-4 w-4" /> Relationships
            </TabsTrigger>
            <TabsTrigger value="scripting">
              <Code className="mr-2 h-4 w-4" /> Scripting
            </TabsTrigger>
            <TabsTrigger value="risk">
              <Target className="mr-2 h-4 w-4" /> Risk
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <EntitlementOverviewEditor
              entitlement={editedEntitlement}
              isEditing={true}
              onChange={handleEntitlementChange}
            />
          </TabsContent>

          <TabsContent value="attributes">
            <EntitlementAttributesEditor
              entitlement={editedEntitlement}
              isEditing={true}
              onChange={handleEntitlementChange}
            />
          </TabsContent>

          <TabsContent value="owners">
            <EntitlementOwnerEditor
              entitlement={editedEntitlement}
              isEditing={true}
              onChange={handleEntitlementChange}
            />
          </TabsContent>

          <TabsContent value="relationships">
            <EntitlementRelationshipsEditor
              entitlement={editedEntitlement}
              allEntitlements={allEntitlements}
              isEditing={true}
              onChange={handleEntitlementChange}
              onSelectEntitlement={onSelectEntitlement}
            />
          </TabsContent>

          <TabsContent value="scripting" forceMount className="data-[state=inactive]:hidden">
            <EntitlementScriptingEditor
              ref={scriptingRef}
              entitlement={editedEntitlement}
              isEditing={true}
              onChange={handleEntitlementChange}
              onDirtyChange={setHasRuleChanges}
            />
          </TabsContent>

          <TabsContent value="risk">
            <EntitlementRiskEditor
              entitlement={editedEntitlement}
              isEditing={true}
              onChange={handleEntitlementChange}
            />
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes to this entitlement. All modifications
              to overview, classification, owner, risk level, privilege level,
              and assignment rules will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDiscardDialog(false)}>
              Continue Editing
            </AlertDialogCancel>
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

export default EntitlementEditor;