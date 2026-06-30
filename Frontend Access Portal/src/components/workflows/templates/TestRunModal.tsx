
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Play, Square, RotateCcw, AlertTriangle, CheckCircle, 
  XCircle, Clock, Shield, Database
} from 'lucide-react';
import { WorkflowTemplate } from '@/types/workflow';
import { useToast } from '@/hooks/use-toast';

interface TestRunModalProps {
  template: WorkflowTemplate | null;
  open: boolean;
  onClose: () => void;
}

export const TestRunModal = ({ template, open, onClose }: TestRunModalProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [testResults, setTestResults] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  if (!template) return null;

  const runTest = async () => {
    setIsRunning(true);
    setCurrentStep(0);
    setProgress(0);
    setTestResults(null);

    const steps = template.linearSteps || [];
    
    // Simulate step-by-step execution
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      setProgress(((i + 1) / steps.length) * 100);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Generate mock test results
    const mockResults = {
      executionId: `test-${Date.now()}`,
      status: 'completed',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 120000).toISOString(),
      duration: '2m 15s',
      steps: steps.map((step, index) => ({
        id: step.id,
        name: step.name,
        status: Math.random() > 0.15 ? 'passed' : 'failed',
        duration: Math.floor(Math.random() * 45) + 10,
        issues: Math.random() > 0.8 ? ['Connection timeout', 'Retry successful'] : [],
        rollbackRequired: false
      })),
      systemsAffected: ['Active Directory', 'Okta', 'Salesforce'],
      risksIdentified: ['None'],
      recommendedActions: ['Deploy to production', 'Monitor first 24 hours']
    };

    setTestResults(mockResults);
    setIsRunning(false);
    
    toast({
      title: "Test Run Complete",
      description: `Workflow test completed in ${mockResults.duration}`,
    });
  };

  const stopTest = () => {
    setIsRunning(false);
    toast({
      title: "Test Stopped",
      description: "Test execution has been aborted safely",
    });
  };

  const resetTest = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setProgress(0);
    setTestResults(null);
  };

  const rollbackChanges = () => {
    toast({
      title: "Rollback Complete",
      description: "All test changes have been reverted successfully",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-green-600" />
            Test Run: {template.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Test Environment Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Button
                  onClick={runTest}
                  disabled={isRunning}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  {isRunning ? 'Running Test...' : 'Start Test Run'}
                </Button>
                <Button
                  onClick={stopTest}
                  disabled={!isRunning}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  Stop Test
                </Button>
                <Button
                  onClick={resetTest}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  This test runs in a sandboxed environment. No production systems will be affected.
                  All changes can be rolled back automatically.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Progress & Current Step */}
          {isRunning && (
            <Card>
              <CardHeader>
                <CardTitle>Test Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={progress} className="h-3" />
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Executing Step {currentStep + 1} of {template.linearSteps?.length || 0}
                    </p>
                    {template.linearSteps && template.linearSteps[currentStep] && (
                      <p className="font-medium mt-1">
                        {template.linearSteps[currentStep].name}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Results */}
          {testResults && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Test Results
                    <Badge variant={testResults.status === 'completed' ? 'default' : 'destructive'}>
                      {testResults.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{testResults.duration}</div>
                      <div className="text-sm text-gray-600">Total Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {testResults.steps.filter((s: any) => s.status === 'passed').length}
                      </div>
                      <div className="text-sm text-gray-600">Passed Steps</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {testResults.steps.filter((s: any) => s.status === 'failed').length}
                      </div>
                      <div className="text-sm text-gray-600">Failed Steps</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {testResults.systemsAffected.length}
                      </div>
                      <div className="text-sm text-gray-600">Systems Tested</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Step Results:</h4>
                    {testResults.steps.map((step: any) => (
                      <div key={step.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          {step.status === 'passed' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <div className="font-medium">{step.name}</div>
                            {step.issues.length > 0 && (
                              <div className="text-sm text-orange-600">
                                Issues: {step.issues.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={step.status === 'passed' ? 'default' : 'destructive'}>
                            {step.status}
                          </Badge>
                          <div className="text-sm text-gray-500 mt-1">
                            {step.duration}s
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Systems Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Systems Tested:</h4>
                      <div className="flex flex-wrap gap-2">
                        {testResults.systemsAffected.map((system: string, index: number) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            <Database className="h-3 w-3" />
                            {system}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Recommended Actions:</h4>
                      <ul className="space-y-1">
                        {testResults.recommendedActions.map((action: string, index: number) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={rollbackChanges} variant="outline">
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Rollback Changes
                      </Button>
                      <Button>
                        Deploy to Production
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
