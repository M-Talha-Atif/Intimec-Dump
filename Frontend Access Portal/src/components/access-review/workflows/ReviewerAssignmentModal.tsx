import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { reviewerService } from '@/services/accessReviewService';
import { mockUsers } from '@/data/mock-access-review-data';

interface ReviewerAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  totalItems: number;
}

export const ReviewerAssignmentModal: React.FC<ReviewerAssignmentModalProps> = ({
  open,
  onOpenChange,
  campaignId,
  totalItems
}) => {
  const [strategy, setStrategy] = useState<'load-balance' | 'manager-hierarchy' | 'custom'>('load-balance');
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async () => {
    if (selectedReviewers.length === 0) {
      toast.error('Please select at least one reviewer');
      return;
    }

    setIsAssigning(true);
    try {
      await reviewerService.assignReviewers(campaignId, selectedReviewers, strategy);
      toast.success(`Assigned ${totalItems} items to ${selectedReviewers.length} reviewers`);
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to assign reviewers');
    } finally {
      setIsAssigning(false);
    }
  };

  const itemsPerReviewer = selectedReviewers.length > 0 ? Math.ceil(totalItems / selectedReviewers.length) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Reviewers
          </DialogTitle>
          <DialogDescription>
            Configure reviewer assignment strategy for {totalItems} review items
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Assignment Strategy</Label>
            <Select value={strategy} onValueChange={(v: any) => setStrategy(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="load-balance">Load Balance (Equal Distribution)</SelectItem>
                <SelectItem value="manager-hierarchy">Manager Hierarchy (Auto-Assign)</SelectItem>
                <SelectItem value="custom">Custom Assignment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Select Reviewers</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {mockUsers.map(user => (
                <Card
                  key={user.id}
                  className={`cursor-pointer transition-colors ${
                    selectedReviewers.includes(user.id) ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => {
                    setSelectedReviewers(prev =>
                      prev.includes(user.id) ? prev.filter(id => id !== user.id) : [...prev, user.id]
                    );
                  }}
                >
                  <CardContent className="p-3">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.jobTitle}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {selectedReviewers.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">Assignment Preview</p>
                    <p className="text-xs text-blue-700 mt-1">
                      {selectedReviewers.length} reviewers selected • ~{itemsPerReviewer} items per reviewer
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {strategy === 'manager-hierarchy' && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800">Manager Hierarchy Mode</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Items will be automatically assigned to direct managers based on org structure
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isAssigning || selectedReviewers.length === 0}>
            {isAssigning ? 'Assigning...' : 'Assign Reviewers'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
