
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, Download, AlertTriangle, CheckCircle, XCircle, 
  Clock, User, Activity, FileText
} from 'lucide-react';
import { WorkflowTemplate } from '@/types/workflow';
import { useToast } from '@/hooks/use-toast';

interface SimulateFlowModalProps {
  template: WorkflowTemplate | null;
  open: boolean;
  onClose: () => void;
}

export const SimulateFlowModal = ({ template, open, onClose }: SimulateFlowModalProps) => {
  const [selectedIdentity, setSelectedIdentity] = useState('');
  const [customPayload, setCustomPayload] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const { toast } = useToast();

  if (!template) return null;

  const mockIdentities = [
    { id: 'emp-001', name: 'John Smith', department: 'Engineering', role: 'Software Developer' },
    { id: 'emp-002', name: 'Sarah Johnson', department: 'Marketing', role: 'Marketing Manager' },
    { id: 'emp-003', name: 'Mike Chen', department: 'Finance', role: 'Financial Analyst' },
    { id: 'con-001', name: 'Alex Contractor', department: 'IT', role: 'External Consultant' }
  ];

  const runSimulation = async () => {
    setIsSimulating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResults = {
      executionId: `sim-${Date.now()}`,
      status: 'completed',
      totalSteps: template.linearSteps?.length || 5,
      completedSteps: template.linearSteps?.length || 5,
      failedSteps: 0,
      executionTime: '2m 34s',
      estimatedRiskLevel: 'low',
      steps: template.linearSteps?.map((step, index) => ({
        id: step.id,
        name: step.name,
        status: Math.random() > 0.1 ? 'passed' : 'failed',
        duration: Math.floor(Math.random() * 30) + 5,
        input: { userId: selectedIdentity, timestamp: new Date().toISOString() },
        output: { success: true, message: 'Step completed successfully' },
        logs: [`Starting ${step.name}`, `Processing request`, `Step completed`]
      })) || []
    };
    
    setSimulationResults(mockResults);
    setIsSimulating(false);
    
    toast({
      title: "Simulation Complete",
      description: `Workflow simulation finished in ${mockResults.executionTime}`,
    });
  };

  const exportResults = () => {
    if (!simulationResults) return;
    
    const dataStr = JSON.stringify(simulationResults, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `simulation-${template.id}-${Date.now()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Results Exported",
      description: "Simulation results downloaded successfully",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Simulate Workflow: {template.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="setup" className="space-y-4">
          <TabsList>
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="results" disabled={!simulationResults}>Results</TabsTrigger>
            <TabsTrigger value="logs" disabled={!simulationResults}>Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Simulation Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Test Identity</label>
                  <Select value={selectedIdentity} onValueChange={setSelectedIdentity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a test identity" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockIdentities.map((identity) => (
                        <SelectItem key={identity.id} value={identity.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{identity.name}</div>
                              <div className="text-xs text-gray-500">
                                {identity.department} - {identity.role}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Custom Payload (Optional)</label>
                  <Textarea
                    placeholder="Enter custom JSON payload for testing edge cases..."
                    value={customPayload}
                    onChange={(e) => setCustomPayload(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={runSimulation}
                    disabled={!selectedIdentity || isSimulating}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    {isSimulating ? 'Running Simulation...' : 'Start Simulation'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workflow Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {template.linearSteps?.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{step.name}</div>
                        <div className="text-sm text-gray-600">{step.description}</div>
                      </div>
                      <Badge variant="outline">{step.type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {simulationResults && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Simulation Results
                      <Button onClick={exportResults} size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{simulationResults.completedSteps}</div>
                        <div className="text-sm text-gray-600">Completed Steps</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{simulationResults.failedSteps}</div>
                        <div className="text-sm text-gray-600">Failed Steps</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{simulationResults.executionTime}</div>
                        <div className="text-sm text-gray-600">Total Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{simulationResults.estimatedRiskLevel}</div>
                        <div className="text-sm text-gray-600">Risk Level</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {simulationResults.steps.map((step: any, index: number) => (
                        <div key={step.id} className="flex items-center gap-3 p-3 border rounded">
                          {step.status === 'passed' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <div className="flex-1">
                            <div className="font-medium">{step.name}</div>
                            <div className="text-sm text-gray-600">Duration: {step.duration}s</div>
                          </div>
                          <Badge variant={step.status === 'passed' ? 'default' : 'destructive'}>
                            {step.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            {simulationResults && (
              <Card>
                <CardHeader>
                  <CardTitle>Execution Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
                    {simulationResults.steps.map((step: any) => (
                      <div key={step.id} className="mb-3">
                        <div className="text-yellow-400">[{step.name}]</div>
                        {step.logs.map((log: string, idx: number) => (
                          <div key={idx} className="ml-2">
                            <span className="text-gray-500">{new Date().toLocaleTimeString()}</span> {log}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
