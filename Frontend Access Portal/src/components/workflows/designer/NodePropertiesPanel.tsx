"use client";

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Node } from '@xyflow/react';
import { WorkflowNodeData } from '@/types/workflow';
import { ExtendedWorkflowNodeData } from '@/types/workflow-steps';
import { Save, Settings, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { PanelGeneral } from './panels/PanelGeneral';
import { PanelPolicy } from './panels/PanelPolicy';
import { PanelTarget } from './panels/PanelTarget';
import { PanelLifecycle } from './panels/PanelLifecycle';
import { PanelExplain } from './panels/PanelExplain';
import { PanelTesting } from './panels/PanelTesting';
import { PanelScript } from './panels/PanelScript';
import { PanelParallel } from './panels/PanelParallel';
import { PanelEnrichment } from './panels/PanelEnrichment';
import { PanelCertification } from './panels/PanelCertification';
import { NODE_CONFIG_PANELS } from './config/NodeConfigPanels';

interface NodePropertiesPanelProps {
  selectedNode: Node<WorkflowNodeData> | null;
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNodeData>) => void;
  onClose?: () => void;
  workflowMetadata?: {
    triggerType?: 'manual' | 'event-based' | 'time-based';
    eventConfig?: {
      services?: string[];
      eventTypes?: string[];
    };
  };
  nodes?: Array<Node<WorkflowNodeData>>;
  edges?: Array<{ source: string; target: string }>;
}

