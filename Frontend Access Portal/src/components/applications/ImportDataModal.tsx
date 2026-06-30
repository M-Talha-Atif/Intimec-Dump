import React, { useState, useEffect } from 'react';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Database, 
  Users, 
  Bot, 
  Play, 
  X, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Shield,
  Loader2,
  UserCheck,
  Building,
  Eye,
  Info,
  Terminal,
  Settings
} from 'lucide-react';
import { Application } from '@/data/mock-applications';
import { AccountsTab } from './import/AccountsTab';
import { EntitlementsTab } from './import/EntitlementsTab';
import { ResultsPreview } from './import/ResultsPreview';
import { PreviewResultsModal } from './import/PreviewResultsModal';
import { JobConsoleDrawer } from '@/components/imports/JobConsoleDrawer';
import { useImportJobs } from '@/hooks/useImportJobs';
import { PolicyWizard } from '@/components/imports/PolicyWizard';
import { PreflightCard } from '@/components/imports/PreflightCard';
import { QuarantinePanel } from '@/components/imports/QuarantinePanel';
import { ImportPolicy } from '@/schemas/importPolicy';
import { setJobPolicy, getJobPolicy } from '@/mocks/api/imports.policy';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
  enableJobConsole?: boolean;
  guardOnActiveRun?: boolean;
}

type AggregationPhase = 'idle' | 'fetching' | 'matching' | 'scoring' | 'completed';
type IdentityType = 'employee' | 'non-employee' | 'non-human';
type ImportTab = 'accounts' | 'entitlements' | 'quarantine';

// Define a flexible result type that can accommodate different identity types
interface BaseResult {
  id: number;
  name: string;
  type: string;
  status: string;
  risk: string;
  lastSeen: string;
  matched: boolean;
  source: string;
  scope: string;
  anomalies: string[];
  // Optional fields for different identity types
  department?: string;  // for employees
  sponsor?: string;     // for non-employees
  owner?: string;       // for non-humans
  assignedCount?: number; // for entitlements
}

// Per-tab import state
interface TabImportState {
  isImporting: boolean;
  isPreviewing: boolean;
  currentPhase: AggregationPhase;
  progress: number;
  results: BaseResult[];
  identityType: IdentityType;
  filters: any;
  previewData: any;
}

const AGGREGATION_PHASES = [
  { key: 'fetching', label: 'Fetching Data', icon: Database },
  { key: 'matching', label: 'Matching Identities', icon: Users },
  { key: 'scoring', label: 'Risk Scoring', icon: Shield },
  { key: 'completed', label: 'Completed', icon: CheckCircle }
];

const IDENTITY_TYPES = [
  { 
    value: 'employee', 
    label: 'Employee Identities', 
    icon: Users,
    description: 'Regular employees with HR master records'
  },
  { 
    value: 'non-employee', 
    label: 'Non-Employee Identities', 
    icon: UserCheck,
    description: 'Contractors, vendors, and temporary workers'
  },
  { 
    value: 'non-human', 
    label: 'Non-Human Identities', 
    icon: Bot,
    description: 'Service accounts, APIs, and system identities'
  }
];

