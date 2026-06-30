"use client"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CanvasDesigner } from '@/components/workflows/designer/CanvasDesigner';
import LinearBuilder from '@/components/workflows/designer/LinearBuilder';
import { QuickStartDialog } from '@/components/workflows/designer/QuickStartDialog';
import { WorkflowMetadataBar } from '@/components/workflows/designer/WorkflowMetadataBar';
import { EventTriggerConfigDialog, EventTriggerConfig } from '@/components/workflows/designer/EventTriggerConfigDialog';
import { DesignerEmptyState } from '@/components/workflows/designer/DesignerEmptyState';
import { DesignerBreadcrumb } from '@/components/workflows/designer/DesignerBreadcrumb';
import { CloseConfirmationDialog } from '@/components/workflows/designer/CloseConfirmationDialog';
import { DraftConflictDialog } from '@/components/workflows/designer/DraftConflictDialog';
import WorkflowMonitoring from '@/components/workflows/monitoring/WorkflowMonitoring';
import WorkflowSimulator from '@/components/workflows/simulator/WorkflowSimulator';
import WorkflowTemplates from '@/components/workflows/templates/WorkflowTemplates';
import WorkflowCatalog from '@/components/workflows/WorkflowCatalog';
import WorkflowsAnalyticsDashboard from '@/components/workflows/WorkflowsAnalyticsDashboard';
import PageHeader from '@/components/shared/PageHeader';
import { RunWorkflowDialog } from '@/components/workflows/RunWorkflowDialog';
import { mockWorkflows, Workflow } from '@/data/mock-workflows';
import { useToast } from '@/hooks/use-toast';
import { workflowApi } from '@/services/workflowApi';
import {
  AlertTriangle, BarChart3, Eye, Grid3X3, LayoutGrid,
  List, Settings, Shield, Sparkles, TrendingUp, UserCheck,
  Wrench, Zap,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import StandardTabs from '@/components/shared/StandardTabs';
import IconTabs from '@/components/shared/IconTabs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WorkflowTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  framework: string;
  complexity: 'simple' | 'medium' | 'complex';
  rating: number;
  downloads: number;
  tags: string[];
  steps: number;
  estimatedTime: string;
  complianceFrameworks: string[];
  version?: string;
  usageCount?: number;
}