export const NodePropertiesPanel: React.FC<NodePropertiesPanelProps> = ({ 
  selectedNode, 
  onUpdateNode,
  onClose,
  workflowMetadata,
  nodes,
  edges
}) => {
  const [localData, setLocalData] = useState<ExtendedWorkflowNodeData>(
    selectedNode?.data as ExtendedWorkflowNodeData || {} as ExtendedWorkflowNodeData
  );

  React.useEffect(() => {
    if (selectedNode?.data) {
      setLocalData(selectedNode.data as ExtendedWorkflowNodeData);
    }
  }, [selectedNode?.data]);

  // Check if node type is backend-ready
  // Use stepType (the actual workflow node type) NOT selectedNode.type (which is always 'workflowNode' for ReactFlow)
  const nodeType = localData?.stepType || selectedNode?.data?.stepType || '';
  const isBackendReady = NODE_CONFIG_PANELS.hasOwnProperty(nodeType);
  const BackendConfigPanel = isBackendReady ? NODE_CONFIG_PANELS[nodeType as keyof typeof NODE_CONFIG_PANELS] : null;

  // Debug logging
  console.log('NodePropertiesPanel - nodeType:', nodeType, '| isBackendReady:', isBackendReady);

  // Validation for backend-ready nodes
  const validateBackendNode = () => {
    if (!isBackendReady) return { errors: [], warnings: [] };

    const errors: string[] = [];
    const warnings: string[] = [];

    if (!localData.label) {
      errors.push('Label is required');
    }

    // Check if using dynamic approver resolution - ALL event-based workflows use dynamic approvers
    const isEventTriggered = workflowMetadata?.triggerType === 'event-based';
    const shouldUseDynamicApprovers = isEventTriggered;

    switch (nodeType) {
      case 'approval.single':
        // Skip approver validation if using dynamic resolution
        if (!shouldUseDynamicApprovers && !localData.approverId) {
          errors.push('Approver ID is required');
        }
        break;
      case 'approval.multi':
        // Skip approvers validation if using dynamic resolution
        if (!shouldUseDynamicApprovers && (!localData.approvers || localData.approvers.length === 0)) {
          errors.push('At least one approver is required');
        }
        // Ensure approverType is set for event-triggered workflows
        if (shouldUseDynamicApprovers && localData.approverType !== 'role_owner') {
          warnings.push('Approver type should be set to "role_owner" for event-triggered workflows');
        }
        break;
      case 'approval.dynamic':
        if (!localData.resolutionStrategy) errors.push('Resolution strategy is required');
        break;
      case 'action.provision':
        if (!localData.email) errors.push('Email is required');
        if (!localData.firstName) errors.push('First name is required');
        if (!localData.lastName) errors.push('Last name is required');
        const hasVariables = [localData.email, localData.firstName, localData.lastName]
          .filter(field => typeof field === 'string')
          .some((field) => field.includes('${context.'));
        if (hasVariables) warnings.push('Using context variables - ensure they are set during execution');
        break;
      case 'action.deprovision':
        if (!localData.identityId) errors.push('Identity ID is required');
        if (!localData.tenantId) errors.push('Tenant ID is required');
        break;
      case 'action.notify':
        if (!localData.recipientUserId) errors.push('Recipient User ID is required');
        if (!localData.recipientEmail) errors.push('Recipient Email is required');
        break;
      case 'gateway.parallel-split':
        if (!localData.joinNode) errors.push('Join Node ID is required');
        const branches = typeof localData.branches === 'number' ? localData.branches : 0;
        if (!localData.branches || branches < 2) {
          errors.push('At least 2 branches are required');
        }
        break;
    }

    return { errors, warnings };
  };

  const { errors, warnings } = validateBackendNode();

  if (!selectedNode || !localData.label) {
    return (
      <div className="p-6 text-center text-gray-500 space-y-4">
        <div className="p-8 bg-gray-50 rounded-lg">
          <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Node Selected</h3>
          <p className="text-sm text-gray-600">
            Click on any workflow node to configure its properties and settings.
          </p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (selectedNode) {
      onUpdateNode(selectedNode.id, localData);
      // Close the panel after successful save to give visual feedback
      if (onClose) {
        onClose();
      }
    }
  };

  const handleDataChange = (updates: Partial<ExtendedWorkflowNodeData>) => {
    setLocalData({ ...localData, ...updates });
  };

  const getAvailableTabs = () => {
    const stepType = localData.stepType || '';
    const tabs = ['general'];
    
    if (stepType.includes('approval') || stepType.includes('sod') || stepType.includes('risk')) {
      tabs.push('policy');
    }
    
    if (stepType.includes('provision') || stepType.includes('aggregate') || stepType.includes('webhook')) {
      tabs.push('target');
    }

    if (stepType.includes('joiner') || stepType.includes('mover') || stepType.includes('leaver') || 
        localData.metadata?.roleType && ['joiner', 'mover', 'leaver'].includes(localData.metadata.roleType)) {
      tabs.push('lifecycle');
    }

    if (stepType.includes('approval') || stepType.includes('sod') || stepType.includes('condition')) {
      tabs.push('explain');
    }

    if (stepType.includes('script')) {
      tabs.push('script');
    }

    if (stepType.includes('parallel')) {
      tabs.push('parallel');
    }

    if (stepType.includes('enrichment')) {
      tabs.push('enrichment');
    }

    if (stepType.includes('certification') || stepType.includes('recertification')) {
      tabs.push('certification');
    }

    tabs.push('testing');

    return tabs;
  };

  const availableTabs = getAvailableTabs();

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Node Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Node Configuration</h3>
            <div className="flex items-center gap-2">
              <Badge variant={localData.risk === 'high' ? 'destructive' : localData.risk === 'medium' ? 'default' : 'secondary'} className="text-xs">
                {localData.risk || 'low'} risk
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {nodeType || localData.stepType}
            </Badge>
            {localData.appTarget && (
              <Badge variant="secondary" className="text-xs">
                {localData.appTarget}
              </Badge>
            )}
          </div>
        </div>

        {/* Validation Status for Backend-Ready Nodes */}
        {isBackendReady && (
          <>
            {errors.length > 0 && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-1">Configuration Errors:</div>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {warnings.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-1">Warnings:</div>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {warnings.map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {errors.length === 0 && warnings.length === 0 && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Configuration is valid and ready for execution
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {/* Backend-Ready Configuration Panel */}
        {isBackendReady && BackendConfigPanel ? (
          <div className="border rounded-lg p-4 bg-card">
            <BackendConfigPanel 
              data={localData} 
              onUpdate={handleDataChange} 
              workflowMetadata={workflowMetadata}
              nodes={nodes?.map(n => ({ id: n.id, type: n.type || '', data: n.data }))}
              edges={edges?.map(e => ({ source: e.source, target: e.target }))}
              currentNodeId={selectedNode?.id}
            />
          </div>
        ) : (
          /* Original Tabbed Configuration for Future Nodes */
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${availableTabs.length}, 1fr)` }}>
              <TabsTrigger value="general">General</TabsTrigger>
              {availableTabs.includes('policy') && (
                <TabsTrigger value="policy">Policy</TabsTrigger>
              )}
              {availableTabs.includes('target') && (
                <TabsTrigger value="target">Target</TabsTrigger>
              )}
              {availableTabs.includes('lifecycle') && (
                <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
              )}
              {availableTabs.includes('explain') && (
                <TabsTrigger value="explain">Explain</TabsTrigger>
              )}
              {availableTabs.includes('testing') && (
                <TabsTrigger value="testing">Testing</TabsTrigger>
              )}
              {availableTabs.includes('script') && (
                <TabsTrigger value="script">Script</TabsTrigger>
              )}
              {availableTabs.includes('parallel') && (
                <TabsTrigger value="parallel">Parallel</TabsTrigger>
              )}
              {availableTabs.includes('enrichment') && (
                <TabsTrigger value="enrichment">Enrichment</TabsTrigger>
              )}
              {availableTabs.includes('certification') && (
                <TabsTrigger value="certification">Certification</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="general" className="space-y-0">
              <PanelGeneral data={localData} onChange={handleDataChange} />
            </TabsContent>

            {availableTabs.includes('policy') && (
              <TabsContent value="policy" className="space-y-0">
                <PanelPolicy data={localData} onChange={handleDataChange} />
              </TabsContent>
            )}

            {availableTabs.includes('target') && (
              <TabsContent value="target" className="space-y-0">
                <PanelTarget data={localData} onChange={handleDataChange} />
              </TabsContent>
            )}

            {availableTabs.includes('lifecycle') && (
              <TabsContent value="lifecycle" className="space-y-0">
                <PanelLifecycle data={localData} onChange={handleDataChange} />
              </TabsContent>
            )}

            {availableTabs.includes('explain') && (
              <TabsContent value="explain" className="space-y-0">
                <PanelExplain data={localData} onChange={handleDataChange} />
              </TabsContent>
            )}

            {availableTabs.includes('testing') && (
              <TabsContent value="testing" className="space-y-0">
                <PanelTesting data={localData} onChange={handleDataChange} />
              </TabsContent>
            )}

            {availableTabs.includes('script') && (
              <TabsContent value="script" className="space-y-0">
                <PanelScript data={localData} onChange={handleDataChange} />
              </TabsContent>
            )}

            {availableTabs.includes('parallel') && (
              <TabsContent value="parallel" className="space-y-0">
                <PanelParallel data={localData} onChange={handleDataChange} />
              </TabsContent>
            )}

            {availableTabs.includes('enrichment') && (
              <TabsContent value="enrichment" className="space-y-0">
                <PanelEnrichment data={localData} onChange={handleDataChange} />
              </TabsContent>
            )}

            {availableTabs.includes('certification') && (
              <TabsContent value="certification" className="space-y-0">
                <PanelCertification data={localData} onChange={handleDataChange} />
              </TabsContent>
            )}
          </Tabs>
        )}

        {/* Save Button */}
        <div className="pt-4">
          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};
