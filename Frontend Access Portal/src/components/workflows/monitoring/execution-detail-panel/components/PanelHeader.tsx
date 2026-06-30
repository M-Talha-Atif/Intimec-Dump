import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Activity, AlertCircle, CheckCircle, Clock, PauseCircle, XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExecutionRecord } from "../ExecutionDetailPanel";

interface PanelHeaderProps {
  execution: ExecutionRecord;
  onClose: () => void;
}

const statusConfig = {
  completed: {
    icon: CheckCircle,
    className: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    label: "Completed",
  },
  failed: {
    icon: XCircle,
    className: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    label: "Failed",
  },
  running: {
    icon: Activity,
    className: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    label: "Running",
  },
  paused: {
    icon: PauseCircle,
    className: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    label: "Paused",
  },
  cancelled: {
    icon: AlertCircle,
    className: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    label: "Cancelled",
  },
};

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  if (hours   > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

export function PanelHeader({ execution }: PanelHeaderProps) {
  const config     = statusConfig[execution.status] ?? statusConfig.running;
  const StatusIcon = config.icon;

  return (
    <div className="px-6 py-4">

      {/* Title row */}
      <div className="flex items-center gap-3 flex-wrap pr-8">
        <h2 className="text-xl font-semibold leading-tight text-foreground">
          {execution.workflowName}
        </h2>
        <Badge className={cn("text-xs font-bold border", config.className)}>
          <StatusIcon className="mr-1.5 h-3 w-3" />
          {config.label}
        </Badge>
      </div>

      {/* Subtitles */}
      <p className="text-sm text-muted-foreground mt-1">
        Execution ID: {execution.id}
      </p>
      <p className="text-sm text-muted-foreground">
        Triggered by: {execution.triggeredBy}
      </p>

      {/* Meta badges */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <Badge
          variant="outline"
          className="text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700"
        >
          <Clock className="mr-1.5 h-3 w-3" />
          {formatDuration(execution.duration)}
        </Badge>
        <Badge variant="outline" className="border-border text-muted-foreground">
          Steps: {execution.stepsCompleted}/{execution.totalSteps}
        </Badge>
        {execution.errorMessage && (
          <Badge
            variant="outline"
            className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-700"
          >
            <AlertCircle className="mr-1.5 h-3 w-3" />
            Error
          </Badge>
        )}
      </div>

    </div>
  );
}