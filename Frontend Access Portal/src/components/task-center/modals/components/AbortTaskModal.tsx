import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from 'lucide-react';

interface AbortTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  taskName: string;
}

export const AbortTaskModal: React.FC<AbortTaskModalProps> = ({
  open,
  onOpenChange,
  taskName
}) => {
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [cleanup, setCleanup] = useState(true);

  const handleAbort = () => {
    toast({
      title: "Task Aborted",
      description: `Task "${taskName}" has been aborted`,
      variant: "destructive"
    });
    onOpenChange(false);
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Abort Task
          </DialogTitle>
          <DialogDescription>
            This will immediately stop the task &quot;{taskName}&quot;. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> Aborting this task may leave the system in an inconsistent state.
            </p>
          </div>

          <div>
            <Label htmlFor="abort-reason">Reason for Aborting *</Label>
            <Textarea
              id="abort-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you're aborting this task..."
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="cleanup"
              checked={cleanup}
              onChange={(e) => setCleanup(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="cleanup" className="cursor-pointer text-sm">
              Attempt to clean up partial changes
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleAbort} disabled={!reason}>
            Abort Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
