import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  BackgroundVariant,
  NodeTypes,
  useReactFlow,
  EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './workflow-handles.css';
import { Settings, LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import WorkflowNode from './WorkflowNode';
import { NodePalette } from './NodePalette';
import { WorkflowStats } from './WorkflowStats';
import { NodePropertiesPanel } from './NodePropertiesPanel';
import { WorkflowNodeData } from '@/types/workflow';
import { useToast } from '@/hooks/use-toast';
import { TemplateMetadataBanner } from './TemplateMetadataBanner';
import { TemplateMetadata } from '@/types/workflow';
import { Badge } from '@/components/ui/badge';
import { WorkflowToolbar } from './WorkflowToolbar';
import { WorkflowFooter } from './WorkflowFooter';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { LintPanel } from './LintPanel';
import { CustomEdge } from './CustomEdge';
import { Swimlanes } from './Swimlanes';
import { SaveWorkflowModal } from './SaveWorkflowModal';
import { ImportDialog } from './ImportDialog';
import { AIWorkflowGenerator } from './AIWorkflowGenerator';
import { AIWorkflowSuggestions } from './AIWorkflowSuggestions';
import { EdgeEditor } from './EdgeEditor';
import { validateWorkflow, LintIssue } from '@/validators/workflowLinter';
import { workflowApi } from '@/services/workflowApi';
import { useWorkflowHistory } from '@/hooks/useWorkflowHistory';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
// @ts-ignore - dagre doesn't have type definitions
import dagre from 'dagre';

const nodeTypes: NodeTypes = {
  workflowNode: WorkflowNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

const initialNodes: Node<WorkflowNodeData>[] = [
  {
    id: 'start-node',
    type: 'workflowNode',
    position: { x: 250, y: 50 },
    deletable: false,
    data: { 
      label: 'Start', 
      stepType: 'trigger.start', 
      icon: Settings,
      risk: 'low' as const,
      description: '', // Empty - trigger details shown in metadata bar
      slaTimeout: 24,
      notifications: true,
      auditLog: true
    },
  },
  {
    id: 'end-node',
    type: 'workflowNode',
    position: { x: 250, y: 400 },
    deletable: false,
    data: { 
      label: 'End', 
      stepType: 'trigger.end', 
      icon: Settings,
      risk: 'low' as const,
      description: 'Workflow completion point',
      slaTimeout: 0,
      notifications: false,
      auditLog: true
    },
  },
];

const initialEdges: Edge[] = [];

interface CanvasDesignerProps {
  templateData?: any;
  templateId?: string;
  existingWorkflowId?: string; // For loading existing workflows
  existingWorkflow?: any; // Full workflow data for pre-filling save dialog
  onWorkflowSaved?: (workflow: any) => void; // Callback when workflow is saved
  designerMode?: 'creating' | 'editing' | 'creating-template' | 'editing-template'; // Designer mode
  templateMetadata?: any; // Template metadata for creating-template mode
  workflowMetadata?: {
    name: string;
    triggerType: 'manual' | 'event-based' | 'time-based';
    cronSchedule?: string;
    eventConfig?: {
      services: string[];
      eventTypes: string[];
    };
  };
  // Callback to update parent metadata when importing a workflow
  onImportMetadata?: (metadata: {
    triggerType: 'manual' | 'event-based' | 'time-based';
    cronSchedule?: string;
    eventConfig?: { services: string[]; eventTypes: string[] };
    name?: string;
  }) => void;
  triggerSaveModal?: boolean; // External trigger to open save modal
  onSaveModalTriggered?: () => void; // Callback when modal is triggered
  triggerDirectSave?: boolean; // External trigger for direct save (edit mode)
  onDirectSaveComplete?: () => void; // Callback when direct save completes
  triggerClearDraft?: boolean; // External trigger to clear draft (discard in create mode)
  onClearDraftComplete?: () => void; // Callback when draft is cleared
  autoSaveEnabled?: boolean; // Controlled auto-save state from parent
  onAutoSaveChange?: (enabled: boolean) => void; // Callback to update auto-save state
  onTestWorkflow?: (workflowData: any) => void; // Callback when Test button is clicked to navigate to simulator
}

// Icon resolver to convert icon names to components
const resolveIcon = (iconName: any): any => {
  if (typeof iconName === 'function') return iconName;
  if (typeof iconName === 'string') {
    return (LucideIcons as any)[iconName] || Settings;
  }
  return Settings;
};

// Helper to transform nodes for backend (same logic as workflowApi.prepareWorkflowData)
const transformNodesForBackend = (nodes: Node<WorkflowNodeData>[]) => {
  // Map step types to backend expected node types
  // The backend expects types like: trigger.start, approval.single, action.provision, etc.
  const mapStepTypeToBackendType = (stepType: string): string => {
    // If stepType already has a dot, it's likely already in backend format
    if (stepType.includes('.')) {
      return stepType;
    }
    
    // Legacy mappings for old stepType values
    const typeMap: Record<string, string> = {
      'trigger': 'trigger.start',
      'approval': 'approval.single',
      'condition': 'condition.if',
      'provisioning': 'action.provision',
      'notification': 'action.notify',
      'wait': 'delay.wait',
      'webhook': 'action.webhook',
      'database': 'action.database',
      'script': 'action.script',
      'api': 'action.api'
    };
    
    // Return mapped value or assume it's already in correct format
    return typeMap[stepType] || stepType;
  };

  return nodes.map(node => {
    const { label, stepType, icon, risk, description, metadata, ...executionConfig } = node.data;
    const backendType = mapStepTypeToBackendType(stepType as string);
    
    return {
      id: node.id,
      type: backendType,
      position: node.position,
      data: {
        ...executionConfig,
        ui: {
          label,
          stepType,
          icon: typeof icon === 'function' ? icon.name || 'Settings' : icon || 'Settings',
          risk,
          description,
          metadata
        }
      }
    };
  });
};

// Helper to transform edges for backend
const transformEdgesForBackend = (edges: Edge[]) => {
  return edges.map(edge => {
    const labelStr = typeof edge.label === 'string' ? edge.label : '';
    const isConditional = labelStr.toLowerCase().includes('if') || 
                        labelStr.toLowerCase().includes('when') ||
                        edge.data?.condition;
    
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: isConditional ? 'conditional' : 'default',
      label: edge.label,
      condition: edge.data?.condition || (isConditional ? { 
        field: 'status',
        operator: 'EQUALS',
        value: 'SUCCESS' 
      } : undefined),
      data: {
        ...edge.data,
        ui: {
          type: edge.type,
          label: edge.label
        }
      }
    };
  });
};

export const CanvasDesigner: React.FC<CanvasDesignerProps> = ({ 
  templateData, 
  templateId,
  designerMode,
  templateMetadata,
  existingWorkflowId,
  existingWorkflow,
  onWorkflowSaved,
  workflowMetadata,
  onImportMetadata,
  triggerSaveModal,
  onSaveModalTriggered,
  triggerDirectSave,
  onDirectSaveComplete,
  triggerClearDraft,
  onClearDraftComplete,
  autoSaveEnabled: autoSaveEnabledProp,
  onAutoSaveChange,
  onTestWorkflow
}) => {
  // Load from template data, draft, or use empty initial state
  const getInitialNodes = () => {
    if (templateData?.nodes) {
      const templateNodes = templateData.nodes.map((node: any) => {
        // Extract UI data from nested structure (same as existing workflow loading)
        const uiData = node.data?.ui || {};
        const { ui, ...executionData } = node.data || {};
        
        // Check if this is a start or end node
        const stepType = uiData.stepType || node.type;
        const isStartOrEnd = stepType === 'trigger.start' || stepType === 'trigger.end';
        
        return {
          ...node,
          type: 'workflowNode', // ReactFlow rendering type
          deletable: !isStartOrEnd, // Start and end nodes cannot be deleted
          data: { 
            // Flatten UI fields from ui object to root level
            label: uiData.label || node.id,
            stepType: stepType,
            icon: resolveIcon(uiData.icon || 'Settings'),
            risk: uiData.risk || 'low',
            description: uiData.description,
            metadata: uiData.metadata,
            // Keep execution config (url, method, headers, etc.)
            ...executionData
          }
        };
      });
      // Ensure start and end nodes are present
      return ensureStartEndNodes(templateNodes);
    }
    
    // Skip draft loading when creating a new template (start fresh)
    if (designerMode === 'creating-template') {
      return initialNodes;
    }
    
    // Try to restore from draft if exists
    const draft = localStorage.getItem('workflow-draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        const draftNodes = parsed.nodes.map((node: any) => ({
          ...node,
          data: { ...node.data, icon: resolveIcon(node.data.icon) }
        }));
        // Ensure start and end nodes are present
        return ensureStartEndNodes(draftNodes);
      } catch (e) {
        console.error('Failed to parse draft:', e);
      }
    }
    return initialNodes;
  };
  
  // Helper function to ensure start and end nodes always exist
  const ensureStartEndNodes = (nodes: Node<WorkflowNodeData>[]) => {
    const hasStartNode = nodes.some(n => n.id === 'start-node');
    const hasEndNode = nodes.some(n => n.id === 'end-node');
    
    let result = [...nodes];
    
    if (!hasStartNode) {
      result.unshift(initialNodes[0]); // Add start node at beginning
    }
    if (!hasEndNode) {
      result.push(initialNodes[1]); // Add end node at end
    }
    
    return result;
  };
  
  const getInitialEdges = () => {
    if (templateData?.edges) return templateData.edges;
    
    // Skip draft loading when creating a new template (start fresh)
    if (designerMode === 'creating-template') {
      return initialEdges;
    }
    
    // Try to restore from draft if exists
    const draft = localStorage.getItem('workflow-draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        return parsed.edges;
      } catch (e) {
        console.error('Failed to parse draft:', e);
      }
    }
    return initialEdges;
  };

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<WorkflowNodeData>>(
    getInitialNodes()
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    getInitialEdges()
  );
  
  // Initialize history hook
  const history = useWorkflowHistory(getInitialNodes(), getInitialEdges());
  
  // State declarations - must be before useEffect
  const [selectedNode, setSelectedNode] = useState<Node<WorkflowNodeData> | null>(null);
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>('');
  const [panelWidth, setPanelWidth] = useState(384); // 96 * 4 = 384px (w-96)
  const [isResizing, setIsResizing] = useState(false);
  const [isNodePaletteCollapsed, setIsNodePaletteCollapsed] = useState(false);
  const [isKpiPanelCollapsed, setIsKpiPanelCollapsed] = useState(false);
  const [lintIssues, setLintIssues] = useState<LintIssue[]>([]);
  const [showLintPanel, setShowLintPanel] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [swimlanes, setSwimlanes] = useState<any[]>([]);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Use controlled auto-save state from parent, or fall back to internal state
  const autoSaveEnabled = autoSaveEnabledProp !== undefined ? autoSaveEnabledProp : true;
  const setAutoSaveEnabled = onAutoSaveChange || (() => {});
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [showEdgeEditor, setShowEdgeEditor] = useState(false);
  const [currentWorkflowData, setCurrentWorkflowData] = useState<any>(existingWorkflow || null);
  const [loadedTemplateMetadata, setLoadedTemplateMetadata] = useState<TemplateMetadata | null>(
    templateData ? {
      id: templateData.id || templateId || '',
      name: templateData.name || 'Template',
      version: templateData.version || '1.0',
      usageCount: templateData.usageCount || 0,
      tags: templateData.tags || [],
      isConnectedToTemplate: true,
      sourceTemplate: templateId
    } : null
  );
  const { toast } = useToast();
  
  // Track last trigger type to prevent infinite updates
  const lastTriggerTypeRef = useRef<string | undefined>(undefined);
  
  // Update start node label when trigger type changes
  useEffect(() => {
    if (!workflowMetadata?.triggerType) return;
    if (lastTriggerTypeRef.current === workflowMetadata.triggerType) return; // Skip if unchanged
    
    lastTriggerTypeRef.current = workflowMetadata.triggerType;
    
    const triggerLabels = {
      'manual': 'Start',
      'event-based': 'Start',
      'time-based': 'Start'
    };
    
    setNodes((nds) => {
      const updatedNodes = nds.map((node) => {
        if (node.id === 'start-node') {
          return {
            ...node,
            data: {
              ...node.data,
              description: '', // Remove long description to keep node size consistent
              label: triggerLabels[workflowMetadata.triggerType]
            }
          };
        }
        return node;
      });
      
      return updatedNodes;
    });
  }, [workflowMetadata?.triggerType, setNodes]);
  
  // Debug: Monitor workflowId changes
  useEffect(() => {
    console.log('workflowId changed to:', workflowId);
    if (workflowId) {
      console.log('Workflow ID is now set, auto-save will be enabled');
    }
  }, [workflowId]);
  
  // Clear draft when switching contexts
  // Check for draft existence (but don't show conflict - handled at page level)
  useEffect(() => {
    const draft = localStorage.getItem('workflow-draft');
    setHasDraft(!!draft);

    // If we're loading an existing workflow, clear any orphaned draft
    if (existingWorkflowId && draft) {
      console.log('Clearing orphaned draft - loading existing workflow:', existingWorkflowId);
      localStorage.removeItem('workflow-draft');
      setHasDraft(false);
    }
    
    // If we're creating a new template, clear any orphaned draft (start fresh)
    if (designerMode === 'creating-template' && draft) {
      console.log('Clearing orphaned draft - creating new template');
      localStorage.removeItem('workflow-draft');
      setHasDraft(false);
    }
  }, [existingWorkflowId, designerMode]);
  
  // Handle external trigger for save modal
  useEffect(() => {
    if (triggerSaveModal) {
      setShowSaveModal(true);
      onSaveModalTriggered?.();
    }
  }, [triggerSaveModal, onSaveModalTriggered]);
  
  // Handle external trigger for direct save (edit mode)
  useEffect(() => {
    if (triggerDirectSave && workflowId) {
      // Perform direct save like handleManualSave
      const performDirectSave = async () => {
        try {
          await workflowApi.partialUpdateWorkflow(workflowId, {
            nodes: transformNodesForBackend(nodes),
            edges: transformEdgesForBackend(edges)
          });
          const savedTime = new Date().toLocaleTimeString();
          setLastSaved(savedTime);
          toast({
            title: "Saved",
            description: "Your changes have been saved",
          });
          onDirectSaveComplete?.();
        } catch (error: any) {
          console.error('Direct save failed:', error);
          toast({
            variant: "destructive",
            title: "Save Failed",
            description: error.message || "Could not save changes",
          });
          onDirectSaveComplete?.(); // Call even on error to reset trigger
        }
      };
      performDirectSave();
    }
  }, [triggerDirectSave, workflowId, nodes, edges, toast, onDirectSaveComplete]);
  
  // Handle external trigger for clearing draft (discard in create mode)
  useEffect(() => {
    if (triggerClearDraft) {
      localStorage.removeItem('workflow-draft');
      setHasDraft(false);
      console.log('Draft cleared from localStorage');
      onClearDraftComplete?.();
    }
  }, [triggerClearDraft, onClearDraftComplete]);
  
  // Save draft to localStorage when no workflow ID (unsaved workflow)
  useEffect(() => {
    if (workflowId) return; // Only save draft if workflow hasn't been saved to backend yet
    
    const timeoutId = setTimeout(() => {
      const draft = {
        nodes: nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            icon: typeof node.data.icon === 'function' ? node.data.icon.name || 'Settings' : node.data.icon
          }
        })),
        edges,
        timestamp: Date.now(),
        workflowName: workflowMetadata?.name, // Include workflow name if available
        metadata: workflowMetadata // Store complete metadata
      };
      localStorage.setItem('workflow-draft', JSON.stringify(draft));
      setHasDraft(true);
      console.log('Draft saved to localStorage');
    }, 1000); // Save draft after 1 second of inactivity
    
    return () => clearTimeout(timeoutId);
  }, [nodes, edges, workflowId]);
  
  // Auto-save to backend (debounced) - only if workflow already exists AND auto-save is enabled
  useEffect(() => {
    if (!workflowId) {
      console.log('Auto-save skipped: no workflowId yet');
      return; // Don't auto-save if no workflow ID yet
    }
    
    if (!autoSaveEnabled) {
      console.log('Auto-save skipped: auto-save is disabled');
      return; // Don't auto-save if toggle is off
    }
    
    console.log('Auto-save scheduled for workflowId:', workflowId);
    const timeoutId = setTimeout(() => {
      const autoSave = async () => {
        console.log('Auto-save executing...');
        setIsSaving(true);
        try {
          await workflowApi.partialUpdateWorkflow(workflowId, {
            nodes: transformNodesForBackend(nodes),
            edges: transformEdgesForBackend(edges)
          });
          const savedTime = new Date().toLocaleTimeString();
          setLastSaved(savedTime);
          console.log('Auto-save successful at:', savedTime);
          toast({
            title: "Auto-saved",
            description: "Your changes have been saved",
            duration: 2000,
          });
        } catch (error: any) {
          console.error('Auto-save failed:', error);
          toast({
            variant: "destructive",
            title: "Auto-save Failed",
            description: error.message || "Could not save changes automatically",
            duration: 3000,
          });
        } finally {
          setIsSaving(false);
        }
      };
      
      autoSave();
    }, 3000); // Debounce 3 seconds
    
    return () => clearTimeout(timeoutId);
  }, [nodes, edges, workflowId, autoSaveEnabled, toast]);

  // Set workflowId for template editing mode
  useEffect(() => {
    if (designerMode === 'editing-template' && existingWorkflowId) {
      setWorkflowId(existingWorkflowId);
    }
  }, [designerMode, existingWorkflowId]);

  // Load existing workflow if existingWorkflowId is provided (skip for template modes)
  useEffect(() => {
    if (!existingWorkflowId) return;
    if (designerMode === 'creating-template' || designerMode === 'editing-template') return;
    
    const loadWorkflow = async () => {
      setIsLoading(true);
      
      // Silently clear any draft when loading an existing workflow
      localStorage.removeItem('workflow-draft');
      setHasDraft(false);
      
      // Clear previous workflow state before loading new one
      setNodes(initialNodes);
      setEdges([]);
      setSelectedNode(null);
      setCurrentWorkflowData(null);
      setWorkflowId(null);
      
      try {
        const workflow = await workflowApi.getWorkflow(existingWorkflowId);
        
        // Store the workflow data for the save modal
        setCurrentWorkflowData(workflow);
        
        // Set workflow ID for auto-save
        setWorkflowId(workflow.id);
        
        // Load nodes with resolved icons and restore UI data
        const loadedNodes = workflow.nodes.map((node: any) => {
          // Backend stores UI data in data.ui, restore it to root level
          const uiData = node.data?.ui || {};
          const { ui, ...executionData } = node.data || {};
          
          // Check if this is a start or end node
          const stepType = uiData.stepType || node.type?.split('.')[0] || 'action';
          const isStartOrEnd = stepType === 'trigger.start' || stepType === 'trigger.end';
          
          return {
            ...node,
            type: 'workflowNode', // ReactFlow rendering type
            deletable: !isStartOrEnd, // Start and end nodes cannot be deleted
            data: { 
              // Restore UI fields from ui object
              label: uiData.label || node.id,
              stepType: stepType,
              icon: resolveIcon(uiData.icon || 'Settings'),
              risk: uiData.risk || 'low',
              description: uiData.description,
              metadata: uiData.metadata,
              // Keep execution config
              ...executionData
            }
          };
        });
        setNodes(loadedNodes);
        
        // Load edges and restore UI type
        const loadedEdges = workflow.edges.map((edge: any) => ({
          ...edge,
          type: edge.data?.ui?.type || 'custom', // Restore ReactFlow type
        }));
        setEdges(loadedEdges);
        
        // Fetch and display original template metadata if workflow was created from template
        if (workflow.sourceTemplateId) {
          try {
            const originalTemplate = await workflowApi.getTemplate(workflow.sourceTemplateId);
            setLoadedTemplateMetadata({
              id: originalTemplate.id,
              name: originalTemplate.name, // Original template name, not workflow name
              version: originalTemplate.version || '1.0',
              usageCount: originalTemplate.usageCount || 0,
              tags: originalTemplate.tags || [],
              isConnectedToTemplate: true,
              sourceTemplate: workflow.sourceTemplateId
            });
            
            console.log('Workflow created from template:', originalTemplate.name);
          } catch (error) {
            console.error('Failed to fetch template metadata:', error);
            // Fallback to basic metadata from workflow
            setLoadedTemplateMetadata({
              id: workflow.sourceTemplateId,
              name: `Template ${workflow.sourceTemplateId}`,
              version: '1.0',
              usageCount: 0,
              tags: [],
              isConnectedToTemplate: true,
              sourceTemplate: workflow.sourceTemplateId
            });
          }
        }
        
        // Initialize history with loaded state
        history.reset(loadedNodes, workflow.edges);
        
        // Clear any draft since we're loading a saved workflow
        localStorage.removeItem('workflow-draft');
        
        toast({
          title: "Workflow Loaded",
          description: `"${workflow.name}" has been loaded successfully`,
        });
      } catch (error: any) {
        console.error('Failed to load workflow:', error);
        toast({
          variant: "destructive",
          title: "Load Failed",
          description: error.message || "Could not load workflow",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWorkflow();
  }, [existingWorkflowId]); // Only run when existingWorkflowId changes

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge({ ...params, type: 'custom' }, eds);
        setTimeout(() => history.pushState(nodes, newEdges), 0);
        return newEdges;
      });
    },
    [setEdges, nodes, history],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<WorkflowNodeData>) => {
    setSelectedNode(node);
    setIsPropertiesPanelOpen(true);
  }, []);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setShowEdgeEditor(true);
  }, []);

  // Handle keyboard shortcuts
  const onKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't handle shortcuts if user is typing in an input/textarea
    const target = event.target as HTMLElement;
    const isTyping = target.tagName === 'INPUT' || 
                     target.tagName === 'TEXTAREA' || 
                     target.isContentEditable ||
                     target.closest('[contenteditable="true"]');
    
    if (isTyping) {
      return; // Let the input handle the key event
    }
    
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (selectedNode) {
        // Prevent deletion of start and end nodes
        if (selectedNode.data.stepType === 'trigger.start' || selectedNode.data.stepType === 'trigger.end') {
          toast({
            title: "Cannot Delete Node",
            description: "Start and End nodes are required and cannot be deleted.",
            variant: "destructive"
          });
          return;
        }
        
        const updatedNodes = nodes.filter((node) => node.id !== selectedNode.id);
        const updatedEdges = edges.filter((edge) => 
          edge.source !== selectedNode.id && edge.target !== selectedNode.id
        );
        
        setNodes(updatedNodes);
        setEdges(updatedEdges);
        
        // Save to history so undo works
        history.pushState(updatedNodes, updatedEdges);
        
        setSelectedNode(null);
        setIsPropertiesPanelOpen(false);
        toast({
          title: "Node Deleted",
          description: "Node and its connections have been removed from the workflow.",
        });
      }
    }
    if (event.key === 'Escape') {
      setSelectedNode(null);
      setIsPropertiesPanelOpen(false);
    }
  }, [selectedNode, nodes, edges, setNodes, setEdges, history, toast]);

  React.useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  const onUpdateNode = useCallback((nodeId: string, updates: Partial<WorkflowNodeData>) => {
    console.log('onUpdateNode called for:', nodeId, 'updates:', updates);
    const newNodes = nodes.map((node) => {
      if (node.id === nodeId) {
        const updatedNode = {
          ...node,
          data: { ...node.data, ...updates }
        };
        // Update selectedNode if this is the currently selected node
        setSelectedNode((current) => 
          current?.id === nodeId ? updatedNode : current
        );
        return updatedNode;
      }
      return node;
    });
    console.log('Setting new nodes, this should trigger auto-save...');
    setNodes(newNodes);
    history.pushState(newNodes, edges);
    
    toast({
      title: "Node Configuration Updated",
      description: "Node properties have been saved successfully with compliance settings applied",
    });
  }, [nodes, edges, setNodes, history, toast]);

  const onAddNode = useCallback((nodeData: { 
    label: string; 
    stepType: string; 
    nodeType?: string; 
    icon: any; 
    risk: 'low' | 'medium' | 'high';
    implemented?: boolean;
  }) => {
    const canvasCenter = { x: 400, y: 300 };
    const newNode: Node<WorkflowNodeData> = {
      id: `node-${Date.now()}`,
      type: 'workflowNode', // Always use workflowNode for ReactFlow rendering
      position: { 
        x: canvasCenter.x + (Math.random() - 0.5) * 100,
        y: canvasCenter.y + (Math.random() - 0.5) * 100
      },
      data: {
        label: nodeData.label,
        stepType: nodeData.stepType, // This is what we check for backend-ready panels
        icon: nodeData.icon,
        risk: nodeData.risk,
        slaTimeout: 24,
        notifications: false,
        auditLog: true
      },
    };
    console.log('Adding node with stepType:', nodeData.stepType, 'Full node:', newNode);
    const newNodes = nodes.concat(newNode);
    setNodes(newNodes);
    history.pushState(newNodes, edges);
  }, [nodes, edges, setNodes, history]);

  const onDeleteNode = useCallback((nodeId: string) => {
    // Prevent deletion of start and end nodes
    const nodeToDelete = nodes.find(node => node.id === nodeId);
    if (nodeToDelete && (nodeToDelete.data.stepType === 'trigger.start' || nodeToDelete.data.stepType === 'trigger.end')) {
      toast({
        title: "Cannot Delete Node",
        description: "Start and End nodes are required and cannot be deleted.",
        variant: "destructive"
      });
      return;
    }
    
    const newNodes = nodes.filter((node) => node.id !== nodeId);
    const newEdges = edges.filter((edge) => 
      edge.source !== nodeId && edge.target !== nodeId
    );
    setNodes(newNodes);
    setEdges(newEdges);
    history.pushState(newNodes, newEdges);
    
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
      setIsPropertiesPanelOpen(false);
    }
    toast({
      title: "Node Deleted",
      description: "Node and its connections have been removed from the workflow.",
    });
  }, [nodes, edges, setNodes, setEdges, selectedNode, history, toast]);

  const onDuplicateNode = useCallback((nodeId: string) => {
    const nodeToDuplicate = nodes.find(node => node.id === nodeId);
    if (nodeToDuplicate) {
      const newNode: Node<WorkflowNodeData> = {
        ...nodeToDuplicate,
        id: `node-${Date.now()}`,
        position: {
          x: nodeToDuplicate.position.x + 50,
          y: nodeToDuplicate.position.y + 50
        }
      };
      const newNodes = nodes.concat(newNode);
      setNodes(newNodes);
      history.pushState(newNodes, edges);
      toast({
        title: "Node Duplicated",
        description: "A copy of the node has been created.",
      });
    }
  }, [nodes, edges, setNodes, history, toast]);
  
  // Prevent ReactFlow from deleting start/end nodes via deleteKeyCode
  const onNodesDelete = useCallback((nodesToDelete: Node[]) => {
    const hasProtectedNode = nodesToDelete.some(node => 
      node.data.stepType === 'trigger.start' || node.data.stepType === 'trigger.end'
    );
    
    if (hasProtectedNode) {
      toast({
        title: "Cannot Delete Node",
        description: "Start and End nodes are required and cannot be deleted.",
        variant: "destructive"
      });
      return;
    }
    
    // Allow deletion of other nodes - ReactFlow will handle it
  }, [toast]);

  const onSave = useCallback(async () => {
    // If creating or editing a template, directly save with the provided metadata
    if ((designerMode === 'creating-template' || designerMode === 'editing-template') && templateMetadata) {
      setIsSaving(true);
      try {
        // Calculate steps count (exclude start and end triggers)
        const actualSteps = nodes.filter(node => 
          node.type !== 'trigger.start' && node.type !== 'trigger.end'
        ).length;
        
        // Prepare template data with nodes and edges from designer
        const templateData = {
          ...templateMetadata,
          steps: actualSteps,
          nodes: nodes.map(node => ({
            id: node.id,
            type: node.type,
            position: node.position,
            data: node.data
          })),
          edges: edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: edge.type
          }))
        };
        
        console.log(designerMode === 'editing-template' ? 'Updating template with data:' : 'Creating template with data:', templateData);
        
        // Call appropriate API based on mode
        const response = designerMode === 'editing-template' 
          ? await workflowApi.updateTemplate(workflowId!, templateData)
          : await workflowApi.createTemplate(templateData);
        
        // Clear any draft data from localStorage after successful save
        localStorage.removeItem('workflow-draft');
        setHasDraft(false);
        
        toast({
          title: designerMode === 'editing-template' ? "Template Updated" : "Template Created",
          description: `"${templateMetadata.name}" has been ${designerMode === 'editing-template' ? 'updated' : 'created'} successfully`,
        });
        
        // Notify parent and navigate away
        onWorkflowSaved?.(response);
      } catch (error: any) {
        console.error(designerMode === 'editing-template' ? 'Failed to update template:' : 'Failed to create template:', error);
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: error.message || `Could not ${designerMode === 'editing-template' ? 'update' : 'create'} template. Please try again.`,
        });
      } finally {
        setIsSaving(false);
      }
    } else {
      // For workflows, open save modal to allow editing metadata
      setShowSaveModal(true);
    }
  }, [designerMode, templateMetadata, nodes, edges, toast, onWorkflowSaved]);

  const handleManualSave = useCallback(async () => {
    if (!workflowId) {
      toast({
        variant: "destructive",
        title: "Cannot Save",
        description: "Please save the workflow first using the Save button",
      });
      return;
    }

    setIsSaving(true);
    try {
      await workflowApi.partialUpdateWorkflow(workflowId, {
        nodes: transformNodesForBackend(nodes),
        edges: transformEdgesForBackend(edges)
      });
      const savedTime = new Date().toLocaleTimeString();
      setLastSaved(savedTime);
      toast({
        title: "Saved",
        description: "Your changes have been saved to the backend",
      });
    } catch (error: any) {
      console.error('Manual save failed:', error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message || "Could not save changes",
      });
    } finally {
      setIsSaving(false);
    }
  }, [workflowId, nodes, edges, toast]);

  const handleSaveWorkflow = useCallback(async (formData: any) => {
    setIsSaving(true);
    
    console.log('Form data received in handleSaveWorkflow:', formData);
    
    try {
      // Prepare workflow data using API service
      const workflowData = workflowApi.prepareWorkflowData(
        {
          ...formData,
          triggerType: workflowMetadata?.triggerType || formData.triggerType,
          eventConfig: workflowMetadata?.eventConfig,
          cronSchedule: workflowMetadata?.cronSchedule,
          templateId: templateId,
          templateName: loadedTemplateMetadata?.name,
          templateVersion: loadedTemplateMetadata?.version,
        },
        nodes,
        edges
      );
      
      console.log('Saving workflow to backend:', workflowData);
      
      let response;
      if (workflowId) {
        // Update existing workflow
        response = await workflowApi.updateWorkflow(workflowId, workflowData);
        
        // Check if operation was denied (403 returns null)
        if (response === null) {
          return;
        }
        
        toast({
          title: "Workflow Updated",
          description: `"${formData.name}" has been updated successfully`,
        });
      } else {
        // Create new workflow
        response = await workflowApi.createWorkflow(workflowData);
        
        // Check if operation was denied (403 returns null)
        if (response === null) {
          return;
        }
        
        setWorkflowId(response.id);
        // Clear draft from localStorage once saved to backend
        localStorage.removeItem('workflow-draft');
        setHasDraft(false);
        console.log('Workflow saved, draft cleared, ID set:', response.id);
        toast({
          title: "Workflow Created",
          description: `"${formData.name}" has been created successfully`,
        });
      }
      
      setLastSaved(new Date().toLocaleTimeString());
      setShowSaveModal(false);
      
      // Update currentWorkflowData with the saved data so form shows fresh data on reopen
      setCurrentWorkflowData({
        ...response,
        // Include the form data that was just saved
        ...formData
      });
      
      // Notify parent component that workflow was saved
      onWorkflowSaved?.(response);
      
      console.log('Workflow saved successfully:', response);
    } catch (error: any) {
      // Validation errors are now handled globally by FetchInterceptor
      // Only show toast for non-validation errors
      if (error.status !== 400) {
        toast({
          title: "Save Failed",
          description: error.message || "Could not save workflow. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, templateId, loadedTemplateMetadata, workflowId, workflowMetadata, toast, onWorkflowSaved]);

  const onLoad = useCallback(() => {
    setShowImportDialog(true);
  }, []);

  const handleImportWorkflow = useCallback((workflowExport: any) => {
    try {
      // Support both simple exports (nodes/edges only) and full exports
      const importedNodes = Array.isArray(workflowExport.nodes) ? workflowExport.nodes : [];
      const importedEdges = Array.isArray(workflowExport.edges) ? workflowExport.edges : [];

      // Rehydrate nodes from backend-like format to designer UI shape
      const loadedNodes = importedNodes.map((node: any) => {
        const uiData = node.data?.ui || {};
        const { ui, ...executionData } = node.data || {};
        const stepType = uiData.stepType || node.type || 'action';
        const isStartOrEnd = stepType === 'trigger.start' || stepType === 'trigger.end';
        return {
          ...node,
          type: 'workflowNode',
          deletable: !isStartOrEnd,
          data: {
            label: uiData.label || node.id,
            stepType: stepType,
            icon: resolveIcon(uiData.icon || 'Settings'),
            risk: uiData.risk || 'low',
            description: uiData.description,
            metadata: uiData.metadata,
            ...executionData
          }
        } as Node<WorkflowNodeData>;
      });

      const loadedEdges = importedEdges.map((edge: any) => ({
        ...edge,
        type: edge.data?.ui?.type || 'custom',
      })) as Edge[];

      setNodes(ensureStartEndNodes(loadedNodes));
      setEdges(loadedEdges);

      // Restore current workflow data for Save modal prefill
      const wfMeta = workflowExport.workflow || workflowExport.metadata || {};
      const toUpperSnake = (val?: string, fallback?: string) => {
        if (!val) return fallback || undefined;
        return val.toUpperCase().replace(/-/g, '_');
      };

      const baseImportedName = (wfMeta.name || existingWorkflow?.name || 'Untitled Workflow') as string;
      const shouldSuffixImportedName = !existingWorkflowId && !workflowId;
      const importedName = shouldSuffixImportedName
        ? (baseImportedName.endsWith(' (Imported)') ? baseImportedName : `${baseImportedName} (Imported)`)
        : baseImportedName;

      const importedCurrent: any = {
        id: undefined,
        name: importedName,
        description: wfMeta.description || existingWorkflow?.description || '',
        // Import creates a NEW workflow by default; keep it safe (draft) and let backend assign version.
        status: 'DRAFT',
        category: toUpperSnake(wfMeta.category, 'ACCESS_REQUEST'),
        triggerType: toUpperSnake(wfMeta.triggerType, 'MANUAL'),
        eventConfig: wfMeta.eventConfig || {},
        cronSchedule: wfMeta.cronSchedule || '',
        applicationScope: wfMeta.applicationScope || [],
        tags: wfMeta.tags || [],
        complianceFrameworks: wfMeta.complianceFrameworks || [],
        permissions: wfMeta.permissions || {},
      };
      setCurrentWorkflowData(importedCurrent);

      // Update template banner if template info exists
      const importedTemplate = wfMeta.template;
      if (importedTemplate?.name || importedTemplate?.version) {
        setLoadedTemplateMetadata({
          id: '',
          name: importedTemplate?.name || 'Template',
          version: importedTemplate?.version || '1.0',
          usageCount: 0,
          tags: importedCurrent.tags || [],
          isConnectedToTemplate: false,
          sourceTemplate: '',
        });
      }

      // Notify parent to sync metadata bar (trigger type, events, cron)
      const frontendTriggerType = (wfMeta.triggerType || 'manual').toLowerCase().replace(/_/g, '-');
      onImportMetadata?.({
        triggerType: (frontendTriggerType as 'manual' | 'event-based' | 'time-based'),
        cronSchedule: wfMeta.cronSchedule || '',
        eventConfig: wfMeta.eventConfig || { services: [], eventTypes: [] },
        name: wfMeta.name,
      });

      toast({
        title: "Workflow Imported",
        description: "Workflow and metadata have been restored",
      });
    } catch (e: any) {
      console.error('Import failed:', e);
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description: e?.message || 'Could not import workflow file',
      });
    }
  }, [setNodes, setEdges, toast, onImportMetadata, ensureStartEndNodes, existingWorkflow?.name, existingWorkflow?.description, templateId]);

  const handleAIGenerate = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    setNodes(newNodes as Node<WorkflowNodeData>[]);
    setEdges(newEdges);
    toast({
      title: "AI Workflow Generated",
      description: "Workflow has been created from your description",
    });
  }, [setNodes, setEdges, toast]);

  const onGenerateAI = useCallback(() => {
    setShowAIGenerator(true);
  }, []);

  const onSimulate = useCallback(() => {
    // Prepare workflow data for simulation
    const workflowData = {
      id: workflowId || 'unsaved',
      name: currentWorkflowData.name || 'Untitled Workflow',
      description: currentWorkflowData.description || '',
      nodes: transformNodesForBackend(nodes),
      edges: transformEdgesForBackend(edges),
      metadata: {
        triggerType: currentWorkflowData.triggerType || 'MANUAL',
        category: currentWorkflowData.category || 'ACCESS_REQUEST',
        applicationScope: currentWorkflowData.applicationScope || [],
        tags: currentWorkflowData.tags || [],
      },
      // Include sample context data for simulation
      context: {
        identity: {
          employeeId: "EMP001",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@company.com",
          department: "Engineering",
          title: "Software Developer",
          manager: "jane.smith@company.com",
          startDate: new Date().toISOString().split('T')[0],
          location: "New York",
          riskScore: 3.2
        },
        trigger: {
          type: "workflow_test",
          source: "Designer",
          timestamp: new Date().toISOString()
        }
      }
    };
    
    // Call parent callback to navigate to simulator with workflow data
    if (onTestWorkflow) {
      onTestWorkflow(workflowData);
    }
  }, [nodes, edges, workflowId, currentWorkflowData, onTestWorkflow]);

  const onExport = useCallback(() => {
    // Portable export (definition), not DB snapshot:
    // - Exclude DB identity/system fields: id, status, version, timestamps, metrics.
    // - Exclude environment-specific IDs where possible (e.g., template IDs).
    // - Include functional metadata + graph with UI data.
    const exportPayload = {
      exportVersion: 1,
      exportedAt: new Date().toISOString(),
      workflow: {
        name: currentWorkflowData?.name || workflowMetadata?.name || 'Untitled Workflow',
        description: currentWorkflowData?.description || '',
        category: (currentWorkflowData?.category || 'ACCESS_REQUEST'),
        triggerType: (currentWorkflowData?.triggerType || (workflowMetadata?.triggerType || 'manual').toUpperCase().replace(/-/g, '_')),
        eventConfig: workflowMetadata?.eventConfig || currentWorkflowData?.eventConfig || { services: [], eventTypes: [] },
        cronSchedule: workflowMetadata?.cronSchedule || currentWorkflowData?.cronSchedule || '',
        applicationScope: currentWorkflowData?.applicationScope || [],
        tags: currentWorkflowData?.tags || [],
        complianceFrameworks: currentWorkflowData?.complianceFrameworks || [],
        permissions: currentWorkflowData?.permissions || {},
        template: loadedTemplateMetadata
          ? {
              name: loadedTemplateMetadata.name,
              version: loadedTemplateMetadata.version,
            }
          : undefined,
      },
      nodes: transformNodesForBackend(nodes),
      edges: transformEdgesForBackend(edges)
    };

    const nameSlug = (exportPayload.workflow.name || 'workflow').toLowerCase().replace(/\s+/g, '-');
    const dataStr = JSON.stringify(exportPayload, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${nameSlug}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Workflow Exported",
      description: "Full workflow (graph + metadata) exported",
    });
  }, [nodes, edges, toast, currentWorkflowData, workflowMetadata, workflowId, loadedTemplateMetadata]);

  const onReset = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedNode(null);
    setIsPropertiesPanelOpen(false);
    setWorkflowId(null);
    localStorage.removeItem('workflow-draft');
    setHasDraft(false);
    
    toast({
      title: "Workflow Reset",
      description: "Canvas has been cleared and draft removed",
    });
  }, [setNodes, setEdges, toast]);

  const onClearDraft = useCallback(() => {
    localStorage.removeItem('workflow-draft');
    setHasDraft(false);
    setNodes(initialNodes);
    setEdges(initialEdges);
    
    toast({
      title: "Draft Cleared",
      description: "Canvas has been reset to initial state",
    });
  }, [setNodes, setEdges, toast]);

  const onAutoLayout = useCallback(() => {
    // Use Dagre for hierarchical graph layout
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    
    // Configure the graph layout
    dagreGraph.setGraph({
      rankdir: 'TB', // Top to Bottom
      align: 'UL', // Upper Left alignment
      nodesep: 100, // Horizontal spacing between nodes
      ranksep: 150, // Vertical spacing between ranks/levels
      marginx: 50,
      marginy: 50,
    });
    
    // Add nodes to dagre graph
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { 
        width: 250, // Approximate node width
        height: 100, // Approximate node height
      });
    });
    
    // Add edges to dagre graph
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });
    
    // Calculate layout
    dagre.layout(dagreGraph);
    
    // Apply calculated positions to nodes
    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          // Center the node on its calculated position
          x: nodeWithPosition.x - 125, // Half of node width
          y: nodeWithPosition.y - 50,  // Half of node height
        },
      };
    });
    
    setNodes(layoutedNodes);
    
    toast({
      title: "Auto Layout Applied",
      description: "Nodes arranged in hierarchical flow from top to bottom",
    });
  }, [nodes, edges, setNodes, toast]);

  const handleDisconnectFromTemplate = () => {
    // Just hide the banner - no backend changes
    setLoadedTemplateMetadata(null);
  };

  // Validate workflow when nodes or edges change
  useEffect(() => {
    const issues = validateWorkflow(nodes, edges);
    setLintIssues(issues);
    if (issues.length > 0 && !showLintPanel) {
      setShowLintPanel(true);
    }
  }, [nodes, edges, showLintPanel]);

  // Handle inline node updates
  useEffect(() => {
    const handleNodeUpdate = (event: CustomEvent) => {
      const { id, updates } = event.detail;
      onUpdateNode(id, updates);
    };
    window.addEventListener('node-update' as any, handleNodeUpdate);
    return () => window.removeEventListener('node-update' as any, handleNodeUpdate);
  }, [onUpdateNode]);

  // Undo/Redo handlers
  const onUndo = useCallback(() => {
    const result = history.undo();
    if (result) {
      setNodes(result.nodes as Node<WorkflowNodeData>[]);
      setEdges(result.edges);
      toast({
        title: "Action Undone",
        description: "Previous action has been undone",
      });
    }
  }, [history, setNodes, setEdges, toast]);

  const onRedo = useCallback(() => {
    const result = history.redo();
    if (result) {
      setNodes(result.nodes as Node<WorkflowNodeData>[]);
      setEdges(result.edges);
      toast({
        title: "Action Redone",
        description: "Action has been redone",
      });
    }
  }, [history, setNodes, setEdges, toast]);

  // Keyboard shortcuts
  const shortcuts = [
    { key: 's', ctrlKey: true, action: onSave, description: 'Save workflow' },
    { key: 'z', ctrlKey: true, action: onUndo, description: 'Undo' },
    { key: 'y', ctrlKey: true, action: onRedo, description: 'Redo' },
    { key: 'Delete', action: () => selectedNode && onNodesDelete([selectedNode]), description: 'Delete node' },
    { key: 'Escape', action: () => { setSelectedNode(null); setIsPropertiesPanelOpen(false); }, description: 'Deselect' },
  ];
  useKeyboardShortcuts(shortcuts);

  // Handle panel resize
  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 300 && newWidth <= 800) {
        setPanelWidth(newWidth);
      }
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleFocusNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setIsPropertiesPanelOpen(true);
    }
  };

  const handleFocusEdge = (edgeId: string) => {
    console.log('Focus edge:', edgeId);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading workflow...</p>
          </div>
        </div>
      )}
      
      {loadedTemplateMetadata && (
        <TemplateMetadataBanner 
          metadata={loadedTemplateMetadata}
          onDisconnectFromTemplate={handleDisconnectFromTemplate}
        />
      )}
      
      {/* Draft Indicator Banner */}
      {hasDraft && !workflowId && (
        <div className="bg-amber-50 border-amber-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
              📝 Draft
            </Badge>
            <span className="text-sm text-amber-800">
              Unsaved changes are stored locally. Click Save to persist to database.
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearDraft}
            className="text-amber-700 hover:text-amber-900 hover:bg-amber-100"
          >
            Clear Draft
          </Button>
        </div>
      )}
      
      {/* Top: Toolbar */}
      <div className="flex-shrink-0">
        <WorkflowToolbar
          onSave={onSave}
          onImport={() => setShowImportDialog(true)}
          onSimulate={onSimulate}
          onExport={onExport}
          onReset={onReset}
          onAutoLayout={onAutoLayout}
          onGenerateAI={() => setShowAIGenerator(true)}
          templateName={loadedTemplateMetadata?.name}
          templateVersion={loadedTemplateMetadata?.version}
          canUndo={history.canUndo}
          canRedo={history.canRedo}
          onUndo={onUndo}
          onRedo={onRedo}
          autoSaveEnabled={autoSaveEnabled}
          onAutoSaveToggle={workflowId ? setAutoSaveEnabled : undefined}
        />
      </div>

      {/* Workflow KPIs - Horizontal Panel */}
      <div className="flex-shrink-0 transition-all duration-300">
        <div className="flex items-center justify-between px-4 py-2">
          <h3 className="text-sm font-semibold text-gray-700">Workflow Statistics</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsKpiPanelCollapsed(!isKpiPanelCollapsed)}
            title={isKpiPanelCollapsed ? "Expand Statistics" : "Collapse Statistics"}
          >
            {isKpiPanelCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronRight className="h-4 w-4 rotate-90" />}
          </Button>
        </div>
        {!isKpiPanelCollapsed && (
          <div className="p-4 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-4 gap-4">
              <WorkflowStats nodes={nodes} edges={edges} />
            </div>
          </div>
        )}
      </div>
      
      {/* Middle: Sidebar + Canvas - Fixed height calculation */}
      <div className="flex bg-gray-50" style={{ height: 'calc(100vh - 280px)' }}>
        {/* Left Sidebar - Node Palette */}
        <div 
          className="border-r bg-white flex flex-col transition-all duration-300"
          style={{ width: isNodePaletteCollapsed ? '48px' : '320px' }}
        >
          {/* Fixed header section */}
          <div className="p-2 flex-shrink-0 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsNodePaletteCollapsed(!isNodePaletteCollapsed)}
              title={isNodePaletteCollapsed ? "Expand Node Palette" : "Collapse Node Palette"}
            >
              {isNodePaletteCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            {!isNodePaletteCollapsed && (
              <h3 className="font-semibold text-sm">Workflow Steps</h3>
            )}
          </div>
          
          {/* Scrollable content section */}
          {!isNodePaletteCollapsed && (
            <div className="flex-1 overflow-y-auto animate-in slide-in-from-left-2 duration-300">
              <div className="p-4">
                <NodePalette onAddNode={onAddNode} />
              </div>
            </div>
          )}
        </div>
        
        {/* Canvas Area */}
        <div className="flex-1 overflow-hidden relative">
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div className="w-full h-full">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onNodesDelete={onNodesDelete}
                  onConnect={onConnect}
                  onNodeClick={onNodeClick}
                  onEdgeClick={onEdgeClick}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  fitView
                  deleteKeyCode={['Delete', 'Backspace']}
                >
                  <Controls />
                  <MiniMap 
                    className="!absolute !bottom-4 !right-4 !z-10"
                    nodeStrokeWidth={3}
                    pannable
                    zoomable
                  />
                  <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                  {swimlanes.length > 0 && (
                    <Swimlanes lanes={swimlanes} width={2000} height={1500} />
                  )}
                </ReactFlow>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              {selectedNode && (
                <>
                  <ContextMenuItem onClick={() => setIsPropertiesPanelOpen(true)}>
                    ✏️ Edit Node
                  </ContextMenuItem>
                  {selectedNode.data.stepType !== 'trigger.start' && selectedNode.data.stepType !== 'trigger.end' && (
                    <>
                      <ContextMenuItem onClick={() => onDuplicateNode(selectedNode.id)}>
                        📄 Duplicate Node
                      </ContextMenuItem>
                      <ContextMenuItem 
                        onClick={() => onDeleteNode(selectedNode.id)}
                        className="text-red-600"
                      >
                        🗑️ Delete Node
                      </ContextMenuItem>
                    </>
                  )}
                </>
              )}
            </ContextMenuContent>
          </ContextMenu>
        </div>
        
        {/* Right Sidebar - Properties Panel */}
        <div 
          className="bg-white border-l relative flex flex-col"
          style={{ width: isPropertiesPanelOpen ? `${panelWidth}px` : '48px' }}
        >
          {/* Resize Handle */}
          {isPropertiesPanelOpen && (
            <div
              className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
              onMouseDown={handleMouseDown}
              style={{ zIndex: 10 }}
            />
          )}
          
          <div className="flex items-center justify-between p-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPropertiesPanelOpen(!isPropertiesPanelOpen)}
            >
              {isPropertiesPanelOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            {isPropertiesPanelOpen && (
              <span className="text-sm font-medium">Properties</span>
            )}
          </div>
          
          {isPropertiesPanelOpen && (
            <div className="flex-1 overflow-y-auto">
              <NodePropertiesPanel 
                selectedNode={selectedNode} 
                onUpdateNode={onUpdateNode}
                onClose={() => {
                  setIsPropertiesPanelOpen(false);
                  setSelectedNode(null);
                }}
                workflowMetadata={workflowMetadata}
                nodes={nodes}
                edges={edges}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom: Footer and LintPanel */}
      <div className="flex-shrink-0">
        <WorkflowFooter 
          nodes={nodes} 
          edges={edges} 
          lastSaved={lastSaved}
          isSaving={isSaving}
        />
        
        {showLintPanel && (
          <LintPanel
            issues={lintIssues}
            isVisible={showLintPanel}
            onClose={() => setShowLintPanel(false)}
            onFocusNode={handleFocusNode}
            onFocusEdge={handleFocusEdge}
          />
        )}
      </div>

      <SaveWorkflowModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveWorkflow}
        currentWorkflow={currentWorkflowData}
        isSaving={isSaving}
        workflowMetadata={workflowMetadata}
      />

      <ImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={handleImportWorkflow}
      />

      <AIWorkflowGenerator
        open={showAIGenerator}
        existingNodes={nodes}
        existingEdges={edges}
        onGenerate={handleAIGenerate}
        onClose={() => setShowAIGenerator(false)}
      />

      <EdgeEditor
        edge={selectedEdge}
        isOpen={showEdgeEditor}
        onClose={() => {
          setShowEdgeEditor(false);
          setSelectedEdge(null);
        }}
        onUpdate={(edgeId, data) => {
          setEdges((eds) =>
            eds.map((e) =>
              e.id === edgeId ? { ...e, data: { ...e.data, ...data } } : e
            )
          );
        }}
        onDelete={(edgeId) => {
          setEdges((eds) => eds.filter((e) => e.id !== edgeId));
          setShowEdgeEditor(false);
          setSelectedEdge(null);
        }}
      />
    </div>
  );
};
