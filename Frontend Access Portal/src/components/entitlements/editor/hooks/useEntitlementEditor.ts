import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Entitlement } from "../../data/mock-entitlements";
import { EditorProps, EditorState, EditorActions } from "../types/editor-types";

export const useEntitlementEditor = (
  props: EditorProps
): EditorState & EditorActions => {
  const { entitlement, onSave, onCancel } = props;

  const [editedEntitlement, setEditedEntitlement] =
    useState<Entitlement>(entitlement);
  const [hasChanges, setHasChanges] = useState(false);
  const [showImpactSimulation, setShowImpactSimulation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleSave = useCallback(async () => {
    // Validation checks
    const errors: string[] = [];

    if (!editedEntitlement.displayName?.trim()) {
      errors.push("Entitlement name is required");
    }

    if (!editedEntitlement.application?.trim()) {
      errors.push("Application is required");
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await onSave(editedEntitlement);
      setHasChanges(false);
      setValidationErrors([]);
      toast.success("Entitlement Updated", {
        description: `${editedEntitlement.displayName} has been successfully updated.`,
      });
    } catch (error) {
      console.error("Failed to save entitlement:", error);
      toast.error("Save Failed", {
        description: "Unable to save entitlement changes. Please try again.",
      });
    }
  }, [editedEntitlement, onSave]);

  const handleEntitlementChange = useCallback(
    (updatedEntitlement: Partial<Entitlement>) => {
      setEditedEntitlement((prev) => ({ ...prev, ...updatedEntitlement }));
      setHasChanges(true);
    },
    []
  );

  const handlePreviewImpact = useCallback(() => {
    setShowImpactSimulation(true);
  }, []);

  const handleCloseImpactSimulation = useCallback(() => {
    setShowImpactSimulation(false);
  }, []);

  const handleCancel = useCallback(() => {
    setEditedEntitlement(entitlement);
    setHasChanges(false);
    setValidationErrors([]);
    setShowImpactSimulation(false);
    onCancel();
  }, [entitlement, onCancel]);

  return {
    editedEntitlement,
    hasChanges,
    showImpactSimulation,
    validationErrors,
    handleSave,
    handleEntitlementChange,
    handlePreviewImpact,
    handleCloseImpactSimulation,
    handleCancel,
  };
};
