
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, Trash2, Settings, GripVertical, Clock, Shield, 
  ChevronDown, ChevronRight, Zap, UserCheck, Mail 
} from 'lucide-react';
import { WorkflowStep } from '@/types/workflow';

interface LinearBuilderProps {
  workflowId?: string;
  onSave: (workflow: any) => void;
}

const LinearBuilder = ({ workflowId, onSave }: LinearBuilderProps) => {
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: '1',
      type: 'trigger',
      name: 'New Employee Trigger',
      description: 'Triggered when new employee is added to HR system',
      config: {},
      position: 0,
      conditions: [],
      timeLogic: null,
      riskLevel: 'low',
      metadata: {
        estimatedDuration: '5 minutes',
        complianceFramework: ['NIST'],
        auditTags: ['employee-onboarding'],
        roleType: '🎯',
        realLifePurpose: 'Automatically detects new employee additions and initiates the onboarding workflow'
      }
    }
  ]);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set(['1']));

  const stepTypeConfig = {
    trigger: { icon: Zap, label: 'Trigger', color: 'bg-blue-50 border-blue-200' },
    provisioning: { icon: UserCheck, label: 'Provisioning', color: 'bg-green-50 border-green-200' },
    approval: { icon: Shield, label: 'Approval', color: 'bg-yellow-50 border-yellow-200' },
    notification: { icon: Mail, label: 'Notification', color: 'bg-purple-50 border-purple-200' },
    condition: { icon: Settings, label: 'Condition', color: 'bg-gray-50 border-gray-200' },
    wait: { icon: Clock, label: 'Wait', color: 'bg-orange-50 border-orange-200' }
  };

  const addStep = (afterIndex: number, stepType: string = 'provisioning') => {
    const newStep: WorkflowStep = {
      id: Date.now().toString(),
      type: stepType as any,
      name: `New ${stepTypeConfig[stepType as keyof typeof stepTypeConfig]?.label || 'Step'}`,
      description: 'Configure step settings',
      config: {},
      position: afterIndex + 1,
      conditions: [],
      timeLogic: null,
      riskLevel: 'medium'
    };

    const updatedSteps = [...steps];
    updatedSteps.splice(afterIndex + 1, 0, newStep);
    
    // Update positions
    updatedSteps.forEach((step, index) => {
      step.position = index;
    });

    setSteps(updatedSteps);
    setExpandedSteps(prev => new Set([...prev, newStep.id]));
  };

  const removeStep = (stepId: string) => {
    setSteps(prev => prev.filter(step => step.id !== stepId));
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(stepId);
      return newSet;
    });
  };

  const toggleExpanded = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const handleSave = () => {
    const workflow = {
      id: workflowId || `workflow-${Date.now()}`,
      steps,
      version: '1.0',
      lastModified: new Date().toISOString(),
      type: 'linear'
    };
    onSave(workflow);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Linear Workflow Builder</h2>
        <Button onClick={handleSave}>
          Save Workflow
        </Button>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const config = stepTypeConfig[step.type as keyof typeof stepTypeConfig];
          const IconComponent = config?.icon || Settings;
          const isExpanded = expandedSteps.has(step.id);

          return (
            <Card key={step.id} className={`${config?.color || 'bg-gray-50'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 cursor-move">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-500">
                      Step {index + 1}
                    </span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(step.id)}
                  >
                    {isExpanded ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </Button>

                  <IconComponent className="h-5 w-5" />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {step.metadata?.roleType && (
                        <span className="text-lg">{step.metadata.roleType}</span>
                      )}
                      <CardTitle className="text-base">{step.name}</CardTitle>
                    </div>
                    {step.metadata?.realLifePurpose && (
                      <p className="text-sm text-gray-600 mt-1">
                        {step.metadata.realLifePurpose}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {step.metadata?.estimatedDuration && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {step.metadata.estimatedDuration}
                      </Badge>
                    )}
                    <Badge variant={step.riskLevel === 'high' ? 'destructive' : 
                                   step.riskLevel === 'medium' ? 'default' : 'secondary'}>
                      {step.riskLevel} risk
                    </Badge>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStep(step.id)}
                    disabled={steps.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {step.metadata?.complianceFramework && step.metadata.complianceFramework.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 ml-16">
                    {step.metadata.complianceFramework.map((framework, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <Shield className="h-2 w-2 mr-1" />
                        {framework}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`name-${step.id}`}>Step Name</Label>
                      <Input
                        id={`name-${step.id}`}
                        value={step.name}
                        onChange={(e) => updateStep(step.id, { name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`type-${step.id}`}>Step Type</Label>
                      <select
                        id={`type-${step.id}`}
                        value={step.type}
                        onChange={(e) => updateStep(step.id, { type: e.target.value as any })}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      >
                        <option value="trigger">Trigger</option>
                        <option value="provisioning">Provisioning</option>
                        <option value="approval">Approval</option>
                        <option value="notification">Notification</option>
                        <option value="condition">Condition</option>
                        <option value="wait">Wait</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`desc-${step.id}`}>Description</Label>
                    <Input
                      id={`desc-${step.id}`}
                      value={step.description}
                      onChange={(e) => updateStep(step.id, { description: e.target.value })}
                    />
                  </div>

                  {step.type === 'wait' && (
                    <div>
                      <Label>Time Logic</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="3"
                          className="w-20"
                        />
                        <select className="px-3 rounded-md border border-input bg-background">
                          <option>hours</option>
                          <option>days</option>
                          <option>business days</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => addStep(index)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step After
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {steps.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No workflow steps defined</p>
            <Button onClick={() => addStep(-1, 'trigger')}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Step
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LinearBuilder;
