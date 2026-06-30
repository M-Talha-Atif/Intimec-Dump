"use client";

import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Node, Edge } from '@xyflow/react';
import { WorkflowNodeData } from '@/types/workflow';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface WorkflowStatsProps {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
}

export const WorkflowStats: React.FC<WorkflowStatsProps> = ({ nodes, edges }) => {
  const analytics = useMemo(() => {
    const highRiskNodes = nodes.filter(node => node.data?.risk === 'high').length;
    const mediumRiskNodes = nodes.filter(node => node.data?.risk === 'medium').length;
    const lowRiskNodes = nodes.filter(node => node.data?.risk === 'low').length;
    
    const approvalNodes = nodes.filter(node => {
      const stepType = node.data?.stepType;
      return stepType?.startsWith('approval.');
    }).length;
    
    // Count automated nodes - explicitly list all automated types
    const automatedNodes = nodes.filter(node => {
      const stepType = node.data?.stepType;
      const automatedTypes = [
        // Triggers (automated flow control)
        'trigger.start', 'trigger.end',
        // Conditions (automated decision logic)
        'condition.if', 'condition.switch',
        // Actions (automated operations)
        'action.provision', 'action.deprovision',
        'action.notify', 'action.notification',
        'action.http', 'action.webhook',
        'action.script', 'action.database',
        'action.api',
        // Legacy naming
        'provisioning', 'notification', 'webhook', 'database', 'script', 'api', 'http'
      ];
      return automatedTypes.includes(stepType);
    }).length;
    
    const avgRiskScore = nodes.length > 0 
      ? ((highRiskNodes * 3 + mediumRiskNodes * 2 + lowRiskNodes) / nodes.length).toFixed(1)
      : '0.0';
    
    // Automation rate = automated nodes / total nodes
    // Only nodes explicitly listed as automated are counted
    const automationRate = nodes.length > 0
      ? Math.round((automatedNodes / nodes.length) * 100)
      : 0;

    const hasComplianceGaps = highRiskNodes > 0 && approvalNodes === 0;
    const complexity = nodes.length > 10 ? 'high' : nodes.length > 5 ? 'medium' : 'low';

    return {
      highRiskNodes,
      mediumRiskNodes,
      lowRiskNodes,
      approvalNodes,
      automatedNodes,
      avgRiskScore,
      automationRate,
      hasComplianceGaps,
      complexity,
    };
  }, [nodes]);

  return (
    <>
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Workflow Health</span>
          {analytics.hasComplianceGaps ? (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Nodes:</span>
            <Badge variant="outline">{nodes.length}</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span>Connections:</span>
            <Badge variant="outline">{edges.length}</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span>Complexity:</span>
            <Badge variant={
              analytics.complexity === 'high' ? 'destructive' : 
              analytics.complexity === 'medium' ? 'default' : 
              'secondary'
            }>
              {analytics.complexity}
            </Badge>
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Risk Distribution</span>
          <span className="text-xs text-muted-foreground">Score: {analytics.avgRiskScore}/3.0</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm items-center">
            <span className="text-destructive">High Risk:</span>
            <Badge variant="destructive">{analytics.highRiskNodes}</Badge>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-orange-500">Medium Risk:</span>
            <Badge variant="default">{analytics.mediumRiskNodes}</Badge>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-green-500">Low Risk:</span>
            <Badge variant="secondary">{analytics.lowRiskNodes}</Badge>
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Automation Rate</span>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        
        <div className="space-y-2">
          <Progress value={analytics.automationRate} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {analytics.automatedNodes} of {nodes.length} nodes automated ({analytics.automationRate}%)
          </p>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Governance</span>
          <Clock className="h-4 w-4" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Approval Steps:</span>
            <Badge variant="outline">{analytics.approvalNodes}</Badge>
          </div>
          {analytics.hasComplianceGaps && (
            <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
              ⚠️ High-risk operations detected without approval workflow
            </div>
          )}
        </div>
      </Card>
    </>
  );
};