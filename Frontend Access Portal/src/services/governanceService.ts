import { Task } from '@/contexts/AccessAnalysisContext';

export interface SodViolation {
  userId: string;
  userName: string;
  conflictingEntitlements: string[];
  policyId: string;
  policyName: string;
  severity: 'critical' | 'high' | 'medium';
  detectedAt: string;
}

export interface ComplianceReport {
  reportId: string;
  type: 'SOX' | 'GDPR' | 'HIPAA' | 'Custom';
  generatedAt: string;
  coveragePeriod: { start: string; end: string };
  findings: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  complianceScore: number;
  recommendations: string[];
}

export const checkSodCompliance = (userId: string, entitlements: string[]): SodViolation[] => {
  const violations: SodViolation[] = [];
  
  if (entitlements.includes('Financial Reports') && entitlements.includes('Expense Approvals')) {
    violations.push({
      userId,
      userName: `User ${userId}`,
      conflictingEntitlements: ['Financial Reports', 'Expense Approvals'],
      policyId: 'sod_001',
      policyName: 'Finance SoD Policy',
      severity: 'high',
      detectedAt: new Date().toISOString(),
    });
  }

  return violations;
};

export const generateComplianceReport = (type: ComplianceReport['type']): ComplianceReport => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  return {
    reportId: `report_${Date.now()}`,
    type,
    generatedAt: now.toISOString(),
    coveragePeriod: {
      start: thirtyDaysAgo.toISOString(),
      end: now.toISOString(),
    },
    findings: {
      total: 45,
      critical: 5,
      high: 12,
      medium: 18,
      low: 10,
    },
    complianceScore: 78,
    recommendations: [
      'Implement quarterly access reviews for high-risk roles',
      'Strengthen SoD controls in finance department',
      'Automate orphan account detection',
      'Enable MFA for all privileged accounts',
    ],
  };
};

export const createRemediationTask = (data: {
  type: Task['type'];
  title: string;
  entityId: string;
  entityName: string;
  assignedTo: string;
  priority: Task['priority'];
  dueDate: string;
}): Task => {
  return {
    id: `task_${Date.now()}`,
    status: 'pending',
    ...data,
  };
};

export const trackTaskProgress = (taskId: string) => {
  return {
    taskId,
    status: 'in_progress',
    completionPercentage: 45,
    estimatedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    blockers: [],
  };
};
