import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Workflow, Plus, Trash2, Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface WorkflowBuilderModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (workflow: any) => void;
}

export const WorkflowBuilderModal = ({ open, onClose, onSave }: WorkflowBuilderModalProps) => {
  const [workflowName, setWorkflowName] = useState('');
  const [trigger, setTrigger] = useState('');
  const [steps, setSteps] = useState<any[]>([
    { id: '1', type: 'approval', config: { approver: '', timeout: 24 } }
  ]);
  const { toast } = useToast();

  const stepTypes = [
    { value: 'approval', label: 'Approval Step' },
    { value: 'notification', label: 'Send Notification' },
    { value: 'assignment', label: 'Assign Task' },
    { value: 'condition', label: 'Conditional Branch' },
    { value: 'action', label: 'Execute Action' },
  ];

  const triggers = [
    { value: 'violation_detected', label: 'Violation Detected' },
    { value: 'exception_requested', label: 'Exception Requested' },
    { value: 'policy_created', label: 'Policy Created' },
    { value: 'sla_breach', label: 'SLA Breach' },
  ];

  const addStep = () => {
    setSteps([...steps, { id: `${steps.length + 1}`, type: 'approval', config: {} }]);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(step => step.id !== id));
  };

  const updateStep = (id: string, updates: any) => {
    setSteps(steps.map(step => step.id === id ? { ...step, ...updates } : step));
  };

  const handleSave = () => {
    if (!workflowName.trim() || !trigger) {
      toast({ title: "Validation Error", description: "Please provide workflow name and trigger", variant: "destructive" });
      return;
    }
    onSave({ name: workflowName, trigger, steps, createdAt: new Date().toISOString() });
    toast({ title: "Workflow Saved", description: `Workflow "${workflowName}" has been created` });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl flex flex-col p-0 h-[90vh]">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <DialogHeader className="p-0">
              <DialogTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Workflow Builder
              </DialogTitle>
              <DialogDescription>
                Design automated workflows for policy violations and exceptions.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="workflow-name">Workflow Name *</Label>
                  <Input id="workflow-name" placeholder="e.g., Critical Violation Escalation" value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Trigger Event *</Label>
                  <Select value={trigger} onValueChange={setTrigger}>
                    <SelectTrigger><SelectValue placeholder="Select trigger event" /></SelectTrigger>
                    <SelectContent>
                      {triggers.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Workflow Steps</Label>
                    <Button size="sm" variant="outline" onClick={addStep}>
                      <Plus className="h-4 w-4 mr-2" />Add Step
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {steps.map((step, idx) => (
                      <Card key={step.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium text-sm">
                              {idx + 1}
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center justify-between">
                                <Select value={step.type} onValueChange={(value) => updateStep(step.id, { type: value })}>
                                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {stepTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                                <Button size="sm" variant="ghost" onClick={() => removeStep(step.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              {step.type === 'approval' && (
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <Label className="text-xs">Approver</Label>
                                    <Select value={step.config.approver}
                                      onValueChange={(value) => updateStep(step.id, { config: { ...step.config, approver: value } })}>
                                      <SelectTrigger><SelectValue placeholder="Select approver" /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="manager">Direct Manager</SelectItem>
                                        <SelectItem value="security">Security Team</SelectItem>
                                        <SelectItem value="compliance">Compliance Officer</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Timeout (hours)</Label>
                                    <Input type="number" value={step.config.timeout || 24}
                                      onChange={(e) => updateStep(step.id, { config: { ...step.config, timeout: parseInt(e.target.value) } })} />
                                  </div>
                                </div>
                              )}

                              {step.type === 'notification' && (
                                <div className="space-y-1">
                                  <Label className="text-xs">Recipients</Label>
                                  <Input placeholder="email@example.com, slack-channel" />
                                </div>
                              )}

                              {step.type === 'assignment' && (
                                <div className="space-y-1">
                                  <Label className="text-xs">Assign To</Label>
                                  <Select>
                                    <SelectTrigger><SelectValue placeholder="Select assignee" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="user">Specific User</SelectItem>
                                      <SelectItem value="team">Security Team</SelectItem>
                                      <SelectItem value="manager">User's Manager</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Workflow Summary</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Trigger: {triggers.find(t => t.value === trigger)?.label || 'Not selected'}</p>
                    <p>Steps: {steps.length}</p>
                    <p>Status: Draft</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={onClose}>Cancel</Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Workflow
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
