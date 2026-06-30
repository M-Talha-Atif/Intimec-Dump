import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Search, Download, Eye, Plus, Users, Shield,
  CheckCircle, XCircle, AlertTriangle, Zap,
  Clock, Settings, Award, Star, Sparkles, UserCheck, Mail, Lock, Pencil, Trash2,
  FileText, Workflow, GitBranch, Key, Database, Cloud, Layers, Target,
  FileCheck, UserPlus, UserMinus, BarChart, ShieldCheck, Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CreateTemplateModal } from './CreateTemplateModal';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { WorkflowNodeData } from '@/types/workflow';
import { workflowApi } from '@/services/workflowApi';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkflowTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  framework: string;
  complexity: 'SIMPLE' | 'MEDIUM' | 'COMPLEX';
  rating: number;
  downloads: number;
  tags: string[];
  steps: number;
  estimatedTime: string;
  complianceFrameworks: string[];
  version: string;
  usageCount: number;
  isSystemTemplate?: boolean; // New field to distinguish system vs user templates
  // Template execution data
  nodes?: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: WorkflowNodeData;
  }>;
  edges?: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
  }>;
  linearSteps?: any[];
}

interface WorkflowTemplatesProps {
  onLoadTemplate?: (template: WorkflowTemplate) => void;
  onCreateTemplate?: (templateMetadata: any) => void;
  onEditTemplate?: (template: WorkflowTemplate) => void;
}

