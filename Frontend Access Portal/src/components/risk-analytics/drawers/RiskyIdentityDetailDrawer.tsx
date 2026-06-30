
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { User, Shield, Award, KeyRound, ShieldAlert, Download } from 'lucide-react';
import { HighRiskIdentity } from '@/types/riskAnalytics';
import { sodViolations, unusedAccessEntries } from '@/data/mock-risk-analytics';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Props { isOpen: boolean; onClose: () => void; identity: HighRiskIdentity | null; }

export const RiskyIdentityDetailDrawer: React.FC<Props> = ({ isOpen, onClose, identity }) => {
  const { toast } = useToast();
  if (!identity) return null;

  const relatedViolations = sodViolations.filter(v => v.violator === identity.name);
  const relatedUnused = unusedAccessEntries.filter(e => e.identity === identity.name);

  const scores = [
    { label: 'Access Risk', value: identity.accessScore, icon: <ShieldAlert className="h-3.5 w-3.5" /> },
    { label: 'SoD Score', value: identity.sodScore, icon: <Shield className="h-3.5 w-3.5" /> },
    { label: 'Certification', value: identity.certScore, icon: <Award className="h-3.5 w-3.5" /> },
    { label: 'Privilege', value: identity.privilegeScore, icon: <KeyRound className="h-3.5 w-3.5" /> },
  ];

  const getScoreColor = (v: number) => v >= 80 ? 'text-destructive' : v >= 60 ? 'text-orange-600' : 'text-green-600';

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="flex flex-col p-0 h-full">
        <DialogHeader className="flex-shrink-0 px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {identity.name}
          </DialogTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">{identity.type}</Badge>
            <span className="text-xs text-muted-foreground">{identity.department}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">Last review: {identity.lastReview}</span>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 pb-6">
          {/* Overall Risk */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 mb-4">
            <div className="text-center">
              <div className={cn("text-3xl font-bold", getScoreColor(identity.riskScore))}>{identity.riskScore}</div>
              <div className="text-xs text-muted-foreground">Risk Score</div>
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="text-xs text-muted-foreground">{identity.violations} active violations</div>
              <Badge variant={identity.remediationStatus === 'Open' ? 'destructive' : identity.remediationStatus === 'In Progress' ? 'secondary' : 'outline'} className="text-xs">{identity.remediationStatus}</Badge>
            </div>
          </div>

          {/* Score Breakdown */}
          <h3 className="text-sm font-semibold text-foreground mb-3">Risk Score Breakdown</h3>
          <div className="space-y-3 mb-6">
            {scores.map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="text-muted-foreground">{s.icon}</span>
                <span className="text-xs text-muted-foreground w-24">{s.label}</span>
                <Progress value={s.value} className="h-2 flex-1" />
                <span className={cn("text-xs font-semibold w-8 text-right", getScoreColor(s.value))}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* SoD Violations */}
          {relatedViolations.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-foreground mb-2">SoD Violations ({relatedViolations.length})</h3>
              <div className="space-y-2 mb-6">
                {relatedViolations.map(v => (
                  <div key={v.id} className="p-3 rounded border border-border text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground">{v.policyName}</span>
                      <Badge variant={v.severity === 'Critical' ? 'destructive' : 'secondary'} className="text-xs">{v.severity}</Badge>
                    </div>
                    <div className="text-muted-foreground">{v.conflictingEntitlements.join(' ↔ ')} • {v.application}</div>
                    <div className="text-muted-foreground mt-1">{v.daysOpen}d open • {v.remediationStatus}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Unused Access */}
          {relatedUnused.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-foreground mb-2">Unused Access ({relatedUnused.length})</h3>
              <div className="space-y-2 mb-6">
                {relatedUnused.map(u => (
                  <div key={u.id} className="p-3 rounded border border-border text-xs flex items-center justify-between">
                    <div>
                      <span className="font-medium text-foreground">{u.entitlement}</span>
                      <span className="text-muted-foreground ml-2">• {u.application}</span>
                    </div>
                    <span className="text-muted-foreground">{u.daysInactive}d inactive</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => toast({ title: "Export Started", description: `Identity risk profile exported` })}>
              <Download className="h-3.5 w-3.5 mr-1" /> Export Profile
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
