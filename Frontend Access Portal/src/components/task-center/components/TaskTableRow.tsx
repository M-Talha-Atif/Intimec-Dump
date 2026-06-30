import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Eye,
  MoreHorizontal,
  X,
  ArrowUp,
  Users,
  Tag,
  FileText,
} from "lucide-react";
import { Task } from "@/services/responsibilities";
import { format } from "date-fns";

interface TaskTableRowProps {
  task: Task;
  isSelected: boolean;
  selectedTaskId?: string;
  onSelect: (taskId: string) => void;
  onToggleSelection: (taskId: string, checked: boolean) => void;
  onApprove: (taskId: string) => void;
  onReject: (taskId: string) => void;
  approveMutationPending?: boolean;
  rejectMutationPending?: boolean;
}

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case "approved":
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "rejected":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "pending":
      return <Clock className="h-4 w-4 text-primary-500" />;
    case "timeout":
      return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-primary-500" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 hover:bg-green-100"
        >
          Approved
        </Badge>
      );
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "pending":
      return (
        <Badge
          variant="outline"
          className="border-primary-300 text-primary-700"
        >
          Pending
        </Badge>
      );
    case "timeout":
      return <Badge variant="secondary">Timed Out</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "critical":
      return <Badge variant="destructive">{priority}</Badge>;
    case "high":
      return <Badge variant="destructive">{priority}</Badge>;
    case "medium":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          {priority}
        </Badge>
      );
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};

const formatApproverType = (approverType?: string) => {
  if (!approverType) return null;
  switch (approverType.toUpperCase()) {
    case "MANAGER":
      return "Manager Approval";
    case "ROLE_OWNER":
      return "Role Owner Approval";
    case "APP_OWNER":
      return "App Owner Approval";
    case "DIRECT_MANAGER":
      return "Direct Manager";
    case "SECURITY_TEAM":
      return "Security Team";
    case "COMPLIANCE_TEAM":
      return "Compliance Team";
    default:
      return approverType.replace(/_/g, " ");
  }
};

const extractAssigneeName = (title?: string): string | null => {
  if (!title) return null;
  // Extract name after "for " in titles like "Approve Role-Assignement - Role Assignment for Sara Ali"
  const match = title.match(/\bfor\s+(.+)$/i);
  return match ? match[1].trim() : null;
};

export const TaskTableRow: React.FC<TaskTableRowProps> = ({
  task,
  isSelected,
  selectedTaskId,
  onSelect,
  onToggleSelection,
  onApprove,
  onReject,
  approveMutationPending = false,
  rejectMutationPending = false,
}) => {
  const isPending = task.status?.toLowerCase() === "pending";

  return (
    <TableRow
      className={`cursor-pointer hover:bg-muted ${
        selectedTaskId === task.id
          ? "bg-blue-50 border-l-4 border-l-blue-500"
          : ""
      }`}
      onClick={() => onSelect(task.id)}
    >
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) =>
            onToggleSelection(task.id, checked as boolean)
          }
        />
      </TableCell>
      <TableCell className="font-mono text-sm">
        <Tooltip>
          <TooltipTrigger>
            <span className="truncate max-w-20 block">
              {task.id.slice(0, 8)}...
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{task.id}</p>
          </TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <Tooltip>
            <TooltipTrigger>
              <span className="font-medium truncate max-w-48 block text-left">
                {task.title || task.workflowName || "Untitled Task"}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{task.title || task.workflowName || "Untitled Task"}</p>
            </TooltipContent>
          </Tooltip>
          {task.roleName && (
            <span className="text-xs text-muted-foreground">
              Role: {task.roleName}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {getStatusIcon(task.status)}
          {getStatusBadge(task.status)}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {task.type?.replace("_", " ") || "Approval"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-sm">
          <User className="h-3 w-3" />
          <Tooltip>
            <TooltipTrigger>
              <span className="truncate max-w-24 block">
                {task.requester?.name || "Unknown"}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{task.requester?.name || "Unknown"}</p>
              {task.requester?.email && (
                <p className="text-xs">{task.requester.email}</p>
              )}
            </TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-sm">
          <User className="h-3 w-3" />
          <Tooltip>
            <TooltipTrigger>
              <span className="truncate max-w-24 block">
                {task.assignee?.name || extractAssigneeName(task.title) || "—"}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {task.assignee?.name ||
                  extractAssigneeName(task.title) ||
                  "Not assigned"}
              </p>
              {task.assignee?.email && (
                <p className="text-xs">{task.assignee.email}</p>
              )}
            </TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
      <TableCell>
        {task.approverType && (
          <span className="text-xs text-blue-600 font-medium">
            {formatApproverType(task.approverType)}
          </span>
        )}
      </TableCell>
      <TableCell>{task.priority && getPriorityBadge(task.priority)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="h-3 w-3" />
          <span>
            {task.dueDate
              ? format(new Date(task.dueDate), "MMM dd, yyyy")
              : "N/A"}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-sm">
        {task.createdAt
          ? format(new Date(task.createdAt), "MMM dd, yyyy")
          : "N/A"}
      </TableCell>
      <TableCell className="text-sm">
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="h-3 w-3" />
          {task.respondedAt
            ? format(new Date(task.respondedAt), "MMM dd, yyyy HH:mm")
            : "—"}
        </div>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onSelect(task.id)}>
            <Eye className="h-4 w-4" />
          </Button>
          {isPending && (
            <>
              <Button
                size="sm"
                variant="default"
                onClick={() => onApprove(task.id)}
                disabled={approveMutationPending}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onReject(task.id)}
                disabled={rejectMutationPending}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <X className="h-4 w-4 mr-2" />
                Abort
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ArrowUp className="h-4 w-4 mr-2" />
                Escalate
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users className="h-4 w-4 mr-2" />
                Reassign
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onSelect(task.id)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Tag className="h-4 w-4 mr-2" />
                Add Tag
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Add Note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};
