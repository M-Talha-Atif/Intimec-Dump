
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Play, Edit, Copy, Clock, AlertTriangle, Shield,
  Activity, GitBranch, CheckCircle, XCircle, AlertCircle,
  Calendar, Users, Zap, FileText
} from 'lucide-react';
import { Workflow } from '@/data/mock-workflows';
import WorkflowActionsDropdown from './WorkflowActionsDropdown';
import { getRiskBadgeClass } from '@/utils/getRiskColor';

interface WorkflowCardProps {
  workflow: Workflow;
  onEdit?: (workflow: Workflow) => void;
  onRun?: (workflow: Workflow) => void;
  onTest?: (workflow: Workflow) => void;
  onClone?: (workflow: Workflow) => void;
  onCardClick?: (workflow: Workflow) => void;
  onArchive?: (workflow: Workflow) => void;
  onExport?: (workflow: Workflow) => void;
  onSetDefault?: (workflow: Workflow) => void;
  onAssignOwner?: (workflow: Workflow) => void;
  onStatusToggle?: (workflow: Workflow, newStatus: 'draft' | 'enabled' | 'archived') => void;
  onAdvancedSettings?: (workflow: Workflow) => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  onEdit,
  onRun,
  onTest,
  onClone,
  onCardClick,
  onArchive,
  onExport,
  onSetDefault,
  onAssignOwner,
  onStatusToggle,
  onAdvancedSettings
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enabled': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'joiner-mover-leaver': return <Users className="h-4 w-4" />;
      case 'access-request': return <Shield className="h-4 w-4" />;
      case 'certification': return <CheckCircle className="h-4 w-4" />;
      case 'revocation': return <XCircle className="h-4 w-4" />;
      case 'ai-risk': return <Zap className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getPolicyIcon = (compliance: string) => {
    switch (compliance) {
      case 'compliant': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'violation': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleRun = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Executing workflow:', workflow.name);
    // Validate trigger logic
    if (workflow.triggerType === 'manual') {
      console.log('Manual trigger - executing immediately');
    } else if (workflow.triggerType === 'event-based') {
      console.log('Event-based trigger - validating event conditions');
    } else if (workflow.triggerType === 'time-based') {
      console.log('Time-based trigger - checking schedule');
    }
    onRun?.(workflow);
  };

  const handleSimulate = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Simulating workflow:', workflow.name);
    onTest?.(workflow);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Opening editor for workflow:', workflow.name);
    onEdit?.(workflow);
  };

  const handleClone = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Cloning workflow:', workflow.name);
    const clonedWorkflow = {
      ...workflow,
      id: `${workflow.id}-clone-${Date.now()}`,
      name: `${workflow.name} (Copy)`,
      status: 'draft' as const,
      executionCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onClone?.(clonedWorkflow);
  };

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Toggle logic: draft -> enabled, enabled -> draft
    const newStatus = workflow.status === 'draft' ? 'enabled' as const : 'draft' as const;

