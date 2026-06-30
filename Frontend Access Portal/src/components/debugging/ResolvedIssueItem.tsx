"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Eye } from "lucide-react";
import { useState } from "react";
import { LogDetailModal } from "./LogDetailModal";
import {
  PinnedLogItem,
  useDebugging,
  type LogItem,
} from "@/contexts/debugging-context";

const getBadgeVariant = (level: string) => {
  switch (level) {
    case "ERROR":
      return "destructive";
    case "WARN":
      return "secondary";
    default:
      return "default";
  }
};

export default function ResolvedIssueItem({ item }: { item: PinnedLogItem }) {
  const [selectedLog, setSelectedLog] = useState<PinnedLogItem | null>(null);
  const itemData = item.data;

  // Format resolved time
  const getRelativeTime = (timestamp: number | null) => {
    if (!timestamp) return "Recently";
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Recently";
  };

  // console.log("ResolvedIssueItem item:", item);

  return (
    <>
      <div
        key={itemData.id}
        className="group p-3 rounded-lg bg-green-50/30 hover:bg-green-50/50 transition-colors border border-green-100"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedLog(item);
        }}
        title="View Resolved Log Details"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Badge
                variant={getBadgeVariant(itemData.level)}
                className="text-xs px-1.5 py-0.5 opacity-75"
              >
                {itemData.level}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 border-green-200"
              >
                <CheckCircle className="h-2 w-2 mr-1" />
                Resolved
              </Badge>
            </div>
            <p className="text-xs font-medium mb-1 truncate">{item.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {item.description}
            </p>
            <p className="text-xs text-green-600 dark:text-green-200 mt-1">
              Resolved {getRelativeTime(item.resolvedAt)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedLog(item);
            }}
            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-green-600 hover:text-green-700"
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <LogDetailModal
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </>
  );
}
