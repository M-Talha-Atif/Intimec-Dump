
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Shield, Clock, User, FileText } from 'lucide-react';
import { getRiskBadgeClass } from '@/utils/getRiskColor';
import { cn } from '@/lib/utils';

interface ViolationDetailsPanelProps {
  violation: any;
  open: boolean;
  onClose: () => void;
}

export const ViolationDetailsPanel = ({ violation, open, onClose }: ViolationDetailsPanelProps) => {
  if (!violation) return null;

  const mockHistory = [
    { timestamp: '2025-06-14 09:15:00', action: 'Violation Detected', actor: 'System', details: 'Automated policy scan detected conflict' },
    { timestamp: '2025-06-14 10:30:00', action: 'Risk Assessment', actor: 'Security Team', details: 'Risk score calculated at 85/100' },
    { timestamp: '2025-06-14 14:20:00', action: 'Manager Notified', actor: 'System', details: 'Notification sent to direct manager' }
  ];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-5xl flex flex-col p-0 h-full">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <SheetHeader className="p-0">
              <SheetTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Violation Details - {violation.id}
              </SheetTitle>
              <SheetDescription>Complete details, history, and conflict analysis for this SoD violation.</SheetDescription>
            </SheetHeader>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Shield className="h-5 w-5" />Overview</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><p className="text-sm font-medium text-muted-foreground">Status</p><Badge className={cn(getRiskBadgeClass(violation.status), "border text-xs")}>{violation.status}</Badge></div>
                      <div><p className="text-sm font-medium text-muted-foreground">Severity</p><Badge className={cn(getRiskBadgeClass(violation.severity), "border text-xs")}>{violation.severity}</Badge></div>
                      <div><p className="text-sm font-medium text-muted-foreground">Risk Score</p><span className="text-lg font-bold text-destructive">{violation.riskScore}/100</span></div>
                      <div><p className="text-sm font-medium text-muted-foreground">Detected</p><span className="text-sm">{violation.detected}</span></div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5" />Policy Information</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div><p className="text-sm font-medium text-muted-foreground">Policy Name</p><p className="text-base">{violation.policy}</p></div>
                    <div><p className="text-sm font-medium text-muted-foreground">Description</p><p className="text-sm text-muted-foreground">{violation.description}</p></div>
                    <div><p className="text-sm font-medium text-muted-foreground">Compliance Framework</p><div className="flex gap-2 mt-1"><Badge variant="outline">SOX</Badge><Badge variant="outline">Internal Controls</Badge></div></div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5" />Affected User & Systems</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div><p className="text-sm font-medium text-muted-foreground">User</p><p className="text-base">{violation.user}</p></div>
                    <div><p className="text-sm font-medium text-muted-foreground">Department</p><p className="text-base">Finance</p></div>
                    <div><p className="text-sm font-medium text-muted-foreground">Affected Systems</p><div className="flex flex-wrap gap-2 mt-1">{violation.affectedSystems.map((system: string, index: number) => (<Badge key={index} variant="secondary">{system}</Badge>))}</div></div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Conflict Analysis</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-destructive/5 border border-destructive/20 rounded">
                      <p className="text-sm font-medium">Detected Conflict</p>
                      <p className="text-sm text-muted-foreground mt-1">User has conflicting roles: Finance Manager + IT Administrator</p>
                    </div>
                    <div><p className="text-sm font-medium text-muted-foreground">Risk Assessment</p><p className="text-sm text-muted-foreground">High risk of financial fraud due to ability to both approve payments and modify system configurations</p></div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Activity History</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockHistory.map((entry, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start"><p className="text-sm font-medium">{entry.action}</p><span className="text-xs text-muted-foreground">{entry.timestamp}</span></div>
                            <p className="text-xs text-muted-foreground">{entry.details}</p>
                            <p className="text-xs text-muted-foreground">by {entry.actor}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Remediation Status</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-destructive"></div><span className="text-sm">Awaiting Action</span></div>
                    <p className="text-sm text-muted-foreground mt-2">No remediation actions have been taken yet. This violation requires immediate attention.</p>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
