// utils/statusIcons.tsx
import React from "react";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { getStatusColor } from "./statusColors";

interface StatusColors {
  text: string;
  bg?: string;
  border?: string;
}

/**
 * Returns a React icon component for a given status
 */
export const getStatusIcon = (status: string) => {
  const normalizedStatus = status.toLowerCase().replace("_", "-");
  const statusColors: StatusColors = getStatusColor(normalizedStatus);

  const iconColorClass = statusColors.text;

  switch (normalizedStatus) {
    case "approved":
      return <CheckCircle className={`h-4 w-4 ${iconColorClass}`} />;
    case "rejected":
      return <XCircle className={`h-4 w-4 ${iconColorClass}`} />;
    case "submitted":
    case "pending-approval":
      return <Clock className={`h-4 w-4 ${iconColorClass}`} />;
    case "provisioned":
      return <CheckCircle className={`h-4 w-4 ${iconColorClass}`} />;
    case "partial":
    case "partially-approved":
      return <AlertCircle className={`h-4 w-4 ${iconColorClass}`} />;
    case "withdrawn":
      return <XCircle className={`h-4 w-4 ${iconColorClass}`} />;
    case "failed":
    default:
      return <AlertCircle className={`h-4 w-4 ${iconColorClass}`} />;
  }
};
