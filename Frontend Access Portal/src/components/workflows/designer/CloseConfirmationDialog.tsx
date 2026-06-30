"use client";

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Save, Trash2 } from 'lucide-react';

interface CloseConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'creating' | 'editing';
  hasWorkflowId: boolean;
  autoSaveEnabled: boolean;
  hasChanges: boolean;
  onSaveAndClose: () => void;
  onDiscardAndClose: () => void;
}

export const CloseConfirmationDialog: React.FC<CloseConfirmationDialogProps> = ({
  open,
  onOpenChange,
  mode,
  hasWorkflowId,
  autoSaveEnabled,
  hasChanges,
  onSaveAndClose,
  onDiscardAndClose,
}) => {
  // Determine the warning message based on context
  const getWarningMessage = () => {
    if (mode === 'creating' && !hasWorkflowId) {
      return {
        title: 'Unsaved New Workflow',
        description: 'You have unsaved work on this new workflow. Your changes have not been saved to the backend yet.',
        severity: 'critical' as const
      };
    }
    
    if (mode === 'editing' && !autoSaveEnabled) {
      return {
        title: 'Unsaved Changes',
        description: 'Auto-save is disabled. You may have unsaved changes since your last manual save.',
        severity: 'warning' as const
      };
    }
    
    // Editing with auto-save enabled - safe to close
    return {
      title: 'Close Designer?',
      description: 'Your changes are auto-saved. You can safely close the designer.',
      severity: 'info' as const
    };
  };

  const warning = getWarningMessage();
  const needsWarning = warning.severity === 'critical' || warning.severity === 'warning';
  
  // Can only discard if:
  // 1. Creating new workflow (can clear draft), OR
  // 2. Editing with auto-save OFF (can reload from backend)
  // Cannot discard if editing with auto-save ON (changes already saved to backend)
  const canDiscard = (mode === 'creating' && !hasWorkflowId) || (mode === 'editing' && !autoSaveEnabled);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {needsWarning && (
              <AlertTriangle className={`h-6 w-6 ${
                warning.severity === 'critical' ? 'text-red-600' : 'text-amber-600'
              }`} />
            )}
            <AlertDialogTitle>{warning.title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            {warning.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          {needsWarning ? (
            <>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              {canDiscard && (
                <AlertDialogAction
                  onClick={onDiscardAndClose}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Discard & Close
                </AlertDialogAction>
              )}
              <AlertDialogAction
                onClick={onSaveAndClose}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save & Close
              </AlertDialogAction>
            </>
          ) : (
            <>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDiscardAndClose}>
                Close Designer
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
