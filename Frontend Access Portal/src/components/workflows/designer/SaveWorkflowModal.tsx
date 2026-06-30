"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Save, AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { SERVICE_EVENTS } from './EventTriggerConfigDialog';

interface SaveWorkflowModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (workflowData: WorkflowFormData) => void;
  currentWorkflow?: (Partial<WorkflowFormData> & { id?: string });
  isSaving?: boolean;
  workflowMetadata?: {
    name: string;
    triggerType: 'manual' | 'event-based' | 'time-based';
    cronSchedule?: string;
    eventConfig?: {
      services: string[];
      eventTypes: string[];
    };
  };
}

export interface WorkflowFormData {
  name: string;
  description: string;
  category: string;
  status: string;
  triggerType: string;
  eventConfig?: {
    services: string[];
    eventTypes: string[];
  };
  cronSchedule?: string;
  applicationScope: string[];
  riskScore: number;
  hasTimeLogic: boolean;
  hasSodViolation: boolean;
  roleSensitivity: 'low' | 'medium' | 'high';
  policyCompliance: 'compliant' | 'warning' | 'violation';
  complianceFrameworks: string[];
  tags: string[];
}

export const SaveWorkflowModal: React.FC<SaveWorkflowModalProps> = ({
  open,
  onClose,
  onSave,
  currentWorkflow,
  isSaving = false,
  workflowMetadata
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [tagInput, setTagInput] = useState('');
  
  // Form state - initialize with workflowMetadata if provided
  const [formData, setFormData] = useState<WorkflowFormData>({
    name: workflowMetadata?.name || '',
    description: '',
    category: 'joiner-mover-leaver',
    status: 'draft',
    triggerType: workflowMetadata?.triggerType || 'manual',
    applicationScope: [],
    riskScore: 5,
    hasTimeLogic: false,
    hasSodViolation: false,
    roleSensitivity: 'medium',
    policyCompliance: 'compliant',
    complianceFrameworks: [],
    tags: []
  });

  // Application scope options (common IGA applications)
  const applicationOptions = [
    'Active Directory',
    'Google Workspace',
    'Salesforce',
    'SAP',
    'Workday',
    'ServiceNow',
    'Okta',
    'Azure AD',
    'AWS',
    'Office 365',
    'Slack',
    'Jira',
    'GitHub',
    'GitLab',
    'Financial Systems',
    'Production DB',
    'HR Systems',
    'All Applications'
  ];

  const complianceFrameworkOptions = [
    'NIST',
    'ISO 27001',
    'SOC 2',
    'GDPR',
    'HIPAA',
    'PCI DSS',
    'SOX',
    'COBIT',
    'CIS Controls'
  ];

  // Load current workflow data if provided
  useEffect(() => {
    if (currentWorkflow && open) {
      console.log('SaveWorkflowModal - Loading currentWorkflow:', currentWorkflow);
      
      // Transform backend format to form format
      const transformCategory = (category: string): string => {
        if (!category) return 'joiner-mover-leaver';
        return category.toLowerCase().replace(/_/g, '-');
      };
      
      const transformStatus = (status: string): string => {
        if (!status) return 'draft';
        const upperStatus = status.toUpperCase();
        if (upperStatus === 'ACTIVE') return 'enabled';
        if (upperStatus === 'DEPRECATED') return 'archived';
        return 'draft';
      };
      
      const transformTriggerType = (triggerType: string): string => {
        if (!triggerType) return 'manual';
        return triggerType.toLowerCase().replace(/_/g, '-');
      };
      
      setFormData(prev => ({
        ...prev,
        ...currentWorkflow,
        // Transform backend formats to form formats
        category: transformCategory(currentWorkflow.category || ''),
        status: transformStatus(currentWorkflow.status || ''),
        triggerType: workflowMetadata?.triggerType || transformTriggerType(currentWorkflow.triggerType || '') || prev.triggerType,
        // Preserve workflowMetadata values
        name: workflowMetadata?.name || currentWorkflow.name || prev.name,
      }));
    }
  }, [currentWorkflow, open, workflowMetadata]);

  // Sync formData when workflowMetadata changes (even while modal is open)
  useEffect(() => {
    if (workflowMetadata) {
      setFormData(prev => ({
        ...prev,
        name: workflowMetadata.name || prev.name,
        triggerType: workflowMetadata.triggerType || prev.triggerType,
        // Sync event configuration and cron schedule
        ...(workflowMetadata.eventConfig && { eventConfig: workflowMetadata.eventConfig }),
        ...(workflowMetadata.cronSchedule && { cronSchedule: workflowMetadata.cronSchedule })
      }));
    }
  }, [workflowMetadata]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setActiveTab('basic');
      setTagInput('');
    }
  }, [open]);

  const handleInputChange = (field: keyof WorkflowFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleArrayItem = (field: 'applicationScope' | 'complianceFrameworks', item: string) => {
    setFormData(prev => {
      const currentArray = prev[field];
      const newArray = currentArray.includes(item)
        ? currentArray.filter(i => i !== item)
        : [...currentArray, item];
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSave = () => {
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Workflow name is required",
        variant: "destructive"
      });
      setActiveTab('basic');
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Workflow description is required",
        variant: "destructive"
      });
      setActiveTab('basic');
      return;
    }

    if (formData.applicationScope.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one application scope",
        variant: "destructive"
      });
      setActiveTab('trigger');
      return;
    }

    onSave(formData);
    // Don't close or show toast here - let parent handle it
  };

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-600';
    if (score <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSensitivityBadgeVariant = (level: string) => {
    if (level === 'low') return 'default';
    if (level === 'medium') return 'secondary';
    return 'destructive';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-h-[90vh] overflow-hidden flex flex-col"
        style={{ maxWidth: '80rem', width: '95vw' }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save Workflow
          </DialogTitle>
          <DialogDescription>
            Configure workflow metadata and compliance settings
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="trigger">Trigger & Scope</TabsTrigger>
            <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
            <TabsTrigger value="compliance">Compliance & Tags</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto py-4">
            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Workflow Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Employee Onboarding Access Request"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose and functionality of this workflow..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="joiner-mover-leaver">Joiner-Mover-Leaver</SelectItem>
                      <SelectItem value="access-request">Access Request</SelectItem>
                      <SelectItem value="certification">Certification</SelectItem>
                      <SelectItem value="revocation">Revocation</SelectItem>
                      <SelectItem value="exception">Exception</SelectItem>
                      <SelectItem value="ai-risk">AI Risk Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status field - only show when editing existing workflow */}
                {currentWorkflow?.id && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Trigger & Scope Tab */}
            <TabsContent value="trigger" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {formData.triggerType === 'manual' && 'Manual Trigger'}
                      {formData.triggerType === 'event-based' && 'Event-Based Trigger'}
                      {formData.triggerType === 'time-based' && 'Time-Based (Scheduled) Trigger'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formData.triggerType === 'manual' && 'Workflow starts when manually triggered by a user'}
                      {formData.triggerType === 'event-based' && (() => {
                        const eventTypes = formData.eventConfig?.eventTypes || [];
                        if (eventTypes.length === 0) {
                          return 'Workflow starts automatically when events occur (no events configured)';
                        }
                        // Find the event label
                        const eventId = eventTypes[0];
                        let eventLabel = eventId;
                        for (const service of Object.values(SERVICE_EVENTS)) {
                          const event = service.events.find(e => e.id === eventId);
                          if (event) {
                            eventLabel = event.label;
                            break;
                          }
                        }
                        return `Workflow starts automatically when: ${eventLabel}`;
                      })()}
                      {formData.triggerType === 'time-based' && `Workflow starts on schedule: ${formData.cronSchedule || 'Not configured'}`}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  To change the trigger type, use the metadata bar above the canvas
                </p>
              </div>

              <div className="space-y-3">
                <Label>
                  Application Scope <span className="text-destructive">*</span>
                </Label>
                <p className="text-sm text-muted-foreground">Select which applications this workflow applies to</p>
                <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-4 border rounded-lg">
                  {applicationOptions.map(app => (
                    <div key={app} className="flex items-center space-x-2">
                      <Checkbox
                        id={`app-${app}`}
                        checked={formData.applicationScope.includes(app)}
                        onCheckedChange={() => toggleArrayItem('applicationScope', app)}
                      />
                      <Label htmlFor={`app-${app}`} className="text-sm font-normal cursor-pointer">
                        {app}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.applicationScope.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.applicationScope.map(app => (
                      <Badge key={app} variant="secondary">
                        {app}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Risk Assessment Tab */}
            <TabsContent value="risk" className="space-y-4 mt-0">
              <div className="space-y-3">
                <Label>Risk Score: <span className={cn("font-bold", getRiskColor(formData.riskScore))}>{formData.riskScore}/10</span></Label>
                <Slider
                  value={[formData.riskScore]}
                  onValueChange={(value) => handleInputChange('riskScore', value[0])}
                  min={0}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low Risk (0-3)</span>
                  <span>Medium Risk (4-6)</span>
                  <span>High Risk (7-10)</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Role Sensitivity</Label>
                <Select value={formData.roleSensitivity} onValueChange={(value) => handleInputChange('roleSensitivity', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Sensitivity</SelectItem>
                    <SelectItem value="medium">Medium Sensitivity</SelectItem>
                    <SelectItem value="high">High Sensitivity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="timeLogic"
                    checked={formData.hasTimeLogic}
                    onCheckedChange={(checked) => handleInputChange('hasTimeLogic', checked)}
                  />
                  <Label htmlFor="timeLogic" className="text-sm font-normal cursor-pointer">
                    Has Time-Based Logic
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sodViolation"
                    checked={formData.hasSodViolation}
                    onCheckedChange={(checked) => handleInputChange('hasSodViolation', checked)}
                  />
                  <Label htmlFor="sodViolation" className="text-sm font-normal cursor-pointer">
                    May Cause SoD Violations
                  </Label>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Risk Assessment Summary
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Risk Level:</span>
                    <Badge variant={formData.riskScore > 6 ? 'destructive' : formData.riskScore > 3 ? 'secondary' : 'default'}>
                      {formData.riskScore <= 3 ? 'Low' : formData.riskScore <= 6 ? 'Medium' : 'High'}
                    </Badge>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Sensitivity:</span>
                    <Badge variant={getSensitivityBadgeVariant(formData.roleSensitivity)}>
                      {formData.roleSensitivity.charAt(0).toUpperCase() + formData.roleSensitivity.slice(1)}
                    </Badge>
                  </p>
                  {formData.hasSodViolation && (
                    <p className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      May require additional SoD checks
                    </p>
                  )}
                  {formData.hasTimeLogic && (
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Includes time-based automation
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Compliance & Tags Tab */}
            <TabsContent value="compliance" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Policy Compliance Status</Label>
                <Select value={formData.policyCompliance} onValueChange={(value) => handleInputChange('policyCompliance', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compliant">Compliant</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="violation">Violation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Compliance Frameworks</Label>
                <p className="text-sm text-muted-foreground">Select applicable compliance frameworks</p>
                <div className="grid grid-cols-3 gap-3 p-4 border rounded-lg">
                  {complianceFrameworkOptions.map(framework => (
                    <div key={framework} className="flex items-center space-x-2">
                      <Checkbox
                        id={`framework-${framework}`}
                        checked={formData.complianceFrameworks.includes(framework)}
                        onCheckedChange={() => toggleArrayItem('complianceFrameworks', framework)}
                      />
                      <Label htmlFor={`framework-${framework}`} className="text-sm font-normal cursor-pointer">
                        {framework}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag (e.g., onboarding, critical, automated)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {activeTab !== 'compliance' && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  const tabs = ['basic', 'trigger', 'risk', 'compliance'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1]);
                  }
                }}
              >
                Next →
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Workflow'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
