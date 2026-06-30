import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Trash2 } from "lucide-react";
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
import { SystemAttributeMapping } from "../../types/index";
import { useMappingContext } from "../../context/MappingContext";

interface MappingActionsProps {
  mapping: SystemAttributeMapping;
}

export const MappingActions: React.FC<MappingActionsProps> = ({ mapping }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<{
    mapping: SystemAttributeMapping;
    performRemoval: () => void;
  } | null>(null);

  const { copySystemMapping, removeSystemMapping } = useMappingContext();

  const handleDeleteClick = () => {
    // Try to use the new confirmation pattern first
    const result = removeSystemMapping?.(mapping.id, () => {
      setIsDeleteDialogOpen(false);
      setPendingDeletion(null);
    });

    if (result && typeof result === "object" && "mapping" in result) {
      setPendingDeletion(result);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleCopyClick = () => {
    copySystemMapping?.(mapping.id);
  };

  const confirmDeletion = () => {
    if (pendingDeletion) {
      pendingDeletion.performRemoval();
    }
  };

  return (
    <>
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm" onClick={handleCopyClick}>
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDeleteClick}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete System Mapping</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the system mapping for &quot;
              {pendingDeletion?.mapping?.systemAttributeName}&quot;? This action
              cannot be undone and will affect the attribute mapping
              configuration for this system attribute.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletion}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete System Mapping
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
