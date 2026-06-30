'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle, XCircle, Clock, AlertTriangle, User, Calendar,
  ChevronDown, ChevronRight, Users
} from 'lucide-react';
import { Task } from '@/services/responsibilities';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getRiskBadgeClass } from '@/utils/getRiskColor';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GroupedApprovalCardProps {
  groupId: string;
  tasks: Task[];
  onApprove: (taskId: string) => void;
  onReject: (taskId: string) => void;
  onViewDetails: (taskId: string) => void;
  approveMutationPending: boolean;
  rejectMutationPending: boolean;
}

export const GroupedApprovalCard = ({
  groupId,
  tasks,
  onApprove,
  onReject,
  onViewDetails,
  approveMutationPending,
  rejectMutationPending,
}: GroupedApprovalCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (tasks.length === 0) return null;

  // Use first task as representative for group metadata
  const mainTask = tasks[0];
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const approvedCount = tasks.filter(t => t.status === 'approved').length;
  const rejectedCount = tasks.filter(t => t.status === 'rejected').length;
  const allPending = tasks.every(t => t.status === 'pending');
  const allProcessed = tasks.every(t => t.status !== 'pending');

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-primary-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-primary-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-primary-300 text-primary-700">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      default: return 'default';
    }
  };

  const formatApproverType = (approverType?: string) => {
    if (!approverType) return null;
    switch (approverType.toUpperCase()) {
      case 'MANAGER': return 'Manager Approval';
      case 'ROLE_OWNER': return 'Role Owner Approval';
      case 'APP_OWNER': return 'App Owner Approval';
      case 'DIRECT_MANAGER': return 'Direct Manager';
      case 'SECURITY_TEAM': return 'Security Team';
      case 'COMPLIANCE_TEAM': return 'Compliance Team';
      default: return approverType.replace(/_/g, ' ');
    }
  };

  const cleanTaskTitle = (title: string) => {
    let cleaned = title;

    // remove known prefixes
    cleaned = cleaned.replace(
      /^(Approve Role-Assignement - |Approve Access-Portal-Role-Assignement - )/i,
      ""
    );

    // fix spelling in normal or hyphenated words
    cleaned = cleaned.replace(/assignement/gi, "Assignment");

    return cleaned;
  };

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-sm",
        allPending
          ? "border-l-4 border-l-primary"
          : allProcessed
            ? "border-l-4 border-l-muted"
            : "border-l-4 border-l-blue-500"
      )}
    >
      <CardContent className="p-5 space-y-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">

          {/* Left Section */}
          <div className="flex items-start gap-3 flex-1 min-w-0">

            {/* Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-8 w-8 shrink-0 text-muted-foreground"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isExpanded ? "Collapse approvals" : "Expand approvals"}
              </TooltipContent>
            </Tooltip>

            {/* Icon */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Users className="h-5 w-5 text-primary mt-1 shrink-0 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                Approval workflow
              </TooltipContent>
            </Tooltip>

            {/* Main Info */}
            <div className="flex-1 min-w-0 space-y-2">

              <div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 className="text-sm font-semibold leading-tight cursor-help">
                      {mainTask.workflowName || mainTask.title}
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent>
                    Workflow: {mainTask.workflowName || mainTask.title}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-muted-foreground cursor-help">
                      {tasks.length} approval{tasks.length > 1 ? "s" : ""}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    Total approval steps in this workflow
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">

                {/* Task Type */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="capitalize cursor-help">
                      {mainTask.type?.replace("_", " ") || "Approval"}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    Request type
                  </TooltipContent>
                </Tooltip>

                {/* Requester */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1 cursor-help">
                      <User className="h-3.5 w-3.5" />
                      {mainTask.requester?.name || "Unknown"}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Requested by {mainTask.requester?.name || "Unknown user"}
                  </TooltipContent>
                </Tooltip>

                {/* Due Date */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1 cursor-help">
                      <Calendar className="h-3.5 w-3.5" />
                      {mainTask.dueDate
                        ? format(new Date(mainTask.dueDate), "MMM dd, yyyy")
                        : "No due date"}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {mainTask.dueDate
                      ? `Due on ${format(new Date(mainTask.dueDate), "PPP")}`
                      : "No due date assigned"}
                  </TooltipContent>
                </Tooltip>

                {/* Priority */}
                {mainTask.priority && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        className={cn(
                          "capitalize cursor-help",
                          getRiskBadgeClass(mainTask.priority)
                        )}
                      >
                        {mainTask.priority}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      Priority level
                    </TooltipContent>
                  </Tooltip>
                )}

              </div>
            </div>
          </div>

          {/* Status Summary */}
          <div className="flex items-center gap-4 shrink-0 text-xs">

            {pendingCount > 0 && (
              <div className="flex items-center gap-1 text-primary">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{pendingCount}</span>
                <span className="text-muted-foreground">Pending</span>
              </div>
            )}

            {approvedCount > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">{approvedCount}</span>
                <span className="text-muted-foreground">Approved</span>
              </div>
            )}

            {rejectedCount > 0 && (
              <div className="flex items-center gap-1 text-red-600">
                <XCircle className="h-4 w-4" />
                <span className="font-medium">{rejectedCount}</span>
                <span className="text-muted-foreground">Rejected</span>
              </div>
            )}

          </div>
        </div>

        {/* Expanded Tasks */}
        {isExpanded && (
          <div className="pt-4">

            <TooltipProvider delayDuration={200}>
              <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(420px,1fr))]">

                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={cn(
                      "rounded-md border bg-background px-4 py-3 transition hover:bg-muted/30",
                      task.status === "pending" && "border-primary/30 bg-primary/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">

                      {/* Left */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">

                        {/* Step Indicator */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium cursor-help">
                              {index + 1}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            Approval Step {index + 1}
                          </TooltipContent>
                        </Tooltip>

                        <div className="flex-1 space-y-1 min-w-0">

                          {/* Status */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2 cursor-help">
                                {getStatusIcon(task.status)}
                                {getStatusBadge(task.status)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {task.status === "pending" && "Waiting for approval"}
                              {task.status === "approved" && "Task approved"}
                              {task.status === "rejected" && "Task rejected"}
                            </TooltipContent>
                          </Tooltip>

                          {/* Title */}
                          <p className="text-sm font-medium leading-snug break-words">
                            {cleanTaskTitle(task.title)}
                          </p>

                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">

                            {task.approverType && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="font-medium text-blue-600 cursor-help">
                                    {formatApproverType(task.approverType)}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Approval required from {formatApproverType(task.approverType)}
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {task.roleName && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help">
                                    Role: <span className="font-medium">{task.roleName}</span>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Access request for role: {task.roleName}
                                </TooltipContent>
                              </Tooltip>
                            )}

                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onViewDetails(task.id)}
                            >
                              View Details
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            View full request information
                          </TooltipContent>
                        </Tooltip>

                        {task.status === "pending" && (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => onApprove(task.id)}
                                  disabled={approveMutationPending}
                                >
                                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                  Approve
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Approve this access request
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => onReject(task.id)}
                                  disabled={rejectMutationPending}
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-1" />
                                  Reject
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Reject this request
                              </TooltipContent>
                            </Tooltip>
                          </>
                        )}

                      </div>
                    </div>
                  </div>
                ))}

              </div>
            </TooltipProvider>
          </div>
        )}

      </CardContent>
    </Card>
  );
};
