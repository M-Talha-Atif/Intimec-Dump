
import { useState } from 'react';
import { getActionData, canExecuteAction } from '../utils/taskBulkUtils';

interface UseTaskBulkActionsProps {
  selectedTasks: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onBulkAction: (taskIds: string[], action: string, additionalData?: any) => void;
}

export const useTaskBulkActions = ({ selectedTasks, onBulkAction }: UseTaskBulkActionsProps) => {
  const [reassignTo, setReassignTo] = useState('');
  const [bulkNote, setBulkNote] = useState('');
  const [bulkTag, setBulkTag] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState('');

  const handleBulkActionWrapper = (action: string) => {
    // For direct actions like retry/abort/escalate that don't need the dialog form data
    // or if confirming from dialog
    const data = { reassignTo, bulkNote, bulkTag };
    const actionData = getActionData(action, data);
    
    onBulkAction(selectedTasks, action, actionData);
    
    // Reset state
    setIsDialogOpen(false);
    setCurrentAction('');
    setReassignTo('');
    setBulkNote('');
    setBulkTag('');
  };

  const openActionDialog = (action: string) => {
    setCurrentAction(action);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const isActionExecutable = () => {
    return canExecuteAction(currentAction, { reassignTo, bulkNote, bulkTag });
  };

  return {
    // State
    reassignTo,
    setReassignTo,
    bulkNote,
    setBulkNote,
    bulkTag,
    setBulkTag,
    isDialogOpen,
    setIsDialogOpen,
    currentAction,

    // Handlers
    handleBulkAction: handleBulkActionWrapper,
    openActionDialog,
    closeDialog,
    isActionExecutable
  };
};