    console.log(`Toggling workflow status from ${workflow.status} to ${newStatus}`);
    onStatusToggle?.(workflow, newStatus);
  };

  return (
    <TooltipProvider>
      <Card
        className="group hover:shadow-xl transition-all duration-300 border border-border/60 hover:border-primary/30 border-l-4 border-l-brand-teal bg-card/80 backdrop-blur-sm overflow-hidden w-full"
      >
        <CardHeader className="pb-3 !block">
          <div className="flex items-start justify-between gap-2">

            {/* LEFT */}
            <div
              className="flex items-start gap-3 flex-1"
              style={{ minWidth: 0, maxWidth: 'calc(100% - 100px)', overflow: 'hidden' }}
            >
              {/* Icon */}
              <div className="p-2 bg-brand-teal/10 rounded-xl flex-shrink-0 group-hover:bg-brand-teal/20 transition-colors">
                {getCategoryIcon(workflow.category)}
              </div>

              {/* Title + Description */}
              <div
                className="flex-1 space-y-1"
                style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}
              >
                <div
                  className="text-base font-semibold text-foreground leading-tight"
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                    display: 'block'
                  }}
                  title={workflow.name}
                >
                  {workflow.name}
                </div>

                <div
                  className="text-sm text-muted-foreground"
                  style={{
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as any,
                    wordBreak: 'break-word',
                    width: '100%'
                  }}
                  title={workflow.description}
                >
                  {workflow.description}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-2 flex-shrink-0">

              {/* Template */}
              {workflow.sourceTemplateId && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="border-blue-200 bg-blue-50/80 text-blue-700 hover:bg-blue-100 transition-colors cursor-help"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Template
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Created from template</p>
                    {workflow.templateMetadata?.templateName && (
                      <p className="text-xs mt-1">
                        {workflow.templateMetadata.templateName} v{workflow.templateMetadata.templateVersion || '1.0'}
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Status */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    className={`${getStatusColor(workflow.status)} cursor-pointer hover:opacity-90 transition`}
                    onClick={handleStatusToggle}
                  >
                    {workflow.status}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to toggle status</p>
                </TooltipContent>
              </Tooltip>

              <WorkflowActionsDropdown
                workflow={workflow}
                onArchive={onArchive}
                onExport={onExport}
                onSetDefault={onSetDefault}
                onAssignOwner={onAssignOwner}
                onAdvancedSettings={onAdvancedSettings}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="text-center rounded-md bg-muted/40 py-2">
              <div className="font-semibold text-foreground">{workflow.executionCount}</div>
              <div className="text-xs text-muted-foreground">Executions</div>
            </div>

            <div className="text-center rounded-md bg-muted/40 py-2">
              <div className="font-semibold text-foreground">
                {Number(workflow.averageCompletionTime).toFixed(2)}h
              </div>
              <div className="text-xs text-muted-foreground">Avg Time</div>
            </div>

            <div className="text-center rounded-md bg-muted/40 py-2">
              <div className="font-semibold text-foreground">v{workflow.currentVersion}</div>
              <div className="text-xs text-muted-foreground">Version</div>
            </div>
          </div>

          {/* Indicators */}
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">
              {workflow.hasTimeLogic && (
                <Tooltip>
                  <TooltipTrigger>
                    <Clock className="h-4 w-4 text-blue-600" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Has time-sensitive logic</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {workflow.hasSoDViolation && (
                <Tooltip>
                  <TooltipTrigger>
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Handles SoD violations</p>
                  </TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium capitalize ${getRiskBadgeClass(workflow.roleSensitivity)}`}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    {workflow.roleSensitivity}
                  </div>
                </TooltipTrigger>

                <TooltipContent>
                  <p>Role sensitivity level</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  {getPolicyIcon(workflow.policyCompliance)}
                </TooltipTrigger>
                <TooltipContent>
                  <p>Policy compliance: {workflow.policyCompliance}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
              <GitBranch className="h-3 w-3" />
              <span className="text-xs">
                {workflow.versions.length} versions
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {workflow.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                {tag}
              </Badge>
            ))}
            {workflow.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                +{workflow.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Last Activity */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">

            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />

              {workflow.lastExecuted && workflow.executionCount > 0 ? (
                <span>
                  Last run: {new Date(workflow.lastExecuted).toLocaleDateString()}
                </span>
              ) : (
                <span className="italic text-muted-foreground/70">
                  Last run: Never
                </span>
              )}

            </div>

            <Badge
              variant="outline"
              className={`text-xs ${workflow.triggerType === 'manual'
                  ? 'border-blue-200 text-blue-700'
                  : workflow.triggerType === 'event-based'
                    ? 'border-green-200 text-green-700'
                    : 'border-purple-200 text-purple-700'
                }`}
            >
              {workflow.triggerType}
            </Badge>

          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {workflow.triggerType === 'event-based' ? (
              <Button
                size="sm"
                onClick={handleSimulate}
                disabled={workflow.status !== 'enabled'}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-1" />
                Simulate
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleRun}
                disabled={workflow.status !== 'enabled'}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-1" />
                Run
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={handleEdit}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleClone}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default WorkflowCard;
