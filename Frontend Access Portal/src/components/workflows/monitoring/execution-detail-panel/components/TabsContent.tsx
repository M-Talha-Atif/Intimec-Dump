import React, { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent as UITabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle, XCircle, Activity, Clock, AlertCircle,
  ChevronDown, ChevronRight, User, Calendar, MapPin,
  Database, Shield, BarChart3, Brain, Repeat, LayoutDashboard, ListOrdered, History, Info
} from "lucide-react";
import { ExecutionRecord, ExecutionStep } from "../ExecutionDetailPanel";
import IconTabs  from "@/components/shared/IconTabs";

interface TabsContentProps {
  execution: ExecutionRecord;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Grouped step structure for nested ForEach display
interface GroupedStep {
  type: 'single' | 'loop-group';
  step?: ExecutionStep;
  loopNodeId?: string;
  loopNodeName?: string;
  totalItems?: number;
  iterations?: Array<{
    index: number;
    steps: ExecutionStep[];
  }>;
}

// Group steps by loop context for nested display
function groupStepsByLoop(steps: ExecutionStep[]): GroupedStep[] {
  const result: GroupedStep[] = [];

  // Deduplicate steps first - use executionId as unique identifier
  const seenExecutionIds = new Set<string>();
  const uniqueSteps = steps.filter(step => {
    const uniqueId = step.executionId || `${step.id}-${step.loopIndex ?? 'single'}-${step.loopStartNode ?? 'root'}`;
    if (seenExecutionIds.has(uniqueId)) {
      return false;
    }
    seenExecutionIds.add(uniqueId);
    return true;
  });

  // Find all ForEach start nodes (only TOP-LEVEL ones - not inside other iterations)
  const forEachNodes: Map<string, ExecutionStep> = new Map();
  uniqueSteps.forEach((step) => {
    if (step.type === 'control' &&
      step.name.toLowerCase().includes('foreach') &&
      !step.name.toLowerCase().includes('end')) {
      if (!step.isLoopIteration) {
        forEachNodes.set(step.id, step);
      }
    }
  });

  // Find ForEach-end nodes for each loop+iteration to know where iterations truly end
  // Key: `${loopStartNode}-${loopIndex}`, Value: index in uniqueSteps where foreach-end appears
  const foreachEndPositions: Map<string, number> = new Map();
  uniqueSteps.forEach((step, idx) => {
    if (step.type === 'control' &&
      step.name.toLowerCase().includes('foreach') &&
      step.name.toLowerCase().includes('end') &&
      step.isLoopIteration &&
      step.loopStartNode &&
      typeof step.loopIndex === 'number') {
      const key = `${step.loopStartNode}-${step.loopIndex}`;
      // Store the position of the foreach-end for this iteration
      if (!foreachEndPositions.has(key) || idx < foreachEndPositions.get(key)!) {
        foreachEndPositions.set(key, idx);
      }
    }
  });

  // Collect iterations for each ForEach node
  const loopIterations: Map<string, Map<number, ExecutionStep[]>> = new Map();
  const loopTotalItems: Map<string, number> = new Map();
  const iterationStepExecutionIds: Set<string> = new Set();

  uniqueSteps.forEach((step, stepIdx) => {
    // Only process steps that are direct children of a top-level ForEach
    if (step.isLoopIteration && step.loopStartNode && forEachNodes.has(step.loopStartNode)) {
      const loopKey = step.loopStartNode;
      const iterIndex = step.loopIndex ?? 0;

      // Check if this step comes AFTER the foreach-end for this iteration
      const endKey = `${loopKey}-${iterIndex}`;
      const endPosition = foreachEndPositions.get(endKey);

      // Only include if:
      // 1. There's no foreach-end yet (still in the loop), OR
      // 2. This step's position is <= the foreach-end position (including the end itself)
      const isWithinLoop = endPosition === undefined || stepIdx <= endPosition;

      if (isWithinLoop) {
        if (!loopIterations.has(loopKey)) {
          loopIterations.set(loopKey, new Map());
        }
        if (!loopIterations.get(loopKey)!.has(iterIndex)) {
          loopIterations.get(loopKey)!.set(iterIndex, []);
        }
        loopIterations.get(loopKey)!.get(iterIndex)!.push(step);
        loopTotalItems.set(loopKey, Math.max(
          step.totalItems || 0,
          loopTotalItems.get(loopKey) || 0
        ));
        if (step.executionId) {
          iterationStepExecutionIds.add(step.executionId);
        }
      }
    }
  });

  // Build result maintaining original order
  const insertedLoopNodeIds: Set<string> = new Set();
  const processedExecutionIds: Set<string> = new Set();

  uniqueSteps.forEach((step, index) => {
    // Skip if already processed as part of an iteration
    if (step.executionId && iterationStepExecutionIds.has(step.executionId)) {
      return;
    }

    // Skip if we've already processed this exact execution
    if (step.executionId && processedExecutionIds.has(step.executionId)) {
      return;
    }
    if (step.executionId) {
      processedExecutionIds.add(step.executionId);
    }

    // Check if this is a ForEach start node with iterations
    if (forEachNodes.has(step.id) && loopIterations.has(step.id) && !insertedLoopNodeIds.has(step.id)) {
      const iterMap = loopIterations.get(step.id)!;
      const iterations = Array.from(iterMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([idx, iterSteps]) => ({ index: idx, steps: iterSteps }));

      result.push({
        type: 'loop-group',
        step: step,
        loopNodeId: step.id,
        loopNodeName: step.name,
        totalItems: loopTotalItems.get(step.id) || iterations.length,
        iterations
      });
      insertedLoopNodeIds.add(step.id);
    } else if (!forEachNodes.has(step.id) || !insertedLoopNodeIds.has(step.id)) {
      // Regular step (not a ForEach start that we already grouped)
      result.push({ type: 'single', step });
    }
  });

  return result;
}

export function TabsContent({ execution, activeTab, onTabChange }: TabsContentProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [expandedLoops, setExpandedLoops] = useState<Set<string>>(new Set());
  const [expandedIterations, setExpandedIterations] = useState<Set<string>>(new Set());

  // Group steps by loop context
  const groupedSteps = useMemo(() => groupStepsByLoop(execution.steps), [execution.steps]);

  const toggleStepExpanded = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const toggleLoopExpanded = (loopId: string) => {
    const newExpanded = new Set(expandedLoops);
    if (newExpanded.has(loopId)) {
      newExpanded.delete(loopId);
    } else {
      newExpanded.add(loopId);
    }
    setExpandedLoops(newExpanded);
  };

  const toggleIterationExpanded = (iterKey: string) => {
    const newExpanded = new Set(expandedIterations);
    if (newExpanded.has(iterKey)) {
      newExpanded.delete(iterKey);
    } else {
      newExpanded.add(iterKey);
    }
    setExpandedIterations(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Activity className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'skipped':
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      passed: { className: "bg-green-100 text-green-800", label: "Passed" },
      failed: { className: "bg-red-100 text-red-800", label: "Failed" },
      running: { className: "bg-blue-100 text-blue-800", label: "Running" },
      pending: { className: "bg-amber-100 text-amber-800", label: "Pending" },
      skipped: { className: "bg-gray-100 text-gray-800", label: "Skipped" }
    };
    const { className, label } = config[status as keyof typeof config] || config.pending;
    return <Badge className={className}>{label}</Badge>;
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-muted/30">
      <Tabs value={activeTab} onValueChange={onTabChange} className="flex flex-col gap-2">
        <IconTabs
          columns={4}
          tabs={[
            {
              value: "overview",
              label: "Overview",
              icon: LayoutDashboard,
            },
            {
              value: "steps",
              label: "Steps",
              icon: ListOrdered,
            },
            {
              value: "audit",
              label: "Audit",
              icon: History,
            },
            {
              value: "details",
              label: "Details",
              icon: Info,
            },
          ]}
        />

        {/* Overview Tab */}
        <UITabsContent value="overview" className="flex-1 outline-none">
          <div className="space-y-6 mt-4">
            {/* Quick Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="leading-none font-semibold flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Execution Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <span className="text-2xl font-bold text-blue-600">
                        {execution.stepsCompleted}/{execution.totalSteps}
                      </span>
                    </div>
                    <div className="text-sm text-blue-800">Steps Completed</div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Clock className="h-5 w-5 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">
                        {formatDuration(execution.duration)}
                      </span>
                    </div>
                    <div className="text-sm text-green-800">Duration</div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Shield className="h-5 w-5 text-purple-600" />
                      <span className="text-2xl font-bold text-purple-600">
                        {execution.slaActual}ms
                      </span>
                    </div>
                    <div className="text-sm text-purple-800">SLA Actual</div>
                  </div>

                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Database className="h-5 w-5 text-orange-600" />
                      <span className="text-2xl font-bold text-orange-600">
                        {execution.steps.filter(s => s.status === 'failed').length}
                      </span>
                    </div>
                    <div className="text-sm text-orange-800">Failed Steps</div>
                  </div>
                </div>

                {execution.errorMessage && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                      Error Message:
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {execution.errorMessage}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Execution Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="leading-none font-semibold">Execution Info</CardTitle>
                  <CardDescription className="text-sm">
                    Core execution attributes and metadata.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start text-sm">
                    <dt className="flex items-center text-slate-500">
                      <User className="w-4 h-4 mr-2 shrink-0" />
                      <span className="font-medium">Identity</span>
                    </dt>
                    <dd className="ml-auto text-slate-700 font-medium">
                      {execution.identityName}
                    </dd>
                  </div>

                  <div className="flex items-start text-sm">
                    <dt className="flex items-center text-slate-500">
                      <User className="w-4 h-4 mr-2 shrink-0" />
                      <span className="font-medium">Triggered By</span>
                    </dt>
                    <dd className="ml-auto text-slate-700 font-medium">
                      {execution.triggeredBy}
                    </dd>
                  </div>

                  <div className="flex items-start text-sm">
                    <dt className="flex items-center text-slate-500">
                      <MapPin className="w-4 h-4 mr-2 shrink-0" />
                      <span className="font-medium">Trigger Source</span>
                    </dt>
                    <dd className="ml-auto text-slate-700 font-medium">
                      {execution.triggerSource}
                    </dd>
                  </div>

                  <div className="flex items-start text-sm">
                    <dt className="flex items-center text-slate-500">
                      <User className="w-4 h-4 mr-2 shrink-0" />
                      <span className="font-medium">Executed By</span>
                    </dt>
                    <dd className="ml-auto text-slate-700 font-medium">
                      {execution.executedBy}
                    </dd>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="leading-none font-semibold">Timeline</CardTitle>
                  <CardDescription className="text-sm">
                    Execution start and end times.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start text-sm">
                    <dt className="flex items-center text-slate-500">
                      <Calendar className="w-4 h-4 mr-2 shrink-0" />
                      <span className="font-medium">Started</span>
                    </dt>
                    <dd className="ml-auto text-slate-700 font-medium">
                      {formatDateTime(execution.startTime)}
                    </dd>
                  </div>

                  {execution.endTime && (
                    <div className="flex items-start text-sm">
                      <dt className="flex items-center text-slate-500">
                        <Calendar className="w-4 h-4 mr-2 shrink-0" />
                        <span className="font-medium">Ended</span>
                      </dt>
                      <dd className="ml-auto text-slate-700 font-medium">
                        {formatDateTime(execution.endTime)}
                      </dd>
                    </div>
                  )}

                  <div className="flex items-start text-sm">
                    <dt className="flex items-center text-slate-500">
                      <Clock className="w-4 h-4 mr-2 shrink-0" />
                      <span className="font-medium">Duration</span>
                    </dt>
                    <dd className="ml-auto text-slate-700 font-medium">
                      {formatDuration(execution.duration)}
                    </dd>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </UITabsContent>

        {/* Steps Tab */}
        <UITabsContent value="steps" className="flex-1 outline-none">
          <div className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Execution Steps</CardTitle>
                <CardDescription>
                  Detailed step-by-step execution flow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {groupedSteps.map((groupedStep, groupIndex) => {
                    if (groupedStep.type === 'loop-group' && groupedStep.iterations) {
                      // Render ForEach loop as collapsible group
                      const loopKey = groupedStep.step?.executionId || groupedStep.loopNodeId || `loop-${groupIndex}`;
                      const isLoopExpanded = expandedLoops.has(loopKey);
                      const completedIterations = groupedStep.iterations.filter(iter =>
                        iter.steps.every(s => s.status === 'passed')
                      ).length;
                      const failedIterations = groupedStep.iterations.filter(iter =>
                        iter.steps.some(s => s.status === 'failed')
                      ).length;
                      const pendingIterations = groupedStep.iterations.filter(iter =>
                        iter.steps.some(s => s.status === 'pending' || s.status === 'running')
                      ).length;

                      return (
                        <div key={loopKey} className="border rounded-lg overflow-hidden">
                          {/* Loop Header */}
                          <div
                            className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/30 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors"
                            onClick={() => toggleLoopExpanded(loopKey)}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLoopExpanded(loopKey);
                                }}
                              >
                                {isLoopExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                              <Repeat className="h-4 w-4 text-purple-600" />
                              <div className="flex-1">
                                <div className="font-medium flex items-center gap-2">
                                  {groupedStep.loopNodeName || 'ForEach Loop'}
                                  <Badge variant="outline" className="text-xs">
                                    {groupedStep.iterations.length} iteration{groupedStep.iterations.length !== 1 ? 's' : ''}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-3">
                                  <span>control</span>
                                  {completedIterations > 0 && (
                                    <span className="text-green-600">✓ {completedIterations} done</span>
                                  )}
                                  {pendingIterations > 0 && (
                                    <span className="text-amber-600">⏳ {pendingIterations} pending</span>
                                  )}
                                  {failedIterations > 0 && (
                                    <span className="text-red-600">✗ {failedIterations} failed</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {groupedStep.step && getStatusBadge(groupedStep.step.status)}
                          </div>

                          {/* Loop Iterations */}
                          {isLoopExpanded && (
                            <div className="border-t">
                              {groupedStep.iterations.map((iteration) => {
                                const iterKey = `${loopKey}-iter-${iteration.index}`;
                                const isIterExpanded = expandedIterations.has(iterKey);
                                const iterStatus = iteration.steps.some(s => s.status === 'failed')
                                  ? 'failed'
                                  : iteration.steps.some(s => s.status === 'pending')
                                    ? 'pending'
                                    : iteration.steps.some(s => s.status === 'running')
                                      ? 'running'
                                      : 'passed';

                                return (
                                  <div key={iterKey} className="border-b last:border-b-0">
                                    {/* Iteration Header */}
                                    <div
                                      className="flex items-center justify-between p-3 pl-8 bg-gray-50 dark:bg-gray-900/30 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-colors"
                                      onClick={() => toggleIterationExpanded(iterKey)}
                                    >
                                      <div className="flex items-center gap-3 flex-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-5 w-5"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleIterationExpanded(iterKey);
                                          }}
                                        >
                                          {isIterExpanded ? (
                                            <ChevronDown className="h-3 w-3" />
                                          ) : (
                                            <ChevronRight className="h-3 w-3" />
                                          )}
                                        </Button>
                                        {getStatusIcon(iterStatus)}
                                        <div className="flex-1">
                                          <div className="font-medium text-sm">
                                            Iteration {iteration.index + 1}/{groupedStep.totalItems || groupedStep.iterations.length}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            {iteration.steps.length} step{iteration.steps.length !== 1 ? 's' : ''}
                                          </div>
                                        </div>
                                      </div>
                                      {getStatusBadge(iterStatus)}
                                    </div>

                                    {/* Iteration Steps */}
                                    {isIterExpanded && (
                                      <div className="pl-12 pr-4 py-2 space-y-2 bg-white dark:bg-background">
                                        {iteration.steps.map((step, stepIndex) => {
                                          const stepUniqueKey = step.executionId || `${loopKey}-${iteration.index}-${step.id}-${stepIndex}`;
                                          const expandKey = step.executionId || `${loopKey}-${iteration.index}-${stepIndex}`;

                                          return (
                                            <div key={stepUniqueKey} className="border rounded-lg p-3">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 flex-1">
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5"
                                                    onClick={() => toggleStepExpanded(expandKey)}
                                                  >
                                                    {expandedSteps.has(expandKey) ? (
                                                      <ChevronDown className="h-3 w-3" />
                                                    ) : (
                                                      <ChevronRight className="h-3 w-3" />
                                                    )}
                                                  </Button>
                                                  {getStatusIcon(step.status)}
                                                  <div className="flex-1">
                                                    <div className="font-medium text-sm">{step.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                      {step.type} • {formatDuration(step.duration)}
                                                    </div>
                                                  </div>
                                                </div>
                                                {getStatusBadge(step.status)}
                                              </div>

                                              {expandedSteps.has(expandKey) && (
                                                <div className="mt-3 pt-3 border-t space-y-2">
                                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                      <div className="font-medium text-muted-foreground">Started</div>
                                                      <div>{formatDateTime(step.startTime)}</div>
                                                    </div>
                                                    {step.endTime && (
                                                      <div>
                                                        <div className="font-medium text-muted-foreground">Ended</div>
                                                        <div>{formatDateTime(step.endTime)}</div>
                                                      </div>
                                                    )}
                                                  </div>

                                                  {step.errorMessage && (
                                                    <div className="p-2 bg-red-50 rounded text-sm text-red-600">
                                                      <div className="font-medium">Error:</div>
                                                      <div>{step.errorMessage}</div>
                                                    </div>
                                                  )}

                                                  {step.inputParameters && Object.keys(step.inputParameters).length > 0 && (
                                                    <div className="text-sm">
                                                      <div className="font-medium text-muted-foreground mb-1">Input</div>
                                                      <pre className="p-2 bg-gray-50 rounded text-xs overflow-auto max-h-32">
                                                        {JSON.stringify(step.inputParameters, null, 2)}
                                                      </pre>
                                                    </div>
                                                  )}

                                                  {step.outputResult && Object.keys(step.outputResult).length > 0 && (
                                                    <div className="text-sm">
                                                      <div className="font-medium text-muted-foreground mb-1">Output</div>
                                                      <pre className="p-2 bg-gray-50 rounded text-xs overflow-auto max-h-32">
                                                        {JSON.stringify(step.outputResult, null, 2)}
                                                      </pre>
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      // Render regular step
                      const step = groupedStep.step!;
                      const stepKey = step.executionId || `${step.id}-${groupIndex}`;

                      return (
                        <div key={stepKey} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => toggleStepExpanded(stepKey)}
                              >
                                {expandedSteps.has(stepKey) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                              {getStatusIcon(step.status)}
                              <div className="flex-1">
                                <div className="font-medium">{step.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {step.type} • {formatDuration(step.duration)}
                                </div>
                              </div>
                            </div>
                            {getStatusBadge(step.status)}
                          </div>

                          {expandedSteps.has(stepKey) && (
                            <div className="mt-4 pt-4 border-t space-y-3">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <div className="font-medium text-muted-foreground">Started</div>
                                  <div>{formatDateTime(step.startTime)}</div>
                                </div>
                                {step.endTime && (
                                  <div>
                                    <div className="font-medium text-muted-foreground">Ended</div>
                                    <div>{formatDateTime(step.endTime)}</div>
                                  </div>
                                )}
                              </div>

                              {step.assignedActor && (
                                <div className="text-sm">
                                  <div className="font-medium text-muted-foreground">Assigned To</div>
                                  <div>{step.assignedActor}</div>
                                </div>
                              )}

                              {step.retryCount > 0 && (
                                <div className="text-sm">
                                  <div className="font-medium text-muted-foreground">Retries</div>
                                  <div>{step.retryCount} attempt(s)</div>
                                </div>
                              )}

                              {step.errorMessage && (
                                <div className="p-2 bg-red-50 rounded text-sm text-red-600">
                                  <div className="font-medium">Error:</div>
                                  <div>{step.errorMessage}</div>
                                </div>
                              )}

                              {step.inputParameters && Object.keys(step.inputParameters).length > 0 && (
                                <div className="text-sm">
                                  <div className="font-medium text-muted-foreground mb-1">Input</div>
                                  <pre className="p-2 bg-gray-50 rounded text-xs overflow-auto max-h-40">
                                    {JSON.stringify(step.inputParameters, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {step.outputResult && Object.keys(step.outputResult).length > 0 && (
                                <div className="text-sm">
                                  <div className="font-medium text-muted-foreground mb-1">Output</div>
                                  <pre className="p-2 bg-gray-50 rounded text-xs overflow-auto max-h-40">
                                    {JSON.stringify(step.outputResult, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </UITabsContent>

        {/* Audit Trail Tab */}
        <UITabsContent value="audit" className="flex-1 outline-none">
          <div className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
                <CardDescription>
                  Complete history of actions and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {execution.auditTrail.map((event) => (
                    <div key={event.id} className="flex gap-4 pb-3 border-b last:border-0">
                      <div className="flex-shrink-0 w-16 text-xs text-muted-foreground">
                        {formatDateTime(event.timestamp).split(' ')[1]}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{event.action}</div>
                        <div className="text-xs text-muted-foreground">
                          {event.actor} • {event.role}
                        </div>
                        <div className="text-sm mt-1">{event.details}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </UITabsContent>

        {/* Details Tab */}
        <UITabsContent value="details" className="flex-1 outline-none">
          <div className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Technical Details</CardTitle>
                <CardDescription>
                  Complete execution metadata and configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm">
                    <div className="font-medium text-muted-foreground mb-1">Execution ID</div>
                    <div className="font-mono text-xs">{execution.id}</div>
                  </div>

                  <div className="text-sm">
                    <div className="font-medium text-muted-foreground mb-1">Workflow ID</div>
                    <div className="font-mono text-xs">{execution.workflowId}</div>
                  </div>

                  <div className="text-sm">
                    <div className="font-medium text-muted-foreground mb-1">SLA Configuration</div>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-xs text-muted-foreground">Expected</div>
                        <div className="font-medium">{execution.slaExpected}ms</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-xs text-muted-foreground">Actual</div>
                        <div className="font-medium">{execution.slaActual}ms</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm">
                    <div className="font-medium text-muted-foreground mb-1">Full Execution Data</div>
                    <pre className="p-3 bg-gray-50 rounded text-xs overflow-auto max-h-96">
                      {JSON.stringify(execution, null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </UITabsContent>
      </Tabs>
    </div>
  );
}
