
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BulkActionForms } from './BulkActionForms';

interface BulkActionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentAction: string;
  selectedCount: number;
  onCancel: () => void;
  onApply: () => void;
  isExecutable: boolean;
  // Form props
  reassignTo: string;
  setReassignTo: (val: string) => void;
  bulkNote: string;
  setBulkNote: (val: string) => void;
  bulkTag: string;
  setBulkTag: (val: string) => void;
}

export const BulkActionDialog: React.FC<BulkActionDialogProps> = ({
  isOpen,
  onOpenChange,
  currentAction,
  selectedCount,
  onCancel,
  onApply,
  isExecutable,
  ...formProps
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {currentAction === 'reassign' && 'Reassign Tasks'}
            {currentAction === 'addNote' && 'Add Note to Tasks'}
            {currentAction === 'addTag' && 'Add Tag to Tasks'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This action will be applied to {selectedCount} selected tasks.
          </p>
          
          <BulkActionForms 
            currentAction={currentAction}
            {...formProps}
          />
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              onClick={onApply}
              disabled={!isExecutable}
            >
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
