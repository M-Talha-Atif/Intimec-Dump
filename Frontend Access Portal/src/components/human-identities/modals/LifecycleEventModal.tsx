
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, User, Building, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface LifecycleEvent {
  name: string;
  event: string;
  due: string;
  department: string;
  status: string;
}

interface LifecycleEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: LifecycleEvent | null;
}

const getChecklist = (eventType: string) => {
  const checklists: Record<string, string[]> = {
    'Probation Ending': ['Complete performance review', 'Confirm role entitlements', 'Update access level to permanent', 'Remove probation restrictions'],
    'Internal Transfer': ['Revoke source department access', 'Provision target department access', 'Update manager assignment', 'Transfer pending reviews'],
    'Contract Renewal': ['Review current access scope', 'Validate contractor justification', 'Renew access certificates', 'Update contract end date'],
    'Offboarding': ['Disable all application access', 'Revoke VPN/network access', 'Transfer data ownership', 'Archive mailbox', 'Collect hardware'],
    'Promotion Review': ['Review current entitlements', 'Add role-based access for new level', 'Update approval authority', 'Assign new review group'],
  };
  return checklists[eventType] || ['Review access', 'Update entitlements', 'Notify manager'];
};

export function LifecycleEventModal({ open, onOpenChange, event }: LifecycleEventModalProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  if (!event) return null;

  const checklist = getChecklist(event.event);
  const toggleCheck = (idx: number) => {
    const next = new Set(checked);
    next.has(idx) ? next.delete(idx) : next.add(idx);
    setChecked(next);
  };

  const handleApprove = () => {
    toast({ title: "Event Approved", description: `${event.event} for ${event.name} has been approved and actions queued.` });
    onOpenChange(false);
    setChecked(new Set());
  };

  const handleEscalate = () => {
    toast({ title: "Escalated", description: `${event.event} for ${event.name} escalated to senior management.` });
    onOpenChange(false);
    setChecked(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setChecked(new Set()); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {/* <Calendar className="h-5 w-5 text-primary" /> */}
            Lifecycle Event Details
          </DialogTitle>

          <DialogDescription className="text-muted-foreground">
            Review lifecycle event information including event type, affected identities, timestamps, and associated governance actions.
          </DialogDescription>
        </DialogHeader>

        {/* Summary strip */}
        <div className="flex flex-wrap gap-3 pt-4">
          <div className="flex items-center gap-1.5 text-sm">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">{event.name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Building className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{event.department}</span>
          </div>
          <Badge variant="outline">{event.event}</Badge>
          <Badge className={
            event.status === 'Action Required' ? 'bg-destructive/10 text-destructive border-destructive/20' :
              event.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                'bg-muted text-muted-foreground'
          }>{event.status}</Badge>
        </div>

        {/* Due date */}
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Due Date:</span> {event.due}
        </div>

        {/* Access Impact */}
        <div className="space-y-2 pt-4">
          <h4 className="text-sm font-medium flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-600" />
            Access Impact
          </h4>
          <div className="text-xs text-muted-foreground bg-muted/50 rounded p-3 space-y-1">
            <p>• {event.event === 'Offboarding' ? '12 application accesses to be revoked' : '5 entitlements affected by this transition'}</p>
            <p>• {event.event === 'Internal Transfer' ? '3 new role-based accesses to be provisioned' : '2 privileged accesses require re-certification'}</p>
            <p>• Last access review: 45 days ago</p>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-2 pt-4">
          <h4 className="text-sm font-medium flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
            Required Actions ({checked.size}/{checklist.length})
          </h4>
          <div className="space-y-2">
            {checklist.map((item, i) => (
              <label key={i} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded p-1.5 -mx-1.5">
                <Checkbox checked={checked.has(i)} onCheckedChange={() => toggleCheck(i)} />
                <span className={checked.has(i) ? 'line-through text-muted-foreground' : ''}>{item}</span>
              </label>
            ))}
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={handleEscalate}>Escalate</Button>
          <Button onClick={handleApprove} disabled={checked.size < checklist.length}>
            Approve & Execute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
