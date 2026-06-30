"use client";

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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Save } from "lucide-react";
import { useDebugConfiguration } from "@/contexts/use-debug-configuration";

interface SaveSettingsDialogProps {
  isAdvanced?: boolean;
}

export const SaveSettingsDialog = ({
  isAdvanced = false,
}: SaveSettingsDialogProps) => {
  const { hasUnsavedChanges, hasDebugPermissions, handleSaveSettings } =
    useDebugConfiguration();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="flex items-center space-x-2"
          disabled={!hasUnsavedChanges || !hasDebugPermissions}
        >
          <Save className="h-4 w-4" />
          <span>
            {isAdvanced ? "Save Advanced Settings" : "Save Debug Settings"}
          </span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isAdvanced
              ? "Confirm Advanced Settings Changes"
              : "Confirm Debug Settings Changes"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isAdvanced
              ? "These advanced settings will immediately impact live logging behavior, retention policies, and system performance. Do you want to proceed with saving these changes?"
              : "These settings will immediately impact live logging across all platform components. Do you want to proceed with saving these changes?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSaveSettings}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
