import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, ShieldAlert, UserX, FileWarning, ServerCrash } from "lucide-react";
import InfoTooltip from "./InfoTooltip";
import { DashboardData } from "@/services/mockDashboardData";
import { cn } from "@/lib/utils";

interface AttentionItem {
  label: string;
  count: number;
  severity: "critical" | "warning" | "info";
  icon: React.ElementType;
  onClick?: () => void;
}

interface AttentionItemsProps {
  data: DashboardData;
  onOpenTasks?: () => void;
  onOpenCompliance?: () => void;
  onOpenCertification?: () => void;
  onOpenAppHealth?: () => void;
}

const severityStyles = {
  critical: "border-destructive/20 text-destructive",
  warning: "border-warning/20 text-warning-foreground",
  info: "border-primary/20 text-primary",
};

const AttentionItems = ({ data, onOpenTasks, onOpenCompliance, onOpenCertification, onOpenAppHealth }: AttentionItemsProps) => {
  const items: AttentionItem[] = ([
    {
      label: "Overdue tasks",
      count: data.tasks.overdue,
      severity: (data.tasks.overdue > 10 ? "critical" : "warning") as AttentionItem["severity"],
      icon: Clock,
      onClick: onOpenTasks,
    },
    {
      label: "Orphan accounts",
      count: data.identityRisk.orphan.count,
      severity: "critical" as const,
      icon: UserX,
    },
    {
      label: "Critical policy violations",
      count: data.compliance.policyViolations.critical + data.compliance.policyViolations.high,
      severity: "critical" as const,
      icon: ShieldAlert,
      onClick: onOpenCompliance,
    },
    {
      label: "Overdue access reviews",
      count: data.certifications.overdueReviews,
      severity: (data.certifications.overdueReviews > 20 ? "critical" : "warning") as AttentionItem["severity"],
      icon: FileWarning,
      onClick: onOpenCertification,
    },
    {
      label: "Near SLA breach",
      count: data.sla.nearBreach,
      severity: "warning" as const,
      icon: AlertTriangle,
    },
    {
      label: "Application errors",
      count: data.applicationHealth.errors,
      severity: (data.applicationHealth.errors > 0 ? "critical" : "info") as AttentionItem["severity"],
      icon: ServerCrash,
      onClick: onOpenAppHealth,
    },
  ] satisfies AttentionItem[]).filter((item) => item.count > 0);

  return (
    <Card className="h-full bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-1.5">
          <CardTitle className="text-base font-semibold">Requires Attention</CardTitle>
          <InfoTooltip text="Priority-ranked list of governance items needing immediate action, grouped by severity." side="right" />
        </div>
        <p className="text-xs text-muted-foreground">Prioritized items needing immediate action</p>
      </CardHeader>
      <CardContent className="space-y-2 pb-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={item.onClick}
              disabled={!item.onClick}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border bg-card px-3 py-2.5 text-left transition-colors",
                severityStyles[item.severity],
                item.onClick ? "cursor-pointer hover:bg-muted/50" : "cursor-default"
              )}
            >
              <Icon className={cn(
                "h-4 w-4 shrink-0",
                item.severity === "critical" && "text-destructive",
                item.severity === "warning" && "text-warning-foreground",
                item.severity === "info" && "text-primary"
              )} />
              <span className="flex-1 text-sm font-medium text-foreground">{item.label}</span>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-sm font-bold tabular-nums bg-card",
                  item.severity === "critical" && "text-destructive border-destructive/20",
                  item.severity === "warning" && "text-warning-foreground border-warning/20",
                  item.severity === "info" && "text-primary border-primary/20"
                )}
              >
                {item.count}
              </Badge>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default AttentionItems;