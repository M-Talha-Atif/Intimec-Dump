import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, User, FileText, Clock, CheckCircle2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface AlertInvestigationModalProps {
  alertId: string;
  open: boolean;
  onClose: () => void;
}

export const AlertInvestigationModal = ({ alertId, open, onClose }: AlertInvestigationModalProps) => {
  const [investigationNotes, setInvestigationNotes] = useState('');
  const [status, setStatus] = useState<'investigating' | 'resolved' | 'escalated'>('investigating');
  const { toast } = useToast();

  const mockAlert = {
    id: alertId,
    type: 'critical_violation',
    title: 'Critical SoD Violation Detected',
    description: 'User John Smith gained conflicting Finance + IT Admin roles',
    severity: 'critical',
    timestamp: '2025-06-15 14:23:00',
    affectedUser: {
      id: 'USR-12345',
      name: 'John Smith',
      email: 'john.smith@company.com',
      department: 'Finance',
      manager: 'Sarah Johnson',
    },
    conflictDetails: {
      roles: ['Finance Manager', 'IT Administrator'],
      systems: ['SAP ERP', 'Active Directory'],
      violatedPolicy: 'POL-001: Finance-IT Segregation',
      riskScore: 95,
    },
    timeline: [
      { time: '14:23:00', event: 'Alert triggered by automated scan' },
      { time: '14:23:45', event: 'IT Admin role assigned to user' },
      { time: '14:22:30', event: 'Role assignment approved by manager' },
      { time: '12:15:00', event: 'Role assignment requested' },
    ],
    relatedViolations: [
      { id: 'VIO-234', policy: 'Finance-IT Segregation', status: 'Open' },
    ],
    systemLogs: [
      { time: '14:23:45', system: 'Active Directory', action: 'Role Added: IT Administrator', user: 'admin@company.com' },
      { time: '14:22:30', system: 'IGA System', action: 'Role assignment approved', user: 'manager@company.com' },
    ],
  };

  const handleResolve = () => {
    if (!investigationNotes.trim()) {
      toast({
        title: "Validation Error",
        description: "Please add investigation notes before resolving",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Alert Resolved",
      description: `Alert ${alertId} has been marked as resolved`,
    });
    onClose();
  };

  const handleEscalate = () => {
    toast({
      title: "Alert Escalated",
      description: `Alert ${alertId} has been escalated to security team`,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Alert Investigation: {alertId}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Alert Summary */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-red-900">{mockAlert.title}</h3>
                <Badge variant="destructive">{mockAlert.severity}</Badge>
              </div>
              <p className="text-sm text-red-700 mb-2">{mockAlert.description}</p>
              <p className="text-xs text-red-600">Detected: {mockAlert.timestamp}</p>
            </CardContent>
          </Card>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="logs">System Logs</TabsTrigger>
              <TabsTrigger value="investigation">Investigation</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5" />
                    Affected User
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p className="text-sm">{mockAlert.affectedUser.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-sm">{mockAlert.affectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Department</p>
                      <p className="text-sm">{mockAlert.affectedUser.department}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Manager</p>
                      <p className="text-sm">{mockAlert.affectedUser.manager}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5" />
                    Conflict Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Conflicting Roles</p>
                    <div className="flex gap-2">
                      {mockAlert.conflictDetails.roles.map((role, idx) => (
                        <Badge key={idx} variant="destructive">{role}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Affected Systems</p>
                    <div className="flex gap-2">
                      {mockAlert.conflictDetails.systems.map((system, idx) => (
                        <Badge key={idx} variant="outline">{system}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Violated Policy</p>
                    <p className="text-sm">{mockAlert.conflictDetails.violatedPolicy}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
                    <p className="text-2xl font-bold text-red-600">{mockAlert.conflictDetails.riskScore}/100</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5" />
                    Event Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockAlert.timeline.map((item, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium">{item.event}</p>
                            <span className="text-xs text-muted-foreground">{item.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Logs Tab */}
            <TabsContent value="logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    System Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 font-mono text-xs">
                    {mockAlert.systemLogs.map((log, idx) => (
                      <div key={idx} className="p-2 bg-muted rounded">
                        <span className="text-muted-foreground">[{log.time}]</span>{' '}
                        <span className="text-primary">[{log.system}]</span>{' '}
                        {log.action} - <span className="text-muted-foreground">by {log.user}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Investigation Tab */}
            <TabsContent value="investigation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Investigation Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Document your investigation findings, actions taken, and recommendations..."
                    value={investigationNotes}
                    onChange={(e) => setInvestigationNotes(e.target.value)}
                    rows={8}
                  />

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Recommended Actions:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>Remove IT Administrator role from user</li>
                      <li>Notify manager for approval</li>
                      <li>Request business justification if access is required</li>
                      <li>Implement compensating controls if exception is granted</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleEscalate}>
                Escalate to Security Team
              </Button>
              <Button onClick={handleResolve}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Resolved
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
