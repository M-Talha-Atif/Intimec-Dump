// Comprehensive mock data for IGA Task Center

export interface MockTask {
  id: string;
  name: string;
  type: 'data-import' | 'ai-analysis' | 'global-import' | 'provisioning' | 'review' | 'sync' | 'api_trigger' | 'workflow' | 'deprovisioning' | 'certification' | 'reconciliation' | 'compliance';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'escalated';
  createdAt: string;
  updatedAt: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  progress?: number;
  
  // Identity and ownership
  affectedIdentity: string;
  initiatedBy: string;
  
  // Application context
  application: string;
  applications: string[];
  
  // Task metadata
  triggerSource: 'ui' | 'api' | 'scheduled' | 'workflow';
  retryCount?: number;
  slaCountdown: number;
  
  // Task data
  payload?: any;
  logs?: string[];
  
  // Task tracking
  history?: Array<{
    status: string;
    timestamp: string;
    notes?: string;
  }>;
  
  // Related objects
  linkedObjects?: {
    userId?: string;
    applicationId?: string;
    entitlementId?: string;
    requestId?: string;
    reviewId?: string;
    certificationId?: string;
  };
  
  // User annotations
  notes?: Array<{
    id: string;
    text: string;
    author: string;
    timestamp: string;
  }>;
  tags?: string[];
  
  // Execution results
  result?: {
    processed: number;
    successful: number;
    failed: number;
    errors: string[];
  };
  objects?: string[];

  // IGA-specific fields
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  approver?: string;
  requester?: string;
  businessJustification?: string;
  sodViolations?: Array<{
    policy: string;
    severity: string;
    description: string;
  }>;
}

