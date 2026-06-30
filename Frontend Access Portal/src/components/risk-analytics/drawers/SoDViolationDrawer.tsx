
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Download, ArrowRight } from 'lucide-react';
import { SoDViolation } from '@/types/riskAnalytics';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Props { isOpen: boolean; onClose: () => void; violation: SoDViolation | null; }

export const SoDViolationDrawer: React.FC<Props> = ({ isOpen, onClose, violation }) => {
  const { toast } = useToast();
  if (!violation) return null;

  const getStatusColor = (s: string) => {
    const c: Record<string, string> = {
      'Open': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'In Review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Mitigated': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Exception Granted': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    };
    return c[s] || '';
  };

  // Mock audit trail
  const auditTrail = [
    { date: '2026-03-01', action: 'Violation detected by SoD scan', actor: 'System' },
    { date: '2026-03-02', action: 'Assigned to IT Security for review', actor: 'Compliance Team' },
    { date: '2026-03-05', action: 'Impact assessment requested', actor: 'IT Security' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="flex flex-col p-0 h-full">
        <DialogHeader className="flex-shrink-0 px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            SoD Violation — {violation.id}
          </DialogTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={violation.severity === 'Critical' ? 'destructive' : 'secondary'} className="text-xs">{violation.severity}</Badge>
            <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium", getStatusColor(violation.remediationStatus))}>{violation.remediationStatus}</span>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 pb-6">
          {/* Details */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Policy</div>
                <div className="text-sm font-medium text-foreground">{violation.policyName}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Violator</div>
                <div className="text-sm font-medium text-foreground">{violation.violator}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Application</div>
                <div className="text-sm font-medium text-foreground">{violation.application}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Days Open</div>
                <div className={cn("text-sm font-medium", violation.daysOpen > 30 ? 'text-destructive' : 'text-foreground')}>{violation.daysOpen} days</div>
              </div>
            </div>
          </div>

          {/* Conflicting Entitlements */}
          <h3 className="text-sm font-semibold text-foreground mb-3">Conflicting Entitlements</h3>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 mb-6">
            <Badge variant="outline" className="text-xs px-3 py-1">{violation.conflictingEntitlements[0]}</Badge>
            <ArrowRight className="h-4 w-4 text-destructive flex-shrink-0" />
            <Badge variant="outline" className="text-xs px-3 py-1">{violation.conflictingEntitlements[1]}</Badge>
          </div>

          {/* Compensating Control */}
          <h3 className="text-sm font-semibold text-foreground mb-2">Compensating Control</h3>
          <div className="p-3 rounded border border-border mb-6">
            {violation.compensatingControl ? (
              <p className="text-sm text-foreground">{violation.compensatingControl}</p>
            ) : (
              <p className="text-sm text-destructive">No compensating control in place</p>
            )}
          </div>

          {/* Remediation Options */}
          <h3 className="text-sm font-semibold text-foreground mb-3">Remediation Actions</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            <Button size="sm" variant="outline" onClick={() => toast({ title: "Action Initiated", description: "Remove conflicting entitlement request submitted" })}>Remove Entitlement</Button>
            <Button size="sm" variant="outline" onClick={() => toast({ title: "Action Initiated", description: "Reassignment request submitted" })}>Reassign to Another User</Button>
            <Button size="sm" variant="outline" onClick={() => toast({ title: "Action Initiated", description: "Exception request submitted for review" })}>Request Exception</Button>
            <Button size="sm" variant="outline" onClick={() => toast({ title: "Action Initiated", description: "Compensating control proposal created" })}>Add Compensating Control</Button>
          </div>

          {/* Audit Trail */}
          <h3 className="text-sm font-semibold text-foreground mb-2">Audit Trail</h3>
          <div className="space-y-2 mb-4">
            {auditTrail.map((e, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <span className="text-muted-foreground whitespace-nowrap">{e.date}</span>
                <span className="text-foreground">{e.action}</span>
                <span className="text-muted-foreground ml-auto">{e.actor}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => toast({ title: "Export Started", description: "Violation details exported" })}>
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
