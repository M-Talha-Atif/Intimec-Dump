import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AttributeMapping } from "./types";

interface AdvancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapping: AttributeMapping;
  onSave: (updates: Partial<AttributeMapping>) => void;
}

export const AdvancedSettingsModal = ({
  isOpen,
  onClose,
  mapping,
  onSave,
}: AdvancedSettingsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Advanced Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>
            Advanced settings for mapping: {mapping.sourceAttribute} →{" "}
            {mapping.targetAttribute}
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => onSave({})}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
