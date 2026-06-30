"use client";

import React from 'react';
import { Node, Edge } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import { WorkflowNodeData } from '@/types/workflow';

interface WorkflowPreviewProps {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  warnings?: Array<{type: string; message: string; severity: string}>;
  confidence?: number;
  reasoning?: string;
}

export const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({
  nodes,
  edges,
  warnings = [],
  confidence = 85,
  reasoning = "Workflow structure follows best practices for IGA workflows",
}) => {
  const getConfidenceColor = () => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      {/* Confidence Score */}
      <Card className="p-4 border-primary/20 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className={`h-5 w-5 ${getConfidenceColor()}`} />
            <span className="font-medium">Confidence Score</span>
          </div>
          <span className={`text-2xl font-bold ${getConfidenceColor()}`}>
            {confidence}%
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{reasoning}</p>
      </Card>

      {/* Workflow Summary */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          Workflow Summary
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Total Nodes:</span>
            <span className="ml-2 font-medium">{nodes.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Connections:</span>
            <span className="ml-2 font-medium">{edges.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">High Risk:</span>
            <span className="ml-2 font-medium">
              {nodes.filter(n => n.data.risk === 'high').length}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Approvals:</span>
            <span className="ml-2 font-medium">
              {nodes.filter(n => n.data.stepType === 'approval').length}
            </span>
          </div>
        </div>
      </Card>

      {/* Node List */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Workflow Steps</h4>
        <div className="space-y-2">
          {nodes.map((node, index) => (
            <div
              key={node.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <span className="text-xs font-medium text-muted-foreground w-6">
                {index + 1}
              </span>
              <div className="flex-1">
                <div className="font-medium text-sm">{node.data.label}</div>
                {node.data.description && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {node.data.description}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {node.data.stepType}
                </Badge>
                <Badge
                  variant={
                    node.data.risk === 'high'
                      ? 'destructive'
                      : node.data.risk === 'medium'
                      ? 'default'
                      : 'secondary'
                  }
                  className="text-xs"
                >
                  {node.data.risk}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="p-4 border-yellow-300 bg-yellow-50">
          <h4 className="font-semibold mb-3 flex items-center gap-2 text-yellow-700">
            <AlertTriangle className="h-4 w-4" />
            Warnings & Suggestions
          </h4>
          <div className="space-y-2">
            {warnings.map((warning, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium capitalize">{warning.type.replace('_', ' ')}</div>
                  <div className="text-muted-foreground">{warning.message}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
