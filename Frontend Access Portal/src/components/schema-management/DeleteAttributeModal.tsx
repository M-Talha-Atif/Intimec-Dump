import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TenantStatisticsResponse, SchemaAttribute } from "@/types/schema-mangement";
import { SchemaConfirmationDialog } from "./SchemaConfirmationDialog";

interface DeleteAttributeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attribute: SchemaAttribute | null;
  entityType: string;
  onDelete: () => Promise<void>;
  tenantStatistics?: TenantStatisticsResponse | null;
}

export const DeleteAttributeModal = ({
  open,
  onOpenChange,
  attribute,
  entityType,
  onDelete,
  tenantStatistics,
}: DeleteAttributeModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();

  // Calculate impact data from tenant statistics
  const getImpactData = () => {
    if (!tenantStatistics || !attribute) {
      return {
        identitiesAffected: 0,
        totalIdentities: 0,
      };
    }

    const identitiesAffected = tenantStatistics.extendedAttributeUsage?.[attribute.displayName] || 0;
    const totalIdentities = tenantStatistics.totalIdentities || 0;

    return {
      identitiesAffected,
      totalIdentities,
    };
  };

  const impactData = getImpactData();

  const handleDelete = async () => {
    // Show confirmation dialog instead of directly deleting
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setShowConfirmation(false);

    try {
      await onDelete();

      toast({
        title: "Attribute Deleted",
        description: `${attribute?.displayName} has been successfully removed from ${entityType}`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while deleting the attribute. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!attribute) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            <span>Delete Attribute</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="text-center">
            <p className="text-sm text-foreground mb-2">
              Delete <strong className="text-foreground">{attribute.displayName}</strong>?
            </p>
            {impactData.identitiesAffected > 0 && (
              <p className="text-xs text-muted-foreground">
                {impactData.identitiesAffected} of {impactData.totalIdentities} identities affected
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded border border-border">
            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <SchemaConfirmationDialog
      open={showConfirmation}
      onOpenChange={setShowConfirmation}
      onConfirm={handleConfirmDelete}
      title="Confirm Attribute Deletion"
      description={`You are about to permanently delete the "${attribute.displayName}" attribute from the ${entityType} schema. This action cannot be undone and may break existing identities or workflows.`}
      actionType="delete"
      entityType={entityType}
      attributeName={attribute.displayName}
      identitiesAffected={impactData.identitiesAffected}
      isLoading={isDeleting}
    />
    </>
  );
};