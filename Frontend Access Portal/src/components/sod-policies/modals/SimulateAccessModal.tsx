
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, AlertTriangle, CheckCircle, XCircle, Play, User, Shield } from "lucide-react";
import { getRiskBadgeClass } from '@/utils/getRiskColor';
import { cn } from '@/lib/utils';

interface SimulationResult {
  status: 'safe' | 'conflict' | 'exception';
  message: string;
  policyHits: Array<{ policyName: string; riskLevel: string; recommendation: string; }>;
  recommendedActions: string[];
}

interface SimulateAccessModalProps {
  onSimulationRun?: (result: SimulationResult) => void;
}

export const SimulateAccessModal = ({ onSimulationRun }: SimulateAccessModalProps) => {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedEntitlements, setSelectedEntitlements] = useState<string[]>([]);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const users = ['John Smith (Finance Manager)', 'Sarah Johnson (IT Administrator)', 'Mike Chen (HR Business Partner)', 'Lisa Rodriguez (Sales Director)', 'David Kim (Audit Manager)'];
  const roles = ['Finance Manager', 'IT Administrator', 'HR Business Partner', 'Sales Director', 'Audit Manager', 'System Administrator', 'Compliance Officer'];
  const entitlements = ['Approve Invoices', 'Create Users', 'View Payroll', 'Access Financial Reports', 'Modify System Configuration', 'Generate Audit Reports'];

  const runSimulation = async () => {
    setIsSimulating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const hasConflict = selectedRoles.includes('Finance Manager') && selectedRoles.includes('IT Administrator');
    const hasException = selectedRoles.includes('Sales Director') && selectedEntitlements.includes('View Payroll');
    let result: SimulationResult;
    if (hasConflict) {
      result = { status: 'conflict', message: 'Access conflict detected - Assignment blocked', policyHits: [{ policyName: 'SOX Financial Controls', riskLevel: 'High', recommendation: 'Remove either Finance Manager or IT Administrator role' }], recommendedActions: ['Request exception with business justification', 'Consider alternative role assignment', 'Implement compensating controls'] };
    } else if (hasException) {
      result = { status: 'exception', message: 'Exception required - Approval needed', policyHits: [{ policyName: 'HR Data Protection', riskLevel: 'Medium', recommendation: 'Require manager approval for payroll access' }], recommendedActions: ['Submit exception request to HR manager', 'Provide business justification', 'Set access expiration date'] };
    } else {
      result = { status: 'safe', message: 'No conflicts detected - Access can be granted', policyHits: [], recommendedActions: ['Proceed with access assignment', 'Monitor for future policy changes'] };
    }
    setSimulationResult(result);
    setIsSimulating(false);
    if (onSimulationRun) onSimulationRun(result);
  };

  const addRole = (role: string) => { if (!selectedRoles.includes(role)) setSelectedRoles(prev => [...prev, role]); };
  const removeRole = (role: string) => setSelectedRoles(prev => prev.filter(r => r !== role));
  const addEntitlement = (ent: string) => { if (!selectedEntitlements.includes(ent)) setSelectedEntitlements(prev => [...prev, ent]); };
  const removeEntitlement = (ent: string) => setSelectedEntitlements(prev => prev.filter(e => e !== ent));

  const getStatusIcon = (status: string) => {
    switch (status) { case 'safe': return <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />; case 'conflict': return <XCircle className="h-6 w-6 text-destructive" />; case 'exception': return <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />; default: return null; }
  };

  const getStatusCardClass = (status: string) => {
    switch (status) { case 'safe': return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'; case 'conflict': return 'border-destructive/30 bg-destructive/5'; case 'exception': return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'; default: return 'border-border bg-muted'; }
  };

  const resetSimulation = () => { setSelectedUser(''); setSelectedRoles([]); setSelectedEntitlements([]); setSimulationResult(null); };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-2" />Simulate Access</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col p-0 h-full">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <DialogHeader className="p-0">
              <DialogTitle>Access Simulation</DialogTitle>
              <DialogDescription>Simulate access changes to detect potential SoD conflicts before they occur.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="user">Select User</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger id="user"><SelectValue placeholder="Choose a user to simulate access for" /></SelectTrigger>
                    <SelectContent>{users.map((user) => (<SelectItem key={user} value={user}><div className="flex items-center gap-2"><User className="h-4 w-4" />{user}</div></SelectItem>))}</SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Roles to Assign</Label>
                  <Select onValueChange={addRole}>
                    <SelectTrigger><SelectValue placeholder="Select roles to assign" /></SelectTrigger>
                    <SelectContent>{roles.filter(r => !selectedRoles.includes(r)).map((role) => (<SelectItem key={role} value={role}><div className="flex items-center gap-2"><Shield className="h-4 w-4" />{role}</div></SelectItem>))}</SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedRoles.map((role) => (<Badge key={role} variant="secondary" className="flex items-center gap-1">{role}<button onClick={() => removeRole(role)}>×</button></Badge>))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Entitlements to Assign</Label>
                  <Select onValueChange={addEntitlement}>
                    <SelectTrigger><SelectValue placeholder="Select entitlements to assign" /></SelectTrigger>
                    <SelectContent>{entitlements.filter(e => !selectedEntitlements.includes(e)).map((ent) => (<SelectItem key={ent} value={ent}>{ent}</SelectItem>))}</SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedEntitlements.map((ent) => (<Badge key={ent} variant="outline" className="flex items-center gap-1">{ent}<button onClick={() => removeEntitlement(ent)}>×</button></Badge>))}
                  </div>
                </div>

                {simulationResult && (
                  <Card className={`${getStatusCardClass(simulationResult.status)} border-2`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {getStatusIcon(simulationResult.status)}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{simulationResult.message}</h3>
                          {simulationResult.policyHits.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-medium mb-2">Policy Hits:</h4>
                              {simulationResult.policyHits.map((hit, index) => (
                                <div key={index} className="mb-2 p-3 bg-background rounded border">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium">{hit.policyName}</span>
                                    <Badge className={cn(getRiskBadgeClass(hit.riskLevel), "border text-xs")}>{hit.riskLevel} Risk</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{hit.recommendation}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium mb-2">Recommended Actions:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {simulationResult.recommendedActions.map((action, index) => (<li key={index}>{action}</li>))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={resetSimulation}>Reset</Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
                    <Button onClick={runSimulation} disabled={!selectedUser || (selectedRoles.length === 0 && selectedEntitlements.length === 0) || isSimulating}>
                      <Play className="h-4 w-4 mr-2" />{isSimulating ? 'Simulating...' : 'Run Simulation'}
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
