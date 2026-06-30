export interface IdentityRiskDetail {
  id: string;
  name: string;
  email: string;
  riskScore: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  department: string;
  lastActivity: string;
  issues: string[];
}

export interface TaskMetrics {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  overdue: number;
  byType: Record<string, number>;
  bySLA: {
    ok: number;
    warning: number;
    breach: number;
  };
  recentTasks: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    assignee: string;
    dueDate: string;
  }>;
}

export interface AccessLifecycleMetrics {
  joiners: { count: number; trend: string; details: any[] };
  movers: { count: number; trend: string; details: any[] };
  leavers: { count: number; trend: string; details: any[] };
  provisioning: { avgTime: number; total: number };
  deprovisioning: { avgTime: number; total: number };
}

export interface PrivilegedAccessMetrics {
  totalAccounts: number;
  activeSessions: number;
  violations: number;
  byApplication: Record<string, number>;
  recentActivity: Array<{
    user: string;
    action: string;
    application: string;
    timestamp: string;
    risk: string;
  }>;
}

type CampaignStatus = "in-progress" | "planned" | "completed";

export interface CertificationMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  completionRate: number;
  itemsPending: number;
  overdueReviews: number;
  campaigns: Array<{
    id: string;
    name: string;
    status: CampaignStatus
    progress: number;
    dueDate: string;
    itemsTotal: number;
    itemsCompleted: number;
  }>;
}

export interface ComplianceMetrics {
  overallScore: number;
  policyViolations: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  exceptions: number;
  auditFindings: number;
  trend: 'up' | 'down' | 'stable';
  details: Array<{
    policy: string;
    violations: number;
    severity: string;
    lastOccurrence: string;
  }>;
}

export interface ApplicationHealthMetrics {
  totalApps: number;
  connected: number;
  errors: number;
  syncStatus: Record<string, {
    status: 'healthy' | 'warning' | 'error';
    lastSync: string;
    accountCount: number;
    errorMessage?: string;
  }>;
}

export interface SLAMetrics {
  onTime: number;
  nearBreach: number;
  breached: number;
  avgCompletionTime: number;
  predictions: Array<{
    taskId: string;
    taskName: string;
    predictedBreach: string;
    confidence: number;
  }>;
}

