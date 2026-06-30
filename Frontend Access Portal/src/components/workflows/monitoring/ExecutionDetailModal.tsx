
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Download, RefreshCw, StopCircle, Brain, Clock, User, 
  CheckCircle, XCircle, AlertCircle, Activity, Play,
  ChevronDown, ChevronRight, ExternalLink, Copy, Repeat
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExecutionStep {
  id: string;
  executionId?: string;
  name: string;
  type: 'trigger' | 'condition' | 'approval' | 'action' | 'notification' | 'control';
  status: 'passed' | 'failed' | 'skipped' | 'retried' | 'running' | 'pending';
  startTime: string;
  endTime?: string;
  duration: number;
  inputParameters?: Record<string, any>;
  outputResult?: Record<string, any>;
  errorMessage?: string;
  retryCount: number;
  assignedActor?: string;
  logs?: string[];
  // Loop context fields
  loopStartNode?: string;
  loopIndex?: number;
  totalItems?: number;
  isLoopIteration?: boolean;
}

interface ExecutionRecord {
  id: string;
  workflowName: string;
  workflowId: string;
  identityName: string;
  status: 'completed' | 'failed' | 'running' | 'cancelled' | 'paused';
  startTime: string;
  endTime?: string;
  duration: number;
  triggeredBy: string;
  triggerSource: string;
  executedBy: string;
  slaExpected: number;
  slaActual: number;
  steps: ExecutionStep[];
  auditTrail: Array<{
    id: string;
    action: string;
    actor: string;
    role: string;
    timestamp: string;
    details: string;
  }>;
}

interface ExecutionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  execution: ExecutionRecord | null;
}

