
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Activity, ChevronDown, ChevronUp, X, RefreshCw, 
  CheckCircle, AlertCircle, Clock, Zap
} from 'lucide-react';

interface TaskProgress {
  appId: string;
  appName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentStep: string;
  processedCount: number;
  totalCount: number;
  startTime: string;
  estimatedCompletion?: string;
  errorMessage?: string;
}

interface LiveMonitoringProps {
  selectedApps: string[];
  onCancel: () => void;
  onRetry: (appId: string) => void;
  taskId?: string;
}

// Mock API function
const mockFetchTaskStatus = async (taskId: string): Promise<TaskProgress[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    {
      appId: 'active-directory',
      appName: 'Active Directory',
      status: Math.random() > 0.7 ? 'completed' : 'running',
      progress: Math.min(100, Math.floor(Math.random() * 100) + 20),
      currentStep: 'Processing user accounts',
      processedCount: 1250,
      totalCount: 1500,
      startTime: new Date(Date.now() - 300000).toISOString(),
      estimatedCompletion: new Date(Date.now() + 180000).toISOString()
    },
    {
      appId: 'salesforce',
      appName: 'Salesforce',
      status: Math.random() > 0.8 ? 'failed' : 'running',
      progress: Math.floor(Math.random() * 60) + 10,
      currentStep: 'Validating entitlements',
      processedCount: 890,
      totalCount: 2100,
      startTime: new Date(Date.now() - 240000).toISOString(),
      errorMessage: Math.random() > 0.8 ? 'Connection timeout to Salesforce API' : undefined
    },
    {
      appId: 'workday',
      appName: 'Workday HCM',
      status: 'pending',
      progress: 0,
      currentStep: 'Queued for processing',
      processedCount: 0,
      totalCount: 800,
      startTime: new Date().toISOString()
    }
  ];
};

export function LiveMonitoring({ selectedApps, onCancel, onRetry, taskId }: LiveMonitoringProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [taskProgress, setTaskProgress] = useState<TaskProgress[]>([]);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    if (!taskId || !isPolling) return;

    const pollStatus = async () => {
      try {
        const progress = await mockFetchTaskStatus(taskId);
        setTaskProgress(progress);

        // Stop polling if all tasks are completed or failed
        const allDone = progress.every(p => 
          p.status === 'completed' || p.status === 'failed' || p.status === 'cancelled'
        );
        if (allDone) {
          setIsPolling(false);
        }
      } catch (error) {
        console.error('Failed to fetch task status:', error);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 2000);

    return () => clearInterval(interval);
  }, [taskId, isPolling]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'running': return <Activity className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'cancelled': return <X className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      running: 'secondary',
      cancelled: 'outline',
      pending: 'outline'
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const overallProgress = taskProgress.length > 0 
    ? Math.round(taskProgress.reduce((acc, task) => acc + task.progress, 0) / taskProgress.length)
    : 0;

  const completedTasks = taskProgress.filter(t => t.status === 'completed').length;
  const failedTasks = taskProgress.filter(t => t.status === 'failed').length;
  const runningTasks = taskProgress.filter(t => t.status === 'running').length;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className="border-blue-200">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-500" />
                <span>Live Import Monitoring</span>
                <Badge variant="secondary">
                  {completedTasks}/{taskProgress.length} Complete
                </Badge>
                {failedTasks > 0 && (
                  <Badge variant="destructive">{failedTasks} Failed</Badge>
                )}
              </div>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
            {!isExpanded && (
              <div className="flex items-center space-x-4 mt-2">
                <Progress value={overallProgress} className="flex-1" />
                <span className="text-sm text-muted-foreground">{overallProgress}%</span>
              </div>
            )}
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Overall Progress */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Overall Progress</h4>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    {completedTasks} completed, {runningTasks} running, {failedTasks} failed
                  </span>
                  <Button size="sm" variant="outline" onClick={onCancel}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel All
                  </Button>
                </div>
              </div>
              <Progress value={overallProgress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>{overallProgress}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Individual App Progress */}
            <div className="space-y-4">
              {taskProgress.map((task) => (
                <Card key={task.appId} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(task.status)}
                        <div>
                          <h5 className="font-medium">{task.appName}</h5>
                          <p className="text-sm text-muted-foreground">{task.currentStep}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(task.status)}
                        {task.status === 'failed' && (
                          <Button size="sm" variant="outline" onClick={() => onRetry(task.appId)}>
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress: {task.processedCount}/{task.totalCount} items</span>
                        <span>{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-1" />
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                      <span>Running for {formatDuration(task.startTime)}</span>
                      {task.estimatedCompletion && task.status === 'running' && (
                        <span>ETA: {new Date(task.estimatedCompletion).toLocaleTimeString()}</span>
                      )}
                    </div>

                    {task.errorMessage && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        Error: {task.errorMessage}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
