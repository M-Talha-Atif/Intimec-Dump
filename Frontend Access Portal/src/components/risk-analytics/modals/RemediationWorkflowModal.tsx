import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Target } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface RemediationWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  riskId: string;
  riskTitle: string;
}

export const RemediationWorkflowModal: React.FC<RemediationWorkflowModalProps> = ({
  isOpen,
  onClose,
  riskId,
  riskTitle
}) => {
  const { toast } = useToast();
  const [action, setAction] = useState<'mitigate' | 'accept' | 'transfer' | 'avoid'>('mitigate');
  const [owner, setOwner] = useState('');
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [dueDate, setDueDate] = useState<Date>();
  const [plan, setPlan] = useState('');
  const [justification, setJustification] = useState('');

  const handleSubmit = () => {
    toast({
      title: "Remediation Plan Created",
      description: `Remediation workflow initiated for: ${riskTitle}`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Create Remediation Plan</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">Risk</Label>
            <div className="text-sm font-medium mt-1">{riskTitle}</div>
          </div>

          <div className="space-y-2">
            <Label>Remediation Action</Label>
            <Select value={action} onValueChange={(value: any) => setAction(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mitigate">Mitigate - Reduce the risk</SelectItem>
                <SelectItem value="accept">Accept - Acknowledge and document</SelectItem>
                <SelectItem value="transfer">Transfer - Delegate to another party</SelectItem>
                <SelectItem value="avoid">Avoid - Eliminate the risk source</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Owner</Label>
            <Input
              placeholder="Enter owner email or name"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Remediation Plan</Label>
            <Textarea
              placeholder="Describe the steps to remediate this risk..."
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              rows={4}
            />
          </div>

          {action === 'accept' && (
            <div className="space-y-2">
              <Label>Justification (Required for Risk Acceptance)</Label>
              <Textarea
                placeholder="Provide business justification for accepting this risk..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!owner || (action === 'accept' && !justification)}>
            Create Remediation Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
