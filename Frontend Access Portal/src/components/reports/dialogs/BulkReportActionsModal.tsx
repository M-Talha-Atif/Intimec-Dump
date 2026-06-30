import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface BulkReportActionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedReports: string[];
  onExecute?: (action: string) => void;
}

export const BulkReportActionsModal = ({ open, onOpenChange, selectedReports, onExecute }: BulkReportActionsModalProps) => {
  const [action, setAction] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const { toast } = useToast();

  const handleExecute = () => {
    onExecute?.(action);
    toast({ title: "Bulk Action Executed", description: `${action} applied to ${selectedReports.length} reports` });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Actions</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {selectedReports.length} reports selected
          </p>
          <div>
            <Label>Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delete">Delete Reports</SelectItem>
                <SelectItem value="schedule">Schedule All</SelectItem>
                <SelectItem value="export">Export All</SelectItem>
                <SelectItem value="tag">Add Tag</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {action === 'delete' && (
            <div className="flex items-center space-x-2 p-3 bg-destructive/10 rounded">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <div className="flex items-center space-x-2">
                <Checkbox checked={confirmed} onCheckedChange={setConfirmed as any} />
                <Label className="text-sm">I understand this action cannot be undone</Label>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleExecute} disabled={!action || (action === 'delete' && !confirmed)}>
            Execute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
