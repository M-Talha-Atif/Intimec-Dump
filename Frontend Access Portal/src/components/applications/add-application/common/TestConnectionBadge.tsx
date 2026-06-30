import { CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import React from "react";

interface TestConnectionBadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  status: "Connection Successful" | "Connection Failed";
  className?: string;
}

export default function TestConnectionBadge({
  status,
  className,
  ...props
}: TestConnectionBadgeProps) {
  switch (status) {
    case "Connection Successful":
      return (
        <Badge
          className={`text-xs font-semibold flex items-center flex-shrink-0 select-none border border-green-200 bg-green-100 text-green-800 hover:bg-green-100 ${className}`}
          {...props}
        >
          <CheckCircle className="mr-1.5 h-3 w-3 text-green-600" />
          Connection Successful
        </Badge>
      );

    case "Connection Failed":
      return (
        <Badge
          className={`text-xs font-semibold flex items-center flex-shrink-0 select-none border border-red-200 bg-red-100 text-red-800 hover:bg-red-100 ${className}`}
          {...props}
        >
          <XCircle className="mr-1.5 h-3 w-3 text-red-600" />
          Connection Failed
        </Badge>
      );
    default:
      return null;
  }
}
