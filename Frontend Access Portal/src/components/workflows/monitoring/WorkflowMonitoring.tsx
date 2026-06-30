import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Activity, Filter, Eye, Clock, AlertCircle,
  CheckCircle, XCircle, Users, BarChart3, RefreshCw, Search,
} from 'lucide-react';
import { ExecutionDetailPanel } from './execution-detail-panel';
import { workflowApi } from '@/services/workflowApi';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExecutionRecord {
  id: string;
  workflowName: string;
  workflowId: string;
  identityName: string;
  status: 'completed' | 'failed' | 'running' | 'cancelled' | 'paused';
  startTime: string;
  endTime?: string;
  duration: number;
  stepsCompleted: number;
  totalSteps: number;
  errorMessage?: string;
  triggeredBy: string;
  triggerSource: string;
  executedBy: string;
  slaExpected: number;
  slaActual: number;
  executionContext?: Record<string, any>;
  steps: Array<{
    id: string;
    executionId?: string; // unique execution record id
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
  }>;
  auditTrail: Array<{
    id: string;
    action: string;
    actor: string;
    role: string;
    timestamp: string;
    details: string;
  }>;
}

const WorkflowMonitoring = () => {
  const { toast } = useToast();
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<ExecutionRecord | null>(null);
  const [panelWidth, setPanelWidth] = useState(700);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;
  const [userDisplayById, setUserDisplayById] = useState<Record<string, string>>({});
  const hasRefreshedAfterUserLoadRef = useRef(false);
  const lastSyncedSelectedFromListRef = useRef<{ executionId: string; listItemRef: ExecutionRecord } | null>(null);
  const [globalStats, setGlobalStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    running: 0,
    paused: 0,
    cancelled: 0,
    avgDurationMs: 0
  });

  // Load global statistics
  const loadStatistics = async () => {
    try {
      const response = await workflowApi.getExecutionStatistics();
      if (response.data) {
        setGlobalStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const unwrapApiEnvelope = <T,>(payload: any): T => {
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload.data as T;
    }
    return payload as T;
  };

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  const isUuid = (value: unknown): value is string => {
    return typeof value === 'string' && UUID_REGEX.test(value);
  };

  const isSensitiveKey = (key: string) => {
    const lowered = key.toLowerCase();
    return (
      lowered === 'jwttoken' ||
      lowered === 'authorization' ||
      lowered.includes('token') ||
      lowered.includes('secret') ||
      lowered.includes('password') ||
      lowered.includes('apikey')
    );
  };

  const shouldResolveAsUserIdKey = (key: string) => {
    const lowered = key.toLowerCase();
    if (lowered === 'roleid' || lowered === 'workflowid' || lowered === 'executionid' || lowered === 'eventid' || lowered === 'approvalid') {
      return false;
    }

    return (
      lowered === 'userid' ||
      lowered.endsWith('userid') ||
      lowered === 'createdby' ||
      lowered === 'deletedby' ||
      lowered === 'triggeredby' ||
      lowered === 'approvedby' ||
      lowered === 'approverid'
    );
  };

  const toUserDisplay = (value: unknown): unknown => {
    if (!isUuid(value)) return value;
    return userDisplayById[value] || value;
  };

  const transformForDisplay = (value: unknown, keyHint?: string, depth = 0): unknown => {
    if (value === null || value === undefined) return value;
    if (depth > 8) return value;

    if (typeof value === 'string') {
      if (keyHint && shouldResolveAsUserIdKey(keyHint)) return toUserDisplay(value);
      return toUserDisplay(value);
    }

    if (Array.isArray(value)) {
      return value.map((v) => transformForDisplay(v, keyHint, depth + 1));
    }

    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj)) {
        if (isSensitiveKey(k)) {
          out[k] = '[REDACTED]';
          continue;
        }
        out[k] = transformForDisplay(v, k, depth + 1);
      }
      return out;
    }

    return value;
  };

  const findUserArray = (root: any): any[] => {
    const seen = new Set<any>();

    const isUserLike = (obj: any) => {
      const id = obj?.id || obj?.userId;
      const name = obj?.username || obj?.userName || obj?.displayName || obj?.fullName || obj?.email;
      return !!id && !!name;
    };

    const visit = (node: unknown, depth: number): any[] => {
      if (node === null || node === undefined) return [];
      if (depth > 6) return [];
      if (typeof node !== 'object') return [];
      if (seen.has(node)) return [];
      seen.add(node);

      if (Array.isArray(node)) {
        const arr = node;
        if (arr.length > 0 && arr.every(isUserLike)) return arr as any[];
        for (const item of arr) {
          const found = visit(item, depth + 1);
          if (found.length) return found;
        }
        return [];
      }

      const obj = node as Record<string, unknown>;
      const directCandidates = [obj.content, obj.data, obj.items, obj.results, obj.users];
      for (const candidate of directCandidates) {
        const found = visit(candidate, depth + 1);
        if (found.length) return found;
      }

      for (const val of Object.values(obj)) {
        const found = visit(val, depth + 1);
        if (found.length) return found;
      }
      return [];
    };

    return visit(root, 0);
  };

  const loadTenantUsers = async () => {
    try {
      const response = await fetch('/api/users', { method: 'GET' });
      if (!response.ok) {
        console.warn('Failed to load tenant users for monitoring:', response.status);
        return;
      }

      const payload = await response.json();
      const usersArray: any[] = findUserArray(payload);

      const nextMap: Record<string, string> = {};
      for (const user of usersArray) {
        const id = user?.id || user?.userId;
        const username = user?.username || user?.userName || user?.displayName || user?.fullName || user?.email;
        if (!id || !username) continue;
        nextMap[String(id)] = String(username);
      }
      setUserDisplayById(nextMap);
    } catch (error) {
      console.warn('Failed to load tenant users for monitoring:', error);
    }
  };

  const mapTriggerSourceLabel = (raw: unknown): string => {
    const value = typeof raw === 'string' ? raw.toLowerCase() : '';
    if (value.includes('event') || value.includes('kafka')) return 'Event';
    if (value.includes('cron') || value.includes('schedule')) return 'Scheduled';
    if (value.includes('manual') || value.includes('ui')) return 'Manual';
    return raw ? String(raw) : 'Manual';
  };

  // Load executions from API
  const loadExecutions = async () => {
    console.log('=== LOAD EXECUTIONS CALLED ===');
    console.log('Current state:', { currentPage, pageSize, statusFilter });
    setIsLoading(true);
    try {
      console.log('Loading executions from API...', { page: currentPage, size: pageSize });

      const response = await workflowApi.listExecutions({
        page: currentPage,
        size: pageSize,
        status: statusFilter === 'all' ? undefined : statusFilter,
        includeDetails: false
      });

      console.log('Executions response:', response);
      console.log('Pagination info from response.data:', response.data);
      console.log('Number of executions in response:', response.data.content?.length);
      console.log('First execution ID:', response.data.content?.[0]?.id);
      console.log('Last execution ID:', response.data.content?.[response.data.content.length - 1]?.id);

      // Update pagination info - response.data IS the Page object
      if (response.data && typeof response.data === 'object' && 'totalPages' in response.data) {
        console.log('Setting pagination:', {
          totalPages: response.data.totalPages,
          totalElements: response.data.totalElements
        });
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      } else {
        console.log('No pagination info in response!', response.data);
      }

      // Transform API response to match ExecutionRecord interface.
      // List is summary-only (includeDetails=false): do not map nodeExecutions here.
      const executionRecords: ExecutionRecord[] = response.data.content.map((exec: any) => {
        const workflowName = exec.executionContext?.workflowName || 'Unknown Workflow';
        const duration = exec.durationMs || (exec.completedAt ? new Date(exec.completedAt).getTime() - new Date(exec.startedAt).getTime() : 0);

        const triggerSourceRaw = exec.triggerSource || exec.triggerType || exec.executionContext?.triggerSource || exec.executionContext?.triggerType || exec.executionContext?.trigger;
        const triggerSourceLabel = mapTriggerSourceLabel(triggerSourceRaw);

        const triggeredByActor = (
          exec.executionContext?.triggeredByUsername ||
          exec.executionContext?.deletedBy ||
          (typeof exec.executionContext?.triggeredBy === 'string' ? toUserDisplay(exec.executionContext.triggeredBy) : undefined) ||
          exec.executionContext?.username ||
          exec.executionContext?.createdBy ||
          'System'
        ) as string;

        const auditTrail: ExecutionRecord['auditTrail'] = [
          {
            id: `audit-trigger-${exec.id}`,
            action: 'Workflow Triggered',
            actor: triggeredByActor,
            role: 'User',
            timestamp: exec.startedAt,
            details: `${workflowName} execution started via ${triggerSourceLabel} trigger`
          }
        ];

        if (exec.completedAt) {
          auditTrail.push({
            id: `audit-complete-${exec.id}`,
            action: exec.status === 'FAILED' ? 'Workflow Failed' : 'Workflow Completed',
            actor: 'Workflow Engine',
            role: 'System',
            timestamp: exec.completedAt,
            details: exec.errorMessage || `${workflowName} execution ${String(exec.status).toLowerCase()}`
          });
        }

        return {
          id: exec.id,
          workflowName,
          workflowId: exec.workflowId,
          identityName: (toUserDisplay(exec.executionContext?.userId) as string) || exec.executionContext?.deletedBy || exec.executionContext?.username || 'Unknown',
          status: String(exec.status).toLowerCase() as 'completed' | 'failed' | 'running' | 'cancelled' | 'paused',
          startTime: exec.startedAt,
          endTime: exec.completedAt,
          duration,
          stepsCompleted: Number(exec.stepsCompleted ?? 0),
          totalSteps: Number(exec.totalSteps ?? 0),
          errorMessage: exec.errorMessage,
          triggeredBy: triggeredByActor,
          triggerSource: triggerSourceLabel,
          executedBy: 'System',
          slaExpected: 300000,
          slaActual: duration,
          executionContext: exec.executionContext,
          steps: [],
          auditTrail
        };
      });

      setExecutions(executionRecords);
    } catch (error) {
      console.error('Failed to load executions:', error);
      toast({
        title: "Error Loading Executions",
        description: error instanceof Error ? error.message : "Failed to load workflow executions",
        variant: "destructive"
      });
      setExecutions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const buildExecutionDetailsFromTrace = (summary: ExecutionRecord, traceResponse: any): ExecutionRecord => {
    const trace = unwrapApiEnvelope<any>(traceResponse) || {};
    const nodeExecutionsRaw = Array.isArray(trace.nodeExecutions) ? trace.nodeExecutions : [];

    const getStepName = (nodeType: string, nodeId: string) => {
      if (nodeId === 'start-node') return 'Workflow Started';
      if (nodeId === 'end-node') return 'Workflow Completed';

      const typeMap: Record<string, string> = {
        'trigger.start': 'Workflow Started',
        'trigger.end': 'Workflow Completed',
        'approval.single': 'Single Approval',
        'approval.multi': 'Multi-party Approval',
        'approval.dynamic': 'Dynamic Approval',
        'action.provision': 'Provision Access',
        'action.deprovision': 'Deprovision Access',
        'condition': 'Condition Check',
        'notification': 'Send Notification'
      };

      return typeMap[nodeType] || nodeType || `Step ${nodeId}`;
    };

    const sortedNodeExecutions = nodeExecutionsRaw.slice().sort((a: any, b: any) => {
      const stepA = a?.stepNumber ?? 9999;
      const stepB = b?.stepNumber ?? 9999;
      return stepA - stepB;
    });

    const steps = sortedNodeExecutions.map((nodeExec: any) => {
      let stepStatus: 'passed' | 'failed' | 'running' | 'skipped' | 'pending' | 'retried' = 'running';

      if (nodeExec.status === 'COMPLETED') {
        stepStatus = 'passed';
      } else if (nodeExec.status === 'FAILED' || nodeExec.status === 'TIMEOUT') {
        stepStatus = 'failed';
      } else if (nodeExec.status === 'SKIPPED') {
        stepStatus = 'skipped';
      } else if (nodeExec.status === 'PAUSED') {
        stepStatus = 'pending';
      } else if (nodeExec.status === 'RUNNING' || nodeExec.status === 'PENDING') {
        stepStatus = 'running';
      }

      // Extract loop context from input data
      const inputData = nodeExec.inputData || {};
      const loopStartNode = inputData.loopStartNode;
      const loopIndex = inputData.index;
      const totalItems = inputData.totalItems;
      const isLoopIteration = loopStartNode && typeof loopIndex === 'number';

      return {
        id: nodeExec.nodeId,
        executionId: nodeExec.id, // unique execution record id
        name: getStepName(nodeExec.stepType, nodeExec.nodeId),
        type: nodeExec.stepType?.split('.')[0] as any || 'action',
        status: stepStatus,
        startTime: nodeExec.startedAt,
        endTime: nodeExec.completedAt,
        duration: nodeExec.durationMs || 0,
        retryCount: nodeExec.retryCount || 0,
        inputParameters: transformForDisplay(nodeExec.inputData) as any,
        outputResult: transformForDisplay(nodeExec.outputData) as any,
        errorMessage: nodeExec.errorDetails?.message,
        logs: [],
        // Loop context
        loopStartNode,
        loopIndex,
        totalItems,
        isLoopIteration
      };
    });

    const auditTrail = [...(summary.auditTrail || [])];
    sortedNodeExecutions.forEach((nodeExec: any) => {
      if (!nodeExec?.stepType || typeof nodeExec.stepType !== 'string') return;
      if (!nodeExec.stepType.includes('approval')) return;

      const output = nodeExec.outputData || {};
      const approvedBy = output.approvedBy || output.approverId;
      const decision = output.decision || (output.approved ? 'APPROVED' : output.rejected ? 'REJECTED' : undefined);
      const respondedAt = output.respondedAt;

      const actor = (typeof approvedBy === 'string' ? (toUserDisplay(approvedBy) as string) : undefined) || 'Approver';
      const timestamp = (typeof respondedAt === 'string' && respondedAt) ? respondedAt : (nodeExec.completedAt || nodeExec.startedAt || summary.startTime);

      auditTrail.push({
        id: `audit-${nodeExec.nodeId}-${timestamp}`,
        action: 'Approval Step',
        actor,
        role: 'Approver',
        timestamp,
        details: decision ? `Approval "${nodeExec.nodeId}" decided: ${decision}` : `Approval node "${nodeExec.nodeId}" executed`
      });
    });

    const completedCount = steps.filter((s: ExecutionRecord['steps'][number]) => s.status === 'passed' || s.status === 'failed' || s.status === 'skipped').length;

    return {
      ...summary,
      status: (typeof trace.status === 'string' ? trace.status.toLowerCase() : summary.status) as ExecutionRecord['status'],
      startTime: trace.startedAt || summary.startTime,
      endTime: trace.completedAt || summary.endTime,
      duration: trace.durationMs || summary.duration,
      steps,
      stepsCompleted: steps.length ? completedCount : summary.stepsCompleted,
      totalSteps: steps.length ? steps.length : summary.totalSteps,
      auditTrail
    };
  };

  // Handle cancel execution
  const handleCancelExecution = async (executionId: string) => {
    try {
      await workflowApi.cancelExecution(executionId);
      toast({
        title: "Execution Cancelled",
        description: "The workflow execution has been cancelled successfully."
      });
      // Reload executions to show updated status
      await loadExecutions();
    } catch (error) {
      console.error('Failed to cancel execution:', error);
      toast({
        title: "Cancel Failed",
        description: error instanceof Error ? error.message : "Failed to cancel execution",
        variant: "destructive"
      });
    }
  };

  // Handle retry execution
  const handleRetryExecution = async (executionId: string) => {
    try {
      await workflowApi.retryExecution(executionId);
      toast({
        title: "Execution Retry Started",
        description: "The workflow execution has been restarted."
      });
      // Reload executions to show new execution
      await loadExecutions();
    } catch (error) {
      console.error('Failed to retry execution:', error);
      toast({
        title: "Retry Failed",
        description: error instanceof Error ? error.message : "Failed to retry execution",
        variant: "destructive"
      });
    }
  };

  // Load executions on mount and when filters change
  useEffect(() => {
    loadExecutions();
    loadStatistics(); // Load global stats
  }, [statusFilter, currentPage]);

  // Load tenant users once for ID -> username resolution
  useEffect(() => {
    loadTenantUsers();
  }, []);

  // Re-load executions once after users are available so IDs are translated.
  useEffect(() => {
    if (hasRefreshedAfterUserLoadRef.current) return;
    if (!userDisplayById || Object.keys(userDisplayById).length === 0) return;
    hasRefreshedAfterUserLoadRef.current = true;
    loadExecutions();
  }, [userDisplayById]);

  // Keep details panel in sync when executions are reloaded/translated.
  useEffect(() => {
    if (!selectedExecution) return;
    const updated = executions.find((e) => e.id === selectedExecution.id);
    if (!updated) return;

    // IMPORTANT: this effect updates `selectedExecution`, so it will re-run when
    // `selectedExecution` changes. If we always create a new object here, React
    // will loop (Maximum update depth exceeded). We only need to sync once per
    // list refresh.
    const lastSync = lastSyncedSelectedFromListRef.current;
    if (lastSync && lastSync.executionId === selectedExecution.id && lastSync.listItemRef === updated) {
      return;
    }
    lastSyncedSelectedFromListRef.current = { executionId: selectedExecution.id, listItemRef: updated };

    setSelectedExecution((prev) => {
      if (!prev) return prev;
      const shouldPreserveSteps = Array.isArray(prev.steps) && prev.steps.length > 0 && Array.isArray(updated.steps) && updated.steps.length === 0;
      const shouldPreserveAudit = Array.isArray(prev.auditTrail) && prev.auditTrail.length > 0 && Array.isArray(updated.auditTrail) && updated.auditTrail.length <= 2;
      return {
        ...updated,
        steps: shouldPreserveSteps ? prev.steps : updated.steps,
        auditTrail: shouldPreserveAudit ? prev.auditTrail : updated.auditTrail
      };
    });
  }, [executions, selectedExecution]);

  // Use real executions only
  const displayExecutions = executions;

  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'paused': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      running: 'secondary',
      paused: 'outline',
      cancelled: 'outline'
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status.toUpperCase()}</Badge>;
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const filteredExecutions = displayExecutions.filter(exec => {
    // Status filter (from dropdown)
    if (statusFilter !== 'all' && exec.status !== statusFilter) return false;

    // Search term filter (workflow name or identity)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesWorkflow = exec.workflowName.toLowerCase().includes(term);
      const matchesIdentity = exec.identityName.toLowerCase().includes(term);
      const matchesTriggeredBy = exec.triggeredBy.toLowerCase().includes(term);
      if (!matchesWorkflow && !matchesIdentity && !matchesTriggeredBy) return false;
    }

    return true;
  });

  // Use global stats from API
  const stats = {
    total: globalStats.total,
    completed: globalStats.completed,
    failed: globalStats.failed,
    running: globalStats.running,
    paused: globalStats.paused,
    avgDuration: Math.round(globalStats.avgDurationMs / 1000) // Convert ms to seconds
  };

  const handleViewDetails = (execution: ExecutionRecord) => {
    setSelectedExecution(execution);
    setIsPanelOpen(true);

    (async () => {
      try {
        const traceResponse = await workflowApi.getExecutionTrace(execution.id);
        const details = buildExecutionDetailsFromTrace(execution, traceResponse);
        setSelectedExecution(details);
      } catch (error) {
        console.error('Failed to load execution trace:', error);
        toast({
          title: 'Failed to load execution details',
          description: error instanceof Error ? error.message : 'Could not load execution trace',
          variant: 'destructive'
        });
      }
    })();
  };

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Monitoring & Executions</h2>
          <p className="text-sm text-muted-foreground">
            Track workflow executions, performance metrics, SLA breaches, and audit trails
          </p>
          <p className="text-sm text-gray-600">
            {executions.length > 0 ? 'Live data from API' : 'No executions yet'}
          </p>
        </div>
        <Button
          onClick={loadExecutions}
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Executions</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Running/Paused</p>
                <p className="text-2xl font-bold text-blue-600">{stats.running + stats.paused}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold">{stats.avgDuration}s</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            {/* Title */}
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters & Search
              </CardTitle>

              <p className="text-sm text-muted-foreground">
                Filter workflows by status or search across identities
              </p>
            </div>

          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-3">

            {/* Search */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search-filter"
                      placeholder="Search workflows, identities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Search by workflow name, user, or trigger</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Status Filter */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full sm:w-[180px]">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full h-9">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="All statuses" />
                        </div>
                      </SelectTrigger>
                      <SelectContent align="end">
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="running">Running</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Filter workflows by execution status</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

          </div>

          {/* Active Filters */}
          {(searchTerm || statusFilter !== "all") && (
            <div className="flex items-center gap-2 pt-2">

              <span className="text-xs text-muted-foreground">Active filters:</span>

              {searchTerm && (
                <Badge variant="secondary" className="text-xs gap-1">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}

              {statusFilter !== "all" && (
                <Badge variant="secondary" className="text-xs gap-1">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Clear all
              </Button>

            </div>
          )}

        </CardHeader>
      </Card>

      {/* Execution History */}
      <Card>
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredExecutions.map(execution => {
              // Check if this is a simulation execution
              const isSimulation = execution.executionContext?.simulationMode === true;

              return (
                <Card key={execution.id} >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(execution.status)}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{execution.workflowName}</h4>
                            {isSimulation && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                                🧪 Simulation
                              </Badge>
                            )}
                            {getStatusBadge(execution.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {execution.identityName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(execution.duration)}
                            </span>
                            <span>
                              Steps: {execution.stepsCompleted}/{execution.totalSteps}
                            </span>
                            <span>
                              Triggered by: {execution.triggeredBy}
                            </span>
                          </div>
                          {execution.errorMessage && (
                            <p className="text-sm text-red-600">
                              Error: {execution.errorMessage}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Started: {new Date(execution.startTime).toLocaleString()}
                            {execution.endTime && ` • Ended: ${new Date(execution.endTime).toLocaleString()}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Show Cancel button for running/paused executions */}
                        {(execution.status === 'running' || execution.status === 'paused') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelExecution(execution.id)}
                          >
                            {/* <XCircle className="h-4 w-4 mr-2" /> */}
                            Cancel
                          </Button>
                        )}

                        {/* Show Retry button for failed executions */}
                        {execution.status === 'failed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetryExecution(execution.id)}
                          >
                            {/* <RefreshCw className="h-4 w-4 mr-2" /> */}
                            Retry
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(execution)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredExecutions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No workflow executions found matching your filters</p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} executions
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(0)}
                  disabled={currentPage === 0}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('Next button clicked. Current page:', currentPage, 'Total pages:', totalPages);
                    setCurrentPage(prev => {
                      const newPage = Math.min(totalPages - 1, prev + 1);
                      console.log('Setting page from', prev, 'to', newPage);
                      return newPage;
                    });
                  }}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages - 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slide-out Panel */}
      {isPanelOpen && selectedExecution && (
        <div
          className="fixed top-0 right-0 h-full z-50 shadow-xl bg-background border-l"
          style={{ width: `${panelWidth}px` }}
        >
          {/* Resize Handle */}
          <div
            className="absolute left-0 top-0 w-2 h-full bg-muted hover:bg-muted/80 cursor-col-resize z-10 transition-colors flex items-center justify-center group"
            onMouseDown={(e) => {
              e.preventDefault();

              const handleMouseMove = (e: MouseEvent) => {
                const newWidth = window.innerWidth - e.clientX;
                // Constrain between 400px and 1200px
                if (newWidth >= 400 && newWidth <= 1200) {
                  setPanelWidth(newWidth);
                }
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <div className="w-0.5 h-8 bg-muted-foreground/60 group-hover:bg-muted-foreground transition-colors"></div>
          </div>

          <ExecutionDetailPanel
            open={!!selectedExecution}
            execution={selectedExecution}
            onClose={() => setSelectedExecution(null)}
            onRetry={handleRetryExecution}
            onCancel={handleCancelExecution}
          />
        </div>
      )}
    </div>
  );
};

export default WorkflowMonitoring;
