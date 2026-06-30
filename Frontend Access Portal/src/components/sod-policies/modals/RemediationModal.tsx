
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getRiskBadgeClass } from '@/utils/getRiskColor';
import { cn } from '@/lib/utils';

interface RemediationModalProps {
  violation: any;
  open: boolean;
  onClose: () => void;
  onRemediate: (violationId: string, action: string, details: string) => void;
}

export const RemediationModal = ({ violation, open, onClose, onRemediate }: RemediationModalProps) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const remediationOptions = [
    { value: 'remove-role', label: 'Remove conflicting role', impact: 'High' },
    { value: 'remove-entitlement', label: 'Remove specific entitlement', impact: 'Medium' },
    { value: 'notify-manager', label: 'Notify manager for review', impact: 'Low' },
    { value: 'compensating-controls', label: 'Implement compensating controls', impact: 'Medium' },
    { value: 'exception-request', label: 'Request formal exception', impact: 'Low' }
  ];

  const handleSubmit = async () => {
    if (!selectedAction || !justification.trim()) {
      toast({ title: "Validation Error", description: "Please select an action and provide justification", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    onRemediate(violation.id, selectedAction, justification);
    toast({ title: "Remediation Initiated", description: `Remediation action has been recorded for violation ${violation.id}` });
    setIsSubmitting(false);
    onClose();
    setSelectedAction('');
    setJustification('');
  };

  if (!violation) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex flex-col p-0 h-full">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <DialogHeader className="p-0">
              <DialogTitle>Remediate Violation - {violation.id}</DialogTitle>
              <DialogDescription>Select a remediation action and provide justification for this SoD violation.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                <Card className="border-destructive/30 bg-destructive/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-medium">{violation.policy}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{violation.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge className={cn(getRiskBadgeClass(violation.severity), "border text-xs")}>{violation.severity}</Badge>
                          <Badge variant="outline">Risk: {violation.riskScore}/100</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <Label className="text-base font-medium">Current Access</Label>
                  <div className="mt-2 space-y-2">
                    <div className="p-3 bg-muted rounded border">
                      <p className="font-medium">User: {violation.user}</p>
                      <p className="text-sm text-muted-foreground">Systems: {violation.affectedSystems.join(', ')}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Remediation Action *</Label>
                  <Select value={selectedAction} onValueChange={setSelectedAction}>
                    <SelectTrigger><SelectValue placeholder="Select remediation action" /></SelectTrigger>
                    <SelectContent>
                      {remediationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{option.label}</span>
                            <Badge variant={option.impact === 'High' ? 'destructive' : option.impact === 'Medium' ? 'secondary' : 'outline'} className="ml-2">{option.impact} Impact</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="justification">Justification *</Label>
                  <Textarea id="justification" placeholder="Provide detailed justification for this remediation action..." value={justification} onChange={(e) => setJustification(e.target.value)} rows={4} />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={onClose}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting || !selectedAction || !justification.trim()}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Processing...' : 'Initiate Remediation'}
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
