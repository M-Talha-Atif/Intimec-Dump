import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSeverityBadgeClass } from '@/utils/getBadgeClass';
import type { SoDPolicy, PolicyCondition } from '@/types/sodPolicies';

interface PolicyEditModalProps {
  policy?: SoDPolicy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (policy: Partial<SoDPolicy>) => void;
}

export const PolicyEditModal: React.FC<PolicyEditModalProps> = ({
  policy,
  open,
  onOpenChange,
  onSave
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<SoDPolicy>>(policy || {
    name: '',
    description: '',
    businessJustification: '',
    riskLevel: 'medium',
    enforcementMode: 'preventive',
    status: 'draft',
    conflictType: 'role-role',
    conditions: [],
    tags: [],
    complianceFrameworks: []
  });

  const [conditions, setConditions] = useState<PolicyCondition[]>(policy?.conditions || []);
  const [aiSuggestions] = useState([
    'Include contractor roles for comprehensive coverage',
    'Add time-based conditions for temporary access',
    'Consider department-specific exceptions'
  ]);

  const steps = ['Basic Info', 'Conditions', 'Compliance', 'Review'];

  const addCondition = () => {
    setConditions([...conditions, {
      id: `cond-${Date.now()}`,
      type: 'role',
      operator: 'AND',
      value: '',
      negation: false
    }]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const handleSave = () => {
    onSave({ ...formData, conditions });
    onOpenChange(false);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.name && formData.description;
      case 1:
        return conditions.length > 0;
      default:
        return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl flex flex-col p-0 h-[90vh]">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <DialogHeader className="p-0">
              <DialogTitle>
                {policy ? 'Edit Policy' : 'Create New Policy'}
              </DialogTitle>
              <DialogDescription>
                {policy ? 'Modify policy configuration and conditions.' : 'Define a new SoD policy with conditions and compliance mappings.'}
              </DialogDescription>
              <div className="flex items-center gap-2 mt-4">
                {steps.map((step, idx) => (
                  <React.Fragment key={step}>
                    <div className={`flex items-center gap-2 ${idx === currentStep ? 'font-medium' : 'text-muted-foreground'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        idx === currentStep ? 'bg-primary text-primary-foreground' :
                        idx < currentStep ? 'bg-green-500 text-white' : 'bg-muted'
                      }`}>
                        {idx < currentStep ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                      </div>
                      <span className="text-sm">{step}</span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className="flex-1 h-px bg-border" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              {currentStep === 0 && (
                <div className="space-y-6 p-1">
                  <div className="space-y-2">
                    <Label htmlFor="name">Policy Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Finance AP & AR Separation"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe what this policy enforces..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="justification">Business Justification</Label>
                    <Textarea
                      id="justification"
                      value={formData.businessJustification}
                      onChange={(e) => setFormData({ ...formData, businessJustification: e.target.value })}
                      placeholder="Explain why this policy is necessary..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Risk Level</Label>
                      <Select
                        value={formData.riskLevel}
                        onValueChange={(value: any) => setFormData({ ...formData, riskLevel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Enforcement Mode</Label>
                      <Select
                        value={formData.enforcementMode}
                        onValueChange={(value: any) => setFormData({ ...formData, enforcementMode: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="preventive">Preventive</SelectItem>
                          <SelectItem value="detective">Detective</SelectItem>
                          <SelectItem value="advisory">Advisory</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Conflict Type</Label>
                    <Select
                      value={formData.conflictType}
                      onValueChange={(value: any) => setFormData({ ...formData, conflictType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="role-role">Role to Role</SelectItem>
                        <SelectItem value="entitlement-entitlement">Entitlement to Entitlement</SelectItem>
                        <SelectItem value="role-entitlement">Role to Entitlement</SelectItem>
                        <SelectItem value="app-role">Application Role</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Card className="bg-muted border">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">AI Suggestions</p>
                          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                            {aiSuggestions.map((suggestion, idx) => (
                              <li key={idx}>• {suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6 p-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Policy Conditions</h3>
                    <Button onClick={addCondition} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Condition
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {conditions.map((condition, idx) => (
                      <Card key={condition.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-3">
                            {idx > 0 && (
                              <Select
                                value={condition.operator}
                                onValueChange={(value: any) => {
                                  const updated = [...conditions];
                                  updated[idx].operator = value;
                                  setConditions(updated);
                                }}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="AND">AND</SelectItem>
                                  <SelectItem value="OR">OR</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            
                            <Select
                              value={condition.type}
                              onValueChange={(value: any) => {
                                const updated = [...conditions];
                                updated[idx].type = value;
                                setConditions(updated);
                              }}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="role">Role</SelectItem>
                                <SelectItem value="entitlement">Entitlement</SelectItem>
                                <SelectItem value="group">Group</SelectItem>
                                <SelectItem value="application">Application</SelectItem>
                                <SelectItem value="department">Department</SelectItem>
                                <SelectItem value="attribute">Attribute</SelectItem>
                              </SelectContent>
                            </Select>

                            <Input
                              placeholder="Enter value..."
                              value={condition.value}
                              onChange={(e) => {
                                const updated = [...conditions];
                                updated[idx].value = e.target.value;
                                setConditions(updated);
                              }}
                              className="flex-1"
                            />

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCondition(condition.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {conditions.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No conditions added yet</p>
                      <p className="text-sm mt-1">Add at least one condition to continue</p>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 p-1">
                  <h3 className="font-medium">Compliance Framework Mapping</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {['SOX', 'GDPR', 'HIPAA', 'PCI-DSS', 'ISO 27001', 'SOC 2'].map((framework) => (
                      <Card key={framework} className="cursor-pointer hover:bg-accent">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{framework}</span>
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6 p-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Policy Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-muted-foreground">Name</Label>
                        <p className="font-medium">{formData.name}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Description</Label>
                        <p>{formData.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={cn(getSeverityBadgeClass(formData.riskLevel || 'medium'), "border text-xs")}>{formData.riskLevel}</Badge>
                        <Badge variant="outline">{formData.enforcementMode}</Badge>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Conditions</Label>
                        <p className="font-medium">{conditions.length} condition(s) defined</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted border">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Ready to Save</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            This policy will be created as a draft. You can activate it after testing.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </ScrollArea>
          </div>
          <div className="flex-shrink-0 px-6 py-4">
            <DialogFooter>
              <div className="flex items-center justify-between w-full">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  {currentStep < steps.length - 1 ? (
                    <Button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      disabled={!isStepValid()}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button onClick={handleSave} disabled={!isStepValid()}>
                      {policy ? 'Update Policy' : 'Create Policy'}
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
