export interface RiskKPI {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  trend: 'up' | 'down' | 'stable';
  severity: 'critical' | 'high' | 'medium' | 'low';
  tooltip: string;
  unit?: string;
}

export interface RiskTrendDataPoint {
  month: string;
  accessRisk: number;
  policyViolations: number;
  certificationRisk: number;
  lifecycleRisk: number;
}

export interface HighRiskIdentity {
  id: string;
  name: string;
  type: 'Employee' | 'Contractor' | 'NHI' | 'Privileged';
  department: string;
  riskScore: number;
  accessScore: number;
  sodScore: number;
  certScore: number;
  privilegeScore: number;
  violations: number;
  lastReview: string;
  remediationStatus: 'Open' | 'In Progress' | 'Mitigated' | 'Accepted';
}

export interface SoDViolation {
  id: string;
  policyName: string;
  violator: string;
  conflictingEntitlements: [string, string];
  application: string;
  severity: 'Critical' | 'High' | 'Medium';
  daysOpen: number;
  remediationStatus: 'Open' | 'In Review' | 'Mitigated' | 'Exception Granted';
  compensatingControl: string | null;
}

export interface AppRiskMatrix {
  application: string;
  sod: number;
  excessive: number;
  unused: number;
  orphaned: number;
  privileged: number;
}

export interface CertificationCampaign {
  id: string;
  name: string;
  completion: number;
  rubberStampRate: number;
  overdueCount: number;
  autoApproveRate: number;
  riskAccepted: number;
  totalItems: number;
  dueDate: string;
  status: 'Active' | 'Overdue' | 'Completed';
}

export interface ComplianceFramework {
  id: string;
  name: string;
  icon: string;
  controlCoverage: number;
  failedControls: number;
  totalControls: number;
  openFindings: number;
  lastAudit: string;
  status: 'Compliant' | 'At Risk' | 'Non-Compliant';
}

export interface IdentityRiskSegment {
  type: string;
  count: number;
  highRiskCount: number;
  avgRiskScore: number;
  color: string;
}

export interface RiskFilter {
  timeRange: '24h' | '7d' | '30d' | '90d';
  severity: ('critical' | 'high' | 'medium' | 'low')[];
  identityTypes: ('employee' | 'non-employee' | 'non-human')[];
  sources: string[];
}

// Keep backward compat for existing modals
export interface RiskMetric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  trend: 'up' | 'down' | 'stable';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  sources: string[];
  lastUpdated: Date;
}

export interface RiskKPIData {
  totalCriticalRisks: RiskMetric;
  sodViolations: RiskMetric;
  orphanAccounts: RiskMetric;
  excessiveAccess: RiskMetric;
  riskyRoles: RiskMetric;
  processFailures: RiskMetric;
  riskDistribution: {
    employee: number;
    nonEmployee: number;
    nonHuman: number;
  };
}

export interface RiskSourceBreakdown {
  applications: number;
  identities: number;
  workflows: number;
  policies: number;
  reviews: number;
}
