import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, XCircle, Download, ExternalLink } from "lucide-react";
import { ExecutionRecord } from "../ExecutionDetailPanel";
import { useToast } from "@/hooks/use-toast";

interface ActionButtonsProps {
  execution: ExecutionRecord;
  onRetry?: (executionId: string) => void;
  onCancel?: (executionId: string) => void;
}

export function ActionButtons({ execution, onRetry, onCancel }: ActionButtonsProps) {
  const { toast } = useToast();

  const handleDownloadLog = () => {
    const logData = {
      executionId: execution.id,
      workflowName: execution.workflowName,
      execution: execution,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(logData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `workflow-execution-${execution.id}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Execution Log Downloaded",
      description: "Full execution details exported successfully",
    });
  };

  const handleViewWorkflow = () => {
    // Store workflow ID in sessionStorage for the workflows page to load
    sessionStorage.setItem('openWorkflowId', execution.workflowId);
    // Navigate to workflows page in same tab
    window.location.href = '/workflows?tab=designer';
  };

  return (
    <div className="px-6">
      <div className="flex gap-2 flex-wrap pt-2">
        {/* Primary Actions */}
        {execution.status === 'failed' && onRetry && (
          <Button size="sm" onClick={() => onRetry(execution.id)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Execution
          </Button>
        )}
        
        {(execution.status === 'running' || execution.status === 'paused') && onCancel && (
          <Button size="sm" variant="destructive" onClick={() => onCancel(execution.id)}>
            <XCircle className="w-4 h-4 mr-2" />
            Cancel Execution
          </Button>
        )}

        <Button size="sm" variant="secondary" onClick={handleDownloadLog}>
          <Download className="w-4 h-4 mr-2" />
          Export Log
        </Button>

        <Button size="sm" variant="outline" onClick={handleViewWorkflow}>
          <ExternalLink className="w-4 h-4 mr-2" />
          View Workflow
        </Button>
      </div>
    </div>
  );
}
