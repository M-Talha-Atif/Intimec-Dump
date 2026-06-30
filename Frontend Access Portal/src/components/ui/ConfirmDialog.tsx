"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

interface SimpleConfirmDialogProps {
  open: boolean; // Whether to show the dialog
  message: string; // The message to display
  onIgnoreChanges: () => void; // Called when user clicks "Ignore Changes"
  onCancel: () => void; // Called when user clicks "Cancel"
}

/**
 * Simple confirmation dialog for navigation with unsaved changes.
 *
 * Shows two options:
 * 1. "Cancel" - Stay on current page (default/safe option)
 * 2. "Ignore Changes" - Leave page and lose unsaved changes (destructive)
 */
export function SimpleConfirmDialog({
  open,
  message,
  onIgnoreChanges,
  onCancel,
}: SimpleConfirmDialogProps) {
  const commonT = useTranslations("common");
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {/* Warning icon to indicate this is important */}
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {commonT("unsaved-changes")}
          </AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          {/* Cancel button - safe option, should be easy to click */}
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            {commonT("cancel")}
          </Button>

          {/* Ignore Changes button - destructive action, red color to warn user */}
          <Button
            variant="destructive"
            onClick={onIgnoreChanges}
            className="w-full sm:w-auto"
          >
            {commonT("ignore")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
