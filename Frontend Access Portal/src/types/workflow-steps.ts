import { LucideIcon } from 'lucide-react';
import { WorkflowNodeData } from './workflow';

// Escalation configuration for approval nodes
export interface EscalationConfig {
  enabled: boolean;
  afterMinutes: number;
  strategy: 'hierarchy' | 'role' | 'static';
  maxEscalationLevels: number;
  notifyOriginalApprover: boolean;
  config?: {
    // Hierarchy strategy config
    hierarchyType?: 'manager' | 'department_head';
    levels?: number;
    // Role strategy config
    roleNames?: string[];
    // Static strategy config
    approverIds?: string[];
  };
}

// Approver resolution configuration
export interface ApproverResolutionConfig {
  strategy: 'static' | 'context' | 'role' | 'hierarchy';
  config?: {
    // Static strategy config
    approverIds?: string[];
    // Context strategy config
    contextPath?: string;
    // Role strategy config
    roleName?: string;
    // Hierarchy strategy config
    hierarchyType?: 'manager' | 'department_head';
    levels?: number;
  };
}

// Extended workflow node data for IGA requirements
export interface ExtendedWorkflowNodeData extends WorkflowNodeData {
  // Escalation configuration for approval nodes
  escalation?: EscalationConfig;
  
  // Approver resolution strategy
  approverResolution?: ApproverResolutionConfig;
  
  // Policy & Governance - Phase 1 Enhanced
  approvalPolicy?: {
    type: 'single' | 'all' | 'any' | 'sequence' | 'quorum';
    quorum?: number;
    resolver: 'manager' | 'app-owner' | 'role-owner' | 'specific' | 'dynamic';
    timeout?: number;
    escalationChain?: string[];
    delegationEnabled?: boolean;
    autoApproveThreshold?: 'low' | 'medium';
    // Phase 1: OOO & Business Calendar
    oooHandling?: {
      enabled: boolean;
      fallbackStrategy: 'skip' | 'manager' | 'delegate' | 'pool';
      delegatePool?: string[];
    };
    businessCalendar?: {
      enabled: boolean;
      calendarId: string;
      excludeWeekends: boolean;
      excludeHolidays: boolean;
      timezone?: string;
    };
    // Phase 1: Dynamic Approvers
    dynamicApprovers?: {
      sourceType: 'attribute' | 'query' | 'api' | 'rule';
      expression: string;
    };
    // Phase 1: Voting Rules
    votingRules?: {
      quorumPercentage?: number;
      tieBreaker: 'reject' | 'approve' | 'escalate';
      weightedVoting?: Record<string, number>;
    };
  };
  
  sodPolicy?: {
    enabled: boolean;
    conflictingRoles?: string[];
    exceptions?: Array<{
      reason: string;
      approver: string;
      expiry: Date;
    }>;
    // Phase 1: Proactive SoD
    preCheckMode?: 'block' | 'warn' | 'audit-only';
    riskCalculation?: {
      enabled: boolean;
      algorithm: 'simple-sum' | 'weighted-graph' | 'ml-prediction';
      thresholds: { low: number; medium: number; high: number };
    };
    mitigatingControls?: Array<{
      controlId: string;
      type: 'approval' | 'attestation' | 'time-bound' | 'monitoring';
      effectiveness: number;
    }>;
    pathAnalysis?: {
      enabled: boolean;
      maxDepth: number;
      visualizeConflictPath: boolean;
    };
  };

  // Target System Configuration - Phase 1 Enhanced
  targetSystem?: {
    type: 'active-directory' | 'sap' | 'workday' | 'salesforce' | 'servicenow' | 'custom';
    endpoint?: string;
    operation: 'create' | 'enable' | 'disable' | 'assign' | 'remove' | 'modify';
    correlationRule?: string;
    mapping?: Record<string, any>;
    // Phase 1: Intelligent Provisioning
    dryRunMode?: boolean;
    errorCatalog?: {
      [errorCode: string]: {
        action: 'retry' | 'escalate' | 'skip' | 'alternate-path' | 'manual';
        fallbackNode?: string;
        notification?: string[];
      };
    };
    compensation?: {
      enabled: boolean;
      rollbackSteps: string[];
    };
  };

  // SLA & Business Logic
  slaConfiguration?: {
    duration: number;
    unit: 'hours' | 'days' | 'weeks';
    businessCalendar: boolean;
    escalationRules?: Array<{
      threshold: number;
      action: string;
      recipients: string[];
    }>;
  };

  // Notifications & Communications
  notificationConfig?: {
    channels: Array<'email' | 'slack' | 'teams' | 'webhook'>;
    recipients: string[];
    template: string;
    variables?: Record<string, string>;
    conditions?: string[];
  };

  // Error Handling & Resilience - Phase 1 Enhanced
  errorHandling?: {
    retryPolicy?: {
      maxAttempts: number;
      backoffStrategy: 'linear' | 'exponential' | 'fibonacci';
      baseDelay: number;
      maxDelay?: number;
      jitter?: boolean;
    };
    circuitBreaker?: {
      enabled: boolean;
      failureThreshold: number;
      timeout: number;
      halfOpenRequests?: number;
    };
    deadLetterEnabled?: boolean;
  };

  // Phase 1: Testing Configuration
  testingConfig?: {
    scenarios?: Array<{
      id: string;
      name: string;
      description: string;
      inputs: Record<string, any>;
      expectedOutputs: Record<string, any>;
      mockResponses?: Record<string, any>;
    }>;
    coverage?: {
      nodes: number;
      edges: number;
      branches: number;
    };
  };

  // Security & Compliance
  securityConfig?: {
    auditLevel: 'minimal' | 'standard' | 'detailed';
    evidenceBundle: boolean;
    piiHandling: 'standard' | 'strict' | 'anonymize';
    encryptionRequired: boolean;
  };

