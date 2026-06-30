import React, { useState } from "react";
import { PanelHeader, ActionButtons, TabsContent } from "./components";
import { WorkflowTaskDetails } from "@/types/tasks";
import { Skeleton } from "@/components/ui/skeleton";

export interface TaskDetailPanelProps {
  task: WorkflowTaskDetails | null;
  isLoading?: boolean;
  onClose: () => void;
  onApprove?: (taskId: string) => void;
  onReject?: (taskId: string) => void;
  onDelegate?: (taskId: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
}

export function TaskDetailPanel({
  task,
  isLoading,
  onClose,
  onApprove,
  onReject,
  onDelegate,
  isApproving,
  isRejecting,
}: TaskDetailPanelProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) {
    return (
      <div className="h-full bg-background border-l flex flex-col">
        <div className="border-b bg-muted/30 p-6">
          <Skeleton className="h-6 w-3/4 mb-3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <div className="h-full bg-background border-l flex flex-col">
      <PanelHeader task={task} onClose={onClose} />
      <ActionButtons 
        task={task} 
        onApprove={onApprove} 
        onReject={onReject} 
        onDelegate={onDelegate}
        isApproving={isApproving}
        isRejecting={isRejecting}
      />
      <TabsContent task={task} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
