
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Save, Mail } from 'lucide-react';
import { wizardSteps } from './onboarding/constants';
import { FormData, ValidationErrors } from './onboarding/types';
import { validateStep } from './onboarding/validation';
import { BasicInformationStep } from './onboarding/BasicInformationStep';
import { SponsorAssignmentStep } from './onboarding/SponsorAssignmentStep';
import { AccessRequestStep } from './onboarding/AccessRequestStep';
import { ReviewSubmitStep } from './onboarding/ReviewSubmitStep';

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    type: '',
    company: '',
    startDate: '',
    endDate: '',
    sponsor: '',
    fallbackSponsor: '',
    department: '',
    justification: '',
    accessRequests: [],
    workLocation: '',
    contractorId: ''
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const handleValidation = (step: number) => {
    const errors = validateStep(step, formData);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (handleValidation(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, wizardSteps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    if (handleValidation(currentStep)) {
      console.log('Submitting onboarding request:', formData);
      // Here you would typically submit to your backend
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInformationStep
            formData={formData}
            validationErrors={validationErrors}
            updateFormData={updateFormData}
          />
        );
      case 1:
        return (
          <SponsorAssignmentStep
            formData={formData}
            validationErrors={validationErrors}
            updateFormData={updateFormData}
          />
        );
      case 2:
        return <AccessRequestStep formData={formData} />;
      case 3:
        return <ReviewSubmitStep formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Non-Employee Onboarding Wizard</h2>
            <Badge variant="outline">{currentStep + 1} of {wizardSteps.length}</Badge>
          </div>
          
          <Progress value={(currentStep + 1) / wizardSteps.length * 100} className="mb-4" />
          
          <div className="flex items-center justify-between">
            {wizardSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  <step.icon className="h-4 w-4" />
                </div>
                {index < wizardSteps.length - 1 && (
                  <div className={`w-12 h-0.5 ${
                    index < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-2">
            <span className="text-sm font-medium">{wizardSteps[currentStep].name}</span>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          disabled={currentStep === 0}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>
        
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>Save Draft</span>
          </Button>
          
          {currentStep < wizardSteps.length - 1 ? (
            <Button onClick={nextStep} className="flex items-center space-x-2">
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Submit Request</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
