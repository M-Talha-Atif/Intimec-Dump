import { Badge } from "@/components/ui/badge";
import { Zap, Archive, Trash2, XCircle } from "lucide-react";
import type { LifecycleStatus } from "../types/table";

export const LifecycleBadge = ({
  lifecycle,
}: {
  lifecycle: LifecycleStatus;
}) => {
  const config = {
    Active: {
      icon: Zap,
      color: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
    },
    Deprecated: {
      icon: Archive,
      color: "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200",
    },
    Orphaned: {
      icon: Trash2,
      color:
        "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
    },
    Inactive: {
      icon: XCircle,
      color: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
    },
  };
  const { icon: Icon, color } = config[lifecycle];
  return (
    <Badge variant="outline" className={`font-normal text-xs ${color}`}>
      <Icon className="h-3 w-3 mr-1" />
      {lifecycle}
    </Badge>
  );
};
