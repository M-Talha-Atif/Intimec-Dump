
import React from 'react';
import { Button } from "@/components/ui/button";
import { RotateCcw, X, ArrowUp, UserCheck, Tag, StickyNote } from 'lucide-react';

interface BulkActionButtonsProps {
  onAction: (action: string) => void;
  onOpenDialog: (action: string) => void;
}

export const BulkActionButtons: React.FC<BulkActionButtonsProps> = ({ 
  onAction, 
  onOpenDialog 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => onAction('retry')}
      >
        <RotateCcw className="h-4 w-4 mr-1" />
        Retry
      </Button>
      
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => onAction('abort')}
      >
        <X className="h-4 w-4 mr-1" />
        Abort
      </Button>
      
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => onAction('escalate')}
      >
        <ArrowUp className="h-4 w-4 mr-1" />
        Escalate
      </Button>
      
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => onOpenDialog('reassign')}
      >
        <UserCheck className="h-4 w-4 mr-1" />
        Reassign
      </Button>
      
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => onOpenDialog('addTag')}
      >
        <Tag className="h-4 w-4 mr-1" />
        Tag
      </Button>
      
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => onOpenDialog('addNote')}
      >
        <StickyNote className="h-4 w-4 mr-1" />
        Note
      </Button>
    </div>
  );
};
