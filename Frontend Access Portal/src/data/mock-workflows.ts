
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
  // Template relationship
  sourceTemplateId?: string;
  templateMetadata?: {
    templateId: string;
    templateName: string;
    templateVersion: string;
    templateCategory?: string;
    usageCount?: number;
    isSystemTemplate?: boolean;
  };
  isConnectedToTemplate?: boolean;
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
