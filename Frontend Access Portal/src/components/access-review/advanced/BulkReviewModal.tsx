import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle } from 'lucide-react';
import { reviewItemService } from '@/services/accessReviewService';
import { toast } from 'sonner';

interface BulkReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: string[];
  onComplete: () => void;
}

export const BulkReviewModal: React.FC<BulkReviewModalProps> = ({
  open,
  onOpenChange,
  selectedItems,
  onComplete
}) => {
  const [decision, setDecision] = useState<'approve' | 'revoke'>('approve');
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!justification.trim()) {
      toast.error('Please provide justification');
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewItemService.bulkSubmitDecisions(selectedItems, decision, justification);
      toast.success(`Bulk ${decision} completed for ${selectedItems.length} items`);
      onComplete();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to submit bulk decision');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col p-0 h-full">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <DialogHeader className="p-0">
              <DialogTitle>Bulk Review Decision</DialogTitle>
              <DialogDescription>
                Apply a single decision to {selectedItems.length} selected review items at once.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                <div className="flex gap-2">
                  <Button
                    variant={decision === 'approve' ? 'default' : 'outline'}
                    onClick={() => setDecision('approve')}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve All ({selectedItems.length})
                  </Button>
                  <Button
                    variant={decision === 'revoke' ? 'destructive' : 'outline'}
                    onClick={() => setDecision('revoke')}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Revoke All ({selectedItems.length})
                  </Button>
                </div>

                <div>
                  <Label>Justification (Required)</Label>
                  <Textarea
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    rows={4}
                    placeholder="Provide business justification for this bulk decision..."
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting || !justification.trim()}>
                    {isSubmitting ? 'Submitting...' : `Submit ${decision}`}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
