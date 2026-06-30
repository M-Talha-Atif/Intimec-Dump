// Comprehensive mock data for IGA Risk Analytics

export interface RiskDetail {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'mitigated' | 'suppressed';
  type: 'identity' | 'access' | 'policy' | 'operational' | 'application';
  affectedEntities: {
    type: 'user' | 'role' | 'application' | 'entitlement';
    id: string;
    name: string;
  }[];
  source: string[];
  discoveredDate: Date;
  lastUpdated: Date;
  owner?: string;
  dueDate?: Date;
  remediationPlan?: string;
  riskScore: number;
  businessImpact: string;
  technicalDetails: string;
  complianceFrameworks: string[];
  relatedRisks: string[];
}

export interface IdentityRisk {
  userId: string;
  userName: string;
  email: string;
  department: string;
  manager: string;
  riskFactors: string[];
  riskScore: number;
  lastLogin?: Date;
  accountStatus: string;
}

export interface SoDViolationDetail {
  id: string;
  userId: string;
  userName: string;
  conflictingRoles: { roleId: string; roleName: string }[];
  violatedPolicy: string;
  severity: 'critical' | 'high' | 'medium';
  discoveredDate: Date;
  businessJustification?: string;
  approvalStatus: 'pending' | 'approved' | 'denied' | 'none';
  remediationOptions: string[];
}