export const ExecutionDetailModal: React.FC<ExecutionDetailModalProps> = ({
  isOpen,
  onClose,
  execution
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  if (!execution) return null;

  const toggleStepExpanded = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Activity className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'skipped':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      passed: 'default',
      completed: 'default',
      failed: 'destructive',
      running: 'secondary',
      pending: 'outline',
      skipped: 'outline'
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const handleDownloadLog = () => {
    const logData = {
      executionId: execution.id,
      workflowName: execution.workflowName,
      execution: execution,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(logData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `workflow-execution-${execution.id}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Execution Log Downloaded",
      description: "Full execution details exported successfully",
    });
  };

  const handleRetryFailed = () => {
    toast({
      title: "Retrying Failed Steps",
      description: `Restarting failed steps for execution ${execution.id}...`,
    });
  };

  const handleAbortExecution = () => {
    toast({
      title: "Execution Aborted",
      description: `Workflow execution ${execution.id} has been terminated`,
    });
  };

  const handleExplainFailure = () => {
    toast({
      title: "AI Analysis Complete",
      description: "Failure analysis: Connection timeout to target system during provisioning step. Recommend checking network connectivity and system availability.",
    });
  };

  const slaStatus = execution.slaActual > execution.slaExpected ? 'breached' : 'met';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Workflow Execution Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Top Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{execution.workflowName}</span>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(execution.status)}
                  <Badge variant={slaStatus === 'met' ? 'default' : 'destructive'}>
                    SLA {slaStatus.toUpperCase()}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Trigger Source</p>
                  <p className="font-medium">{execution.triggerSource}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Executed By</p>
                  <p className="font-medium">{execution.executedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{formatDuration(execution.duration)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SLA Time</p>
                  <p className="font-medium">
                    {formatDuration(execution.slaActual)} / {formatDuration(execution.slaExpected)}
                  </p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <span>Started: {new Date(execution.startTime).toLocaleString()}</span>
                  {execution.endTime && (
                    <span> • Ended: {new Date(execution.endTime).toLocaleString()}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleDownloadLog} size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    Download Log
                  </Button>
                  {execution.status === 'failed' && (
                    <>
                      <Button onClick={handleRetryFailed} size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Retry Failed
                      </Button>
                      <Button onClick={handleExplainFailure} size="sm" variant="outline">
                        <Brain className="h-4 w-4 mr-1" />
                        AI Explain
                      </Button>
                    </>
                  )}
                  {execution.status === 'running' && (
                    <Button onClick={handleAbortExecution} size="sm" variant="destructive">
                      <StopCircle className="h-4 w-4 mr-1" />
                      Abort
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for detailed views */}
          <Tabs defaultValue="steps" className="space-y-4">
            <TabsList>
              <TabsTrigger value="steps">Step Breakdown</TabsTrigger>
              <TabsTrigger value="audit">Audit Trail</TabsTrigger>
              <TabsTrigger value="timeline">Timeline View</TabsTrigger>
            </TabsList>

            <TabsContent value="steps" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Step-by-Step Execution</CardTitle>
                </CardHeader>
                <CardContent>
                  {execution.steps.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No step details available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {execution.steps.map((step, index) => (
                        <Card key={`${step.executionId || step.id}-${index}`} className={`border-l-4 ${step.isLoopIteration ? 'border-l-purple-500 ml-4' : 'border-l-blue-500'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              {getStatusIcon(step.status)}
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-medium">Step {index + 1}: {step.name}</h4>
                                  {step.isLoopIteration && (
                                    <Badge variant="outline" className="text-purple-600 border-purple-300">
                                      <Repeat className="h-3 w-3 mr-1" />
                                      Iteration {(step.loopIndex ?? 0) + 1}/{step.totalItems}
                                    </Badge>
                                  )}
                                  {getStatusBadge(step.status)}
                                  {step.retryCount > 0 && (
                                    <Badge variant="outline">Retried {step.retryCount}x</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDuration(step.duration)}
                                  </span>
                                  {step.assignedActor && (
                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {step.assignedActor}
                                    </span>
                                  )}
                                  <span>Type: {step.type}</span>
                                </div>
                                {step.errorMessage && (
                                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                    Error: {step.errorMessage}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  Started: {new Date(step.startTime).toLocaleString()}
                                  {step.endTime && ` • Ended: ${new Date(step.endTime).toLocaleString()}`}
                                </p>
                              </div>
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => toggleStepExpanded(step.id)}
                            >
                              {expandedSteps.has(step.id) ? 
                                <ChevronDown className="h-4 w-4" /> : 
                                <ChevronRight className="h-4 w-4" />
                              }
                            </Button>
                          </div>

                          {expandedSteps.has(step.id) && (
                            <div className="mt-4 pl-7 space-y-3">
                              {step.inputParameters && (
                                <div>
                                  <h5 className="font-medium mb-2">Input Parameters</h5>
                                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(step.inputParameters, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {step.outputResult && (
                                <div>
                                  <h5 className="font-medium mb-2">Output Result</h5>
                                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(step.outputResult, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {step.logs && step.logs.length > 0 && (
                                <div>
                                  <h5 className="font-medium mb-2">Logs</h5>
                                  <div className="space-y-1">
                                    {step.logs.map((log, logIndex) => (
                                      <p key={logIndex} className="text-xs font-mono bg-gray-50 p-1 rounded">
                                        {log}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Audit Trail</CardTitle>
                </CardHeader>
                <CardContent>
                  {execution.auditTrail.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No audit trail available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {execution.auditTrail.map((entry) => (
                        <div key={entry.id} className="flex items-start gap-3 p-3 border rounded">
                          <User className="h-4 w-4 mt-1 text-blue-600" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{entry.action}</span>
                              <Badge variant="outline">{entry.role}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              by {entry.actor} • {new Date(entry.timestamp).toLocaleString()}
                            </p>
                            {entry.details && (
                              <p className="text-sm mt-1">{entry.details}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Timeline Visualization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {execution.steps.map((step, index) => (
                      <div key={`${step.id}-${index}`} className="flex items-center gap-4">
                        <div className="w-20 text-sm text-muted-foreground">
                          Step {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{step.name}</span>
                            {getStatusIcon(step.status)}
                          </div>
                          <div className="h-4 bg-gray-200 rounded relative overflow-hidden">
                            <div 
                              className={`h-full rounded ${
                                step.status === 'passed' ? 'bg-green-500' :
                                step.status === 'failed' ? 'bg-red-500' :
                                step.status === 'running' ? 'bg-blue-500' :
                                step.status === 'pending' ? 'bg-amber-500' :
                                'bg-yellow-500'
                              }`}
                              style={{ width: `${Math.min((step.duration / execution.duration) * 100, 100)}%` }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDuration(step.duration)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
