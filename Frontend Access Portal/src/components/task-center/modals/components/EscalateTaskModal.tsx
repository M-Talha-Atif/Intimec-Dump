import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowUp } from 'lucide-react';
import { escalationRecipients, urgencyLevels } from '../data/taskActionData';

interface EscalateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  taskName: string;
}

export const EscalateTaskModal: React.FC<EscalateTaskModalProps> = ({
  open,
  onOpenChange,
  taskName
}) => {
  const { toast } = useToast();
  const [escalateTo, setEscalateTo] = useState('');
  const [justification, setJustification] = useState('');
  const [priority, setPriority] = useState('high');

  const handleEscalate = () => {
    toast({
      title: "Task Escalated",
      description: `Task "${taskName}" has been escalated to ${escalateTo}`
    });
    onOpenChange(false);
    setEscalateTo('');
    setJustification('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUp className="h-5 w-5 text-orange-500" />
            Escalate Task
          </DialogTitle>
          <DialogDescription>
            Escalate &quot;{taskName}&quot; to a higher authority
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="escalate-to">Escalate To *</Label>
            <Select value={escalateTo} onValueChange={setEscalateTo}>
              <SelectTrigger id="escalate-to">
                <SelectValue placeholder="Select recipient" />
              </SelectTrigger>
              <SelectContent>
                {escalationRecipients.map(recipient => (
                  <SelectItem key={recipient.value} value={recipient.value}>
                    {recipient.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priority">Priority Level</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {urgencyLevels.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="justification">Justification *</Label>
            <Textarea
              id="justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Explain why this task needs escalation..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleEscalate} disabled={!escalateTo || !justification}>
            Escalate Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
