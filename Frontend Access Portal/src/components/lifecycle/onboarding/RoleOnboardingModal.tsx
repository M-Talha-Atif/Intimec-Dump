import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Shield, ShieldCheck, Crown, ArrowLeft, ArrowRight, Eye, History } from 'lucide-react';
import { RoleBasicsForm } from './RoleBasicsForm';
import { RoleEntitlementsForm } from './RoleEntitlementsForm';
import { RoleGovernanceForm } from './RoleGovernanceForm';
import { RolePreviewPanel } from './RolePreviewPanel';
import { RoleHistoryPanel } from './RoleHistoryPanel';
import { RoleOnboardingOptions } from './RoleOnboardingOptions';
import { RoleAssignmentsForm } from './RoleAssignmentsForm';

interface RoleOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleType: 'business' | 'technical' | 'privileged' | null;
}

const roleTypeConfig = {
  business: {
    title: 'Create Business Role',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Job-based or organizational scope role'
  },
  technical: {
    title: 'Create Technical Role',
    icon: ShieldCheck,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Application or system-specific role'
  },
  privileged: {
    title: 'Create Privileged Role',
    icon: Crown,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'High-risk administrative role'
  }
};

export function RoleOnboardingModal({ isOpen, onClose, roleType }: RoleOnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState('basics');
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [formData, setFormData] = useState({
    basics: {},
    assignments: {},
    governance: {},
    tags: []
  });

  if (!roleType) return null;

  const config = roleTypeConfig[roleType];
  const IconComponent = config.icon;

  const steps = [
    { id: 'basics', label: 'Role Details', required: true },
    { id: 'assignments', label: 'Assignments', required: true },
    { id: 'governance', label: 'Governance', required: false }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleFormDataChange = (stepId: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [stepId]: data
    }));
  };

  const handleSubmit = () => {
    
    // TODO: Implement actual submission logic
    onClose();
  };

  const handleClose = () => {
    setCurrentStep('basics');
    setShowPreview(false);
    setShowHistory(false);
    setFormData({
      basics: {},
      assignments: {},
      governance: {},
      tags: []
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <DialogHeader className={`px-6 py-4 border-b ${config.bgColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-white/50`}>
                <IconComponent className={`h-6 w-6 ${config.color}`} />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">{config.title}</DialogTitle>
                <p className="text-sm text-slate-600">{config.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex h-full">
          {/* Main Content */}
          <div className={`flex-1 flex flex-col ${showPreview || showHistory ? 'w-3/5' : 'w-full'}`}>
            {/* Options Bar */}
            <div className="px-6 py-3 border-b bg-gray-50">
              <RoleOnboardingOptions roleType={roleType} />
            </div>

            {/* Steps Navigation */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center space-x-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        currentStep === step.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        currentStep === step.id
                          ? 'bg-blue-600 text-white'
                          : index < currentStepIndex
                          ? 'bg-green-600 text-white'
                          : 'bg-slate-300 text-slate-600'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium">{step.label}</span>
                      {step.required && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                    </button>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-slate-300 mx-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {currentStep === 'basics' && (
                <RoleBasicsForm
                  roleType={roleType}
                  data={formData.basics}
                  onChange={(data) => handleFormDataChange('basics', data)}
                />
              )}
              {currentStep === 'assignments' && (
                <RoleAssignmentsForm
                  roleType={roleType}
                  data={formData.assignments}
                  onChange={(data) => handleFormDataChange('assignments', data)}
                />
              )}
              {currentStep === 'governance' && (
                <RoleGovernanceForm
                  roleType={roleType}
                  data={formData.governance}
                  onChange={(data) => handleFormDataChange('governance', data)}
                />
              )}
            </div>

            {/* Navigation Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-3">
                {currentStepIndex === steps.length - 1 ? (
                  <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                    Create Role
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          {(showPreview || showHistory) && (
            <div className="w-2/5 border-l bg-gray-50">
              <Tabs value={showPreview ? 'preview' : 'history'} className="h-full">
                <TabsList className="grid w-full grid-cols-2 m-4">
                  <TabsTrigger 
                    value="preview" 
                    onClick={() => { setShowPreview(true); setShowHistory(false); }}
                  >
                    Preview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history"
                    onClick={() => { setShowHistory(true); setShowPreview(false); }}
                  >
                    History
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="h-full p-4 mt-0">
                  <RolePreviewPanel 
                    roleType={roleType}
                    formData={formData}
                  />
                </TabsContent>
                
                <TabsContent value="history" className="h-full p-4 mt-0">
                  <RoleHistoryPanel roleType={roleType} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