export interface OrphanAccountDetail {
  id: string;
  accountName: string;
  application: string;
  createdDate: Date;
  lastActivity?: Date;
  assignedEntitlements: string[];
  suggestedOwner?: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

export interface ExcessiveAccessDetail {
  id: string;
  userId: string;
  userName: string;
  application: string;
  assignedPermissions: string[];
  requiredPermissions: string[];
  excessivePermissions: string[];
  lastUsed?: Date;
  riskScore: number;
  suggestedAction: string;
}

export interface RemediationTask {
  id: string;
  riskId: string;
  title: string;
  description: string;
  owner: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  priority: 'critical' | 'high' | 'medium' | 'low';
  createdDate: Date;
  dueDate: Date;
  completedDate?: Date;
  progress: number;
}

export interface RiskTrendData {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

export interface ComplianceMapping {
  framework: string;
  requirements: {
    id: string;
    title: string;
    mappedRisks: string[];
    status: 'compliant' | 'non-compliant' | 'partial';
  }[];
}

// Mock Critical Risks
export const mockCriticalRisks: RiskDetail[] = [
  {
    id: 'risk-001',
    title: 'CEO Account with Excessive Database Admin Rights',
    description: 'Executive account has direct database administrator access to production financial systems, violating least privilege principle.',
    severity: 'critical',
    status: 'open',
    type: 'access',
    affectedEntities: [
      { type: 'user', id: 'u-001', name: 'John Smith (CEO)' },
      { type: 'application', id: 'app-001', name: 'Oracle Financial System' },
      { type: 'role', id: 'r-dba', name: 'Database Administrator' }
    ],
    source: ['Access Analysis', 'Entitlements', 'SoD Policies'],
    discoveredDate: new Date('2024-01-15'),
    lastUpdated: new Date('2024-01-20'),
    owner: 'Security Team',
    dueDate: new Date('2024-02-01'),
    riskScore: 95,
    businessImpact: 'High - Potential for unauthorized financial data manipulation. Audit finding risk. SOX compliance violation.',
    technicalDetails: 'User john.smith@company.com has db_owner role on PROD_FINANCE database. Direct SQL access detected 3 times in last 30 days.',
    complianceFrameworks: ['SOX 404', 'ISO 27001', 'NIST'],
    relatedRisks: ['risk-002', 'risk-005']
  },
  {
    id: 'risk-002',
    title: 'Multiple Terminated Employees with Active SAP Access',
    description: '5 terminated employees still have active SAP accounts with financial transaction capabilities.',
    severity: 'critical',
    status: 'in-progress',
    type: 'identity',
    affectedEntities: [
      { type: 'user', id: 'u-term-1', name: 'Sarah Johnson (Terminated 30 days ago)' },
      { type: 'user', id: 'u-term-2', name: 'Mike Brown (Terminated 45 days ago)' },
      { type: 'application', id: 'app-sap', name: 'SAP ERP' }
    ],
    source: ['Identity Lifecycle', 'Access Reviews', 'Applications'],
    discoveredDate: new Date('2024-01-10'),
    lastUpdated: new Date('2024-01-22'),
    owner: 'IT Operations',
    dueDate: new Date('2024-01-25'),
    remediationPlan: 'Disable accounts immediately. Review and revoke all entitlements. Investigate any activity since termination.',
    riskScore: 92,
    businessImpact: 'Critical - Potential fraud, unauthorized transactions, data breach. Legal and regulatory implications.',
    technicalDetails: 'Accounts created between 2020-2022. Last password change: 60+ days ago. Entitlements: FI-GL (General Ledger), MM-PUR (Purchasing).',
    complianceFrameworks: ['SOX', 'GDPR', 'PCI-DSS'],
    relatedRisks: ['risk-003']
  },
  {
    id: 'risk-003',
    title: 'Service Account with Password Not Changed in 2 Years',
    description: 'Critical service account "svc_payroll_integration" uses a password that has not been rotated in 730 days.',
    severity: 'critical',
    status: 'open',
    type: 'identity',
    affectedEntities: [
      { type: 'user', id: 'svc-001', name: 'svc_payroll_integration' },
      { type: 'application', id: 'app-payroll', name: 'ADP Payroll System' }
    ],
    source: ['Identity Lifecycle', 'Security Monitoring'],
    discoveredDate: new Date('2024-01-18'),
    lastUpdated: new Date('2024-01-18'),
    riskScore: 88,
    businessImpact: 'High - Payroll data breach risk. Affects 5000+ employees. Potential for salary data exposure.',
    technicalDetails: 'Account has privileged access to payroll database. Static password stored in config file. No MFA enabled.',
    complianceFrameworks: ['PCI-DSS', 'GDPR'],
    relatedRisks: []
  }
  // Add more critical risks (total 23)
];

// Mock SoD Violations
export const mockSoDViolations: SoDViolationDetail[] = [
  {
    id: 'sod-001',
    userId: 'u-101',
    userName: 'Jane Martinez - Finance Manager',
    conflictingRoles: [
      { roleId: 'r-ap-create', roleName: 'Accounts Payable Creator' },
      { roleId: 'r-ap-approve', roleName: 'Accounts Payable Approver' }
    ],
    violatedPolicy: 'SOD-FIN-001: Finance Separation - Create and Approve',
    severity: 'critical',
    discoveredDate: new Date('2024-01-12'),
    businessJustification: 'Small team - only 2 people in AP department',
    approvalStatus: 'pending',
    remediationOptions: [
      'Remove approval rights',
      'Implement compensating controls (audit log review)',
      'Require secondary approval for own transactions',
      'Request formal exception with monthly attestation'
    ]
  },
  {
    id: 'sod-002',
    userId: 'u-102',
    userName: 'Robert Chen - IT Administrator',
    conflictingRoles: [
      { roleId: 'r-dev', roleName: 'Developer - Production Access' },
      { roleId: 'r-dba', roleName: 'Database Administrator - Production' }
    ],
    violatedPolicy: 'SOD-IT-003: Development and Production DBA Segregation',
    severity: 'high',
    discoveredDate: new Date('2024-01-15'),
    approvalStatus: 'none',
    remediationOptions: [
      'Separate development and production access',
      'Implement privileged access management',
      'Enable session recording for privileged access'
    ]
  }
  // Add 5 more SoD violations
];

// Mock Orphan Accounts
export const mockOrphanAccounts: OrphanAccountDetail[] = [
  {
    id: 'orphan-001',
    accountName: 'contractor_smith_temp',
    application: 'Salesforce',
    createdDate: new Date('2022-03-15'),
    lastActivity: new Date('2022-06-20'),
    assignedEntitlements: ['Sales - Full Access', 'Reports - View All', 'Export Data'],
    suggestedOwner: 'Sales Operations Manager',
    riskLevel: 'high'
  },
  {
    id: 'orphan-002',
    accountName: 'test_migration_2022',
    application: 'Oracle EBS',
    createdDate: new Date('2022-01-10'),
    assignedEntitlements: ['Finance - GL Entry', 'Finance - Journal Approval'],
    riskLevel: 'critical'
  }
  // Add more orphan accounts (total 34)
];

// Mock Excessive Access
export const mockExcessiveAccess: ExcessiveAccessDetail[] = [
  {
    id: 'excess-001',
    userId: 'u-201',
    userName: 'Alice Williams - Marketing Coordinator',
    application: 'Google Workspace',
    assignedPermissions: ['Drive - Full Access', 'Admin Console - User Management', 'Admin Console - Billing', 'Groups - Admin'],
    requiredPermissions: ['Drive - Full Access', 'Groups - Member'],
    excessivePermissions: ['Admin Console - User Management', 'Admin Console - Billing', 'Groups - Admin'],
    lastUsed: new Date('2023-11-05'),
    riskScore: 72,
    suggestedAction: 'Reduce to standard user permissions. User has not used admin permissions in 60+ days.'
  }
  // Add more excessive access instances (total 156)
];

// Mock Risk Trends (30 days)
export const mockRiskTrends: RiskTrendData[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split('T')[0],
    critical: 18 + Math.floor(Math.random() * 8),
    high: 45 + Math.floor(Math.random() * 15),
    medium: 120 + Math.floor(Math.random() * 30),
    low: 200 + Math.floor(Math.random() * 50),
    total: 383 + Math.floor(Math.random() * 100)
  };
});

