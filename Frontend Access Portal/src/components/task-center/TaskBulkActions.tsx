
'use client';
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';
import { useTaskBulkActions } from './hooks/useTaskBulkActions';
import { BulkActionButtons } from './components/BulkActionButtons';
import { BulkActionDialog } from './components/BulkActionDialog';

interface TaskBulkActionsProps {
  selectedTasks: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onBulkAction: (taskIds: string[], action: string, additionalData?: any) => void;
  onClearSelection: () => void;
}

export const TaskBulkActions: React.FC<TaskBulkActionsProps> = ({
  selectedTasks,
  onBulkAction,
  onClearSelection
}) => {
  const {
    reassignTo,
    setReassignTo,
    bulkNote,
    setBulkNote,
    bulkTag,
    setBulkTag,
    isDialogOpen,
    setIsDialogOpen,
    currentAction,
    handleBulkAction,
    openActionDialog,
    closeDialog,
    isActionExecutable
  } = useTaskBulkActions({ selectedTasks, onBulkAction });

  return (
    <>
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {selectedTasks.length} selected
                </Badge>
                <span className="text-sm text-gray-600">Bulk Actions:</span>
              </div>
              
              <BulkActionButtons 
                onAction={handleBulkAction}
                onOpenDialog={openActionDialog}
              />
            </div>
            
            <Button 
              size="sm" 
              variant="ghost"
              onClick={onClearSelection}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <BulkActionDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        currentAction={currentAction}
        selectedCount={selectedTasks.length}
        onCancel={closeDialog}
        onApply={() => handleBulkAction(currentAction)}
        isExecutable={isActionExecutable()}
        reassignTo={reassignTo}
        setReassignTo={setReassignTo}
        bulkNote={bulkNote}
        setBulkNote={setBulkNote}
        bulkTag={bulkTag}
        setBulkTag={setBulkTag}
      />
    </>
  );
};
