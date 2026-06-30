"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit3 } from "lucide-react";
import { useState } from "react";
import { LogDetailModal } from "./LogDetailModal";
import {
  PinnedLogItem,
  useDebugging,
  type LogItem,
} from "@/contexts/debugging-context";
import { EditIssueModal } from "./EditIssueModal";

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

export default function PinnedIssueItem({ item }: { item: PinnedLogItem }) {
  const [selectedLog, setSelectedLog] = useState<PinnedLogItem | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const itemData = item.data;
  const [description, setDescription] = useState(item.description);
  // console.log("PinnedIssueItem item:", item);
  return (
    <>
      <div
        key={itemData.id}
        className="group p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedLog(item);
        }}
        title="View Log Details"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Badge
                variant={getBadgeVariant(itemData.level)}
                className="text-xs px-1.5 py-0.5"
              >
                {itemData.level}
              </Badge>
            </div>
            <p className="text-xs font-medium mb-1 truncate">{item.name}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsEditModalOpen(true);
            }}
            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-[#438D98] hover:text-[#5faab6]"
          >
            <Edit3 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <LogDetailModal
        log={selectedLog}
        isOpen={!!selectedLog}
        setDescription={setDescription}
        onClose={() => setSelectedLog(null)}
      />

      <EditIssueModal
        item={item}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
}
