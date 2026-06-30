import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, UserPlus } from "lucide-react";
import { WorkflowTaskDetails } from "@/types/tasks";

interface ActionButtonsProps {
  task: WorkflowTaskDetails;
  onApprove?: (taskId: string) => void;
  onReject?: (taskId: string) => void;
  onDelegate?: (taskId: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
}

export function ActionButtons({ 
  task, 
  onApprove, 
  onReject, 
  onDelegate,
  isApproving = false,
  isRejecting = false,
}: ActionButtonsProps) {
  // Only show action buttons for pending tasks
  if (task.status !== "Pending") {
    return null;
  }

  const isProcessing = isApproving || isRejecting;

  return (
    <div className="border-b bg-background px-6 py-3">
      <div className="flex items-center justify-end gap-2">
        {onDelegate && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDelegate(task.id)}
            disabled={isProcessing}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Delegate
          </Button>
        )}
        {onReject && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onReject(task.id)}
            disabled={isProcessing}
          >
            <XCircle className="h-4 w-4 mr-1" />
            {isRejecting ? "Rejecting..." : "Reject"}
          </Button>
        )}
        {onApprove && (
          <Button 
            size="sm"
            onClick={() => onApprove(task.id)}
            disabled={isProcessing}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            {isApproving ? "Approving..." : "Approve"}
          </Button>
        )}
      </div>
    </div>
  );
}