// Mock Remediation Tasks
export const mockRemediationTasks: RemediationTask[] = [
  {
    id: 'task-001',
    riskId: 'risk-001',
    title: 'Remove DBA access from CEO account',
    description: 'Coordinate with IT and CFO to remove database admin rights. Set up approval workflow for emergency access if needed.',
    owner: 'security.team@company.com',
    status: 'in-progress',
    priority: 'critical',
    createdDate: new Date('2024-01-20'),
    dueDate: new Date('2024-02-01'),
    progress: 45
  },
  {
    id: 'task-002',
    riskId: 'risk-002',
    title: 'Disable terminated employee SAP accounts',
    description: 'Immediately disable all 5 accounts. Review access logs. Document findings.',
    owner: 'it.operations@company.com',
    status: 'in-progress',
    priority: 'critical',
    createdDate: new Date('2024-01-22'),
    dueDate: new Date('2024-01-25'),
    progress: 70
  }
];

// Mock Compliance Mappings
export const mockComplianceMappings: ComplianceMapping[] = [
  {
    framework: 'SOX 404',
    requirements: [
      {
        id: 'sox-404-1',
        title: 'Access Controls - Segregation of Duties',
        mappedRisks: ['risk-001', 'sod-001', 'sod-002'],
        status: 'non-compliant'
      },
      {
        id: 'sox-404-2',
        title: 'Terminated User Access Removal',
        mappedRisks: ['risk-002'],
        status: 'non-compliant'
      }
    ]
  },
  {
    framework: 'PCI-DSS 3.2',
    requirements: [
      {
        id: 'pci-7.1',
        title: 'Limit access to system components',
        mappedRisks: ['risk-001', 'excess-001'],
        status: 'partial'
      }
    ]
  }
];

// Helper functions
export const getRiskById = (id: string): RiskDetail | undefined => {
  return mockCriticalRisks.find(r => r.id === id);
};

export const getRisksByType = (type: string) => {
  return mockCriticalRisks.filter(r => r.type === type);
};

export const getRisksBySeverity = (severity: string) => {
  return mockCriticalRisks.filter(r => r.severity === severity);
};

export const getRisksByStatus = (status: string) => {
  return mockCriticalRisks.filter(r => r.status === status);
};