export default function Page() {
  // ── Workflow list state ──────────────────────────────────────────────────
  const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);

  // ── Tab state ────────────────────────────────────────────────────────────
  const [primaryTab, setPrimaryTab] = useState('analytics');   // analytics | operations
  const [activeTab, setActiveTab] = useState('catalog');     // ops sub-tab

  // ── Designer state ───────────────────────────────────────────────────────
  const [designerMode, setDesignerMode] = useState<'canvas' | 'linear'>('canvas');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [loadedTemplate, setLoadedTemplate] = useState<WorkflowTemplate | null>(null);
  const [appContext, setAppContext] = useState<any>(null);
  const [designerState, setDesignerState] = useState<{
    mode: 'empty' | 'creating' | 'editing' | 'creating-template' | 'editing-template';
    workflowId?: string;
    workflowName?: string;
    templateMetadata?: any;
  }>({ mode: 'empty' });

  // ── Dialog / modal state ─────────────────────────────────────────────────
  const [showRunDialog, setShowRunDialog] = useState(false);
  const [workflowToRun, setWorkflowToRun] = useState<Workflow | null>(null);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [pendingCloseAction, setPendingCloseAction] = useState<'save' | 'discard' | null>(null);
  const [showDraftConflict, setShowDraftConflict] = useState(false);
  const [draftMetadata, setDraftMetadata] = useState<any>(null);
  const [showQuickStartDialog, setShowQuickStartDialog] = useState(false);
  const [showEventConfigDialog, setShowEventConfigDialog] = useState(false);

  // ── Auto-save / trigger refs (lifted) ───────────────────────────────────
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [triggerSaveModal, setTriggerSaveModal] = useState(false);
  const [triggerDirectSave, setTriggerDirectSave] = useState(false);
  const [triggerClearDraft, setTriggerClearDraft] = useState(false);

  // ── Simulation ───────────────────────────────────────────────────────────
  const [workflowForSimulation, setWorkflowForSimulation] = useState<any>(null);
  const [pendingWorkflowId, setPendingWorkflowId] = useState<string | null>(null);

  // ── Workflow metadata ────────────────────────────────────────────────────
  const [workflowMetadata, setWorkflowMetadata] = useState<{
    triggerType: 'manual' | 'event-based' | 'time-based';
    cronSchedule?: string;
    eventConfig?: EventTriggerConfig;
  }>({
    triggerType: 'manual',
    cronSchedule: '',
    eventConfig: { services: [], eventTypes: [] },
  });

  const { toast } = useToast();
  const searchParams = useSearchParams();

  // ── Sync selectedWorkflow → designerState + workflowMetadata ────────────
  useEffect(() => {
    if (selectedWorkflow) {
      setWorkflowMetadata({
        triggerType: selectedWorkflow.triggerType || 'manual',
        cronSchedule: selectedWorkflow.cronSchedule || '',
        eventConfig: selectedWorkflow.eventConfig || { services: [], eventTypes: [] },
      });
      setDesignerState({
        mode: 'editing',
        workflowId: selectedWorkflow.id,
        workflowName: selectedWorkflow.name,
      });
    } else {
      setWorkflowMetadata({
        triggerType: 'manual',
        cronSchedule: '',
        eventConfig: { services: [], eventTypes: [] },
      });
    }
  }, [selectedWorkflow]);

  // ── URL params + sessionStorage context ─────────────────────────────────
  useEffect(() => {
    const tab = searchParams.get('tab');
    const mode = searchParams.get('mode');

    if (tab) {
      if (['catalog', 'designer', 'simulator', 'monitoring', 'templates'].includes(tab)) {
        setPrimaryTab('operations');
        setActiveTab(tab);
      } else if (tab === 'analytics' || tab === 'operations') {
        setPrimaryTab(tab);
      }
    }

    if (mode === 'canvas' || mode === 'linear') {
      setDesignerMode(mode);
    }

    const openWorkflowId = sessionStorage.getItem('openWorkflowId');
    if (openWorkflowId) {
      sessionStorage.removeItem('openWorkflowId');
      setPendingWorkflowId(openWorkflowId);
    }

    loadWorkflows();

    const contextData = sessionStorage.getItem('workflowContext');
    if (contextData) {
      const context = JSON.parse(contextData);
      setAppContext(context);
      if (context.workflowType !== 'custom') {
        setLoadedTemplate(generateContextAwareTemplate(context));
      }
      sessionStorage.removeItem('workflowContext');
      toast({
        title: 'Context Loaded',
        description: `Designer loaded with ${context.appName} configuration`,
      });
    }
  }, [searchParams]);

  // ── Resolve pending workflow once list loads ─────────────────────────────
  useEffect(() => {
    if (pendingWorkflowId && workflows.length > 0 && !isLoadingWorkflows) {
      const wf = workflows.find(w => w.id === pendingWorkflowId);
      if (wf) {
        setSelectedWorkflow(wf);
        setLoadedTemplate(null);
        setPendingWorkflowId(null);
      }
    }
  }, [pendingWorkflowId, workflows, isLoadingWorkflows]);

  // ── API helpers ──────────────────────────────────────────────────────────

  const updateWorkflowStatus = (workflowId: string, newStatus: 'draft' | 'enabled' | 'archived') => {
    setWorkflows(prev => prev.map(wf => wf.id === workflowId ? { ...wf, status: newStatus } : wf));
  };

  const loadWorkflows = async () => {
    setIsLoadingWorkflows(true);
    try {
      const response = await workflowApi.getWorkflows();

      if (!response?.content || !Array.isArray(response.content)) {
        setWorkflows(mockWorkflows);
        return;
      }

      const parseStringToArray = (value: any): string[] => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') return value.split(/[\s,]+/).filter(Boolean);
        return [];
      };

      const mapStatus = (s: string): 'draft' | 'enabled' | 'archived' => {
        const u = s?.toUpperCase();
        if (u === 'ACTIVE') return 'enabled';
        if (u === 'DEPRECATED') return 'archived';
        return 'draft';
      };

      const apiWorkflows: Workflow[] = response.content.map((wf: any) => ({
        id: wf.id,
        name: wf.name || 'Untitled Workflow',
        description: wf.description || '',
        category: wf.category?.toLowerCase().replace(/_/g, '-') as any || 'access-request',
        status: mapStatus(wf.status),
        triggerType: wf.triggerType?.toLowerCase().replace(/_/g, '-') as any || 'manual',
        version: wf.version || '1.0',
        owner: wf.createdBy || 'System',
        tags: parseStringToArray(wf.tags),
        createdAt: wf.createdAt,
        updatedAt: wf.updatedAt,
        executionCount: wf.executionCount || 0,
        successRate: 100,
        avgExecutionTime: wf.averageCompletionTime ? `${wf.averageCompletionTime.toFixed(1)}h` : '0h',
        isTemplate: false,
        linkedApplications: parseStringToArray(wf.applicationScope),
        complianceFrameworks: parseStringToArray(wf.complianceFrameworks),
        riskScore: wf.riskScore || 0,
        roleSensitivity: wf.roleSensitivity?.toLowerCase() as any || 'low',
        policyCompliance: wf.policyCompliance?.toLowerCase() as any || 'compliant',
        applicationScope: parseStringToArray(wf.applicationScope),
        hasTimeLogic: wf.hasTimeLogic || false,
        hasSoDViolation: wf.hasSodViolation || false,
        versions: [{ version: wf.version || '1.0', createdAt: wf.createdAt, createdBy: wf.createdBy || 'System', isActive: true, changes: 'Initial version' }],
        currentVersion: wf.version || '1.0',
        nodes: Array.isArray(wf.nodes) ? wf.nodes : [],
        edges: Array.isArray(wf.edges) ? wf.edges : [],
        averageCompletionTime: wf.averageCompletionTime || 0,
        lastExecuted: wf.lastExecuted || wf.updatedAt,
        eventConfig: wf.eventConfig || { services: [], eventTypes: [] },
        cronSchedule: wf.cronSchedule || '',
        sourceTemplateId: wf.sourceTemplateId,
        templateMetadata: wf.templateMetadata,
        isConnectedToTemplate: wf.isConnectedToTemplate || false,
      }));

      setWorkflows([...apiWorkflows, ...mockWorkflows]);
    } catch (error) {
      toast({ title: 'Error Loading Workflows', description: (error as Error).message, variant: 'destructive' });
      setWorkflows(mockWorkflows);
    } finally {
      setIsLoadingWorkflows(false);
    }
  };

  // ── Context-aware template generation ───────────────────────────────────
  // (generateContextAwareTemplate, generateContextNodes, generateContextEdges,
  //  generateLinearSteps — all unchanged from your original, kept verbatim)

  const generateContextAwareTemplate = (context: any): WorkflowTemplate => ({
    id: `ctx-${context.appId}-${Date.now()}`,
    name: `${context.workflowType === 'standard' ? 'Standard' : 'High-Risk'} Access for ${context.appName}`,
    category: 'joiner-mover-leaver',
    description: `Auto-generated ${context.workflowType} workflow for ${context.appName}`,
    framework: 'NIST',
    complexity: context.workflowType === 'standard' ? 'medium' : 'complex',
    rating: 4.5,
    downloads: 0,
    tags: ['auto-generated', context.appType.toLowerCase(), context.workflowType],
    steps: context.workflowType === 'standard' ? 6 : 8,
    estimatedTime: context.workflowType === 'standard' ? '2-4 hours' : '1-3 days',
    complianceFrameworks: ['NIST', 'ISO 27001'],
    version: '1.0',
    usageCount: 0,
  });

  const generateContextNodes = (context: any) => {
    if (context.workflowType === 'standard') {
      return [
        { id: '1', type: 'workflowNode', position: { x: 250, y: 25 }, data: { label: `${context.appName} Access Request`, stepType: 'trigger', icon: Zap, risk: 'low' as const, description: `Access request trigger for ${context.appName}`, slaTimeout: 5, notifications: true, auditLog: true, metadata: { estimatedDuration: '5 minutes', complianceFramework: ['NIST'], auditTags: ['access-request', 'app-integration'], roleType: '🎯', realLifePurpose: 'Automatically triggers when a new access request is submitted for the application' } } },
        { id: '2', type: 'workflowNode', position: { x: 250, y: 150 }, data: { label: 'Manager Approval', stepType: 'approval', icon: Shield, risk: 'medium' as const, description: 'Direct manager approval required', approvers: ['direct_manager'], slaTimeout: 24, notifications: true, auditLog: true, metadata: { estimatedDuration: '2-4 hours', complianceFramework: ['NIST', 'ISO 27001'], auditTags: ['manager-approval', 'access-control'], roleType: '🧑‍💼', realLifePurpose: 'Ensures direct manager reviews and approves the access request' } } },
        { id: '3', type: 'workflowNode', position: { x: 250, y: 275 }, data: { label: `${context.appName} Provisioning`, stepType: 'provisioning', icon: UserCheck, risk: 'low' as const, description: `Provision access to ${context.appName}`, appTarget: context.appName, slaTimeout: 2, notifications: true, auditLog: true, metadata: { estimatedDuration: '10 minutes', complianceFramework: ['NIST'], auditTags: ['provisioning', 'app-integration'], roleType: '⚙️', realLifePurpose: 'Automatically provisions access to the application upon approval' } } },
      ];
    }
    return [
      { id: '1', type: 'workflowNode', position: { x: 250, y: 25 }, data: { label: `High-Risk ${context.appName} Request`, stepType: 'trigger', icon: AlertTriangle, risk: 'high' as const, description: `High-risk access request for ${context.appName}`, slaTimeout: 5, notifications: true, auditLog: true, metadata: { estimatedDuration: '5 minutes', complianceFramework: ['NIST'], auditTags: ['access-request', 'high-risk'], roleType: '🎯', realLifePurpose: 'Automatically triggers when a high-risk access request is submitted' } } },
      { id: '2', type: 'workflowNode', position: { x: 250, y: 150 }, data: { label: 'Security Team Review', stepType: 'approval', icon: Shield, risk: 'high' as const, description: 'Security team approval required', approvers: ['security_team'], slaTimeout: 48, notifications: true, auditLog: true, metadata: { estimatedDuration: '24-48 hours', complianceFramework: ['NIST', 'ISO 27001'], auditTags: ['security-review', 'access-control'], roleType: '🛡️', realLifePurpose: 'Ensures security team reviews and approves high-risk access requests' } } },
      { id: '3', type: 'workflowNode', position: { x: 250, y: 275 }, data: { label: 'SoD Evaluation', stepType: 'condition', icon: AlertTriangle, risk: 'high' as const, description: 'Segregation of duties conflict check', slaTimeout: 1, notifications: true, auditLog: true, metadata: { estimatedDuration: '1 hour', complianceFramework: ['SOX', 'ISO 27001'], auditTags: ['sod-check', 'compliance'], roleType: '⚠️', realLifePurpose: 'Checks for segregation of duties conflicts before provisioning access' } } },
      { id: '4', type: 'workflowNode', position: { x: 250, y: 400 }, data: { label: 'Manual Provisioning', stepType: 'provisioning', icon: UserCheck, risk: 'high' as const, description: `Manual provisioning for ${context.appName}`, appTarget: context.appName, slaTimeout: 4, notifications: true, auditLog: true, metadata: { estimatedDuration: '4 hours', complianceFramework: ['NIST'], auditTags: ['manual-provisioning', 'access-control'], roleType: '🧑‍💻', realLifePurpose: 'Requires manual provisioning by an administrator for high-risk access' } } },
    ];
  };

  const generateContextEdges = (context: any) =>
    context.workflowType === 'standard'
      ? [{ id: 'e1-2', source: '1', target: '2' }, { id: 'e2-3', source: '2', target: '3' }]
      : [{ id: 'e1-2', source: '1', target: '2' }, { id: 'e2-3', source: '2', target: '3' }, { id: 'e3-4', source: '3', target: '4' }];

  const generateLinearSteps = (context: any) => {
    if (context.workflowType === 'standard') {
      return [
        { id: '1', type: 'trigger' as const, name: `${context.appName} Access Request`, description: `Access request trigger for ${context.appName}`, config: { appId: context.appId, eventType: 'access_request' }, position: 0, conditions: ['request.status == "submitted"'], timeLogic: null, riskLevel: 'low' as const, metadata: { estimatedDuration: '5 minutes', complianceFramework: ['NIST'], auditTags: ['access-request'], roleType: '🎯', realLifePurpose: 'Automatically triggers when a new access request is submitted' } },
        { id: '2', type: 'approval' as const, name: 'Manager Approval', description: 'Direct manager approval required', config: { approverType: 'direct_manager', timeout: 24 }, position: 1, conditions: ['manager.exists == true'], timeLogic: null, riskLevel: 'medium' as const, metadata: { estimatedDuration: '2-4 hours', complianceFramework: ['NIST', 'ISO 27001'], auditTags: ['manager-approval'], roleType: '🧑‍💼', realLifePurpose: 'Ensures direct manager reviews and approves the access request' } },
        { id: '3', type: 'provisioning' as const, name: `${context.appName} Provisioning`, description: `Provision access to ${context.appName}`, config: { target: context.appName, action: 'grant_access' }, position: 2, conditions: ['approval.status == "approved"'], timeLogic: null, riskLevel: 'low' as const, metadata: { estimatedDuration: '10 minutes', complianceFramework: ['NIST'], auditTags: ['provisioning'], roleType: '⚙️', realLifePurpose: 'Automatically provisions access to the application upon approval' } },
      ];
    }
    return [
      { id: '1', type: 'trigger' as const, name: `High-Risk ${context.appName} Request`, description: `High-risk access request for ${context.appName}`, config: { appId: context.appId, eventType: 'high_risk_request' }, position: 0, conditions: ['request.risk_level == "high"'], timeLogic: null, riskLevel: 'high' as const, metadata: { estimatedDuration: '5 minutes', complianceFramework: ['NIST'], auditTags: ['access-request', 'high-risk'], roleType: '🎯', realLifePurpose: 'Automatically triggers when a high-risk access request is submitted' } },
      { id: '2', type: 'approval' as const, name: 'Security Team Review', description: 'Security team approval required', config: { approverType: 'security_team', timeout: 48 }, position: 1, conditions: ['security_team.available == true'], timeLogic: null, riskLevel: 'high' as const, metadata: { estimatedDuration: '24-48 hours', complianceFramework: ['NIST', 'ISO 27001'], auditTags: ['security-review'], roleType: '🛡️', realLifePurpose: 'Ensures security team reviews and approves high-risk access requests' } },
      { id: '3', type: 'condition' as const, name: 'SoD Evaluation', description: 'Segregation of duties conflict check', config: { checkType: 'sod_conflict', severity: 'blocking' }, position: 2, conditions: ['sod.conflicts == false'], timeLogic: null, riskLevel: 'high' as const, metadata: { estimatedDuration: '1 hour', complianceFramework: ['SOX', 'ISO 27001'], auditTags: ['sod-check'], roleType: '⚠️', realLifePurpose: 'Checks for segregation of duties conflicts before provisioning access' } },
      { id: '4', type: 'provisioning' as const, name: 'Manual Provisioning', description: `Manual provisioning for ${context.appName}`, config: { target: context.appName, action: 'manual_grant', approval_required: true }, position: 3, conditions: ['manual_approval.status == "approved"'], timeLogic: null, riskLevel: 'high' as const, metadata: { estimatedDuration: '4 hours', complianceFramework: ['NIST'], auditTags: ['manual-provisioning'], roleType: '🧑‍💻', realLifePurpose: 'Requires manual provisioning by an administrator for high-risk access' } },
    ];
  };

  // ── Handlers (all unchanged) ─────────────────────────────────────────────

  const handleCreateNew = () => {
    const draft = localStorage.getItem('workflow-draft');
    if (draft) {
      try {
        setDraftMetadata(JSON.parse(draft));
        setShowDraftConflict(true);
      } catch {
        localStorage.removeItem('workflow-draft');
        setShowQuickStartDialog(true);
      }
    } else {
      setShowQuickStartDialog(true);
    }
  };

  const handleQuickStartComplete = (triggerType: 'manual' | 'event-based' | 'time-based') => {
    setWorkflowMetadata({ triggerType, cronSchedule: '', eventConfig: { services: [], eventTypes: [] } });
    setLoadedTemplate(null);
    setSelectedWorkflow(null);
    setPrimaryTab('operations');
    setActiveTab('designer');
    setShowQuickStartDialog(false);
    setDesignerState({ mode: 'creating', workflowId: undefined, workflowName: 'New Workflow' });
    if (triggerType === 'event-based') setTimeout(() => setShowEventConfigDialog(true), 300);
    toast({ title: 'Workflow Designer Opened', description: `Configure your ${triggerType.replace('-', ' ')} workflow` });
  };

  const handleEventConfigSave = (config: EventTriggerConfig) => {
    setWorkflowMetadata(prev => ({ ...prev, eventConfig: config }));
    toast({ title: 'Event Configuration Saved', description: `${config.eventTypes.length} event(s) from ${config.services.length} service(s)` });
  };

  const handleEditWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setLoadedTemplate(null);
    setPrimaryTab('operations');
    setActiveTab('designer');
  };

  const handleRunWorkflow = (workflow: Workflow) => {
    setWorkflowToRun(workflow);
    setShowRunDialog(true);
  };

  const handleSimulateWorkflow = (workflow: Workflow, context?: any) => {
    setSelectedWorkflow(workflow);
    setPrimaryTab('operations');
    setActiveTab('simulator');
  };

  const handleTestWorkflow = (workflowData: any) => {
    setWorkflowForSimulation(workflowData);
    setPrimaryTab('operations');
    setActiveTab('simulator');
    toast({ title: 'Opening Simulator', description: `Preparing to simulate: ${workflowData.name}` });
  };

  const handleExecuteWorkflow = async (workflow: Workflow, context?: any) => {
    try {
      toast({ title: 'Starting Execution', description: `Executing workflow: ${workflow.name}...` });
      const result = await workflowApi.executeWorkflow(workflow.id, context);
      const executionId = result.data?.id || result.id || 'Unknown';
      const status = result.data?.status || result.status || 'RUNNING';
      toast({ title: 'Execution Started Successfully', description: `Execution ID: ${executionId} | Status: ${status}` });
      setPrimaryTab('operations');
      setActiveTab('monitoring');
    } catch (error) {
      toast({ title: 'Execution Failed', description: (error as Error).message || 'Failed to start workflow execution', variant: 'destructive' });
    }
  };

  const handleCloneWorkflow = (workflow: Workflow) => {
    toast({ title: 'Workflow Cloned', description: `${workflow.name} has been duplicated.` });
  };

  const handleSaveWorkflow = (workflowData: any) => {
    // Actual save handled by CanvasDesigner
  };

  const handleLoadTemplate = (template: WorkflowTemplate) => {
    setLoadedTemplate(template);
    setSelectedWorkflow(null);
    setPrimaryTab('operations');
    setActiveTab('designer');
    setDesignerState({ mode: 'creating', workflowId: undefined, workflowName: `${template.name} (from template)` });
    setTimeout(() => toast({ title: 'Template Loaded Successfully', description: `${template.name} (v${template.version}) is now ready for customization in the designer.` }), 500);
  };

  const handleCreateTemplate = (templateMetadata: any) => {
    setLoadedTemplate(null);
    setSelectedWorkflow(null);
    setPrimaryTab('operations');
    setActiveTab('designer');
    setDesignerState({ mode: 'creating-template', workflowId: undefined, workflowName: templateMetadata.name || 'New Template', templateMetadata });
    setTimeout(() => toast({ title: 'Template Designer Ready', description: 'Design your template workflow in the canvas.' }), 500);
  };

  const handleEditTemplate = (template: WorkflowTemplate) => {
    setLoadedTemplate(template);
    setSelectedWorkflow(null);
    setPrimaryTab('operations');
    setActiveTab('designer');
    setDesignerState({
      mode: 'editing-template',
      workflowId: template.id,
      workflowName: template.name,
      templateMetadata: { name: template.name, description: template.description, category: template.category, complexity: template.complexity, framework: template.framework, estimatedTime: template.estimatedTime, tags: template.tags, complianceFrameworks: template.complianceFrameworks },
    });
    setTimeout(() => toast({ title: 'Template Loaded', description: `Editing "${template.name}" in designer.` }), 500);
  };

  const handleCloseDesigner = () => setShowCloseConfirmation(true);

  const handleSaveAndClose = () => {
    setShowCloseConfirmation(false);
    setPendingCloseAction('save');
    if (designerState.workflowId) setTriggerDirectSave(true);
    else setTriggerSaveModal(true);
  };

  const handleDirectSaveComplete = () => {
    setTriggerDirectSave(false);
    if (pendingCloseAction === 'save') {
      setPendingCloseAction(null);
      setSelectedWorkflow(null);
      setLoadedTemplate(null);
      setDesignerState({ mode: 'empty' });
      setAutoSaveEnabled(false);
      toast({ title: 'Saved & Closed', description: 'Your workflow has been saved successfully.' });
    }
  };

  const handleDiscardAndClose = async () => {
    setShowCloseConfirmation(false);
    const isNewWorkflow = !designerState.workflowId;
    if (isNewWorkflow) {
      localStorage.removeItem('workflow-draft');
      setTriggerClearDraft(true);
      setWorkflowMetadata({ triggerType: 'manual', cronSchedule: '', eventConfig: { services: [], eventTypes: [] } });
    } else if (selectedWorkflow) {
      try { await workflowApi.getWorkflow(selectedWorkflow.id); } catch { /* ignore */ }
    }
    setSelectedWorkflow(null);
    setLoadedTemplate(null);
    setDesignerState({ mode: 'empty' });
    setAutoSaveEnabled(false);
    toast({ title: 'Designer Closed', description: 'Changes discarded. You can start fresh from the catalog.' });
  };

  const handleContinueDraft = () => {
    setShowDraftConflict(false);
    if (draftMetadata?.metadata) {
      setWorkflowMetadata({ triggerType: draftMetadata.metadata.triggerType || 'manual', cronSchedule: draftMetadata.metadata.cronSchedule || '', eventConfig: draftMetadata.metadata.eventConfig || { services: [], eventTypes: [] } });
    }
    setLoadedTemplate(null);
    setSelectedWorkflow(null);
    setPrimaryTab('operations');
    setActiveTab('designer');
    setDesignerState({ mode: 'creating', workflowId: undefined, workflowName: draftMetadata?.workflowName || 'New Workflow' });
    toast({ title: 'Draft Restored', description: 'Your previous work has been restored' });
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem('workflow-draft');
    setShowDraftConflict(false);
    setDraftMetadata(null);
    setShowQuickStartDialog(true);
    toast({ title: 'Draft Discarded', description: 'Starting with a fresh workflow' });
  };

  const handleWorkflowSaved = (workflow: any) => {
    if (pendingCloseAction === 'save') {
      setPendingCloseAction(null);
      setPrimaryTab('operations');
      setActiveTab('catalog');
      setSelectedWorkflow(null);
      setLoadedTemplate(null);
      setDesignerState({ mode: 'empty' });
      setWorkflowMetadata({ triggerType: 'manual', cronSchedule: '', eventConfig: { services: [], eventTypes: [] } });
      setAutoSaveEnabled(false);
      toast({ title: 'Saved & Closed', description: 'Your workflow has been saved successfully.' });
    }
  };

  const getTabBadgeCount = (tabType: string) => {
    switch (tabType) {
      case 'catalog': return workflows.length;
      case 'designer': return workflows.filter(w => w.status === 'draft').length;
      case 'monitoring': return workflows.filter(w => w.status === 'enabled').length;
      case 'templates': return 8;
      default: return 0;
    }
  };

  // ── Shared tab trigger styles ────────────────────────────────────────────
  const tabTriggerCls = "flex items-center gap-1.5 px-4 data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground";

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* ── Dialogs (portal, always mounted) ── */}
      <QuickStartDialog
        open={showQuickStartDialog}
        onOpenChange={setShowQuickStartDialog}
        onStart={handleQuickStartComplete}
      />
      <EventTriggerConfigDialog
        open={showEventConfigDialog}
        onOpenChange={setShowEventConfigDialog}
        currentConfig={workflowMetadata.eventConfig}
        onSave={handleEventConfigSave}
      />
      <RunWorkflowDialog
        open={showRunDialog}
        onClose={() => setShowRunDialog(false)}
        workflow={workflowToRun}
        onSimulate={handleSimulateWorkflow}
        onExecute={handleExecuteWorkflow}
      />
      <CloseConfirmationDialog
        open={showCloseConfirmation}
        onOpenChange={setShowCloseConfirmation}
        mode={designerState.mode as 'creating' | 'editing'}
        hasWorkflowId={!!designerState.workflowId}
        autoSaveEnabled={autoSaveEnabled}
        hasChanges={true}
        onSaveAndClose={handleSaveAndClose}
        onDiscardAndClose={handleDiscardAndClose}
      />
      <DraftConflictDialog
        open={showDraftConflict}
        draftMetadata={draftMetadata}
        onContinue={handleContinueDraft}
        onDiscard={handleDiscardDraft}
      />

      {/* ── Page Header (from Lovable) ── */}
      <div className="px-6 pt-5 pb-3">
        <PageHeader
          title="Lifecycle Automation Center"
          description="Orchestrate, monitor, and optimize identity governance workflows across the enterprise"
          icon={<Wrench className="h-5 w-5 text-primary" />}
          tooltip="Central hub for managing identity lifecycle workflows. Analytics provides strategic insights into automation maturity, execution health, and governance risks. Operations offers tools for designing, testing, and monitoring workflows."
        />
      </div>

      {/* ── Primary tabs: Analytics | Operations (from Lovable) ── */}
      <Tabs
        value={primaryTab}
        onValueChange={setPrimaryTab}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="px-6 py-2">
          <StandardTabs
            tabs={[
              { value: "analytics", label: "Analytics", icon: <TrendingUp className="h-4 w-4" /> },
              { value: "operations", label: "Operations", icon: <Wrench className="h-4 w-4" /> },
            ]}
            onValueChange={setPrimaryTab}
          />
        </div>

        <div className="flex-1 overflow-hidden">

          {/* Analytics tab — full WorkflowsAnalyticsDashboard */}
          <TabsContent value="analytics" className="h-full mt-0 overflow-auto">
            <WorkflowsAnalyticsDashboard />
          </TabsContent>

          {/* Operations tab — your existing ops sub-tabs */}
          <TabsContent value="operations" className="h-full mt-0 flex flex-col overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col overflow-hidden min-h-0"
            >
              {/* Ops sub-tab bar */}
              <div className="px-6 py-2 flex-shrink-0">
               <IconTabs
                    tabs={[
                      { value: "catalog", label: "Catalog", icon: LayoutGrid },
                      { value: "designer", label: "Designer", icon: Settings },
                      { value: "simulator", label: "Simulator", icon: Eye },
                      { value: "monitoring", label: "Monitoring", icon: BarChart3 },
                      { value: "templates", label: "Templates", icon: Sparkles },
                    ]}
                    columns={5}
                  />
              </div>

              {/* Ops sub-tab content */}
              <div className="flex-1 overflow-hidden min-h-0">

                {/* Catalog */}
                <TabsContent value="catalog" className="h-full overflow-auto p-6 m-0">
                  {isLoadingWorkflows ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading workflows...</p>
                      </div>
                    </div>
                  ) : (
                    <WorkflowCatalog
                      workflows={workflows}
                      onCreateNew={handleCreateNew}
                      onEditWorkflow={handleEditWorkflow}
                      onRunWorkflow={handleRunWorkflow}
                      onTestWorkflow={handleTestWorkflow}
                      onCloneWorkflow={handleCloneWorkflow}
                      onWorkflowsChange={loadWorkflows}
                      onStatusUpdate={updateWorkflowStatus}
                    />
                  )}
                </TabsContent>

                {/* Designer */}
                <TabsContent value="designer" className="h-full m-0 flex flex-col overflow-hidden min-h-0">
                  <DesignerBreadcrumb
                    mode={designerState.mode}
                    workflowName={designerState.workflowName}
                    isDraft={selectedWorkflow?.status === 'draft'}
                    onClose={handleCloseDesigner}
                  />

                  {designerState.mode === 'empty' ? (
                    <DesignerEmptyState
                      onCreateNew={handleCreateNew}
                      onOpenExisting={() => setActiveTab('catalog')}
                      onUseTemplate={() => setActiveTab('templates')}
                    />
                  ) : (
                    <>
                      {activeTab === 'designer' && (
                        <WorkflowMetadataBar
                          triggerType={workflowMetadata.triggerType}
                          cronSchedule={workflowMetadata.cronSchedule}
                          eventConfig={workflowMetadata.eventConfig}
                          onTriggerTypeChange={(triggerType) => {
                            setWorkflowMetadata(prev => ({ ...prev, triggerType }));
                            if (triggerType === 'event-based') setTimeout(() => setShowEventConfigDialog(true), 300);
                          }}
                          onCronScheduleChange={(cronSchedule) => setWorkflowMetadata(prev => ({ ...prev, cronSchedule }))}
                          onConfigureEvents={() => setShowEventConfigDialog(true)}
                        />
                      )}

                      <div className="flex justify-between items-center p-4 flex-shrink-0">
                        <div className="flex items-center gap-4">
                          <h2 className="text-lg font-semibold">Workflow Designer</h2>
                          {appContext && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Settings className="h-3 w-3" />
                              Linked to {appContext.appName}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-muted rounded-md p-1">
                            <Button
                              variant={designerMode === 'canvas' ? 'default' : 'ghost'}
                              size="sm"
                              onClick={() => setDesignerMode('canvas')}
                              className="flex items-center gap-2"
                            >
                              <Grid3X3 className="h-4 w-4" />
                              Canvas
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 overflow-hidden min-h-0">
                        {designerMode === 'canvas' ? (
                          <CanvasDesigner
                            designerMode={designerState.mode === 'empty' ? 'creating' : designerState.mode}
                            templateMetadata={designerState.templateMetadata}
                            templateData={loadedTemplate}
                            templateId={loadedTemplate?.id}
                            existingWorkflowId={designerState.mode === 'editing-template' ? designerState.workflowId : selectedWorkflow?.id}
                            existingWorkflow={selectedWorkflow}
                            onWorkflowSaved={(workflow) => {
                              if (designerState.mode === 'creating-template' || designerState.mode === 'editing-template') {
                                setPrimaryTab('operations');
                                setActiveTab('templates');
                                setDesignerState({ mode: 'empty' });
                                setLoadedTemplate(null);
                                setSelectedWorkflow(null);
                                toast({ title: 'Template Created', description: 'Your template has been saved successfully.' });
                              } else {
                                loadWorkflows();
                                handleWorkflowSaved(workflow);
                              }
                            }}
                            workflowMetadata={workflowMetadata}
                            onImportMetadata={(meta) => setWorkflowMetadata(prev => ({
                              triggerType: meta.triggerType || prev.triggerType,
                              cronSchedule: meta.cronSchedule || prev.cronSchedule || '',
                              eventConfig: meta.eventConfig || prev.eventConfig,
                            }))}
                            triggerSaveModal={triggerSaveModal}
                            onSaveModalTriggered={() => setTriggerSaveModal(false)}
                            triggerDirectSave={triggerDirectSave}
                            onDirectSaveComplete={handleDirectSaveComplete}
                            triggerClearDraft={triggerClearDraft}
                            onClearDraftComplete={() => setTriggerClearDraft(false)}
                            autoSaveEnabled={autoSaveEnabled}
                            onAutoSaveChange={setAutoSaveEnabled}
                            onTestWorkflow={handleTestWorkflow}
                          />
                        ) : (
                          <div className="p-6">
                            <LinearBuilder workflowId={selectedWorkflow?.id} onSave={handleSaveWorkflow} />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </TabsContent>

                {/* Simulator */}
                <TabsContent value="simulator" className="h-full overflow-auto p-6 m-0">
                  <div className="bg-card rounded-lg shadow-sm h-full">
                    <div className="p-6">
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">Workflow Simulator</h2>
                        <p className="text-sm text-muted-foreground">
                          Test workflows with sample identities, see execution paths, timing, SoD violations, and risk predictions
                        </p>
                      </div>
                      <WorkflowSimulator
                        workflow={workflowForSimulation || selectedWorkflow}
                        workflows={workflows}
                        onWorkflowSelect={(workflow) => {
                          setWorkflowForSimulation(workflow);
                          setSelectedWorkflow(workflow);
                        }}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Monitoring */}
                <TabsContent value="monitoring" className="h-full overflow-auto p-6 m-0">
                  <div className="h-full">
                    <div>
                      {/* <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">📈 Workflow Monitoring & Audit</h2>
                        <p className="text-sm text-muted-foreground">
                          Track workflow executions, performance metrics, SLA breaches, and audit trails
                        </p>
                      </div> */}
                      <WorkflowMonitoring />
                    </div>
                  </div>
                </TabsContent>

                {/* Templates */}
                <TabsContent value="templates" className="h-full overflow-auto p-6 m-0">
                  <div className="h-full">
                    <div>
                      <WorkflowTemplates
                        onLoadTemplate={handleLoadTemplate}
                        onCreateTemplate={handleCreateTemplate}
                        onEditTemplate={handleEditTemplate}
                      />
                    </div>
                  </div>
                </TabsContent>

              </div>
            </Tabs>
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
}