import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ReportCloneModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportName: string;
  onClone?: (config: any) => void;
}

export const ReportCloneModal = ({ open, onOpenChange, reportName, onClone }: ReportCloneModalProps) => {
  const [name, setName] = useState(`${reportName} (Copy)`);
  const [description, setDescription] = useState('');
  const [includeSchedule, setIncludeSchedule] = useState(false);
  const { toast } = useToast();

  const handleClone = () => {
    onClone?.({ name, description, includeSchedule });
    toast({ title: "Report Cloned", description: `Created "${name}"` });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Copy className="h-5 w-5" />
            <span>Clone Report</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Report Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox checked={includeSchedule} onCheckedChange={setIncludeSchedule as any} />
            <Label>Include schedule configuration</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleClone}>Clone Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
