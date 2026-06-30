
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Settings, AlertTriangle, Save, Network } from 'lucide-react';
import { Node, Edge } from '@xyflow/react';
import { WorkflowNodeData } from '@/types/workflow';

interface WorkflowFooterProps {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  lastSaved?: string;
  isSaving?: boolean;
}

export const WorkflowFooter: React.FC<WorkflowFooterProps> = ({ 
  nodes, 
  edges, 
  lastSaved,
  isSaving = false
}) => {
  const highRiskSteps = nodes.filter(node => node.data.risk === 'high').length;
  const approvalSteps = nodes.filter(node => node.data.stepType === 'approval').length;

  return (
    <div className="border-t bg-white px-4 py-3">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            <span>{nodes.length} Nodes</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1">
            <Network className="h-4 w-4" />
            <span>{edges.length} Connections</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span>{highRiskSteps} High-Risk</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <Badge variant="secondary" className="text-xs">
            {approvalSteps} Approval Points
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-xs">
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-blue-600"></div>
              <span className="text-blue-600 font-medium">Saving...</span>
            </>
          ) : (
            <>
              <Clock className="h-3 w-3 text-gray-500" />
              <span className="text-gray-500">Last saved: {lastSaved || 'Not saved'}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
