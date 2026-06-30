import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Users, FileText, Shield, TrendingUp, Download, Plus, CheckCircle2 } from 'lucide-react';
import { getRiskBadgeClass } from '@/utils/getRiskColor';
import { cn } from '@/lib/utils';
import type { ConflictMatrixCell } from '@/types/sodPolicies';

interface ConflictDetailsModalProps {
  conflict: ConflictMatrixCell | null; open: boolean; onOpenChange: (open: boolean) => void;
  onCreatePolicy?: () => void; onBulkException?: () => void;
}

export const ConflictDetailsModal: React.FC<ConflictDetailsModalProps> = ({ conflict, open, onOpenChange, onCreatePolicy, onBulkException }) => {
  if (!conflict) return null;

  const affectedUsers = [
    { id: '1', name: 'John Smith', department: 'Finance', email: 'john.smith@company.com' },
    { id: '2', name: 'Sarah Johnson', department: 'Finance', email: 'sarah.johnson@company.com' },
    { id: '3', name: 'Mike Chen', department: 'Operations', email: 'mike.chen@company.com' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col p-0 h-full">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <DialogHeader className="p-0">
              <DialogTitle className="text-2xl">Conflict Analysis</DialogTitle>
              <DialogDescription>{conflict.row} ↔ {conflict.column} — Detailed conflict breakdown with affected users and policies.</DialogDescription>
              <div className="flex items-center gap-2 mt-3">
                <Badge className={cn(getRiskBadgeClass(conflict.riskLevel || 'medium'), "border text-xs")}>{(conflict.riskLevel || 'MEDIUM').toUpperCase()} RISK</Badge>
                <Badge variant="outline">{conflict.violationCount} violations</Badge>
                {conflict.exceptionCount > 0 && <Badge variant="secondary">{conflict.exceptionCount} exceptions</Badge>}
              </div>
              <div className="flex gap-2 mt-3">
                {onCreatePolicy && (<Button size="sm" onClick={onCreatePolicy}><Plus className="h-4 w-4 mr-2" />Create Policy</Button>)}
                {onBulkException && (<Button size="sm" variant="outline" onClick={onBulkException}><Shield className="h-4 w-4 mr-2" />Bulk Exception</Button>)}
                <Button size="sm" variant="outline" className="shrink-0 mr-4 mb-4"><Download className="h-4 w-4 mr-2" />Export</Button>
              </div>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <Card><CardContent className="pt-6"><AlertTriangle className="h-8 w-8 text-destructive mb-2" /><p className="text-2xl font-bold">{conflict.violationCount}</p><p className="text-sm text-muted-foreground">Active Violations</p></CardContent></Card>
                  <Card><CardContent className="pt-6"><Users className="h-8 w-8 text-primary mb-2" /><p className="text-2xl font-bold">{affectedUsers.length}</p><p className="text-sm text-muted-foreground">Affected Users</p></CardContent></Card>
                  <Card><CardContent className="pt-6"><TrendingUp className="h-8 w-8 text-primary mb-2" /><p className="text-2xl font-bold">89%</p><p className="text-sm text-muted-foreground">Risk Score</p></CardContent></Card>
                </div>

                <Card>
                  <CardHeader><CardTitle className="text-lg">Conflict Description</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Conflicting Items</label>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="outline" className="text-base px-4 py-2">{conflict.row}</Badge>
                          <span className="text-muted-foreground">conflicts with</span>
                          <Badge variant="outline" className="text-base px-4 py-2">{conflict.column}</Badge>
                        </div>
                      </div>
                      <Separator />
                      <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                          <div>
                            <p className="font-medium">Risk Scenario</p>
                            <p className="text-sm text-muted-foreground mt-1">Users with both these roles/entitlements can create and approve their own transactions, leading to potential fraud.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" />Related Policies ({conflict.policyIds.length})</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {conflict.policyIds.map((policyId) => (
                        <div key={policyId} className="flex items-center justify-between p-3 bg-muted rounded-lg"><div><p className="font-medium">Policy {policyId}</p><p className="text-sm text-muted-foreground">SOX Compliance - Financial Controls</p></div><Button variant="ghost" size="sm">View Policy</Button></div>
                      ))}
                      {conflict.policyIds.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-2 opacity-50" /><p className="text-sm">No policies defined for this conflict</p>{onCreatePolicy && (<Button variant="link" className="mt-2" onClick={onCreatePolicy}>Create Policy Now</Button>)}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" />Affected Users ({affectedUsers.length})</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {affectedUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg"><div><p className="font-medium">{user.name}</p><p className="text-sm text-muted-foreground">{user.email}</p></div><div className="flex items-center gap-2"><Badge variant="outline">{user.department}</Badge><Button variant="outline" size="sm">View Details</Button></div></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Remediation Recommendations</p>
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <li>• Remove conflicting role from {affectedUsers.length} users</li>
                          <li>• Create formal policy to prevent future violations</li>
                          <li>• Consider role redesign to eliminate inherent conflict</li>
                          <li>• Implement compensating controls if roles must coexist</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
                  <Button>Create Remediation Plan</Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