const WorkflowTemplates: React.FC<WorkflowTemplatesProps> = ({ onLoadTemplate, onCreateTemplate, onEditTemplate }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'system' | 'user'>('system');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [selectedComplexity, setSelectedComplexity] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkflowTemplate | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<WorkflowTemplate | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Separate state for system and user templates
  const [systemTemplates, setSystemTemplates] = useState<WorkflowTemplate[]>([]);
  const [userTemplates, setUserTemplates] = useState<WorkflowTemplate[]>([]);
  const [isLoadingSystem, setIsLoadingSystem] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  // Load templates from backend
  useEffect(() => {
    loadSystemTemplates();
    loadUserTemplates();
  }, []);

  const loadSystemTemplates = async () => {
    setIsLoadingSystem(true);
    try {
      const response = await workflowApi.listTemplates(true); // systemOnly=true
      console.log('System templates response:', response);

      // Handle both direct array response and wrapped response
      const templates = Array.isArray(response) ? response : (response.data || []);

      if (templates.length > 0) {
        setSystemTemplates(templates.map((t: any) => ({
          ...t,
          isSystemTemplate: true,
          complexity: t.complexity || 'MEDIUM', // Keep uppercase for backend compatibility
        })));
      } else {
        // No system templates found, load mock data
        loadMockSystemTemplates();
      }
    } catch (error: any) {
      console.error('Failed to load system templates:', error);
      toast({
        title: 'Info',
        description: 'Using mock templates for demonstration',
      });
      // Load mock templates as fallback
      loadMockSystemTemplates();
    } finally {
      setIsLoadingSystem(false);
    }
  };

  const loadUserTemplates = async () => {
    setIsLoadingUser(true);
    try {
      const response = await workflowApi.listTemplates(false); // systemOnly=false
      console.log('User templates response:', response);
      console.log('User templates response type:', typeof response, Array.isArray(response));

      // Handle both direct array response and wrapped response
      const allTemplates = Array.isArray(response) ? response : (response.data || []);
      console.log('All templates extracted:', allTemplates.length, 'templates');
      const templates = allTemplates.filter((t: any) => !t.isSystemTemplate);
      console.log('User templates after filtering:', templates.length, 'templates');

      if (templates.length > 0) {
        console.log('First user template sample:', JSON.stringify(templates[0], null, 2));
        setUserTemplates(templates.map((t: any) => ({
          ...t,
          isSystemTemplate: false,
          complexity: t.complexity || 'MEDIUM', // Keep uppercase for backend compatibility
        })));
      } else {
        // No user templates found, load mock data
        loadMockUserTemplates();
      }
    } catch (error: any) {
      console.error('Failed to load user templates:', error);
      toast({
        title: 'Info',
        description: 'Using mock templates for demonstration',
      });
      // Load mock templates as fallback
      loadMockUserTemplates();
    } finally {
      setIsLoadingUser(false);
    }
  };

  const loadMockSystemTemplates = () => {
    // For now, system templates come from backend
    // If needed, add mock system templates here
    setSystemTemplates([]);
  };

  const loadMockUserTemplates = () => {
    // Keep original mock templates as user templates for demonstration
    setUserTemplates([
      {
        id: 'tpl-001',
        name: 'Standard Employee Onboarding',
        category: 'joiner-mover-leaver',
        description: 'NIST-compliant new hire provisioning workflow with automated role assignment',
        framework: 'NIST',
        complexity: 'MEDIUM',
        rating: 4.8,
        downloads: 342,
        tags: ['onboarding', 'nist', 'automation', 'roles'],
        steps: 8,
        estimatedTime: '2-4 hours',
        complianceFrameworks: ['NIST', 'ISO 27001'],
        version: '2.1',
        usageCount: 142,
        isSystemTemplate: false,
        nodes: [
          {
            id: '1',
            type: 'workflowNode',
            position: { x: 250, y: 25 },
            data: {
              label: 'HR System Trigger',
              stepType: 'trigger',
              icon: Zap,
              risk: 'low' as const,
              description: 'Detects new employee in HR system',
              slaTimeout: 5,
              notifications: true,
              auditLog: true,
              metadata: {
                estimatedDuration: '5 minutes',
                complianceFramework: ['NIST'],
                auditTags: ['hr-integration', 'employee-onboarding'],
                roleType: '🎯',
                realLifePurpose: 'Automatically detects when a new employee is added to the HR system and triggers the onboarding workflow'
              }
            },
          },
          {
            id: '2',
            type: 'workflowNode',
            position: { x: 250, y: 150 },
            data: {
              label: 'Manager Approval',
              stepType: 'approval',
              icon: Shield,
              risk: 'medium' as const,
              description: 'Direct manager approves access requirements',
              approvers: ['direct_manager'],
              slaTimeout: 24,
              notifications: true,
              auditLog: true,
              metadata: {
                estimatedDuration: '2-4 hours',
                complianceFramework: ['NIST', 'ISO 27001'],
                auditTags: ['manager-approval', 'access-control'],
                roleType: '🧑‍💼',
                realLifePurpose: 'Ensures direct manager reviews and approves the access requirements for new employee'
              }
            },
          },
          {
            id: '3',
            type: 'workflowNode',
            position: { x: 250, y: 275 },
            data: {
              label: 'AD Account Creation',
              stepType: 'provisioning',
              icon: UserCheck,
              risk: 'low' as const,
              description: 'Create Active Directory account',
              appTarget: 'active-directory',
              slaTimeout: 2,
              notifications: true,
              auditLog: true,
              metadata: {
                estimatedDuration: '10 minutes',
                complianceFramework: ['NIST'],
                auditTags: ['account-creation', 'active-directory'],
                roleType: '⚙️',
                realLifePurpose: 'Automatically creates Active Directory account with appropriate group memberships'
              }
            },
          }
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' }
        ],
        linearSteps: [
          {
            id: '1',
            type: 'trigger',
            name: 'HR System Trigger',
            description: 'Detects new employee in HR system',
            config: { hrSystem: 'workday', eventType: 'employee_create' },
            position: 0,
            conditions: ['employee.status == "active"'],
            timeLogic: null,
            riskLevel: 'low',
            metadata: {
              estimatedDuration: '5 minutes',
              complianceFramework: ['NIST'],
              auditTags: ['hr-integration'],
              roleType: '🎯',
              realLifePurpose: 'Automatically detects new employee additions'
            }
          },
          {
            id: '2',
            type: 'approval',
            name: 'Manager Approval',
            description: 'Direct manager approves access requirements',
            config: { approverType: 'direct_manager', timeout: 24 },
            position: 1,
            conditions: [],
            timeLogic: 'business_hours_only',
            riskLevel: 'medium',
            metadata: {
              estimatedDuration: '2-4 hours',
              complianceFramework: ['NIST', 'ISO 27001'],
              auditTags: ['manager-approval'],
              roleType: '🧑‍💼',
              realLifePurpose: 'Ensures proper authorization before access provisioning'
            }
          },
          {
            id: '3',
            type: 'provisioning',
            name: 'AD Account Creation',
            description: 'Create Active Directory account',
            config: { target: 'active-directory', action: 'create_account' },
            position: 2,
            conditions: ['approval.status == "approved"'],
            timeLogic: null,
            riskLevel: 'low',
            metadata: {
              estimatedDuration: '10 minutes',
              complianceFramework: ['NIST'],
              auditTags: ['account-creation'],
              roleType: '⚙️',
              realLifePurpose: 'Creates user account with appropriate permissions'
            }
          }
        ]
      },
      {
        id: 'tpl-002',
        name: 'SoD Conflict Resolution',
        category: 'access-request',
        description: 'ISO 27001 segregation of duties workflow with risk assessment',
        framework: 'ISO 27001',
        complexity: 'complex',
        rating: 4.6,
        downloads: 198,
        tags: ['sod', 'iso27001', 'risk', 'approval'],
        steps: 12,
        estimatedTime: '4-8 hours',
        complianceFrameworks: ['ISO 27001', 'SOX'],
        version: '1.8',
        usageCount: 87,
        nodes: [],
        edges: [],
        linearSteps: []
      },
      {
        id: 'tpl-003',
        name: 'Emergency Access Provisioning',
        category: 'exception',
        description: 'Fast-track access provisioning for emergency situations with audit trail',
        framework: 'Custom',
        complexity: 'simple',
        rating: 4.9,
        downloads: 267,
        tags: ['emergency', 'fast-track', 'audit'],
        steps: 5,
        estimatedTime: '15-30 minutes',
        complianceFrameworks: ['SOX', 'GDPR'],
        version: '3.0',
        usageCount: 201,
        nodes: [],
        edges: [],
        linearSteps: []
      },
      {
        id: 'tpl-004',
        name: 'Quarterly Access Certification',
        category: 'certification',
        description: 'Automated quarterly access review campaign with manager notifications',
        framework: 'SOX',
        complexity: 'medium',
        rating: 4.5,
        downloads: 156,
        tags: ['certification', 'quarterly', 'sox', 'managers'],
        steps: 10,
        estimatedTime: '1-2 weeks',
        complianceFrameworks: ['SOX', 'NIST'],
        version: '1.5',
        usageCount: 76,
        nodes: [],
        edges: [],
        linearSteps: []
      },
      {
        id: 'tpl-005',
        name: 'AI-Powered Risk Assessment',
        category: 'ai-risk',
        description: 'Machine learning workflow for dynamic risk evaluation and access decisions',
        framework: 'Custom',
        complexity: 'complex',
        rating: 4.7,
        downloads: 89,
        tags: ['ai', 'ml', 'risk', 'dynamic'],
        steps: 15,
        estimatedTime: '1-3 hours',
        complianceFrameworks: ['NIST', 'Custom'],
        version: '2.3',
        usageCount: 34,
        nodes: [],
        edges: [],
        linearSteps: []
      },
      {
        id: 'tpl-006',
        name: 'Contractor Access Lifecycle',
        category: 'joiner-mover-leaver',
        description: 'Time-limited access workflow for external contractors with auto-expiration',
        framework: 'NIST',
        complexity: 'medium',
        rating: 4.4,
        downloads: 203,
        tags: ['contractor', 'time-limited', 'external'],
        steps: 9,
        estimatedTime: '1-2 hours',
        complianceFrameworks: ['NIST', 'ISO 27001'],
        version: '1.9',
        usageCount: 98,
        nodes: [],
        edges: [],
        linearSteps: []
      },
      {
        id: 'tpl-007',
        name: 'Privileged Access Review',
        category: 'certification',
        description: 'Enhanced review process for privileged accounts with CISO approval',
        framework: 'NIST',
        complexity: 'complex',
        rating: 4.8,
        downloads: 145,
        tags: ['privileged', 'ciso', 'enhanced'],
        steps: 14,
        estimatedTime: '2-5 days',
        complianceFrameworks: ['NIST', 'SOX', 'ISO 27001'],
        version: '2.0',
        usageCount: 67,
        nodes: [],
        edges: [],
        linearSteps: []
      },
      {
        id: 'tpl-008',
        name: 'Automated Deprovisioning',
        category: 'revocation',
        description: 'Complete access removal workflow triggered by HR termination events',
        framework: 'ISO 27001',
        complexity: 'simple',
        rating: 4.9,
        downloads: 298,
        tags: ['deprovisioning', 'termination', 'hr-integration'],
        steps: 6,
        estimatedTime: '30-60 minutes',
        complianceFrameworks: ['ISO 27001', 'GDPR'],
        version: '1.7',
        usageCount: 189,
        nodes: [],
        edges: [],
        linearSteps: []
      }
    ]);
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'joiner-mover-leaver': UserPlus,
      'joiner': UserPlus,
      'mover': UserCheck,
      'leaver': UserMinus,
      'access-request': Key,
      'access': Key,
      'certification': FileCheck,
      'recertification': Award,
      'revocation': XCircle,
      'exception': AlertTriangle,
      'ai-risk': Zap,
      'ai': Activity,
      'risk-assessment': BarChart,
      'risk': Target,
      'compliance': ShieldCheck,
      'approval': CheckCircle,
      'workflow': Workflow,
      'automation': GitBranch,
      'provisioning': Database,
      'deprovisioning': Cloud,
      'integration': Layers,
      'identity': Users,
      'security': Shield,
      'governance': Lock,
      'audit': FileText,
      // Add mappings for system template categories
      'role': Award,
      'permission': ShieldCheck,
      'management': Settings,
      'user': Users,
      'assignment': CheckCircle,
      'policy': FileCheck
    };

    // Try exact match first
    const lowerCategory = category?.toLowerCase() || '';
    for (const [key, icon] of Object.entries(icons)) {
      if (lowerCategory.includes(key)) {
        return icon;
      }
    }

    // Default icon
    return Workflow;
  };

  const getCategoryIconColor = (category: string) => {
    const colors = {
      'joiner-mover-leaver': { bg: 'bg-green-50', text: 'text-green-600' },
      'joiner': { bg: 'bg-emerald-50', text: 'text-emerald-600' },
      'mover': { bg: 'bg-cyan-50', text: 'text-cyan-600' },
      'leaver': { bg: 'bg-orange-50', text: 'text-orange-600' },
      'access-request': { bg: 'bg-purple-50', text: 'text-purple-600' },
      'access': { bg: 'bg-indigo-50', text: 'text-indigo-600' },
      'certification': { bg: 'bg-teal-50', text: 'text-teal-600' },
      'recertification': { bg: 'bg-sky-50', text: 'text-sky-600' },
      'revocation': { bg: 'bg-red-50', text: 'text-red-600' },
      'exception': { bg: 'bg-amber-50', text: 'text-amber-600' },
      'ai-risk': { bg: 'bg-violet-50', text: 'text-violet-600' },
      'ai': { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600' },
      'risk-assessment': { bg: 'bg-rose-50', text: 'text-rose-600' },
      'risk': { bg: 'bg-pink-50', text: 'text-pink-600' },
      'compliance': { bg: 'bg-blue-50', text: 'text-blue-600' },
      'approval': { bg: 'bg-lime-50', text: 'text-lime-700' },
      'workflow': { bg: 'bg-slate-50', text: 'text-slate-600' },
      'automation': { bg: 'bg-zinc-50', text: 'text-zinc-600' },
      'provisioning': { bg: 'bg-stone-50', text: 'text-stone-600' },
      'deprovisioning': { bg: 'bg-neutral-50', text: 'text-neutral-600' },
      'integration': { bg: 'bg-gray-50', text: 'text-gray-600' },
      'identity': { bg: 'bg-blue-50', text: 'text-blue-700' },
      'security': { bg: 'bg-red-50', text: 'text-red-700' },
      'governance': { bg: 'bg-indigo-50', text: 'text-indigo-700' },
      'audit': { bg: 'bg-yellow-50', text: 'text-yellow-700' },
      // Add colors for system template categories
      'role': { bg: 'bg-amber-50', text: 'text-amber-600' },
      'permission': { bg: 'bg-blue-50', text: 'text-blue-700' },
      'management': { bg: 'bg-gray-50', text: 'text-gray-700' },
      'user': { bg: 'bg-cyan-50', text: 'text-cyan-600' },
      'assignment': { bg: 'bg-green-50', text: 'text-green-600' },
      'policy': { bg: 'bg-indigo-50', text: 'text-indigo-600' }
    };

    // Try to match category
    const lowerCategory = category?.toLowerCase() || '';
    for (const [key, color] of Object.entries(colors)) {
      if (lowerCategory.includes(key)) {
        return color;
      }
    }

    // Default color
    return { bg: 'bg-blue-50', text: 'text-blue-600' };
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'complex': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Get current templates based on active tab
  const currentTemplates = activeTab === 'system' ? systemTemplates : userTemplates;
  const isLoading = activeTab === 'system' ? isLoadingSystem : isLoadingUser;

  // Helper function to get similar templates
  const getSimilarTemplates = useCallback((template: WorkflowTemplate, templatesArray: WorkflowTemplate[]) => {
    return templatesArray
      .filter(t =>
        t.id !== template.id &&
        (t.category === template.category ||
          t.framework === template.framework ||
          t.tags.some(tag => template.tags.includes(tag)))
      )
      .slice(0, 3);
  }, []);

  // Filter templates based on search and filter criteria
  const safeFilteredTemplates = useMemo(() => {
    const templates = currentTemplates || [];
    return templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (template.tags && template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesFramework = selectedFramework === 'all' || template.framework === selectedFramework;
      const matchesComplexity = selectedComplexity === 'all' || template.complexity === selectedComplexity;

      return matchesSearch && matchesCategory && matchesFramework && matchesComplexity;
    });
  }, [currentTemplates, searchTerm, selectedCategory, selectedFramework, selectedComplexity, activeTab, systemTemplates, userTemplates]);

  const handleUseTemplate = async (template: WorkflowTemplate) => {
    try {
      // For system templates, use instantiateTemplate API
      // For user templates, just clone the data
      if (template.isSystemTemplate) {
        console.log('Instantiating system template:', template.name);
        // Will be handled later with variable input dialog
      } else {
        // Update usage statistics for user templates
        if (activeTab === 'user') {
          setUserTemplates(prev => prev.map(t =>
            t.id === template.id
              ? { ...t, downloads: (t.downloads || 0) + 1, usageCount: (t.usageCount || 0) + 1 }
              : t
          ));
        }
      }

      toast({
        title: "Template Successfully Loaded",
        description: `Loading ${template.name} into the workflow designer${template.isSystemTemplate ? ' (System Template)' : ''}...`,
      });

      // Call parent callback with full template data
      if (onLoadTemplate) {
        onLoadTemplate(template);
      }
    } catch (error: any) {
      console.error('Failed to use template:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to use template',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTemplate = (template: WorkflowTemplate) => {
    if (template.isSystemTemplate) {
      toast({
        title: 'Cannot Delete',
        description: 'System templates cannot be deleted',
        variant: 'destructive',
      });
      return;
    }

    // Show confirmation dialog
    setTemplateToDelete(template);
    setShowDeleteDialog(true);
  };

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      await workflowApi.deleteTemplate(templateToDelete.id);
      setUserTemplates(prev => prev.filter(t => t.id !== templateToDelete.id));
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });
    } catch (error: any) {
      console.error('Failed to delete template:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete template',
        variant: 'destructive',
      });
    } finally {
      setShowDeleteDialog(false);
      setTemplateToDelete(null);
    }
  };

  const handleEditTemplate = (template: WorkflowTemplate) => {
    if (template.isSystemTemplate) {
      toast({
        title: 'Cannot Edit',
        description: 'System templates cannot be edited',
        variant: 'destructive',
      });
      return;
    }

    // Open modal for editing metadata first
    setEditingTemplate(template);
    setShowCreateModal(true);
  };

  const handlePreviewTemplate = (template: WorkflowTemplate) => {
    console.log('Previewing template:', template.name);
    console.log('Template full data:', JSON.stringify(template, null, 2));
    console.log('Template has nodes?', template.nodes ? `Yes (${template.nodes.length} nodes)` : 'No');
    setSelectedTemplate(template);
    setShowPreviewModal(true);

    // Track preview analytics
    toast({
      title: "Template Preview",
      description: `Viewing detailed configuration for ${template.name}`,
    });
  };

  const handleCreateTemplate = async (templateData: any) => {
    console.log('Creating/editing template:', templateData);

    try {
      if (editingTemplate) {
        // Update existing template
        await workflowApi.updateTemplate(editingTemplate.id, templateData);

        setUserTemplates(prev => prev.map(t =>
          t.id === editingTemplate.id
            ? { ...t, ...templateData }
            : t
        ));

        toast({
          title: "Template Updated",
          description: `"${templateData.name}" has been updated successfully`,
        });

        setEditingTemplate(null);
      } else {
        // Navigate to designer to create template (don't save yet - need nodes/edges)
        if (onCreateTemplate) {
          onCreateTemplate(templateData);
        } else {
          toast({
            title: 'Error',
            description: 'Template creation not available',
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      console.error('Failed to create/edit template:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save template',
        variant: 'destructive',
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Workflow Templates</h2>
          <p className="text-sm text-gray-600">Pre-built workflows for common IAM scenarios and compliance frameworks</p>
        </div>
        {activeTab === 'user' && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Custom Template
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'system' | 'user')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            System Templates
            <Badge variant="secondary" className="ml-1">{systemTemplates.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="user" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Templates
            <Badge variant="secondary" className="ml-1">{userTemplates.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <Card className="shadow-sm mt-6">
          <CardHeader className="pb-3">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

              {/* Title */}
              <div>
                <CardTitle className="text-lg font-semibold tracking-tight">
                  Templates Filters
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Search and filter templates by category, framework, and complexity
                </p>
              </div>

            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-3">

              {/* Search */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative flex-1 min-w-[240px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search templates, frameworks, or tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-9"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Search by template name, framework, or tags</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">

                {/* Category */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-full sm:w-[180px] max-w-[180px] min-w-0">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="h-9 w-full overflow-hidden">
                            <span className="truncate w-full text-left">
                              <SelectValue placeholder="Category" />
                            </span>
                          </SelectTrigger>

                          <SelectContent align="end" className="max-w-[320px]">
                            {[
                              { value: "all", label: "All Categories" },
                              { value: "joiner-mover-leaver", label: "Joiner/Mover/Leaver" },
                              { value: "access-request", label: "Access Request" },
                              { value: "certification", label: "Certification" },
                              { value: "revocation", label: "Revocation" },
                              { value: "exception", label: "Exception" },
                              { value: "ai-risk", label: "AI Risk" },
                              { value: "Role Management", label: "Role Management" },
                              { value: "Permission Management", label: "Permission Management" },
                            ].map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="block truncate max-w-[240px]">
                                      {opt.label}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-md break-words">
                                    {opt.label}
                                  </TooltipContent>
                                </Tooltip>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Filter by template category</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Framework */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-full sm:w-[150px] max-w-[150px] min-w-0">
                        <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                          <SelectTrigger className="h-9 w-full overflow-hidden">
                            <span className="truncate w-full text-left">
                              <SelectValue placeholder="Framework" />
                            </span>
                          </SelectTrigger>

                          <SelectContent align="end">
                            <SelectItem value="all">All Frameworks</SelectItem>
                            <SelectItem value="NIST">NIST</SelectItem>
                            <SelectItem value="ISO 27001">ISO 27001</SelectItem>
                            <SelectItem value="SOX">SOX</SelectItem>
                            <SelectItem value="GDPR">GDPR</SelectItem>
                            <SelectItem value="RBAC">RBAC</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Filter by compliance framework</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Complexity */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-full sm:w-[150px] max-w-[150px] min-w-0">
                        <Select value={selectedComplexity} onValueChange={setSelectedComplexity}>
                          <SelectTrigger className="h-9 w-full overflow-hidden">
                            <span className="truncate w-full text-left">
                              <SelectValue placeholder="Complexity" />
                            </span>
                          </SelectTrigger>

                          <SelectContent align="end">
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="simple">Simple</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="complex">Complex</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Filter by workflow complexity</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

              </div>

            </div>

            {/* Active Filters */}
            {(searchTerm || selectedCategory !== "all" || selectedFramework !== "all" || selectedComplexity !== "all") && (
              <div className="flex items-center gap-2 pt-2 flex-wrap">

                <span className="text-xs text-muted-foreground">Active filters:</span>

                {searchTerm && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    Search: "{searchTerm}"
                    <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-destructive">×</button>
                  </Badge>
                )}

                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    Category: {selectedCategory}
                    <button onClick={() => setSelectedCategory("all")} className="ml-1 hover:text-destructive">×</button>
                  </Badge>
                )}

                {selectedFramework !== "all" && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    Framework: {selectedFramework}
                    <button onClick={() => setSelectedFramework("all")} className="ml-1 hover:text-destructive">×</button>
                  </Badge>
                )}

                {selectedComplexity !== "all" && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    Complexity: {selectedComplexity}
                    <button onClick={() => setSelectedComplexity("all")} className="ml-1 hover:text-destructive">×</button>
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedFramework("all");
                    setSelectedComplexity("all");
                  }}
                >
                  Clear all
                </Button>

              </div>
            )}

          </CardHeader>
        </Card>

        {/* System Templates Tab */}
        <TabsContent value="system" className="mt-4">
          {isLoadingSystem ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : safeFilteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No system templates found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {safeFilteredTemplates.map((template) => {
                const CategoryIcon = getCategoryIcon(template.category);
                const iconColors = getCategoryIconColor(template.category);

                return (
                  <Card key={template.id} className="hover:shadow-md transition-all border-gray-200">
                    <CardContent className="p-6">
                      {/* Header with Icon, Title and Global Badge */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`p-3 ${iconColors.bg} rounded-lg flex-shrink-0`}>
                          <CategoryIcon className={`h-6 w-6 ${iconColors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                              {template.name}
                            </h3>
                            {template.isSystemTemplate && (
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                🌐 Global
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                      </div>

                      {/* Metadata - Grid Layout like screenshot */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Steps</div>
                          <div className="text-base font-semibold text-gray-900">{template.steps}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Duration</div>
                          <div className="text-base font-semibold text-gray-900">{template.estimatedTime}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Complexity</div>
                          <div className="text-sm font-medium text-orange-600">{template.complexity}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Usage</div>
                          <div className="text-base font-semibold text-gray-900">{template.usageCount || 0}</div>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <div className="mb-4">
                        <Badge variant="secondary" className="text-xs font-normal bg-purple-50 text-purple-700 hover:bg-purple-100">
                          {template.category}
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUseTemplate(template)}
                          className="flex-1 text-sm h-9"
                        >
                          Use Template
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePreviewTemplate(template)}
                          className="h-9 w-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!template.isSystemTemplate && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditTemplate(template)}
                              className="h-9 w-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteTemplate(template)}
                              className="px-3 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* User Templates Tab */}
        <TabsContent value="user" className="mt-4">
          {isLoadingUser ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : safeFilteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No user templates found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== 'all' || selectedFramework !== 'all' || selectedComplexity !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'Create your first custom template to get started'}
              </p>
              {!searchTerm && selectedCategory === 'all' && selectedFramework === 'all' && selectedComplexity === 'all' && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {safeFilteredTemplates.map((template) => {
                const CategoryIcon = getCategoryIcon(template.category);
                const iconColors = getCategoryIconColor(template.category);

                return (
                  <Card key={template.id} className="hover:shadow-md transition-all border-gray-200">
                    <CardContent className="p-6">
                      {/* Header with Icon, Title and Badge */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`p-3 ${iconColors.bg} rounded-lg flex-shrink-0`}>
                          <CategoryIcon className={`h-6 w-6 ${iconColors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-gray-900 text-sm leading-tight" style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={template.name}>
                              {template.name}
                            </h3>
                            {!template.isSystemTemplate && (
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                👤 User
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2" title={template.description}>
                            {template.description}
                          </p>
                        </div>
                      </div>

                      {/* Metadata - Grid Layout */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Steps</div>
                          <div className="text-base font-semibold text-gray-900">{template.steps}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Duration</div>
                          <div className="text-base font-semibold text-gray-900">{template.estimatedTime}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Complexity</div>
                          <div className="text-sm font-medium text-orange-600">{template.complexity}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Usage</div>
                          <div className="text-base font-semibold text-gray-900">{template.usageCount || 0}</div>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <div className="mb-4">
                        <Badge variant="secondary" className="text-xs font-normal bg-purple-50 text-purple-700 hover:bg-purple-100">
                          {template.category}
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUseTemplate(template)}
                          className="flex-1 text-sm h-9"
                        >
                          Use Template
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePreviewTemplate(template)}
                          className="h-9 w-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!template.isSystemTemplate && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditTemplate(template)}
                              className="h-9 w-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteTemplate(template)}
                              className="px-3 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateTemplateModal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingTemplate(null);
        }}
        onCreateTemplate={handleCreateTemplate}
        editingTemplate={editingTemplate}
        onEditTemplate={onEditTemplate}
      />

      <TemplatePreviewModal
        template={selectedTemplate}
        open={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onUseTemplate={handleUseTemplate}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteDialog(false);
              setTemplateToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTemplate}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkflowTemplates;
