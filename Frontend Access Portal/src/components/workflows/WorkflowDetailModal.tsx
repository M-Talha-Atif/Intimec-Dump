
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Clock, Users, Activity, GitBranch, Shield, 
  CheckCircle, AlertTriangle, Calendar, Zap,
  Play, Edit, Archive, FileDown, Settings,
  UserCheck, XCircle, Trash2
} from 'lucide-react';
import { Workflow } from '@/data/mock-workflows';
import { workflowApi } from '@/services/workflowApi';

interface WorkflowDetailModalProps {
  workflow: Workflow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (workflow: Workflow) => void;
  onRun?: (workflow: Workflow) => void;
  onClone?: (workflow: Workflow) => void;
  onDelete?: (workflow: Workflow) => void;
}

const WorkflowDetailModal: React.FC<WorkflowDetailModalProps> = ({
  workflow,
  open,
  onOpenChange,
  onEdit,
  onRun,
  onClone,
  onDelete
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [runLogs, setRunLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Fetch execution logs when logs tab is opened
  useEffect(() => {
    if (workflow && activeTab === 'logs' && runLogs.length === 0 && !isLoadingLogs) {
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
  }, [workflow, activeTab, runLogs.length, isLoadingLogs]);

  // Format duration in a human-readable way
  const formatDuration = (hours: number): string => {
    if (hours === 0 || !hours) return '0s';
    if (hours < 1/3600) return `${Math.round(hours * 3600000)}ms`; // Less than 1 second
    if (hours < 1/60) return `${Math.round(hours * 3600)}s`; // Less than 1 minute
    if (hours < 1) return `${(hours * 60).toFixed(1)}min`; // Less than 1 hour
    if (hours < 24) return `${hours.toFixed(1)}h`; // Less than 1 day
    return `${(hours / 24).toFixed(1)}d`; // Days
  };

  const mockAISuggestions = [
    'Consider adding parallel approval paths to reduce completion time by 40%',
    'Automate department classification to eliminate manual review step',
    'Add escalation logic for approvals pending longer than 24 hours'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enabled': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPolicyIcon = (compliance: string) => {
    switch (compliance) {
      case 'compliant': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'violation': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!workflow) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">{workflow.name}</DialogTitle>
              <p className="text-gray-600 mt-1">{workflow.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(workflow.status)}>
                {workflow.status}
              </Badge>
              <div className="flex items-center gap-1">
                {getPolicyIcon(workflow.policyCompliance)}
                <span className="text-sm text-gray-600">{workflow.policyCompliance}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
            <TabsTrigger value="logs">Run Logs</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
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
                    <span className="text-gray-600">Total Executions</span>
                    <span className="font-semibold">{workflow.executionCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Completion Time</span>
                    <span className="font-semibold">{formatDuration(workflow.averageCompletionTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Risk Score</span>
                    <Badge variant={workflow.riskScore > 7 ? 'destructive' : workflow.riskScore > 4 ? 'default' : 'secondary'}>
                      {workflow.riskScore}/10
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role Sensitivity</span>
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
                    <span className="text-gray-600">Trigger Type</span>
                    <Badge variant="outline">{workflow.triggerType}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Version</span>
                    <span className="font-semibold">v{workflow.currentVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="text-sm text-gray-600">
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
                  <p className="text-sm text-gray-500 italic">No tags defined</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="versions" className="space-y-4">
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
                          <div className="text-sm text-gray-600">
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
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            {isLoadingLogs ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading execution logs...</p>
              </div>
            ) : runLogs.length > 0 ? (
              <div className="space-y-3">
                {runLogs.map((log) => (
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
                            <div className="text-sm text-gray-600">
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
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No execution logs yet</p>
                <p className="text-sm text-gray-500 mt-1">This workflow hasn't been executed yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workflow.applicationScope.map((app, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Shield className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{app}</div>
                        <div className="text-sm text-gray-600">Connected Application</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  AI Optimization Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockAISuggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="p-1 bg-blue-100 rounded">
                        <Zap className="h-3 w-3 text-blue-600" />
                      </div>
                      <p className="text-sm text-blue-800">{suggestion}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <div className="flex gap-2">
            {workflow.triggerType !== 'event-based' && (
              <Button 
                size="sm" 
                onClick={() => onRun?.(workflow)}
                disabled={workflow.status !== 'enabled'}
              >
                <Play className="h-4 w-4 mr-2" />
                Run Workflow
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onEdit?.(workflow)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onClone?.(workflow)}
            >
              <GitBranch className="h-4 w-4 mr-2" />
              Clone
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => onDelete?.(workflow)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowDetailModal;
