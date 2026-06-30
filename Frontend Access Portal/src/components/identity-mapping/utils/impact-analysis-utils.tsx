import { Badge } from "@/components/ui/badge";
import { Settings, Database, TrendingUp, AlertTriangle } from "lucide-react";
import { ImpactIssue } from "../data/impact-analysis";

export const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case "critical":
      return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
    case "high":
      return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
    case "medium":
      return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    case "low":
      return <Badge className="bg-green-100 text-green-800">Low</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
};

export const getTypeIcon = (type: ImpactIssue["type"]) => {
  switch (type) {
    case "mapping-conflict":
      return <Settings className="h-4 w-4" />;
    case "data-quality":
      return <Database className="h-4 w-4" />;
    case "performance":
      return <TrendingUp className="h-4 w-4" />;
    case "compliance":
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <AlertTriangle className="h-4 w-4" />;
  }
};

export const getSeverityBorderClass = (severity: string) => {
  switch (severity) {
    case "critical":
      return "border-l-red-500";
    case "high":
      return "border-l-orange-500";
    case "medium":
      return "border-l-yellow-500";
    case "low":
      return "border-l-green-500";
    default:
      return "border-l-gray-500";
  }
};
