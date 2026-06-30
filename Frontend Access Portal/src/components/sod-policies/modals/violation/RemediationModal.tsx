import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Wrench, AlertTriangle, CheckCircle2, TrendingUp, Clock, 
  Users, DollarSign, Sparkles 
} from 'lucide-react';
import type { ViolationDetail } from '@/types/sodPolicies';

interface RemediationModalProps {
  violation: ViolationDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (violationId: string, action: string, details: string) => void;
}

export const RemediationModal: React.FC<RemediationModalProps> = ({
  violation,
  open,
  onOpenChange,
  onSubmit
}) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [justification, setJustification] = useState('');
  const [showImpact, setShowImpact] = useState(false);

  const remediationOptions = [
    {
      id: 'remove_role',
      title: 'Remove Conflicting Role',
      description: 'Remove the role that creates the SoD conflict',
      effort: 'Low',
      time: '< 1 hour',
      impact: 'User loses access to role functionality',
      success: 98,
      recommended: true,
      aiInsight: 'Historical data shows 98% success rate with minimal disruption'
    },
    {
      id: 'remove_entitlement',
      title: 'Remove Specific Entitlements',
      description: 'Remove only the conflicting entitlements while keeping roles',
      effort: 'Medium',
      time: '2-4 hours',
      impact: 'Partial access restriction',
      success: 95,
      recommended: false,
      aiInsight: 'More granular control but requires careful permission mapping'
    },
    {
      id: 'transfer_user',
      title: 'Transfer User to Different Role',
      description: 'Assign user to a different role that doesn\'t conflict',
      effort: 'High',
      time: '1-2 days',
      impact: 'User workflow changes required',
      success: 89,
      recommended: false,
      aiInsight: 'Requires business approval and user training'
    },
    {
      id: 'compensating_controls',
      title: 'Implement Compensating Controls',
      description: 'Add additional monitoring and approval workflows',
      effort: 'High',
      time: '3-5 days',
      impact: 'Additional approval steps for user',
      success: 82,
      recommended: false,
      aiInsight: 'Maintains access but adds overhead and monitoring costs'
    }
  ];

  const handleSubmit = () => {
    if (!violation || !selectedAction) return;
    onSubmit(violation.id, selectedAction, justification);
    onOpenChange(false);
  };

  if (!violation) return null;

  const selectedOption = remediationOptions.find(opt => opt.id === selectedAction);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl flex flex-col p-0 h-[90vh]">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <DialogHeader className="p-0">
              <DialogTitle>Remediate Violation</DialogTitle>
              <DialogDescription>
                {violation.userName} - {violation.policyName}. Select a remediation approach and provide justification.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                <Card className="bg-muted border">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">AI Recommendation</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Based on similar violations, removing the conflicting role is the most effective 
                          solution with minimal business disruption.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <Label className="text-base font-medium mb-3 block">
                    Select Remediation Action
                  </Label>
                  <RadioGroup value={selectedAction} onValueChange={setSelectedAction}>
                    <div className="space-y-3">
                      {remediationOptions.map((option) => (
                        <Card 
                          key={option.id}
                          className={`cursor-pointer transition-colors ${
                            selectedAction === option.id ? 'border-primary bg-accent' : ''
                          } ${option.recommended ? 'border-primary' : ''}`}
                          onClick={() => setSelectedAction(option.id)}
                        >
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <RadioGroupItem value={option.id} id={option.id} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Label htmlFor={option.id} className="font-medium cursor-pointer">
                                    {option.title}
                                  </Label>
                                  {option.recommended && (
                                    <Badge variant="default">Recommended</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {option.description}
                                </p>

                                <div className="grid grid-cols-4 gap-3 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Effort</p>
                                    <p className="font-medium">{option.effort}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Time</p>
                                    <p className="font-medium">{option.time}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Success Rate</p>
                                    <div className="flex items-center gap-1">
                                      <TrendingUp className="h-4 w-4 text-green-600" />
                                      <p className="font-medium">{option.success}%</p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Impact</p>
                                    <p className="font-medium text-xs">{option.impact}</p>
                                  </div>
                                </div>

                                <Separator className="my-3" />

                                <div className="flex items-start gap-2 p-2 bg-muted rounded-lg">
                                  <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                                  <p className="text-xs text-muted-foreground">{option.aiInsight}</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {selectedOption && (
                  <>
                    <Card>
                      <CardContent className="pt-4">
                        <Label className="mb-2 block">Justification *</Label>
                        <Textarea
                          value={justification}
                          onChange={(e) => setJustification(e.target.value)}
                          placeholder="Explain the reason for this remediation action..."
                          rows={4}
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">Impact Analysis</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowImpact(!showImpact)}
                          >
                            {showImpact ? 'Hide' : 'Show'} Details
                          </Button>
                        </div>

                        {showImpact && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                              <Card className="bg-muted border">
                                <CardContent className="pt-4">
                                  <Users className="h-6 w-6 text-primary mb-2" />
                                  <p className="text-sm text-muted-foreground">Affected Users</p>
                                  <p className="text-2xl font-bold">1</p>
                                </CardContent>
                              </Card>

                              <Card className="bg-muted border">
                                <CardContent className="pt-4">
                                  <Clock className="h-6 w-6 text-primary mb-2" />
                                  <p className="text-sm text-muted-foreground">Est. Duration</p>
                                  <p className="text-2xl font-bold">{selectedOption.time}</p>
                                </CardContent>
                              </Card>

                              <Card className="bg-muted border">
                                <CardContent className="pt-4">
                                  <DollarSign className="h-6 w-6 text-primary mb-2" />
                                  <p className="text-sm text-muted-foreground">Est. Cost</p>
                                  <p className="text-2xl font-bold">Low</p>
                                </CardContent>
                              </Card>
                            </div>

                            <div className="p-3 bg-orange-500/5 border border-orange-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                                <div>
                                  <p className="font-medium">Business Impact</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {selectedOption.impact}. User will need to use alternative 
                                    workflows for affected functionality.
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="p-3 bg-muted border rounded-lg">
                              <div className="flex items-start gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                <div>
                                  <p className="font-medium">Expected Outcome</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    SoD conflict will be resolved immediately. Compliance status restored.
                                    No additional violations expected.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
          <div className="flex-shrink-0 px-6 py-4">
            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!selectedAction || !justification}
              >
                <Wrench className="h-4 w-4 mr-2" />
                Execute Remediation
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
