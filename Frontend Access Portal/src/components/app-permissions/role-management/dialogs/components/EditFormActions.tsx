import React, { useState } from "react";
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
import { useEditRoleContext } from "../contexts/EditRoleContext";

export const EditFormActions: React.FC = () => {
  const { handleSubmit, onClose, isFormValid, hasChanges, resetForm } =
    useEditRoleContext();
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const handleUpdateClick = () => {
    if (hasChanges) {
      setShowUpdateConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmUpdate = async () => {
    setShowUpdateConfirm(false);
    try {
      await handleSubmit();
    } catch (err) {
      // Silently catch - error already handled in state
    }
  };

  const handleCancelClick = () => {
    if (hasChanges) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleDiscardChanges = () => {
    setShowDiscardConfirm(false);
    resetForm();
    onClose();
  };

  return (
    <>
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline" onClick={handleCancelClick}>
          Cancel
        </Button>
        <Button
          onClick={handleUpdateClick}
          disabled={!isFormValid || !hasChanges}
        >
          Update Role
        </Button>
      </div>

      {/* Update Confirmation Dialog */}
      <AlertDialog open={showUpdateConfirm} onOpenChange={setShowUpdateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Role Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update this role? This will apply all
              changes including role information, owners, settings, and tags.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUpdate}>
              Update Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discard Changes Confirmation Dialog */}
      <AlertDialog
        open={showDiscardConfirm}
        onOpenChange={setShowDiscardConfirm}
      >
        <AlertDialogContent>
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
