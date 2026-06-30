import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserCheck } from 'lucide-react';
import { reassignRecipients } from '../data/taskActionData';

interface ReassignTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  taskName: string;
  currentAssignee?: string;
}

export const ReassignTaskModal: React.FC<ReassignTaskModalProps> = ({
  open,
  onOpenChange,
  taskName,
  currentAssignee
}) => {
  const { toast } = useToast();
  const [newAssignee, setNewAssignee] = useState('');
  const [reason, setReason] = useState('');
  const [notifyPrevious, setNotifyPrevious] = useState(true);

  const handleReassign = () => {
    toast({
      title: "Task Reassigned",
      description: `Task "${taskName}" has been reassigned to ${newAssignee}`
    });
    onOpenChange(false);
    setNewAssignee('');
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-500" />
            Reassign Task
          </DialogTitle>
          <DialogDescription>
            Reassign &quot;{taskName}&quot; to another team member
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {currentAssignee && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Current Assignee</p>
              <p className="font-medium">{currentAssignee}</p>
            </div>
          )}

          <div>
            <Label htmlFor="new-assignee">New Assignee *</Label>
            <Select value={newAssignee} onValueChange={setNewAssignee}>
              <SelectTrigger id="new-assignee">
                <SelectValue placeholder="Select new assignee" />
              </SelectTrigger>
              <SelectContent>
                {reassignRecipients.map(recipient => (
                  <SelectItem key={recipient.value} value={recipient.value}>
                    {recipient.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reason">Reason for Reassignment</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional: Explain why you're reassigning this task..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="notify-previous"
              checked={notifyPrevious}
              onChange={(e) => setNotifyPrevious(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="notify-previous" className="cursor-pointer text-sm">
              Notify previous assignee
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleReassign} disabled={!newAssignee}>
            Reassign Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
