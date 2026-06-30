
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, Users, Clock, Shield, AlertTriangle, 
  Database, Mail, CheckCircle, Save
} from 'lucide-react';
import { WorkflowTemplate } from '@/types/workflow';
import { useToast } from '@/hooks/use-toast';

interface CustomizeTemplateModalProps {
  template: WorkflowTemplate | null;
  open: boolean;
  onClose: () => void;
  onCustomized: (customizedTemplate: WorkflowTemplate) => void;
}

export const CustomizeTemplateModal = ({ template, open, onClose, onCustomized }: CustomizeTemplateModalProps) => {
  const [workflowName, setWorkflowName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedApprovers, setSelectedApprovers] = useState<string[]>([]);
  const [enabledSteps, setEnabledSteps] = useState<Record<string, boolean>>({});
  const [slaSettings, setSlaSettings] = useState({
    approval: 24,
    provisioning: 2,
    notification: 1
  });
  const { toast } = useToast();

  React.useEffect(() => {
    if (template && open) {
      setWorkflowName(`${template.name} (Customized)`);
      setDescription(template.description);
      
      // Initialize enabled steps
      const stepsState: Record<string, boolean> = {};
      template.linearSteps?.forEach(step => {
        stepsState[step.id] = true;
      });
      setEnabledSteps(stepsState);
    }
  }, [template, open]);

  if (!template) return null;

  const mockApprovers = [
    { id: 'mgr-001', name: 'Direct Manager', type: 'role' },
    { id: 'sec-001', name: 'Security Team', type: 'team' },
    { id: 'admin-001', name: 'IT Administrator', type: 'user' },
    { id: 'ciso-001', name: 'CISO', type: 'user' }
  ];

  const mockSystems = [
    { id: 'ad', name: 'Active Directory', type: 'identity' },
    { id: 'okta', name: 'Okta', type: 'identity' },
    { id: 'salesforce', name: 'Salesforce', type: 'application' },
    { id: 'workday', name: 'Workday', type: 'hr' }
  ];

  const handleSaveCustomization = () => {
    const customizedTemplate: WorkflowTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
      name: workflowName,
      description: description,
      version: '1.0-custom',
      linearSteps: template.linearSteps?.filter(step => enabledSteps[step.id]).map(step => ({
        ...step,
        // Apply SLA customizations
        config: {
          ...step.config,
          timeout: slaSettings[step.type as keyof typeof slaSettings] || step.config.timeout
        }
      })),
      nodes: template.nodes?.filter(node => 
        template.linearSteps?.find(step => 
          enabledSteps[step.id] && step.name === node.data.label
        )
      )
    };

    onCustomized(customizedTemplate);
    
    toast({
      title: "Template Customized",
      description: `${workflowName} has been configured and is ready for use`,
    });
    
    onClose();
  };

  const toggleStep = (stepId: string) => {
    setEnabledSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Customize Template: {template.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="workflow-name">Workflow Name</Label>
                <Input
                  id="workflow-name"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="Enter custom workflow name"
                />
              </div>
              <div>
                <Label htmlFor="workflow-description">Description</Label>
                <Textarea
                  id="workflow-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the purpose of this customized workflow"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Step Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow Steps Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {template.linearSteps?.map((step, index) => {
                  const isEnabled = enabledSteps[step.id];
                  return (
                    <div key={step.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${!isEnabled ? 'text-gray-400' : ''}`}>
                            {step.name}
                          </div>
                          <div className={`text-sm ${!isEnabled ? 'text-gray-400' : 'text-gray-600'}`}>
                            {step.description}
                          </div>
                          <div className="flex gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {step.type}
                            </Badge>
                            {step.metadata?.estimatedDuration && (
                              <Badge variant="secondary" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {step.metadata.estimatedDuration}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={() => toggleStep(step.id)}
                        />
                        <span className="text-sm text-gray-500">
                          {isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Approvers Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Approvers & Reviewers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Default Approvers</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select default approvers" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockApprovers.map((approver) => (
                        <SelectItem key={approver.id} value={approver.id}>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{approver.name}</div>
                              <div className="text-xs text-gray-500">{approver.type}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SLA Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                SLA & Timeout Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="approval-sla">Approval Timeout (hours)</Label>
                  <Input
                    id="approval-sla"
                    type="number"
                    value={slaSettings.approval}
                    onChange={(e) => setSlaSettings(prev => ({
                      ...prev,
                      approval: parseInt(e.target.value)
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="provisioning-sla">Provisioning Timeout (hours)</Label>
                  <Input
                    id="provisioning-sla"
                    type="number"
                    value={slaSettings.provisioning}
                    onChange={(e) => setSlaSettings(prev => ({
                      ...prev,
                      provisioning: parseInt(e.target.value)
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="notification-sla">Notification Timeout (hours)</Label>
                  <Input
                    id="notification-sla"
                    type="number"
                    value={slaSettings.notification}
                    onChange={(e) => setSlaSettings(prev => ({
                      ...prev,
                      notification: parseInt(e.target.value)
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target Systems */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Target Systems
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {mockSystems.map((system) => (
                  <div key={system.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{system.name}</div>
                        <div className="text-xs text-gray-500">{system.type}</div>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSaveCustomization} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save & Use Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