export function ImportDataModal({ 
  isOpen, 
  onClose, 
  application,
  enableJobConsole = false,
  guardOnActiveRun = false
}: ImportDataModalProps) {
  const { confirm: confirmAction, isOpen: isConfirmOpen, options: confirmOptions, handleConfirm: onConfirmAction, handleCancel: onCancelAction } = useConfirm();
  const [activeTab, setActiveTab] = useState<ImportTab>('accounts');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [currentPreviewType, setCurrentPreviewType] = useState<ImportTab>('accounts');
  
  // Policy Wizard state
  const [showPolicyWizard, setShowPolicyWizard] = useState(false);
  const [currentPolicy, setCurrentPolicy] = useState<ImportPolicy | null>(null);
  
  // Preflight state
  const [preflightHasFailures, setPreflightHasFailures] = useState(false);
  
  // Quarantine state
  const [showQuarantine, setShowQuarantine] = useState(false);

  // Determine if identity type should be locked based on application configuration
  const isIdentityTypeLocked = application?.identityType !== undefined;
  const lockedIdentityType = application?.identityType as IdentityType || 'employee';
  
  // Per-tab state management
  const [tabStates, setTabStates] = useState<Record<ImportTab, TabImportState>>({
    accounts: {
      isImporting: false,
      isPreviewing: false,
      currentPhase: 'idle',
      progress: 0,
      results: [],
      identityType: isIdentityTypeLocked ? lockedIdentityType : 'employee',
      filters: {
        aggregationMode: 'full',
        status: [],
        creationDate: '',
        lastSeen: '',
        owner: '',
        entitlementType: []
      },
      previewData: null
    },
    entitlements: {
      isImporting: false,
      isPreviewing: false,
      currentPhase: 'idle',
      progress: 0,
      results: [],
      identityType: isIdentityTypeLocked ? lockedIdentityType : 'employee',
      filters: {
        aggregationMode: 'full',
        status: [],
        creationDate: '',
        lastSeen: '',
        owner: '',
        entitlementType: []
      },
      previewData: null
    },
    quarantine: {
      isImporting: false,
      isPreviewing: false,
      currentPhase: 'idle',
      progress: 0,
      results: [],
      identityType: 'employee',
      filters: {},
      previewData: null
    }
  });

  const currentTabState = tabStates[activeTab];

  useEffect(() => {
    if (isOpen && application) {
      // Reset state when modal opens
      setTabStates({
        accounts: {
          isImporting: false,
          isPreviewing: false,
          currentPhase: 'idle',
          progress: 0,
          results: [],
          identityType: isIdentityTypeLocked ? lockedIdentityType : 'employee',
          filters: {
            aggregationMode: 'full',
            status: [],
            creationDate: '',
            lastSeen: '',
            owner: '',
            entitlementType: []
          },
          previewData: null
        },
        entitlements: {
          isImporting: false,
          isPreviewing: false,
          currentPhase: 'idle',
          progress: 0,
          results: [],
          identityType: isIdentityTypeLocked ? lockedIdentityType : 'employee',
          filters: {
            aggregationMode: 'full',
            status: [],
            creationDate: '',
            lastSeen: '',
            owner: '',
            entitlementType: []
          },
          previewData: null
        },
        quarantine: {
          isImporting: false,
          isPreviewing: false,
          currentPhase: 'idle',
          progress: 0,
          results: [],
          identityType: 'employee',
          filters: {},
          previewData: null
        }
      });
      
      // Load cached filters for this application
      const cachedAccountsFilters = localStorage.getItem(`import-filters-${application.id}-accounts`);
      const cachedEntitlementsFilters = localStorage.getItem(`import-filters-${application.id}-entitlements`);
      
      if (cachedAccountsFilters || cachedEntitlementsFilters) {
        setTabStates(prev => ({
          ...prev,
          accounts: {
            ...prev.accounts,
            ...(cachedAccountsFilters ? JSON.parse(cachedAccountsFilters) : {}),
            // Override identity type if locked
            identityType: isIdentityTypeLocked ? lockedIdentityType : prev.accounts.identityType
          },
          entitlements: {
            ...prev.entitlements,
            ...(cachedEntitlementsFilters ? JSON.parse(cachedEntitlementsFilters) : {}),
            // Override identity type if locked
            identityType: isIdentityTypeLocked ? lockedIdentityType : prev.entitlements.identityType
          }
        }));
      }
    }
  }, [isOpen, application, isIdentityTypeLocked, lockedIdentityType]);

  const updateTabState = (tab: ImportTab, updates: Partial<TabImportState>) => {
    setTabStates(prev => ({
      ...prev,
      [tab]: { ...prev[tab], ...updates }
    }));
  };

  const generateMockPreviewData = (tab: ImportTab, identityType: IdentityType) => {
    const baseData = {
      connectionStatus: 'success' as const,
      recordCount: Math.floor(Math.random() * 500) + 100,
      lastImportTimestamp: '2024-06-15 14:32:00',
      qualityScore: Math.floor(Math.random() * 2) + 4, // 4 or 5
      aiDiagnostic: `Connection succeeded. ${tab === 'accounts' ? 'Account' : 'Entitlement'} data quality is good with ${Math.floor(Math.random() * 10) + 5}% missing optional attributes.`,
      validationWarnings: [
        `Missing email attribute for ${Math.floor(Math.random() * 20) + 5} ${identityType.replace('-', ' ')} identities`,
        `Department field empty for ${Math.floor(Math.random() * 15) + 3} records`
      ],
      schemaFields: tab === 'accounts' ? [
        { field: 'accountId', mapped: true, type: 'string' },
        { field: 'email', mapped: true, type: 'string' },
        { field: 'status', mapped: true, type: 'string' },
        { field: 'department', mapped: false, type: 'string' },
        { field: 'lastLogin', mapped: true, type: 'datetime' }
      ] : [
        { field: 'entitlementId', mapped: true, type: 'string' },
        { field: 'name', mapped: true, type: 'string' },
        { field: 'type', mapped: true, type: 'string' },
        { field: 'scope', mapped: false, type: 'string' },
        { field: 'risk', mapped: true, type: 'string' }
      ],
      samplePayload: tab === 'accounts' ? [
        { accountId: 'acc_001', email: 'john.doe@company.com', status: 'active', department: 'Engineering' },
        { accountId: 'acc_002', email: 'jane.smith@company.com', status: 'active', department: 'Sales' },
        { accountId: 'acc_003', email: 'service.account@company.com', status: 'active', department: null }
      ] : [
        { entitlementId: 'ent_001', name: 'Admin Access', type: 'role', scope: 'global', risk: 'high' },
        { entitlementId: 'ent_002', name: 'Read Access', type: 'permission', scope: 'department', risk: 'low' },
        { entitlementId: 'ent_003', name: 'License Pro', type: 'license', scope: 'user', risk: 'medium' }
      ],
      suggestedFixes: [
        'Email attribute not mapped → Map to user.email field',
        'Department field missing → Enable HR sync for organizational data'
      ]
    };

    return baseData;
  };

  const handleStartPreview = async (tab: ImportTab) => {
    if (!application) return;
    
    updateTabState(tab, { isPreviewing: true });
    setCurrentPreviewType(tab);
    
    // Simulate preview processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const previewData = generateMockPreviewData(tab, tabStates[tab].identityType);
    updateTabState(tab, { previewData, isPreviewing: false });
    setShowPreviewModal(true);
  };

  const { activeJobId, createImportJob, getImportJob } = useImportJobs();

  const handleStartImport = async (tab: ImportTab) => {
    if (!application) return;
    
    const tabState = tabStates[tab];
    updateTabState(tab, { isImporting: true, currentPhase: 'fetching', progress: 0 });
    
    // Cache current filters and identity type for this tab
    localStorage.setItem(`import-filters-${application.id}-${tab}`, JSON.stringify({
      filters: tabState.filters, 
      identityType: tabState.identityType
    }));
    
    // Create job if console is enabled
    if (enableJobConsole) {
      try {
        const jobRequest = {
          appId: application.id.toString(),
          objectType: tab as any,
          runType: tabState.filters.aggregationMode === 'full' ? 'full' as const : 'delta' as const,
          policy: { version: 'pol_v3' },
          operator: {
            id: 'u_1029',
            email: 'ops.iga@aidentx.com'
          }
        };
        
        await createImportJob(jobRequest);
        
        // Save policy if one exists
        if (currentPolicy && activeJobId) {
          await setJobPolicy(activeJobId, currentPolicy);
        }
        
        setShowJobConsole(true);
      } catch (error) {
        console.error('Failed to create import job:', error);
      }
    }
    
    // Simulate aggregation phases
    const phases: AggregationPhase[] = ['fetching', 'matching', 'scoring', 'completed'];
    
    for (let i = 0; i < phases.length; i++) {
      updateTabState(tab, { currentPhase: phases[i] });
      
      // Simulate progress for each phase
      const phaseProgress = (i / phases.length) * 100;
      const phaseIncrement = 25; // Each phase is 25% of total
      
      for (let j = 0; j <= 10; j++) {
        updateTabState(tab, { progress: phaseProgress + (j / 10) * phaseIncrement });
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      if (phases[i] === 'completed') {
        // Generate mock results based on identity type and tab
        const mockResults = generateMockResults(tab, tabState.identityType, tabState.filters);
        updateTabState(tab, { results: mockResults });
      }
    }
    
    updateTabState(tab, { isImporting: false });
  };

  // New policy handlers
  const handleSavePolicy = async (policy: ImportPolicy) => {
    setCurrentPolicy(policy);
    
    // Save to job if one exists
    if (activeJobId) {
      try {
        await setJobPolicy(activeJobId, policy);
      } catch (error) {
        console.error('Failed to save policy to job:', error);
      }
    }
  };

  const handleSafeStartImport = async (tab: ImportTab) => {
    if (preflightHasFailures) {
      return; // Blocked by preflight failures
    }
    await handleStartImport(tab);
  };

  const generateMockResults = (tab: string, idType: IdentityType, currentFilters: any): BaseResult[] => {
    const entitlementTypes = currentFilters.entitlementType || [];
    const statusFilters = currentFilters.status || [];
    
    // Enhanced contextual data generation
    const contextualAccountData: Record<IdentityType, BaseResult[]> = {
      employee: [
        { 
          id: 1, 
          name: 'john.doe@company.com', 
          type: 'Employee Account', 
          status: 'Active', 
          risk: 'Low', 
          lastSeen: '2024-06-20', 
          matched: true, 
          department: 'Engineering',
          source: 'Active Directory',
          scope: 'Corporate Network',
          anomalies: []
        },
        { 
          id: 2, 
          name: 'jane.smith@company.com', 
          type: 'Employee Account', 
          status: 'Active', 
          risk: 'Medium', 
          lastSeen: '2024-06-18', 
          matched: true, 
          department: 'Sales',
          source: 'LDAP',
          scope: 'Sales Applications',
          anomalies: ['unusual_access_pattern']
        },
        { 
          id: 3, 
          name: 'admin.temp@company.com', 
          type: 'Employee Account', 
          status: 'Inactive', 
          risk: 'High', 
          lastSeen: '2024-05-10', 
          matched: false, 
          department: 'IT',
          source: 'Active Directory',
          scope: 'Administrative',
          anomalies: ['elevated_privileges', 'stale_account']
        }
      ],
      'non-employee': [
        { 
          id: 1, 
          name: 'contractor.external@company.com', 
          type: 'Contractor Account', 
          status: 'Active', 
          risk: 'Medium', 
          lastSeen: '2024-06-19', 
          matched: true, 
          sponsor: 'john.doe@company.com',
          source: 'External Identity Provider',
          scope: 'Project Resources',
          anomalies: []
        },
        { 
          id: 2, 
          name: 'vendor.temp@company.com', 
          type: 'Vendor Account', 
          status: 'Pending', 
          risk: 'High', 
          lastSeen: '2024-06-15', 
          matched: false, 
          sponsor: 'jane.smith@company.com',
          source: 'Manual Provisioning',
          scope: 'Limited Access',
          anomalies: ['missing_sponsor_approval', 'expired_contract']
        }
      ],
      'non-human': [
        { 
          id: 1, 
          name: 'service.backup@company.com', 
          type: 'Service Account', 
          status: 'Active', 
          risk: 'High', 
          lastSeen: '2024-06-15', 
          matched: false, 
          owner: 'Platform Team',
          source: 'Service Registry',
          scope: 'System Resources',
          anomalies: ['token_near_expiry', 'excessive_privileges']
        },
        { 
          id: 2, 
          name: 'api.integration@company.com', 
          type: 'API Account', 
          status: 'Inactive', 
          risk: 'Critical', 
          lastSeen: '2024-05-10', 
          matched: true, 
          owner: 'DevOps Team',
          source: 'API Gateway',
          scope: 'External APIs',
          anomalies: ['stale_credentials', 'unrotated_secrets', 'orphaned_service']
        }
      ]
    };

    const contextualEntitlementData: Record<IdentityType, BaseResult[]> = {
      employee: [
        { 
          id: 1, 
          name: 'Employee Portal Access', 
          type: 'Permission', 
          status: 'Active', 
          risk: 'Low', 
          scope: 'Portal', 
          matched: true,
          source: 'HR System',
          assignedCount: 1247,
          anomalies: [],
          lastSeen: '2024-06-20'
        },
        { 
          id: 2, 
          name: 'Manager Role', 
          type: 'Role', 
          status: 'Active', 
          risk: 'Medium', 
          scope: 'Department', 
          matched: true,
          source: 'Active Directory',
          assignedCount: 89,
          anomalies: ['rarely_assigned'],
          lastSeen: '2024-06-19'
        },
        { 
          id: 3, 
          name: 'Executive Dashboard License', 
          type: 'License', 
          status: 'Active', 
          risk: 'High', 
          scope: 'Enterprise', 
          matched: false,
          source: 'SaaS Application',
          assignedCount: 12,
          anomalies: ['high_cost', 'underutilized'],
          lastSeen: '2024-06-18'
        }
      ],
      'non-employee': [
        { 
          id: 1, 
          name: 'Limited Access', 
          type: 'Permission', 
          status: 'Active', 
          risk: 'Medium', 
          scope: 'Project', 
          matched: true,
          source: 'Project Management System',
          assignedCount: 45,
          anomalies: [],
          lastSeen: '2024-06-19'
        },
        { 
          id: 2, 
          name: 'Contractor Role', 
          type: 'Role', 
          status: 'Active', 
          risk: 'High', 
          scope: 'Limited', 
          matched: false,
          source: 'External Identity Provider',
          assignedCount: 23,
          anomalies: ['missing_expiry_date', 'excessive_scope'],
          lastSeen: '2024-06-17'
        }
      ],
      'non-human': [
        { 
          id: 1, 
          name: 'System Admin Access', 
          type: 'Permission', 
          status: 'Active', 
          risk: 'Critical', 
          scope: 'System', 
          matched: true,
          source: 'Infrastructure Management',
          assignedCount: 8,
          anomalies: ['admin_level_access', 'no_rotation_policy'],
          lastSeen: '2024-06-20'
        },
        { 
          id: 2, 
          name: 'API Access Role', 
          type: 'Role', 
          status: 'Active', 
          risk: 'High', 
          scope: 'API', 
          matched: false,
          source: 'API Gateway',
          assignedCount: 34,
          anomalies: ['broad_api_access', 'token_never_rotated'],
          lastSeen: '2024-06-16'
        }
      ]
    };
    
    let baseData = tab === 'accounts' ? contextualAccountData[idType] : contextualEntitlementData[idType];
    
    // Apply status filters
    if (statusFilters.length > 0) {
      baseData = baseData.filter(item => statusFilters.includes(item.status.toLowerCase()));
    }
    
    // Apply entitlement type filters for entitlements tab
    if (tab === 'entitlements' && entitlementTypes.length > 0) {
      baseData = baseData.filter(item => entitlementTypes.includes(item.type.toLowerCase()));
    }
    
    return baseData;
  };

  const handleViewLogs = (tab: ImportTab) => {
    const tabState = tabStates[tab];
    console.log(`Opening logs for ${application?.name} - ${tab} aggregation - ${tabState.identityType} identities`);
  };

  const handleFiltersChange = (tab: ImportTab, filters: any) => {
    updateTabState(tab, { filters });
  };

  const handleIdentityTypeChange = (tab: ImportTab, identityType: IdentityType) => {
    // Only allow change if not locked
    if (!isIdentityTypeLocked) {
      updateTabState(tab, { identityType });
    }
  };

  const selectedIdentityTypeInfo = IDENTITY_TYPES.find(type => type.value === currentTabState.identityType);

  // Helper function to get identity type display name
  const getIdentityTypeDisplay = (identityType?: string) => {
    switch (identityType) {
      case 'employee': return 'Employee';
      case 'non-employee': return 'Non-Employee';
      case 'non-human': return 'Non-Human';
      default: return 'Mixed';
    }
  };

  // Job Console state and hooks
  const [showJobConsole, setShowJobConsole] = useState(false);

  // Add exit guard for active jobs
  const handleClose = async () => {
    if (guardOnActiveRun && activeJobId) {
      try {
        const job = await getImportJob(activeJobId);
        if (job && (job.status === 'running' || job.status === 'paused')) {
          const { confirmed } = await confirmAction({
            title: 'Import Running',
            description: 'An import job is currently running. Are you sure you want to close this modal? The job will continue in the background.',
            confirmText: 'Close',
          });
          if (confirmed) {
            onClose();
          }
        } else {
          onClose();
        }
      } catch {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!application) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Database className="h-6 w-6 text-blue-500" />
              <span>Import Data from {application.name}</span>
              <Badge variant="outline" className="ml-2">
                {application.category} • {application.source === 'authoritative' ? 'Authoritative Source' : 'Non-Authoritative'}
              </Badge>
              {application.isAuthoritative && (
                <Badge variant="destructive" className="ml-2">
                  Authoritative for {getIdentityTypeDisplay(application.identityType)}
                </Badge>
              )}
              {/* Job Console Entry Point */}
              {enableJobConsole && (
                <div className="ml-auto flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPolicyWizard(true)}
                    className="text-xs"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Policy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowJobConsole(true)}
                    disabled={!activeJobId}
                    className="text-xs"
                  >
                    <Terminal className="h-4 w-4 mr-1" />
                    Open Job Console
                  </Button>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col h-full space-y-4">
            {/* Policy Summary Card */}
            {currentPolicy && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Import Policy Active: {currentPolicy.version}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {currentPolicy.runType} • {currentPolicy.match.keys.join(', ')}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPolicyWizard(true)}
                    className="text-blue-600"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Identity Type Selector */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium mb-1">Identity Context for {activeTab}</h3>
                  <p className="text-xs text-muted-foreground">
                    {isIdentityTypeLocked 
                      ? `This application is configured for ${getIdentityTypeDisplay(application.identityType)} identities`
                      : 'Select the type of identities to aggregate from this source'
                    }
                  </p>
                </div>
                <div className="w-72">
                  <Select 
                    value={currentTabState.identityType} 
                    onValueChange={(value: IdentityType) => handleIdentityTypeChange(activeTab, value)}
                    disabled={isIdentityTypeLocked}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {IDENTITY_TYPES.map((type) => {
                        const IconComponent = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center space-x-2">
                              <IconComponent className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-muted-foreground">{type.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {isIdentityTypeLocked && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Identity type is locked based on application configuration
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Show contextual banner if identity type is locked */}
            {isIdentityTypeLocked && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-blue-800">
                  <Info className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    You're importing data for {getIdentityTypeDisplay(application.identityType)} Identities
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  This application has been configured as an authoritative source for this identity type.
                </p>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ImportTab)} className="flex-1">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="accounts" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Accounts</span>
                  {tabStates.accounts.results.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {tabStates.accounts.results.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="entitlements" className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Entitlements</span>
                  {tabStates.entitlements.results.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {tabStates.entitlements.results.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="quarantine" className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Quarantine</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 mt-4 min-h-0">
                <TabsContent value="accounts" className="mt-0 h-full">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    <div className="lg:col-span-2 overflow-y-auto">
                      <AccountsTab 
                        filters={tabStates.accounts.filters} 
                        onFiltersChange={(filters) => handleFiltersChange('accounts', filters)}
                        application={application}
                        identityType={tabStates.accounts.identityType}
                      />
                    </div>
                    <div className="lg:col-span-1">
                      <div className="sticky top-0 space-y-4">
                        {/* Pre-Flight Card */}
                        <PreflightCard 
                          jobId={activeJobId}
                          onStatusChange={setPreflightHasFailures}
                        />
                        
                        <ResultsPreview 
                          results={tabStates.accounts.results}
                          isLoading={tabStates.accounts.isImporting}
                          type="accounts"
                          identityType={tabStates.accounts.identityType}
                          filters={tabStates.accounts.filters}
                          onViewAll={() => console.log('View all accounts results clicked')}
                          onReviewRisk={() => console.log('Review high risk accounts clicked')}
                        />
                        
                        {/* Per-tab action buttons */}
                        <div className="flex flex-col space-y-2">
                          <Button 
                            onClick={() => handleStartPreview('accounts')} 
                            disabled={tabStates.accounts.isImporting || tabStates.accounts.isPreviewing}
                            variant="outline"
                            className="flex items-center space-x-2 w-full"
                          >
                            {tabStates.accounts.isPreviewing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                            <span>{tabStates.accounts.isPreviewing ? 'Running Preview...' : 'Preview Accounts Import'}</span>
                          </Button>
                          
                          <Button 
                            onClick={() => handleStartImport('accounts')} 
                            disabled={tabStates.accounts.isImporting || tabStates.accounts.isPreviewing}
                            className="flex items-center space-x-2 w-full"
                          >
                            {tabStates.accounts.isImporting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                            <span>{tabStates.accounts.isImporting ? 'Importing Accounts...' : 'Start Accounts Import'}</span>
                          </Button>

                          {/* Safe Start Button (feature flagged) */}
                          {enableJobConsole && (
                            <Button 
                              onClick={() => handleSafeStartImport('accounts')} 
                              disabled={tabStates.accounts.isImporting || tabStates.accounts.isPreviewing || preflightHasFailures}
                              variant="default"
                              className="flex items-center space-x-2 w-full bg-green-600 hover:bg-green-700"
                              title={preflightHasFailures ? "Resolve pre-flight checks" : "Start import with safety checks"}
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Safe Start</span>
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline" 
                            onClick={() => handleViewLogs('accounts')} 
                            className="flex items-center space-x-2 w-full"
                            size="sm"
                          >
                            <FileText className="h-4 w-4" />
                            <span>View Accounts Logs</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="entitlements" className="mt-0 h-full">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    <div className="lg:col-span-2 overflow-y-auto">
                      <EntitlementsTab 
                        filters={tabStates.entitlements.filters} 
                        onFiltersChange={(filters) => handleFiltersChange('entitlements', filters)}
                        application={application}
                        identityType={tabStates.entitlements.identityType}
                      />
                    </div>
                    <div className="lg:col-span-1">
                      <div className="sticky top-0 space-y-4">
                        {/* Pre-Flight Card */}
                        <PreflightCard 
                          jobId={activeJobId}
                          onStatusChange={setPreflightHasFailures}
                        />
                        
                        <ResultsPreview 
                          results={tabStates.entitlements.results}
                          isLoading={tabStates.entitlements.isImporting}
                          type="entitlements"
                          identityType={tabStates.entitlements.identityType}
                          filters={tabStates.entitlements.filters}
                          onViewAll={() => console.log('View all entitlements results clicked')}
                          onReviewRisk={() => console.log('Review high risk entitlements clicked')}
                        />
                        
                        {/* Per-tab action buttons */}
                        <div className="flex flex-col space-y-2">
                          <Button 
                            onClick={() => handleStartPreview('entitlements')} 
                            disabled={tabStates.entitlements.isImporting || tabStates.entitlements.isPreviewing}
                            variant="outline"
                            className="flex items-center space-x-2 w-full"
                          >
                            {tabStates.entitlements.isPreviewing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                            <span>{tabStates.entitlements.isPreviewing ? 'Running Preview...' : 'Preview Entitlements Import'}</span>
                          </Button>
                          
                          <Button 
                            onClick={() => handleStartImport('entitlements')} 
                            disabled={tabStates.entitlements.isImporting || tabStates.entitlements.isPreviewing}
                            className="flex items-center space-x-2 w-full"
                          >
                            {tabStates.entitlements.isImporting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                            <span>{tabStates.entitlements.isImporting ? 'Importing Entitlements...' : 'Start Entitlements Import'}</span>
                          </Button>

                          {/* Safe Start Button (feature flagged) */}
                          {enableJobConsole && (
                            <Button 
                              onClick={() => handleSafeStartImport('entitlements')} 
                              disabled={tabStates.entitlements.isImporting || tabStates.entitlements.isPreviewing || preflightHasFailures}
                              variant="default"
                              className="flex items-center space-x-2 w-full bg-green-600 hover:bg-green-700"
                              title={preflightHasFailures ? "Resolve pre-flight checks" : "Start import with safety checks"}
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Safe Start</span>
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline" 
                            onClick={() => handleViewLogs('entitlements')} 
                            className="flex items-center space-x-2 w-full"
                            size="sm"
                          >
                            <FileText className="h-4 w-4" />
                            <span>View Entitlements Logs</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="quarantine" className="mt-0 h-full">
                  <QuarantinePanel 
                    jobId={activeJobId}
                    isVisible={activeTab === 'quarantine'}
                  />
                </TabsContent>
              </div>
            </Tabs>

            {/* Progress Section - Show for active importing tab */}
            {(tabStates.accounts.isImporting || tabStates.entitlements.isImporting) && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {tabStates.accounts.isImporting ? 'Accounts' : 'Entitlements'} Aggregation Progress
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(tabStates.accounts.isImporting ? tabStates.accounts.progress : tabStates.entitlements.progress)}%
                  </span>
                </div>
                <Progress 
                  value={tabStates.accounts.isImporting ? tabStates.accounts.progress : tabStates.entitlements.progress} 
                  className="w-full" 
                />
                <div className="flex items-center justify-between">
                  {AGGREGATION_PHASES.map((phase, index) => {
                    const PhaseIcon = phase.icon;
                    const currentPhase = tabStates.accounts.isImporting ? tabStates.accounts.currentPhase : tabStates.entitlements.currentPhase;
                    const isActive = phase.key === currentPhase;
                    const isCompleted = AGGREGATION_PHASES.findIndex(p => p.key === currentPhase) > index;
                    
                    return (
                      <div key={phase.key} className="flex items-center space-x-2">
                        <div className={`p-2 rounded-full ${
                          isActive ? 'bg-blue-100 text-blue-600' : 
                          isCompleted ? 'bg-green-100 text-green-600' : 
                          'bg-muted text-muted-foreground'
                        }`}>
                          {isActive ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <PhaseIcon className="h-4 w-4" />
                          )}
                        </div>
                        <span className={`text-sm ${
                          isActive ? 'text-blue-600 font-medium' : 
                          isCompleted ? 'text-green-600' : 
                          'text-muted-foreground'
                        }`}>
                          {phase.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Separator />

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                {selectedIdentityTypeInfo && (
                  <span className="flex items-center space-x-2">
                    <selectedIdentityTypeInfo.icon className="h-4 w-4" />
                    <span>Current Context: {selectedIdentityTypeInfo.label}</span>
                  </span>
                )}
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={tabStates.accounts.isImporting || tabStates.entitlements.isImporting}
                >
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Policy Wizard Modal */}
      <PolicyWizard
        isOpen={showPolicyWizard}
        onClose={() => setShowPolicyWizard(false)}
        onSave={handleSavePolicy}
        initialPolicy={currentPolicy || undefined}
      />

      {/* Job Console Drawer */}
      {enableJobConsole && (
        <JobConsoleDrawer
          isOpen={showJobConsole}
          onClose={() => setShowJobConsole(false)}
          jobId={activeJobId}
        />
      )}

      {/* Preview Results Modal */}
      {currentPreviewType !== 'quarantine' && (
        <PreviewResultsModal 
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          type={currentPreviewType as 'accounts' | 'entitlements'}
          identityType={tabStates[currentPreviewType].identityType}
          applicationName={application?.name || ''}
          previewData={tabStates[currentPreviewType].previewData}
          isLoading={tabStates[currentPreviewType].isPreviewing}
        />
      )}
      <ConfirmDialog isOpen={isConfirmOpen} options={confirmOptions} onConfirm={onConfirmAction} onCancel={onCancelAction} />
    </>
  );
}
