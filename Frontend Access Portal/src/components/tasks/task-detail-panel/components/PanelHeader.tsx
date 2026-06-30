import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { WorkflowTaskDetails, RiskLevel } from "@/types/tasks";
import { format } from "date-fns";

interface PanelHeaderProps {
  task: WorkflowTaskDetails;
  onClose: () => void;
}

export function PanelHeader({ task, onClose }: PanelHeaderProps) {
  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      default:
        return "secondary";
    }
  };

  const getSlaColor = (status?: string) => {
    switch (status) {
      case "overdue":
        return "destructive";
      case "dueSoon":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="border-b bg-muted/30 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="capitalize shrink-0">
              {task.type.replace(/([A-Z])/g, " $1").trim()}
            </Badge>
            <Badge variant={getRiskColor(task.risk)} className="shrink-0">
              {task.risk.toUpperCase()} RISK
            </Badge>
            {task.sla && (
              <Badge variant={getSlaColor(task.sla.status)} className="shrink-0">
                SLA: {task.sla.status === "ok" ? "On Track" : task.sla.status === "dueSoon" ? "Due Soon" : "Overdue"}
              </Badge>
            )}
          </div>
          <h2 className="text-xl font-semibold break-words">{task.title}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
            {task.requester && <span>By {task.requester.name}</span>}
            {task.createdAt && <span>•</span>}
            {task.createdAt && <span>{format(new Date(task.createdAt), "MMM dd, yyyy")}</span>}
            {task.dueAt && <span>•</span>}
            {task.dueAt && <span>Due {format(new Date(task.dueAt), "MMM dd")}</span>}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
