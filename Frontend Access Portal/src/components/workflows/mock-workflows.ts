
export type WorkflowStatus = 'enabled' | 'draft' | 'archived';
export type TriggerType = 'event-based' | 'time-based' | 'manual';
export type WorkflowCategory = 'joiner-mover-leaver' | 'access-request' | 'certification' | 'revocation' | 'exception' | 'ai-risk';

export type WorkflowNode = {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'notify' | 'exception' | 'end' | 'human-decision' | 'ai-decision';
  label: string;
  config?: any;
  position: { x: number; y: number };
};

export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
};

export type WorkflowVersion = {
  version: string;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
  changes?: string;
};

export type Workflow = {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  status: WorkflowStatus;
  triggerType: TriggerType;
  applicationScope: string[];
  riskScore: number;
  hasTimeLogic: boolean;
  hasSoDViolation: boolean;
  roleSensitivity: 'low' | 'medium' | 'high';
  policyCompliance: 'compliant' | 'warning' | 'violation';
  versions: WorkflowVersion[];
  currentVersion: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  executionCount: number;
  averageCompletionTime: number; // in hours
  lastExecuted?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
};

export const mockWorkflows: Workflow[] = [
  {
    id: 'wf-001',
    name: 'New Employee Onboarding',
    description: 'Automated workflow for provisioning access when new employees join',
    category: 'joiner-mover-leaver',
    status: 'enabled',
    triggerType: 'event-based',
    applicationScope: ['Active Directory', 'Google Workspace', 'Salesforce'],
    riskScore: 2,
    hasTimeLogic: true,
    hasSoDViolation: false,
    roleSensitivity: 'medium',
    policyCompliance: 'compliant',
    versions: [
      { version: '2.1', createdAt: '2024-01-15', createdBy: 'John Smith', isActive: true, changes: 'Added escalation logic' },
      { version: '2.0', createdAt: '2024-01-01', createdBy: 'Jane Doe', isActive: false },
      { version: '1.0', createdAt: '2023-12-01', createdBy: 'Admin', isActive: false }
    ],
    currentVersion: '2.1',
    nodes: [
      { id: 'start', type: 'trigger', label: 'HR System Event', position: { x: 100, y: 100 } },
      { id: 'check-dept', type: 'condition', label: 'Check Department', position: { x: 300, y: 100 } },
      { id: 'mgr-approval', type: 'human-decision', label: 'Manager Approval', position: { x: 500, y: 50 } },
      { id: 'provision', type: 'action', label: 'Provision Access', position: { x: 700, y: 100 } },
      { id: 'notify', type: 'notify', label: 'Send Welcome Email', position: { x: 900, y: 100 } },
      { id: 'end', type: 'end', label: 'Complete', position: { x: 1100, y: 100 } }
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'check-dept' },
      { id: 'e2', source: 'check-dept', target: 'mgr-approval', condition: 'High Risk Dept' },
      { id: 'e3', source: 'check-dept', target: 'provision', condition: 'Standard Dept' },
      { id: 'e4', source: 'mgr-approval', target: 'provision' },
      { id: 'e5', source: 'provision', target: 'notify' },
      { id: 'e6', source: 'notify', target: 'end' }
    ],
    executionCount: 156,
    averageCompletionTime: 4.2,
    lastExecuted: '2024-06-03T14:30:00Z',
    createdAt: '2023-12-01',
    updatedAt: '2024-01-15',
    tags: ['onboarding', 'hr-integration', 'automated']
  },
  {
    id: 'wf-002',
    name: 'High-Risk Access Request',
    description: 'Multi-step approval process for sensitive system access',
    category: 'access-request',
    status: 'enabled',
    triggerType: 'manual',
    applicationScope: ['SAP', 'Financial Systems', 'Production DB'],
    riskScore: 8,
    hasTimeLogic: true,
    hasSoDViolation: true,
    roleSensitivity: 'high',
    policyCompliance: 'warning',
    versions: [
      { version: '1.3', createdAt: '2024-05-20', createdBy: 'Security Team', isActive: true, changes: 'Added SoD checks' }
    ],
    currentVersion: '1.3',
    nodes: [
      { id: 'request', type: 'trigger', label: 'Access Request', position: { x: 100, y: 100 } },
      { id: 'risk-check', type: 'ai-decision', label: 'AI Risk Assessment', position: { x: 300, y: 100 } },
      { id: 'sod-check', type: 'condition', label: 'SoD Violation Check', position: { x: 500, y: 100 } },
      { id: 'ciso-approval', type: 'human-decision', label: 'CISO Approval', position: { x: 700, y: 50 } },
      { id: 'provision-limited', type: 'action', label: 'Provision (Time-Limited)', position: { x: 900, y: 100 } },
      { id: 'escalate', type: 'exception', label: 'Escalate to Security', position: { x: 700, y: 150 } }
    ],
    edges: [
      { id: 'e1', source: 'request', target: 'risk-check' },
      { id: 'e2', source: 'risk-check', target: 'sod-check', condition: 'Risk Score > 7' },
      { id: 'e3', source: 'sod-check', target: 'ciso-approval', condition: 'No Violation' },
      { id: 'e4', source: 'sod-check', target: 'escalate', condition: 'SoD Violation' },
      { id: 'e5', source: 'ciso-approval', target: 'provision-limited' }
    ],
    executionCount: 24,
    averageCompletionTime: 18.5,
    lastExecuted: '2024-06-02T09:15:00Z',
    createdAt: '2024-03-15',
    updatedAt: '2024-05-20',
    tags: ['high-risk', 'ciso-approval', 'time-limited']
  },
  {
    id: 'wf-003',
    name: 'Quarterly Access Certification',
    description: 'Automated certification campaign for all application access',
    category: 'certification',
    status: 'enabled',
    triggerType: 'time-based',
    applicationScope: ['All Applications'],
    riskScore: 3,
    hasTimeLogic: true,
    hasSoDViolation: false,
    roleSensitivity: 'low',
    policyCompliance: 'compliant',
    versions: [
      { version: '3.0', createdAt: '2024-04-01', createdBy: 'Compliance Team', isActive: true }
    ],
    currentVersion: '3.0',
    nodes: [
      { id: 'schedule', type: 'trigger', label: 'Quarterly Schedule', position: { x: 100, y: 100 } },
      { id: 'generate-reports', type: 'action', label: 'Generate Access Reports', position: { x: 300, y: 100 } },
      { id: 'send-to-managers', type: 'notify', label: 'Send to Managers', position: { x: 500, y: 100 } },
      { id: 'collect-responses', type: 'action', label: 'Collect Responses', position: { x: 700, y: 100 } },
      { id: 'auto-revoke', type: 'action', label: 'Auto-Revoke Uncertified', position: { x: 900, y: 100 } }
    ],
    edges: [],
    executionCount: 4,
    averageCompletionTime: 168, // 1 week
    lastExecuted: '2024-04-01T00:00:00Z',
    createdAt: '2024-01-10',
    updatedAt: '2024-04-01',
    tags: ['certification', 'quarterly', 'automated']
  },
  {
    id: 'wf-004',
    name: 'Emergency Access Revocation',
    description: 'Immediate access suspension for security incidents',
    category: 'revocation',
    status: 'enabled',
    triggerType: 'manual',
    applicationScope: ['All Applications'],
    riskScore: 9,
    hasTimeLogic: false,
    hasSoDViolation: false,
    roleSensitivity: 'high',
    policyCompliance: 'compliant',
    versions: [
      { version: '1.0', createdAt: '2024-02-01', createdBy: 'Security Team', isActive: true }
    ],
    currentVersion: '1.0',
    nodes: [],
    edges: [],
    executionCount: 3,
    averageCompletionTime: 0.25, // 15 minutes
    lastExecuted: '2024-05-15T16:45:00Z',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01',
    tags: ['emergency', 'security', 'immediate']
  },
  {
    id: 'wf-005',
    name: 'AI-Powered Risk Assessment',
    description: 'Machine learning-based access risk evaluation',
    category: 'ai-risk',
    status: 'draft',
    triggerType: 'event-based',
    applicationScope: ['High-Risk Applications'],
    riskScore: 6,
    hasTimeLogic: false,
    hasSoDViolation: false,
    roleSensitivity: 'medium',
    policyCompliance: 'violation',
    versions: [
      { version: '0.9', createdAt: '2024-06-01', createdBy: 'AI Team', isActive: true, changes: 'Beta testing phase' }
    ],
    currentVersion: '0.9',
    nodes: [],
    edges: [],
    executionCount: 0,
    averageCompletionTime: 0,
    createdAt: '2024-06-01',
    updatedAt: '2024-06-01',
    tags: ['ai', 'beta', 'machine-learning']
  },
  {
    id: 'wf-006',
    name: 'Role Change Automation',
    description: 'Automated role transition workflow for internal transfers and promotions',
    category: 'joiner-mover-leaver',
    status: 'enabled',
    triggerType: 'event-based',
    applicationScope: ['Active Directory', 'SAP', 'ServiceNow'],
    riskScore: 5,
    hasTimeLogic: true,
    hasSoDViolation: false,
    roleSensitivity: 'medium',
    policyCompliance: 'compliant',
    versions: [
      { version: '1.2', createdAt: '2024-04-10', createdBy: 'HR Operations', isActive: true, changes: 'Added mover detection logic' }
    ],
    currentVersion: '1.2',
    nodes: [
      { id: 'hr-event', type: 'trigger', label: 'HR Role Change Event', position: { x: 100, y: 100 } },
      { id: 'diff-calc', type: 'condition', label: 'Access Delta Calculation', position: { x: 300, y: 100 } },
      { id: 'mgr-review', type: 'human-decision', label: 'New Manager Review', position: { x: 500, y: 100 } },
      { id: 'reprovision', type: 'action', label: 'Reprovision Access', position: { x: 700, y: 100 } },
      { id: 'revoke-old', type: 'action', label: 'Revoke Old Access', position: { x: 900, y: 100 } }
    ],
    edges: [
      { id: 'e1', source: 'hr-event', target: 'diff-calc' },
      { id: 'e2', source: 'diff-calc', target: 'mgr-review' },
      { id: 'e3', source: 'mgr-review', target: 'reprovision' },
      { id: 'e4', source: 'reprovision', target: 'revoke-old' }
    ],
    executionCount: 89,
    averageCompletionTime: 6.5,
    lastExecuted: '2024-06-01T11:00:00Z',
    createdAt: '2024-02-15',
    updatedAt: '2024-04-10',
    tags: ['mover', 'role-change', 'automated']
  },
  {
    id: 'wf-007',
    name: 'Emergency Privilege Escalation',
    description: 'Break-glass procedure for emergency privileged access without standard approvals',
    category: 'exception',
    status: 'enabled',
    triggerType: 'manual',
    applicationScope: ['Production DB', 'Cloud Infrastructure', 'Network Firewalls'],
    riskScore: 10,
    hasTimeLogic: true,
    hasSoDViolation: true,
    roleSensitivity: 'high',
    policyCompliance: 'warning',
    versions: [
      { version: '1.1', createdAt: '2024-03-20', createdBy: 'Security Team', isActive: true, changes: 'Added 4-hour auto-revoke' }
    ],
    currentVersion: '1.1',
    nodes: [
      { id: 'break-glass', type: 'trigger', label: 'Break-Glass Request', position: { x: 100, y: 100 } },
      { id: 'grant-temp', type: 'action', label: 'Grant Temporary Access', position: { x: 300, y: 100 } },
      { id: 'notify-soc', type: 'notify', label: 'Alert SOC Team', position: { x: 500, y: 100 } },
      { id: 'auto-revoke', type: 'action', label: 'Auto-Revoke (4h)', position: { x: 700, y: 100 } }
    ],
    edges: [
      { id: 'e1', source: 'break-glass', target: 'grant-temp' },
      { id: 'e2', source: 'grant-temp', target: 'notify-soc' },
      { id: 'e3', source: 'notify-soc', target: 'auto-revoke' }
    ],
    executionCount: 7,
    averageCompletionTime: 4.0,
    lastExecuted: '2024-05-28T03:15:00Z',
    createdAt: '2024-01-20',
    updatedAt: '2024-03-20',
    tags: ['emergency', 'break-glass', 'privileged']
  },
  {
    id: 'wf-008',
    name: 'Automated SOX Certification',
    description: 'SOX-compliant quarterly certification for financial application access',
    category: 'certification',
    status: 'enabled',
    triggerType: 'time-based',
    applicationScope: ['SAP', 'Financial Systems', 'ERP'],
    riskScore: 4,
    hasTimeLogic: true,
    hasSoDViolation: false,
    roleSensitivity: 'medium',
    policyCompliance: 'compliant',
    versions: [
      { version: '2.0', createdAt: '2024-05-01', createdBy: 'Compliance Team', isActive: true, changes: 'Added SOX control evidence collection' }
    ],
    currentVersion: '2.0',
    nodes: [
      { id: 'sox-trigger', type: 'trigger', label: 'SOX Certification Schedule', position: { x: 100, y: 100 } },
      { id: 'scope-fin', type: 'condition', label: 'Scope Financial Apps', position: { x: 300, y: 100 } },
      { id: 'cfo-cert', type: 'human-decision', label: 'CFO Certification', position: { x: 500, y: 100 } },
      { id: 'evidence', type: 'action', label: 'Collect Evidence', position: { x: 700, y: 100 } },
      { id: 'report', type: 'notify', label: 'Generate SOX Report', position: { x: 900, y: 100 } }
    ],
    edges: [
      { id: 'e1', source: 'sox-trigger', target: 'scope-fin' },
      { id: 'e2', source: 'scope-fin', target: 'cfo-cert' },
      { id: 'e3', source: 'cfo-cert', target: 'evidence' },
      { id: 'e4', source: 'evidence', target: 'report' }
    ],
    executionCount: 3,
    averageCompletionTime: 240,
    lastExecuted: '2024-04-15T00:00:00Z',
    createdAt: '2024-01-05',
    updatedAt: '2024-05-01',
    tags: ['sox', 'certification', 'financial']
  },
  {
    id: 'wf-009',
    name: 'AI Anomaly Response',
    description: 'AI-driven anomalous access pattern detection and automated response',
    category: 'ai-risk',
    status: 'draft',
    triggerType: 'event-based',
    applicationScope: ['All Applications'],
    riskScore: 7,
    hasTimeLogic: false,
    hasSoDViolation: false,
    roleSensitivity: 'high',
    policyCompliance: 'warning',
    versions: [
      { version: '0.5', createdAt: '2024-06-02', createdBy: 'AI Team', isActive: true, changes: 'Initial anomaly detection model' }
    ],
    currentVersion: '0.5',
    nodes: [
      { id: 'ai-detect', type: 'trigger', label: 'AI Anomaly Detection', position: { x: 100, y: 100 } },
      { id: 'ai-assess', type: 'ai-decision', label: 'AI Risk Scoring', position: { x: 300, y: 100 } },
      { id: 'auto-suspend', type: 'action', label: 'Auto-Suspend Access', position: { x: 500, y: 50 } },
      { id: 'soc-review', type: 'human-decision', label: 'SOC Analyst Review', position: { x: 500, y: 150 } }
    ],
    edges: [
      { id: 'e1', source: 'ai-detect', target: 'ai-assess' },
      { id: 'e2', source: 'ai-assess', target: 'auto-suspend', condition: 'Risk > 9' },
      { id: 'e3', source: 'ai-assess', target: 'soc-review', condition: 'Risk 5-9' }
    ],
    executionCount: 0,
    averageCompletionTime: 0,
    createdAt: '2024-06-02',
    updatedAt: '2024-06-02',
    tags: ['ai', 'anomaly-detection', 'automated-response']
  }
];

export const workflowTemplates = [
  {
    id: 'template-joiner',
    name: 'Standard Employee Onboarding',
    category: 'joiner-mover-leaver',
    description: 'NIST-compliant new hire provisioning workflow',
    framework: 'NIST',
    nodes: [
      { id: 'hr-trigger', type: 'trigger', label: 'HR System Event' },
      { id: 'identity-check', type: 'condition', label: 'Identity Verification' },
      { id: 'role-assignment', type: 'action', label: 'Assign Role-Based Access' },
      { id: 'notification', type: 'notify', label: 'Welcome & Training' }
    ]
  },
  {
    id: 'template-sod',
    name: 'SoD Conflict Resolution',
    category: 'access-request',
    description: 'ISO 27001 segregation of duties workflow',
    framework: 'ISO 27001',
    nodes: [
      { id: 'request', type: 'trigger', label: 'Access Request' },
      { id: 'sod-analysis', type: 'condition', label: 'SoD Conflict Check' },
      { id: 'risk-approval', type: 'human-decision', label: 'Risk Committee Review' },
      { id: 'compensating-controls', type: 'action', label: 'Apply Controls' }
    ]
  }
];