export const generateDashboardData = (dateRange: string = '30days') => {
  // Identity Risk Details
  const terminatedAccounts: IdentityRiskDetail[] = [
    {
      id: 'USR-001',
      name: 'John Smith',
      email: 'john.smith@company.com',
      riskScore: 95,
      riskLevel: 'critical',
      department: 'Engineering',
      lastActivity: '2024-01-10',
      issues: ['Active access after termination', 'Privileged roles not revoked', 'AWS access active']
    },
    {
      id: 'USR-002',
      name: 'Sarah Johnson',
      email: 'sarah.j@company.com',
      riskScore: 88,
      riskLevel: 'high',
      department: 'Finance',
      lastActivity: '2024-01-12',
      issues: ['SAP access active', 'Admin rights in Salesforce']
    },
    // ... more terminated accounts
  ];

  const inactiveAccounts: IdentityRiskDetail[] = Array.from({ length: 82 }, (_, i) => ({
    id: `INACTIVE-${i + 1}`,
    name: `User ${i + 1}`,
    email: `inactive${i + 1}@company.com`,
    riskScore: 60 + Math.random() * 30,
    riskLevel: Math.random() > 0.5 ? 'medium' : 'low',
    department: ['Engineering', 'Finance', 'Sales', 'HR'][Math.floor(Math.random() * 4)],
    lastActivity: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    issues: ['No login for 90+ days', 'Active entitlements']
  }));

  const orphanAccounts: IdentityRiskDetail[] = [
    {
      id: 'ORPHAN-001',
      name: 'service_account_legacy',
      email: 'legacy@company.com',
      riskScore: 92,
      riskLevel: 'critical',
      department: 'IT',
      lastActivity: '2024-01-14',
      issues: ['No owner assigned', 'Admin privileges', 'Active in production']
    },
    // ... more orphan accounts
  ];

  const riskyUsers: IdentityRiskDetail[] = [
    {
      id: 'RISKY-001',
      name: 'Mike Wilson',
      email: 'mike.w@company.com',
      riskScore: 87,
      riskLevel: 'high',
      department: 'Engineering',
      lastActivity: '2024-01-15',
      issues: ['Multiple SoD violations', 'Excessive permissions', 'Failed login attempts']
    },
    // ... more risky users
  ];

  // Task Metrics
  const taskMetrics: TaskMetrics = {
    total: 347,
    pending: 89,
    running: 12,
    completed: 234,
    failed: 12,
    overdue: 23,
    byType: {
      provisioning: 145,
      deprovisioning: 67,
      review: 89,
      workflow: 34,
      'data-import': 12
    },
    bySLA: {
      ok: 298,
      warning: 26,
      breach: 23
    },
    recentTasks: [
      {
        id: 'TSK-347',
        name: 'Provision Salesforce Access',
        type: 'provisioning',
        status: 'running',
        assignee: 'system',
        dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
      },
      // ... more recent tasks
    ]
  };

  // Access Lifecycle Metrics
  const lifecycleMetrics: AccessLifecycleMetrics = {
    joiners: {
      count: 47,
      trend: '+12%',
      details: Array.from({ length: 47 }, (_, i) => ({
        name: `New Employee ${i + 1}`,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        department: ['Engineering', 'Sales', 'Support'][Math.floor(Math.random() * 3)],
        status: ['completed', 'in-progress', 'pending'][Math.floor(Math.random() * 3)]
      }))
    },
    movers: {
      count: 23,
      trend: '+5%',
      details: []
    },
    leavers: {
      count: 18,
      trend: '-8%',
      details: []
    },
    provisioning: {
      avgTime: 2.3, // hours
      total: 156
    },
    deprovisioning: {
      avgTime: 1.8,
      total: 67
    }
  };

  // Privileged Access Metrics
  const privilegedAccessMetrics: PrivilegedAccessMetrics = {
    totalAccounts: 234,
    activeSessions: 18,
    violations: 7,
    byApplication: {
      'AWS': 89,
      'Azure': 67,
      'Database': 45,
      'Network': 33
    },
    recentActivity: [
      {
        user: 'admin@company.com',
        action: 'Database schema modification',
        application: 'Production DB',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        risk: 'high'
      },
      // ... more activity
    ]
  };

  // Certification Metrics
  const certificationMetrics: CertificationMetrics = {
    totalCampaigns: 12,
    activeCampaigns: 4,
    completionRate: 67,
    itemsPending: 234,
    overdueReviews: 45,
    campaigns: [
      {
        id: 'CAMP-001',
        name: 'Q1 2024 Manager Review',
        status: 'in-progress',
        progress: 72,
        dueDate: '2024-03-31',
        itemsTotal: 450,
        itemsCompleted: 324
      },
      {
        id: 'CAMP-002',
        name: 'Privileged Access Certification',
        status: 'in-progress',
        progress: 45,
        dueDate: '2024-02-15',
        itemsTotal: 234,
        itemsCompleted: 105
      },
      {
        id: 'CAMP-003',
        name: 'Q1 Security Audit',
        status: 'planned',
        progress: 0,
        dueDate: '2024-04-10',
        itemsTotal: 300,
        itemsCompleted: 0
      },
      {
        id: 'CAMP-004',
        name: 'Admin Access Review',
        status: 'in-progress',
        progress: 60,
        dueDate: '2024-03-20',
        itemsTotal: 200,
        itemsCompleted: 120
      },
      {
        id: 'CAMP-005',
        name: 'Vendor Account Certification',
        status: 'completed',
        progress: 100,
        dueDate: '2024-01-31',
        itemsTotal: 496,
        itemsCompleted: 496
      }
    ]
  };

  // Compliance Metrics
  const complianceMetrics: ComplianceMetrics = {
    overallScore: 87,
    policyViolations: {
      critical: 3,
      high: 12,
      medium: 34,
      low: 67
    },
    exceptions: 23,
    auditFindings: 8,
    trend: 'up',
    details: [
      {
        policy: 'Password Policy',
        violations: 45,
        severity: 'medium',
        lastOccurrence: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        policy: 'SoD Policy',
        violations: 12,
        severity: 'high',
        lastOccurrence: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      // ... more violations
    ]
  };

  // Application Health Metrics
  const applicationHealthMetrics: ApplicationHealthMetrics = {
    totalApps: 45,
    connected: 42,
    errors: 3,
    syncStatus: {
      'Office 365': { status: 'healthy', lastSync: new Date(Date.now() - 10 * 60 * 1000).toISOString(), accountCount: 1234 },
      'Salesforce': { status: 'healthy', lastSync: new Date(Date.now() - 15 * 60 * 1000).toISOString(), accountCount: 567 },
      'SAP ERP': { status: 'warning', lastSync: new Date(Date.now() - 120 * 60 * 1000).toISOString(), accountCount: 890, errorMessage: 'Slow response time' },
      'Active Directory': { status: 'error', lastSync: new Date(Date.now() - 180 * 60 * 1000).toISOString(), accountCount: 2345, errorMessage: 'Connection timeout' },
      'AWS': { status: 'healthy', lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(), accountCount: 456 },
    }
  };

  // SLA Metrics
  const slaMetrics: SLAMetrics = {
    onTime: 298,
    nearBreach: 26,
    breached: 23,
    avgCompletionTime: 4.2, // hours
    predictions: [
      {
        taskId: 'TSK-345',
        taskName: 'Critical Access Review',
        predictedBreach: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        confidence: 0.87
      },
      // ... more predictions
    ]
  };

  return {
    identityRisk: {
      terminated: { count: 25, trend: '+5.1%', details: terminatedAccounts },
      inactive: { count: 82, trend: '-12.3%', details: inactiveAccounts },
      orphan: { count: 7, trend: '+3.8%', details: orphanAccounts },
      risky: { count: 14, trend: '-2.0%', details: riskyUsers }
    },
    tasks: taskMetrics,
    lifecycle: lifecycleMetrics,
    privilegedAccess: privilegedAccessMetrics,
    certifications: certificationMetrics,
    compliance: complianceMetrics,
    applicationHealth: applicationHealthMetrics,
    sla: slaMetrics,
    lastUpdated: new Date()
  };
};

export type DashboardData = ReturnType<typeof generateDashboardData>;
