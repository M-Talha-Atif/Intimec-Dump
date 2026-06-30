
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Key, Shield, Lock, ArrowLeft, ArrowRight, Eye, History } from 'lucide-react';
import { EntitlementBasicsForm } from './EntitlementBasicsForm';
import { EntitlementGovernanceForm } from './EntitlementGovernanceForm';
import { EntitlementAssignmentForm } from './EntitlementAssignmentForm';
import { EntitlementPreviewPanel } from './EntitlementPreviewPanel';
import { EntitlementHistoryPanel } from './EntitlementHistoryPanel';
import { EntitlementOnboardingOptions } from './EntitlementOnboardingOptions';

interface EntitlementOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  entitlementType: 'standard' | 'sensitive' | 'admin' | null;
}

const entitlementTypeConfig = {
  standard: {
    title: 'Create Standard Permission',
    icon: Key,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Basic application permission or access right'
  },
  sensitive: {
    title: 'Create Sensitive Access',
    icon: Shield,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'High-risk permission requiring approval'
  },
  admin: {
    title: 'Create Administrative Rights',
    icon: Lock,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'Privileged administrative or system access'
  }
};

export function EntitlementOnboardingModal({ isOpen, onClose, entitlementType }: EntitlementOnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState('basics');
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [formData, setFormData] = useState({
    basics: {},
    governance: {},
    assignment: {},
    tags: []
  });

  if (!entitlementType) return null;

  const config = entitlementTypeConfig[entitlementType];
  const IconComponent = config.icon;

  const steps = [
    { id: 'basics', label: 'Basic Details', required: true },
    { id: 'governance', label: 'Governance', required: false },
    { id: 'assignment', label: 'Assignment', required: false }
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
    console.log('Submitting entitlement:', { type: entitlementType, data: formData });
    // TODO: Implement actual submission logic
    onClose();
  };

  const handleClose = () => {
    setCurrentStep('basics');
    setShowPreview(false);
    setShowHistory(false);
    setFormData({
      basics: {},
      governance: {},
      assignment: {},
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
              <EntitlementOnboardingOptions entitlementType={entitlementType} />
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
                <EntitlementBasicsForm
                  entitlementType={entitlementType}
                  data={formData.basics}
                  onChange={(data) => handleFormDataChange('basics', data)}
                />
              )}
              {currentStep === 'governance' && (
                <EntitlementGovernanceForm
                  entitlementType={entitlementType}
                  data={formData.governance}
                  onChange={(data) => handleFormDataChange('governance', data)}
                />
              )}
              {currentStep === 'assignment' && (
                <EntitlementAssignmentForm
                  entitlementType={entitlementType}
                  data={formData.assignment}
                  onChange={(data) => handleFormDataChange('assignment', data)}
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
                    Create Entitlement
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
                  <EntitlementPreviewPanel 
                    entitlementType={entitlementType}
                    formData={formData}
                  />
                </TabsContent>
                
                <TabsContent value="history" className="h-full p-4 mt-0">
                  <EntitlementHistoryPanel entitlementType={entitlementType} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
