"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Play, Square, Download, User, Clock, CheckCircle, 
  XCircle, AlertTriangle, Zap, Shield, Target
} from 'lucide-react';

interface SimulationResult {
  executionId: string;
  status: 'success' | 'partial' | 'failed';
  duration: number;
  pathTrace: Array<{
    nodeId: string;
    stepType: string;
    status: 'completed' | 'failed' | 'skipped' | 'timeout';
    duration: number;
    timestamp: Date;
    output?: any;
    error?: string;
  }>;
  riskScore: number;
  sodViolations: Array<{
    nodeId: string;
    violation: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  metrics: {
    totalNodes: number;
    nodesExecuted: number;
    nodesFailed: number;
    nodesSkipped: number;
    avgExecutionTime: number;
  };
}

interface SimulationConsoleProps {
  workflow: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SimulationConsole: React.FC<SimulationConsoleProps> = ({
  workflow,
  open,
  onOpenChange
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentResult, setCurrentResult] = useState<SimulationResult | null>(null);
  const [simulationHistory, setSimulationHistory] = useState<SimulationResult[]>([]);
  
  const [scenario, setScenario] = useState<'joiner' | 'mover' | 'leaver' | 'request'>('joiner');
  const [testIdentity, setTestIdentity] = useState({
    id: 'emp-12345',
    email: 'jane.doe@company.com',
    firstName: 'Jane',
    lastName: 'Doe',
    department: 'Engineering',
    title: 'Software Engineer',
    manager: 'john.manager@company.com'
  });
  const [injectFailures, setInjectFailures] = useState(false);
  const [simulateLoad, setSimulateLoad] = useState(false);

  const runSimulation = async () => {
    setIsRunning(true);
    
    // Mock simulation execution
    setTimeout(() => {
      const mockResult: SimulationResult = {
        executionId: `sim-${Date.now()}`,
        status: injectFailures ? 'partial' : 'success',
        duration: 2340,
        pathTrace: [
          {
            nodeId: 'start-node',
            stepType: 'trigger',
            status: 'completed',
            duration: 120,
            timestamp: new Date(),
            output: { triggered: true }
          },
          {
            nodeId: 'approval-node',
            stepType: 'approval',
            status: injectFailures ? 'timeout' : 'completed',
            duration: 1500,
            timestamp: new Date(),
            output: { approved: !injectFailures }
          },
          {
            nodeId: 'provision-node',
            stepType: 'provisioning',
            status: 'completed',
            duration: 720,
            timestamp: new Date(),
            output: { provisioned: true }
          }
        ],
        riskScore: 35,
        sodViolations: [],
        metrics: {
          totalNodes: 5,
          nodesExecuted: 3,
          nodesFailed: injectFailures ? 1 : 0,
          nodesSkipped: 1,
          avgExecutionTime: 780
        }
      };

      setCurrentResult(mockResult);
      setSimulationHistory(prev => [mockResult, ...prev.slice(0, 9)]);
      setIsRunning(false);
    }, 2000);
  };

  const exportReport = () => {
    if (!currentResult) return;
    
    const report = {
      workflow: {
        id: workflow.id,
        name: workflow.name,
        version: workflow.version
      },
      simulation: currentResult,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation-report-${currentResult.executionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'timeout': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'skipped': return <Target className="h-4 w-4 text-gray-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'partial': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed inset-4 bg-background border rounded-lg shadow-lg">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <h2 className="font-semibold">Workflow Simulation Console</h2>
              <Badge variant="outline">{workflow.name}</Badge>
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Configuration Panel */}
            <div className="w-80 border-r bg-muted/20 p-4 overflow-y-auto">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Scenario Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs">Scenario Type</Label>
                      <Select value={scenario} onValueChange={(value: any) => setScenario(value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="joiner">👋 New Joiner</SelectItem>
                          <SelectItem value="mover">🔄 Department Transfer</SelectItem>
                          <SelectItem value="leaver">👋 Employee Departure</SelectItem>
                          <SelectItem value="request">📝 Access Request</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Test Identity</Label>
                      <Input
                        value={testIdentity.email}
                        onChange={(e) => setTestIdentity({ ...testIdentity, email: e.target.value })}
                        placeholder="user@company.com"
                        className="mt-1"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Inject Failures</Label>
                      <Switch
                        checked={injectFailures}
                        onCheckedChange={setInjectFailures}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Simulate Load</Label>
                      <Switch
                        checked={simulateLoad}
                        onCheckedChange={setSimulateLoad}
                      />
                    </div>

                    <Button 
                      onClick={runSimulation} 
                      disabled={isRunning}
                      className="w-full"
                    >
                      {isRunning ? (
                        <>
                          <Square className="h-4 w-4 mr-2" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Run Simulation
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {simulationHistory.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Simulation History</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {simulationHistory.map((result) => (
                        <Card key={result.executionId} className="cursor-pointer hover:bg-muted/50">
                          <CardContent className="p-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(result.status)}
                                <span className="text-xs">{result.executionId.slice(0, 12)}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {result.duration}ms
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Results Panel */}
            <div className="flex-1 p-4 overflow-y-auto">
              {isRunning ? (
                <Card>
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="h-5 w-5 animate-pulse" />
                        <p className="font-medium">Simulation Running...</p>
                      </div>
                      <Progress value={66} className="w-full" />
                    </div>
                  </CardContent>
                </Card>
              ) : currentResult ? (
                <Tabs defaultValue="trace" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="trace">Execution Trace</TabsTrigger>
                    <TabsTrigger value="metrics">Metrics</TabsTrigger>
                    <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
                  </TabsList>

                  <TabsContent value="trace" className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(currentResult.status)}>
                          {currentResult.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Duration: {currentResult.duration}ms
                        </span>
                      </div>
                      <Button variant="outline" size="sm" onClick={exportReport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                      </Button>
                    </div>

                    {currentResult.pathTrace.map((step, idx) => (
                      <Card key={idx} className="border-l-4 border-l-blue-400">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(step.status)}
                              <div>
                                <p className="text-sm font-medium">{step.nodeId}</p>
                                <p className="text-xs text-muted-foreground">{step.stepType}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {step.duration}ms
                            </Badge>
                          </div>
                          {step.error && (
                            <div className="mt-2 text-xs text-red-600">
                              Error: {step.error}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="metrics">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold">{currentResult.metrics.nodesExecuted}</div>
                            <p className="text-xs text-muted-foreground">Nodes Executed</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold">{currentResult.metrics.avgExecutionTime}ms</div>
                            <p className="text-xs text-muted-foreground">Avg. Execution Time</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-red-600">{currentResult.metrics.nodesFailed}</div>
                            <p className="text-xs text-muted-foreground">Nodes Failed</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-gray-600">{currentResult.metrics.nodesSkipped}</div>
                            <p className="text-xs text-muted-foreground">Nodes Skipped</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="risk">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Risk Assessment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm">Risk Score</Label>
                              <span className={`text-2xl font-bold ${getRiskColor(currentResult.riskScore)}`}>
                                {currentResult.riskScore}
                              </span>
                            </div>
                            <Progress value={currentResult.riskScore} className="w-full" />
                          </div>

                          {currentResult.sodViolations.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground text-sm">
                              No SoD violations detected
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {currentResult.sodViolations.map((violation, idx) => (
                                <Card key={idx} className="border-l-4 border-l-red-400">
                                  <CardContent className="p-3">
                                    <div className="flex items-start gap-2">
                                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                                      <div>
                                        <p className="text-sm font-medium">{violation.violation}</p>
                                        <p className="text-xs text-muted-foreground">Node: {violation.nodeId}</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Configure a scenario and click "Run Simulation" to test the workflow
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
