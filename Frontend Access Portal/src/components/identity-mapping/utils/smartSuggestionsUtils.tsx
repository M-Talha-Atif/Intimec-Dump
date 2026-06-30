import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";

export const getIssueIcon = (type: string) => {
  switch (type) {
    case "error":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    default:
      return <CheckCircle className="h-4 w-4 text-green-500" />;
  }
};

export const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case "high":
      return <Badge variant="destructive">High</Badge>;
    case "medium":
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Medium
        </Badge>
      );
    default:
      return <Badge variant="outline">Low</Badge>;
  }
};
