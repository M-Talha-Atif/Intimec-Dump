import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, Settings, Clock, AlertTriangle, Shield, Zap,
  CheckCircle, XCircle 
} from 'lucide-react';
import { Workflow } from '@/data/mock-workflows';
import { workflowApi } from '@/services/workflowApi';

interface TabsContentProps {
  workflow: Workflow;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabsContent({ workflow, activeTab, onTabChange }: TabsContentProps) {
  const [runLogs, setRunLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Fetch execution logs when logs tab is opened
  useEffect(() => {
    if (activeTab === 'logs' && runLogs.length === 0 && !isLoadingLogs) {
      setIsLoadingLogs(true);
      workflowApi.listExecutions({ 
        workflowId: workflow.id, 
        page: 0, 
        size: 10,
        sort: 'startedAt,desc'
      })
        .then(response => {
          if (response.data?.content) {
            setRunLogs(response.data.content);
          }
        })
        .catch(error => {
          console.error('Failed to fetch execution logs:', error);
        })
        .finally(() => {
          setIsLoadingLogs(false);
        });
    }
  }, [activeTab, workflow.id, runLogs.length, isLoadingLogs]);

  const formatDuration = (hours: number): string => {
    if (hours === 0 || !hours) return '0s';
    if (hours < 1/3600) return `${Math.round(hours * 3600000)}ms`;
    if (hours < 1/60) return `${Math.round(hours * 3600)}s`;
    if (hours < 1) return `${(hours * 60).toFixed(1)}min`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
  };

  const mockAISuggestions = [
    'Consider adding parallel approval paths to reduce completion time by 40%',
    'Automate department classification to eliminate manual review step',
    'Add escalation logic for approvals pending longer than 24 hours'
  ];

  return (
    <ScrollArea className="flex-1">
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Executions</span>
                    <span className="font-semibold">{workflow.executionCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Completion Time</span>
                    <span className="font-semibold">{formatDuration(workflow.averageCompletionTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Score</span>
                    <Badge variant={workflow.riskScore > 7 ? 'destructive' : workflow.riskScore > 4 ? 'default' : 'secondary'}>
                      {workflow.riskScore}/10
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role Sensitivity</span>
                    <Badge variant="outline">{workflow.roleSensitivity.toUpperCase()}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trigger Type</span>
                    <Badge variant="outline">{workflow.triggerType}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Version</span>
                    <span className="font-semibold">v{workflow.currentVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(workflow.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {workflow.hasTimeLogic && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Time Logic
                      </Badge>
                    )}
                    {workflow.hasSoDViolation && (
                      <Badge variant="secondary" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        SoD Check
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                {workflow.tags && workflow.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {workflow.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No tags defined</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'versions' && (
          <div className="space-y-3">
            {workflow.versions.map((version, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={version.isActive ? 'default' : 'secondary'}>
                        v{version.version}
                      </Badge>
                      <div>
                        <div className="font-medium">{version.changes || 'Version update'}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(version.createdAt).toLocaleDateString()} by {version.createdBy}
                        </div>
                      </div>
                    </div>
                    {version.isActive && (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Current
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-3">
            {isLoadingLogs ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading execution logs...</p>
              </div>
            ) : runLogs.length > 0 ? (
              runLogs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {log.status === 'COMPLETED' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <div className="font-medium">
                            {log.status === 'COMPLETED' ? 'Completed Successfully' : 'Failed Execution'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(log.startedAt).toLocaleString()} • Duration: {formatDuration(log.durationMs / (1000 * 60 * 60))} • 
                            Triggered by: {log.triggeredBy || 'System'}
                          </div>
                          {log.errorMessage && (
                            <div className="text-sm text-red-600 mt-1">Error: {log.errorMessage}</div>
                          )}
                        </div>
                      </div>
                      <Badge variant={log.status === 'COMPLETED' ? 'secondary' : 'destructive'}>
                        {log.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No execution logs yet</p>
                <p className="text-sm text-muted-foreground mt-1">This workflow hasn't been executed yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflow.applicationScope.map((app, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{app}</div>
                      <div className="text-sm text-muted-foreground">Connected Application</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'ai-insights' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4" />
                AI Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockAISuggestions.map((suggestion, index) => (
                <div key={index} className="p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="p-1 bg-primary/10 rounded">
                      <Zap className="h-3 w-3 text-primary" />
                    </div>
                    <p className="text-sm">{suggestion}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
