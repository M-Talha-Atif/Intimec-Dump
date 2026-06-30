import React from "react";
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
import { AlertTriangle, Database, Clock } from "lucide-react";

interface SchemaConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  actionType: "create" | "update" | "delete";
  entityType: string;
  attributeName?: string;
  identitiesAffected?: number;
  isLoading?: boolean;
}

export const SchemaConfirmationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  actionType,
  entityType,
  attributeName,
  identitiesAffected,
  isLoading = false,
}: SchemaConfirmationDialogProps) => {
  const getActionColor = () => {
    switch (actionType) {
      case "delete":
        return "text-red-600";
      case "update":
        return "text-orange-600";
      case "create":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getActionText = () => {
    switch (actionType) {
      case "delete":
        return "delete";
      case "update":
        return "update";
      case "create":
        return "create";
      default:
        return "modify";
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className={`h-6 w-6 ${getActionColor()}`} />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-lg font-semibold">
                {title}
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4">
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </AlertDialogDescription>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                  Potential Impact on Identities
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  This action may affect{" "}
                  <span className="font-semibold">
                    {identitiesAffected ? `${identitiesAffected.toLocaleString()} ` : ""}
                    {entityType.toLowerCase()} identities
                  </span>{" "}
                  and could break existing identity data or workflows.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                  Computational Cost
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Schema changes require significant computational resources and may take several minutes to propagate across all systems.
                </p>
              </div>
            </div>
          </div>

          {attributeName && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <span className="font-medium">Target:</span> {attributeName} in{" "}
                <span className="font-medium">{entityType}</span> schema
              </p>
            </div>
          )}
        </div>

        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={`${getActionColor()} hover:opacity-90`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </div>
            ) : (
              `Confirm ${getActionText().charAt(0).toUpperCase() + getActionText().slice(1)}`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};