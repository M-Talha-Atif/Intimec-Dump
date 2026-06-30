import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { PreviewResult } from "../data/livePreviewData";

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    case "error":
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
};

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "success":
      return <Badge className="bg-green-100 text-green-800">Success</Badge>;
    case "warning":
      return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
    case "error":
      return <Badge variant="destructive">Error</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
};

export const calculatePreviewStats = (results: PreviewResult[]) => {
  const successCount = results.filter((r) => r.status === "success").length;
  const warningCount = results.filter((r) => r.status === "warning").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  return {
    total: results.length,
    successCount,
    warningCount,
    errorCount,
  };
};

export const simulateProgress = (
  setProgress: React.Dispatch<React.SetStateAction<number>>
): NodeJS.Timeout => {
  return setInterval(() => {
    setProgress((prev: number) => {
      if (prev >= 100) {
        return 100;
      }
      return prev + 10;
    });
  }, 200);
};