export const generateMockTasks = (): MockTask[] => {
  const now = Date.now();
  const dayMs = 86400000;
  const hourMs = 3600000;

  return [
    // Provisioning Tasks
    {
      id: 'TSK-001',
      name: 'Provision Office 365 Access for New Hire',
      type: 'provisioning',
      status: 'running',
      createdAt: new Date(now - hourMs * 2).toISOString(),
      updatedAt: new Date(now - hourMs * 1.5).toISOString(),
      startTime: new Date(now - hourMs * 1.5).toISOString(),
      progress: 65,
      affectedIdentity: 'john.doe@company.com',
      initiatedBy: 'hr@company.com',
      application: 'Office 365',
      applications: ['Office 365', 'Exchange Online', 'SharePoint'],
      triggerSource: 'ui',
      slaCountdown: 180,
      retryCount: 0,
      tags: ['new-hire', 'urgent'],
      riskLevel: 'low',
      requester: 'hr@company.com',
      businessJustification: 'New employee onboarding - Finance department',
      logs: [
        'Task initiated by HR system',
        'Validating user information',
        'Creating mailbox in Exchange Online',
        'Assigning Office 365 E3 license',
        'Configuring SharePoint access'
      ],
      linkedObjects: {
        userId: 'usr-12345',
        requestId: 'REQ-789'
      }
    },
    {
      id: 'TSK-002',
      name: 'Provision SAP Finance Module Access',
      type: 'provisioning',
      status: 'completed',
      createdAt: new Date(now - dayMs * 1).toISOString(),
      updatedAt: new Date(now - dayMs * 1 + hourMs * 2).toISOString(),
      startTime: new Date(now - dayMs * 1).toISOString(),
      endTime: new Date(now - dayMs * 1 + hourMs * 2).toISOString(),
      duration: 7200,
      affectedIdentity: 'jane.smith@company.com',
      initiatedBy: 'finance-manager@company.com',
      application: 'SAP ERP',
      applications: ['SAP ERP', 'SAP BI'],
      triggerSource: 'workflow',
      slaCountdown: 2400,
      retryCount: 0,
      tags: ['finance', 'approved'],
      riskLevel: 'high',
      approver: 'cfo@company.com',
      requester: 'jane.smith@company.com',
      businessJustification: 'Required for quarterly financial close activities',
      sodViolations: [
        {
          policy: 'SOD-FIN-001: Payment Creation & Approval Separation',
          severity: 'high',
          description: 'User will have ability to both create and approve payments'
        }
      ],
      result: {
        processed: 1,
        successful: 1,
        failed: 0,
        errors: []
      },
      linkedObjects: {
        userId: 'usr-67890',
        requestId: 'REQ-456',
        applicationId: 'app-sap-001'
      },
      history: [
        {
          status: 'pending',
          timestamp: new Date(now - dayMs * 1).toISOString(),
          notes: 'Access request submitted'
        },
        {
          status: 'running',
          timestamp: new Date(now - dayMs * 1 + hourMs * 0.5).toISOString(),
          notes: 'SoD check initiated'
        },
        {
          status: 'completed',
          timestamp: new Date(now - dayMs * 1 + hourMs * 2).toISOString(),
          notes: 'Access provisioned successfully with SoD violation flagged for review'
        }
      ]
    },

    // Access Review Tasks
    {
      id: 'TSK-003',
      name: 'Quarterly Access Review: Finance Team',
      type: 'review',
      status: 'pending',
      createdAt: new Date(now - dayMs * 3).toISOString(),
      updatedAt: new Date(now - dayMs * 3).toISOString(),
      affectedIdentity: 'finance-team@company.com',
      initiatedBy: 'system',
      application: 'SAP ERP',
      applications: ['SAP ERP', 'Oracle Financials', 'Workday'],
      triggerSource: 'scheduled',
      slaCountdown: 5760,
      tags: ['certification', 'compliance'],
      riskLevel: 'medium',
      approver: 'finance-manager@company.com',
      businessJustification: 'Quarterly access certification requirement',
      linkedObjects: {
        reviewId: 'REV-Q1-2024',
        certificationId: 'CERT-FIN-Q1'
      }
    },
    {
      id: 'TSK-004',
      name: 'Access Review: Privileged Admin Accounts',
      type: 'certification',
      status: 'escalated',
      createdAt: new Date(now - dayMs * 7).toISOString(),
      updatedAt: new Date(now - dayMs * 1).toISOString(),
      affectedIdentity: 'admin-group@company.com',
      initiatedBy: 'compliance@company.com',
      application: 'Active Directory',
      applications: ['Active Directory', 'AWS', 'Azure'],
      triggerSource: 'scheduled',
      slaCountdown: -120,
      tags: ['overdue', 'high-risk', 'escalated'],
      riskLevel: 'critical',
      approver: 'ciso@company.com',
      businessJustification: 'Monthly privileged access certification',
      notes: [
        {
          id: 'note-1',
          text: 'Escalated due to missed SLA. Compliance team notified.',
          author: 'system',
          timestamp: new Date(now - dayMs * 1).toISOString()
        }
      ],
      linkedObjects: {
        reviewId: 'REV-ADMIN-JAN',
        certificationId: 'CERT-ADMIN-001'
      }
    },

    // Deprovisioning Tasks
    {
      id: 'TSK-005',
      name: 'Deprovision Access for Terminated Employee',
      type: 'deprovisioning',
      status: 'running',
      createdAt: new Date(now - hourMs * 3).toISOString(),
      updatedAt: new Date(now - hourMs * 2).toISOString(),
      startTime: new Date(now - hourMs * 2).toISOString(),
      progress: 80,
      affectedIdentity: 'bob.wilson@company.com',
      initiatedBy: 'hr@company.com',
      application: 'All Systems',
      applications: ['Office 365', 'Salesforce', 'SAP', 'AWS', 'Workday'],
      triggerSource: 'workflow',
      slaCountdown: 60,
      retryCount: 0,
      tags: ['termination', 'urgent', 'high-priority'],
      riskLevel: 'high',
      requester: 'hr@company.com',
      businessJustification: 'Employee termination effective immediately',
      logs: [
        'Termination workflow initiated',
        'Disabled Office 365 account - Completed',
        'Revoked Salesforce access - Completed',
        'Removing SAP roles - In Progress',
        'Revoking AWS IAM permissions - Pending',
        'Disabling Workday account - Pending'
      ],
      result: {
        processed: 5,
        successful: 2,
        failed: 0,
        errors: []
      }
    },

    // Data Import Tasks
    {
      id: 'TSK-006',
      name: 'Daily AD User Sync',
      type: 'data-import',
      status: 'completed',
      createdAt: new Date(now - hourMs * 6).toISOString(),
      updatedAt: new Date(now - hourMs * 5.5).toISOString(),
      startTime: new Date(now - hourMs * 6).toISOString(),
      endTime: new Date(now - hourMs * 5.5).toISOString(),
      duration: 1800,
      affectedIdentity: 'system',
      initiatedBy: 'system',
      application: 'Active Directory',
      applications: ['Active Directory'],
      triggerSource: 'scheduled',
      slaCountdown: 3600,
      retryCount: 0,
      tags: ['scheduled', 'automated'],
      riskLevel: 'low',
      result: {
        processed: 1250,
        successful: 1248,
        failed: 2,
        errors: ['User john.temp@company.com - Invalid email format', 'User test.account - Missing required field: department']
      }
    },
    {
      id: 'TSK-007',
      name: 'Import Contractors from HR System',
      type: 'data-import',
      status: 'failed',
      createdAt: new Date(now - hourMs * 4).toISOString(),
      updatedAt: new Date(now - hourMs * 3).toISOString(),
      startTime: new Date(now - hourMs * 4).toISOString(),
      endTime: new Date(now - hourMs * 3).toISOString(),
      duration: 3600,
      affectedIdentity: 'contractor-group',
      initiatedBy: 'hr-system',
      application: 'Workday',
      applications: ['Workday'],
      triggerSource: 'api',
      slaCountdown: 1200,
      retryCount: 2,
      tags: ['failed', 'needs-attention'],
      riskLevel: 'medium',
      result: {
        processed: 45,
        successful: 0,
        failed: 45,
        errors: ['Connection timeout to HR API', 'Authentication failed', 'Rate limit exceeded']
      },
      logs: [
        'Connecting to Workday API',
        'ERROR: Connection timeout after 30 seconds',
        'Retry attempt 1 failed',
        'Retry attempt 2 failed',
        'Task marked as failed'
      ]
    },

    // Workflow Tasks
    {
      id: 'TSK-008',
      name: 'Multi-Step Approval: Database Access Request',
      type: 'workflow',
      status: 'pending',
      createdAt: new Date(now - dayMs * 2).toISOString(),
      updatedAt: new Date(now - dayMs * 1).toISOString(),
      affectedIdentity: 'alice.brown@company.com',
      initiatedBy: 'alice.brown@company.com',
      application: 'Oracle Database',
      applications: ['Oracle Database'],
      triggerSource: 'ui',
      slaCountdown: 4320,
      tags: ['multi-approval', 'database'],
      riskLevel: 'high',
      approver: 'dba-team@company.com',
      requester: 'alice.brown@company.com',
      businessJustification: 'Need production database read access for audit investigation',
      linkedObjects: {
        userId: 'usr-11111',
        requestId: 'REQ-999',
        applicationId: 'app-oracle-prod'
      },
      history: [
        {
          status: 'pending',
          timestamp: new Date(now - dayMs * 2).toISOString(),
          notes: 'Request submitted'
        },
        {
          status: 'pending',
          timestamp: new Date(now - dayMs * 1.5).toISOString(),
          notes: 'Manager approved - Forwarded to DBA team'
        }
      ]
    },

    // Reconciliation Tasks
    {
      id: 'TSK-009',
      name: 'Salesforce Account Reconciliation',
      type: 'reconciliation',
      status: 'running',
      createdAt: new Date(now - hourMs * 8).toISOString(),
      updatedAt: new Date(now - hourMs * 7).toISOString(),
      startTime: new Date(now - hourMs * 7).toISOString(),
      progress: 45,
      affectedIdentity: 'system',
      initiatedBy: 'system',
      application: 'Salesforce',
      applications: ['Salesforce', 'Active Directory'],
      triggerSource: 'scheduled',
      slaCountdown: 7200,
      tags: ['reconciliation', 'automated'],
      riskLevel: 'medium',
      logs: [
        'Starting account reconciliation',
        'Fetching accounts from Salesforce: 2,345 accounts',
        'Fetching accounts from HR system: 2,340 accounts',
        'Identifying orphan accounts...',
        'Found 5 potential orphan accounts',
        'Analyzing access patterns...'
      ]
    },

    // Compliance Tasks
    {
      id: 'TSK-010',
      name: 'SOX Compliance Attestation',
      type: 'compliance',
      status: 'pending',
      createdAt: new Date(now - dayMs * 5).toISOString(),
      updatedAt: new Date(now - dayMs * 5).toISOString(),
      affectedIdentity: 'financial-systems',
      initiatedBy: 'compliance@company.com',
      application: 'SAP ERP',
      applications: ['SAP ERP', 'Oracle Financials'],
      triggerSource: 'ui',
      slaCountdown: 8640,
      tags: ['sox', 'compliance', 'attestation'],
      riskLevel: 'high',
      approver: 'cfo@company.com',
      requester: 'compliance@company.com',
      businessJustification: 'Quarterly SOX compliance attestation required'
    },

    // More varied tasks
    {
      id: 'TSK-011',
      name: 'Emergency Access Grant: Production Database',
      type: 'provisioning',
      status: 'completed',
      createdAt: new Date(now - hourMs * 12).toISOString(),
      updatedAt: new Date(now - hourMs * 11.5).toISOString(),
      startTime: new Date(now - hourMs * 12).toISOString(),
      endTime: new Date(now - hourMs * 11.5).toISOString(),
      duration: 1800,
      affectedIdentity: 'incident-response@company.com',
      initiatedBy: 'incident-manager@company.com',
      application: 'PostgreSQL Production',
      applications: ['PostgreSQL Production'],
      triggerSource: 'ui',
      slaCountdown: 1440,
      tags: ['emergency', 'incident', 'completed'],
      riskLevel: 'critical',
      approver: 'cto@company.com',
      requester: 'incident-manager@company.com',
      businessJustification: 'Emergency incident response - Production database issue',
      result: {
        processed: 1,
        successful: 1,
        failed: 0,
        errors: []
      },
      notes: [
        {
          id: 'note-2',
          text: 'Emergency access granted for incident INC-54321. Time-limited access for 4 hours.',
          author: 'incident-manager@company.com',
          timestamp: new Date(now - hourMs * 12).toISOString()
        }
      ]
    },
    {
      id: 'TSK-012',
      name: 'AI Analysis: Detect Anomalous Access Patterns',
      type: 'ai-analysis',
      status: 'running',
      createdAt: new Date(now - hourMs * 1).toISOString(),
      updatedAt: new Date(now - hourMs * 0.5).toISOString(),
      startTime: new Date(now - hourMs * 0.5).toISOString(),
      progress: 35,
      affectedIdentity: 'all-users',
      initiatedBy: 'security-team@company.com',
      application: 'Multiple Systems',
      applications: ['Office 365', 'AWS', 'Salesforce', 'SAP'],
      triggerSource: 'scheduled',
      slaCountdown: 2400,
      tags: ['ai', 'security', 'analysis'],
      riskLevel: 'medium',
      logs: [
        'Loading access logs from past 30 days',
        'Processing 1.2M access events',
        'Applying ML model for anomaly detection',
        'Analyzing patterns...'
      ]
    }
  ];
};

export const getMockTaskById = (taskId: string): MockTask | undefined => {
  const tasks = generateMockTasks();
  return tasks.find(t => t.id === taskId);
};

export const getMockTasksByStatus = (status: MockTask['status']): MockTask[] => {
  const tasks = generateMockTasks();
  return tasks.filter(t => t.status === status);
};

export const getMockTasksByType = (type: MockTask['type']): MockTask[] => {
  const tasks = generateMockTasks();
  return tasks.filter(t => t.type === type);
};
