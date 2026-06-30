import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  PenLine,
  Plus,
  Trash2,
  Play,
  Settings,
} from "lucide-react";

export const getActivityBadge = (activity: string) => {
  const icon = (() => {
    switch (activity) {
      case "Entitlement Updated":
        return <Settings className="h-3 w-3 mr-1" />;
      case "Rule Created":
        return <Plus className="h-3 w-3 mr-1" />;
      case "Rule Updated":
        return <PenLine className="h-3 w-3 mr-1" />;
      case "Rule Deleted":
        return <Trash2 className="h-3 w-3 mr-1" />;
      case "Rule Evaluated":
        return <Play className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  })();

  return (
    <Badge variant="secondary" className="font-normal text-xs">
      {icon}
      {activity}
    </Badge>
  );
};