  // Data Transformation & Scripts - Phase 3 Enhanced
  scriptConfig?: {
    language: 'javascript' | 'powershell' | 'python';
    code: string;
    sandbox: boolean;
    timeout: number;
    allowedModules?: string[];
    // Phase 3: Security
    security?: {
      allowedAPIs: string[];
      deniedAPIs: string[];
      memoryLimit: number;
      cpuLimit: number;
      networkAccess: boolean;
      fileSystemAccess: 'none' | 'read' | 'read-write';
    };
    staticAnalysis?: {
      enabled: boolean;
      rules: string[];
      blockOnViolation: boolean;
    };
    secretScanning?: {
      enabled: boolean;
      patterns: string[];
    };
    versionControl?: {
      trackChanges: boolean;
      requireReview: boolean;
      reviewers: string[];
      version?: string;
    };
  };

  // Webhooks & Integration - Phase 2 Enhanced
  webhookConfig?: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    authentication?: {
      type: 'none' | 'basic' | 'bearer' | 'oauth2' | 'mtls' | 'hmac' | 'api-key';
      credentials?: Record<string, string>;
      oauth2?: {
        clientId: string;
        tokenUrl: string;
        scopes: string[];
        refreshStrategy: 'auto' | 'manual';
      };
      hmac?: {
        algorithm: 'sha256' | 'sha512';
        secretRef: string;
        headerName: string;
      };
      mtls?: {
        certRef: string;
        keyRef: string;
      };
    };
    timeout: number;
    retries: number;
    resilience?: {
      idempotencyKey?: string;
      dedupe: boolean;
    };
    responseHandling?: {
      successCodes: number[];
      extractors: Array<{
        path: string;
        variable: string;
      }>;
    };
  };

  // Phase 2: Lifecycle-Aware Configuration
  lifecycleConfig?: {
    phase: 'pre-hire' | 'onboard' | 'active' | 'transfer' | 'offboard' | 'post-termination';
    rules?: {
      carryForwardAccess: boolean;
      revokeAll: boolean;
      gracePeriod?: number;
      dataRetention?: {
        archiveEmails: boolean;
        transferFiles: boolean;
        backupData: boolean;
      };
    };
    roleTransitions?: {
      from?: string[];
      to?: string[];
      reconcileStrategy: 'additive' | 'replace' | 'merge';
    };
    managerTransition?: {
      transferDirectReports: boolean;
      transferApprovals: boolean;
      delegateTasks: boolean;
    };
  };

  // Phase 2: Explainability & Decision Logging
  explainabilityConfig?: {
    decisionLogging?: {
      captureReasoning: boolean;
      reasoningTemplate: string;
      evidenceBundle: boolean;
      includeContext: string[];
    };
    complianceAnnotations?: {
      framework: string[];
      controlIds: string[];
      riskRating: string;
      justification: string;
    };
  };

  // Phase 4: Data Enrichment Configuration
  enrichmentConfig?: {
    sources: Array<'hr-system' | 'active-directory' | 'external-api' | 'database'>;
    mapping: Record<string, string>;
    caching?: {
      enabled: boolean;
      ttl: number;
    };
    fallbackStrategy?: 'skip' | 'default-values' | 'error';
  };

  // Phase 4: Certification Configuration
  certificationConfig?: {
    type: 'access-review' | 'role-review' | 'entitlement-review' | 'sod-review';
    scope: 'user' | 'department' | 'application' | 'all';
    schedule: {
      frequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
      dayOfMonth?: number;
      timezone?: string;
    };
    reviewers: string[];
    autoApprove?: {
      enabled: boolean;
      conditions: string[];
    };
    escalation?: {
      enabled: boolean;
      thresholdDays: number;
      escalateTo: string[];
    };
  };

  // Parallel Processing - Phase 3 Enhanced
  parallelConfig?: {
    maxConcurrency: number;
    aggregationStrategy: 'all-success' | 'any-success' | 'majority';
    failureHandling: 'fail-fast' | 'continue' | 'partial-success';
    // Phase 3: Smart Orchestration
    strategy?: {
      type: 'all' | 'any' | 'quorum' | 'race' | 'waterfall';
      quorumSize?: number;
      timeout: number;
      cancelOnFirstFailure: boolean;
    };
    childNodes?: Array<{
      nodeId: string;
      weight?: number;
      optional: boolean;
      timeout?: number;
    }>;
    results?: {
      aggregation: 'collect' | 'merge' | 'latest' | 'custom';
      customAggregator?: string;
      successCriteria: string;
    };
    isolation?: {
      shareContext: boolean;
      isolateErrors: boolean;
      rollbackStrategy: 'all' | 'failed-only' | 'none';
    };
  };

  // Wait/Timer Configuration
  waitConfig?: {
    duration: number;
    unit: 'minutes' | 'hours' | 'days';
    condition?: string;
    maxWait?: number;
  };
}

// Step type categories for palette organization
export interface StepCategory {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  steps: StepDefinition[];
}

export interface StepDefinition {
  type: string;
  label: string;
  description: string;
  icon: LucideIcon;
  risk: 'low' | 'medium' | 'high';
  category: string;
  requiredFields?: string[];
  availableTabs?: PanelTab[];
}

export type PanelTab = 
  | 'general'
  | 'inputs'
  | 'policy'
  | 'target'
  | 'sla'
  | 'notifications'
  | 'errorHandling'
  | 'security'
  | 'preview';

// Panel configuration based on step type
export interface PanelConfiguration {
  stepType: string;
  tabs: PanelTab[];
  requiredFields: string[];
  validationRules: ValidationRule[];
}

export interface ValidationRule {
  field: string;
  rule: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  severity: 'error' | 'warning';
}
