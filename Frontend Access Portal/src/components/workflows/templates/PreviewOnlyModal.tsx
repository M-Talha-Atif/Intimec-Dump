
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Play, Pause, RotateCcw, Eye, CheckCircle, Clock, 
  ArrowRight, Zap, Shield, UserCheck, Mail, Settings
} from 'lucide-react';
import { WorkflowTemplate } from '@/types/workflow';

interface PreviewOnlyModalProps {
  template: WorkflowTemplate | null;
  open: boolean;
  onClose: () => void;
}

export const PreviewOnlyModal = ({ template, open, onClose }: PreviewOnlyModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);

  if (!template) return null;

  const steps = template.linearSteps || [];

  const startAnimation = () => {
    setIsAnimating(true);
    setCurrentStep(0);
    setAnimationProgress(0);
  };

  const pauseAnimation = () => {
    setIsAnimating(false);
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setCurrentStep(0);
    setAnimationProgress(0);
  };

  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setAnimationProgress(prev => {
        if (prev >= 100) {
          if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
            return 0;
          } else {
            setIsAnimating(false);
            return 100;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isAnimating, currentStep, steps.length]);

  const getStepIcon = (stepType: string) => {
    const icons = {
      trigger: Zap,
      condition: Shield,
      approval: UserCheck,
      provisioning: Settings,
      notification: Mail
    };
    return icons[stepType as keyof typeof icons] || Settings;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Preview: {template.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Animation Controls */}
          <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
            <Button
              onClick={startAnimation}
              disabled={isAnimating}
              size="sm"
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Start Preview
            </Button>
            <Button
              onClick={pauseAnimation}
              disabled={!isAnimating}
              size="sm"
              variant="outline"
            >
              <Pause className="h-4 w-4" />
              Pause
            </Button>
            <Button
              onClick={resetAnimation}
              size="sm"
              variant="outline"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <div className="ml-4 text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>

          {/* Workflow Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow Flow Animation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const StepIcon = getStepIcon(step.type);
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  
                  return (
                    <div key={step.id} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-green-100 text-green-600' :
                        isActive ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <StepIcon className="h-5 w-5" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-medium ${isActive ? 'text-blue-600' : ''}`}>
                            {step.name}
                          </h4>
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
                        <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                        
                        {isActive && isAnimating && (
                          <div className="mt-2">
                            <Progress value={animationProgress} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">
                              Executing: {step.metadata?.realLifePurpose || 'Processing step...'}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {index < steps.length - 1 && (
                        <ArrowRight className={`h-4 w-4 ${
                          isCompleted ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Step Details */}
          {steps[currentStep] && (
            <Card>
              <CardHeader>
                <CardTitle>Current Step Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Purpose: </span>
                    <span>{steps[currentStep].metadata?.realLifePurpose}</span>
                  </div>
                  {steps[currentStep].conditions && steps[currentStep].conditions.length > 0 && (
                    <div>
                      <span className="font-medium">Conditions: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {steps[currentStep].conditions.map((condition, idx) => (
                          <code key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {condition}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}
                  {steps[currentStep].metadata?.complianceFramework && (
                    <div>
                      <span className="font-medium">Compliance: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {steps[currentStep].metadata.complianceFramework.map((framework, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {framework}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close Preview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
