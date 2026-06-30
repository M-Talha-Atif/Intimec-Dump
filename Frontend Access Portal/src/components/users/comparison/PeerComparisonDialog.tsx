
import React, { useState } from 'react';
import { type User } from '@/data/mock-users';
import { usePeerComparison } from '@/contexts/PeerComparisonContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import UserSelectionList from './UserSelectionList';
import ComparisonView from './ComparisonView';

type PeerComparisonDialogProps = {
  allUsers: User[];
};

const PeerComparisonDialog = ({ allUsers }: PeerComparisonDialogProps) => {
  const { isDialogOpen, setIsDialogOpen, selectedUsers, clearSelection } = usePeerComparison();
  const [isComparing, setIsComparing] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      clearSelection();
      setIsComparing(false);
    }
    setIsDialogOpen(isOpen);
  };

  const handleStartComparison = () => {
    if (selectedUsers.length > 1) {
      setIsComparing(true);
    }
  };

  const handleBackToSelection = () => {
    setIsComparing(false);
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Peer Comparison</DialogTitle>
          <DialogDescription>
            {isComparing ? 'Side-by-side comparison of selected identities.' : 'Select 2 to 3 identities to compare their access, risk, and activity.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {isComparing ? (
            <ComparisonView users={selectedUsers} />
          ) : (
            <UserSelectionList allUsers={allUsers} />
          )}
        </div>
        
        <DialogFooter className="mt-4">
          {isComparing ? (
             <Button variant="outline" onClick={handleBackToSelection}>Back to Selection</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => handleOpenChange(false)}>Cancel</Button>
              <Button onClick={handleStartComparison} disabled={selectedUsers.length < 2}>Compare ({selectedUsers.length})</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PeerComparisonDialog;
