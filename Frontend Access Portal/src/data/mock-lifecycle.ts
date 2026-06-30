// Lifecycle Management Mock Data — JML Events, Provisioning, Orphaned Accounts, SLA, Access Accumulation

export interface JmlMonthlyData {
  month: string;
  joiners: number;
  movers: number;
  leavers: number;
  joinerEmployee: number;
  joinerContractor: number;
  joinerNhi: number;
  moverDepartment: number;
  moverPromotion: number;
  moverTransfer: number;
  leaverVoluntary: number;
  leaverInvoluntary: number;
  leaverContractEnd: number;
}

export interface ProvisioningMetric {
  application: string;
  totalActions: number;
  success: number;
  failed: number;
  pending: number;
  avgProvisionTimeHours: number;
  slaTargetHours: number;
  slaBreach: number;
  lastFailure?: string;
}

export interface OrphanedAccount {
  id: string;
  accountName: string;
  application: string;
  identityName: string;
  identityId: string;
  daysOrphaned: number;
  lastActivity: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  accountType: string;
  privileges: string[];
  detectedDate: string;
  reason: string;
  recommendedAction: string;
}

export interface LifecycleSlaData {
  category: string;
  avgHours: number;
  targetHours: number;
  p95Hours: number;
  compliancePercent: number;
  totalEvents: number;
  breaches: number;
}

export interface AccessAccumulationEntry {
  department: string;
  avgAtJoin: number;
  avgCurrent: number;
  excessPercent: number;
  identitiesAboveThreshold: number;
  totalMovers: number;
}

export interface PendingLifecycleAction {
  id: string;
  identityName: string;
  identityId: string;
  actionType: 'onboarding' | 'offboarding' | 'role-change' | 'access-review' | 'recertification' | 'deprovision';
  daysPending: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  blocker: string;
  targetApplication: string;
  assignee: string;
  createdDate: string;
  slaDeadline: string;
  slaBreached: boolean;
  affectedEntitlements: number;
}

export interface JmlPipelineStage {
  stage: string;
  joinerCount: number;
  leaverCount: number;
}

export interface ComplianceAuditEntry {
  framework: string;
  completeness: number;
  totalEvents: number;
  auditedEvents: number;
  missingTrails: number;
  nextDeadline: string;
  status: 'compliant' | 'at-risk' | 'non-compliant';
}

export interface LifecycleKpis {
  totalEventsQuarter: number;
  totalEventsTrend: number;
  activeJoinersPipeline: number;
  activeJoinersTrend: number;
  pendingLeavers: number;
  pendingLeaversTrend: number;
  orphanedAccounts: number;
  orphanedAccountsTrend: number;
  avgTimeToProvision: number;
  avgTimeToProvisionTarget: number;
  avgTimeToDeprovision: number;
  avgTimeToDeprovisionTarget: number;
  provisioningFailures: number;
  provisioningFailuresTrend: number;
  lifecycleCoverage: number;
  lifecycleCoverageTrend: number;
}

// ── KPIs ──

export const lifecycleKpis: LifecycleKpis = {
  totalEventsQuarter: 847,
  totalEventsTrend: 12.3,
  activeJoinersPipeline: 43,
  activeJoinersTrend: 8.5,
  pendingLeavers: 17,
  pendingLeaversTrend: -4.2,
  orphanedAccounts: 23,
  orphanedAccountsTrend: 15.0,
  avgTimeToProvision: 4.2,
  avgTimeToProvisionTarget: 4.0,
  avgTimeToDeprovision: 2.8,
  avgTimeToDeprovisionTarget: 2.0,
  provisioningFailures: 12,
  provisioningFailuresTrend: 25.0,
  lifecycleCoverage: 92,
  lifecycleCoverageTrend: 3.1,
};

// ── JML Monthly Trend ──

export const jmlMonthlyData: JmlMonthlyData[] = [
  { month: 'Apr', joiners: 38, movers: 22, leavers: 15, joinerEmployee: 25, joinerContractor: 10, joinerNhi: 3, moverDepartment: 10, moverPromotion: 7, moverTransfer: 5, leaverVoluntary: 8, leaverInvoluntary: 4, leaverContractEnd: 3 },
  { month: 'May', joiners: 45, movers: 28, leavers: 18, joinerEmployee: 30, joinerContractor: 12, joinerNhi: 3, moverDepartment: 14, moverPromotion: 8, moverTransfer: 6, leaverVoluntary: 10, leaverInvoluntary: 5, leaverContractEnd: 3 },
  { month: 'Jun', joiners: 52, movers: 35, leavers: 22, joinerEmployee: 35, joinerContractor: 13, joinerNhi: 4, moverDepartment: 18, moverPromotion: 10, moverTransfer: 7, leaverVoluntary: 12, leaverInvoluntary: 6, leaverContractEnd: 4 },
  { month: 'Jul', joiners: 60, movers: 30, leavers: 20, joinerEmployee: 40, joinerContractor: 14, joinerNhi: 6, moverDepartment: 15, moverPromotion: 9, moverTransfer: 6, leaverVoluntary: 11, leaverInvoluntary: 5, leaverContractEnd: 4 },
  { month: 'Aug', joiners: 48, movers: 25, leavers: 28, joinerEmployee: 32, joinerContractor: 12, joinerNhi: 4, moverDepartment: 12, moverPromotion: 7, moverTransfer: 6, leaverVoluntary: 15, leaverInvoluntary: 8, leaverContractEnd: 5 },
  { month: 'Sep', joiners: 55, movers: 32, leavers: 25, joinerEmployee: 38, joinerContractor: 13, joinerNhi: 4, moverDepartment: 16, moverPromotion: 9, moverTransfer: 7, leaverVoluntary: 13, leaverInvoluntary: 7, leaverContractEnd: 5 },
  { month: 'Oct', joiners: 42, movers: 38, leavers: 20, joinerEmployee: 28, joinerContractor: 10, joinerNhi: 4, moverDepartment: 20, moverPromotion: 12, moverTransfer: 6, leaverVoluntary: 10, leaverInvoluntary: 6, leaverContractEnd: 4 },
  { month: 'Nov', joiners: 35, movers: 28, leavers: 22, joinerEmployee: 22, joinerContractor: 9, joinerNhi: 4, moverDepartment: 14, moverPromotion: 8, moverTransfer: 6, leaverVoluntary: 12, leaverInvoluntary: 5, leaverContractEnd: 5 },
  { month: 'Dec', joiners: 25, movers: 18, leavers: 30, joinerEmployee: 15, joinerContractor: 7, joinerNhi: 3, moverDepartment: 8, moverPromotion: 5, moverTransfer: 5, leaverVoluntary: 18, leaverInvoluntary: 7, leaverContractEnd: 5 },
  { month: 'Jan', joiners: 65, movers: 22, leavers: 18, joinerEmployee: 45, joinerContractor: 15, joinerNhi: 5, moverDepartment: 10, moverPromotion: 6, moverTransfer: 6, leaverVoluntary: 9, leaverInvoluntary: 5, leaverContractEnd: 4 },
  { month: 'Feb', joiners: 58, movers: 30, leavers: 20, joinerEmployee: 40, joinerContractor: 14, joinerNhi: 4, moverDepartment: 15, moverPromotion: 9, moverTransfer: 6, leaverVoluntary: 11, leaverInvoluntary: 5, leaverContractEnd: 4 },
  { month: 'Mar', joiners: 70, movers: 35, leavers: 24, joinerEmployee: 48, joinerContractor: 16, joinerNhi: 6, moverDepartment: 18, moverPromotion: 10, moverTransfer: 7, leaverVoluntary: 13, leaverInvoluntary: 6, leaverContractEnd: 5 },
];

// ── Provisioning Metrics ──

export const provisioningMetrics: ProvisioningMetric[] = [
  { application: 'Active Directory', totalActions: 245, success: 230, failed: 8, pending: 7, avgProvisionTimeHours: 1.2, slaTargetHours: 2.0, slaBreach: 3, lastFailure: 'Connection timeout to DC-02' },
  { application: 'SAP ERP', totalActions: 180, success: 158, failed: 12, pending: 10, avgProvisionTimeHours: 6.5, slaTargetHours: 8.0, slaBreach: 5, lastFailure: 'Role conflict detected' },
  { application: 'Salesforce', totalActions: 156, success: 148, failed: 4, pending: 4, avgProvisionTimeHours: 2.1, slaTargetHours: 4.0, slaBreach: 1 },
  { application: 'ServiceNow', totalActions: 120, success: 115, failed: 3, pending: 2, avgProvisionTimeHours: 1.8, slaTargetHours: 4.0, slaBreach: 0 },
  { application: 'AWS IAM', totalActions: 98, success: 88, failed: 6, pending: 4, avgProvisionTimeHours: 3.5, slaTargetHours: 4.0, slaBreach: 4, lastFailure: 'Policy limit exceeded' },
  { application: 'Oracle DB', totalActions: 85, success: 75, failed: 7, pending: 3, avgProvisionTimeHours: 5.2, slaTargetHours: 6.0, slaBreach: 6, lastFailure: 'Schema permission denied' },
  { application: 'Workday', totalActions: 72, success: 70, failed: 1, pending: 1, avgProvisionTimeHours: 0.8, slaTargetHours: 2.0, slaBreach: 0 },
  { application: 'GitHub Enterprise', totalActions: 65, success: 62, failed: 2, pending: 1, avgProvisionTimeHours: 0.5, slaTargetHours: 1.0, slaBreach: 0 },
];

// ── Orphaned Accounts ──

export const orphanedAccounts: OrphanedAccount[] = [
  { id: 'orp-1', accountName: 'jsmith_admin', application: 'Active Directory', identityName: 'John Smith', identityId: 'ID-1042', daysOrphaned: 45, lastActivity: '2025-12-15', riskLevel: 'critical', accountType: 'Privileged', privileges: ['Domain Admin', 'Schema Admin'], detectedDate: '2026-01-22', reason: 'Identity terminated but admin account not deprovisioned', recommendedAction: 'Immediate disable and access review' },
  { id: 'orp-2', accountName: 'mwilson_sap', application: 'SAP ERP', identityName: 'Mark Wilson', identityId: 'ID-0891', daysOrphaned: 32, lastActivity: '2026-01-03', riskLevel: 'critical', accountType: 'Service', privileges: ['Basis Admin', 'Financial Posting'], detectedDate: '2026-02-04', reason: 'Contractor contract expired, SAP account active', recommendedAction: 'Revoke all SAP roles immediately' },
  { id: 'orp-3', accountName: 'lchen_aws', application: 'AWS IAM', identityName: 'Lisa Chen', identityId: 'ID-0755', daysOrphaned: 28, lastActivity: '2026-01-10', riskLevel: 'high', accountType: 'Technical', privileges: ['EC2 Full Access', 'S3 Admin'], detectedDate: '2026-02-08', reason: 'Transfer to non-technical role, AWS access retained', recommendedAction: 'Remove AWS privileges, reassign to new role owner' },
  { id: 'orp-4', accountName: 'rjones_sf', application: 'Salesforce', identityName: 'Robert Jones', identityId: 'ID-0623', daysOrphaned: 21, lastActivity: '2026-02-05', riskLevel: 'high', accountType: 'Standard', privileges: ['Sales Admin', 'Data Export'], detectedDate: '2026-02-15', reason: 'Moved to Engineering, CRM access not revoked', recommendedAction: 'Deprovision Salesforce access' },
  { id: 'orp-5', accountName: 'svc_etl_prod', application: 'Oracle DB', identityName: 'ETL Service Account', identityId: 'NHI-0089', daysOrphaned: 60, lastActivity: '2025-12-01', riskLevel: 'critical', accountType: 'Service', privileges: ['DBA', 'Data Pump Export'], detectedDate: '2026-01-08', reason: 'Project decommissioned, service account active', recommendedAction: 'Disable account and rotate credentials' },
  { id: 'orp-6', accountName: 'apark_snow', application: 'ServiceNow', identityName: 'Amy Park', identityId: 'ID-0934', daysOrphaned: 14, lastActivity: '2026-02-20', riskLevel: 'medium', accountType: 'Standard', privileges: ['ITIL User', 'Change Manager'], detectedDate: '2026-02-22', reason: 'Role change pending, old ITSM access retained', recommendedAction: 'Review and align to new role' },
  { id: 'orp-7', accountName: 'bot_deploy_01', application: 'GitHub Enterprise', identityName: 'Deploy Bot', identityId: 'NHI-0112', daysOrphaned: 90, lastActivity: '2025-11-05', riskLevel: 'high', accountType: 'Bot', privileges: ['Repo Admin', 'Actions Write'], detectedDate: '2025-12-08', reason: 'Automation pipeline replaced, bot token active', recommendedAction: 'Revoke token and archive bot account' },
  { id: 'orp-8', accountName: 'kbrown_wd', application: 'Workday', identityName: 'Kevin Brown', identityId: 'ID-0487', daysOrphaned: 7, lastActivity: '2026-02-28', riskLevel: 'low', accountType: 'Standard', privileges: ['Employee Self-Service', 'Time Reporting'], detectedDate: '2026-03-01', reason: 'Terminated last week, HR system sync delay', recommendedAction: 'Monitor for auto-deprovision within SLA' },
];

// ── Lifecycle SLA Data ──

export const lifecycleSlaData: LifecycleSlaData[] = [
  { category: 'Time-to-Provision (Joiners)', avgHours: 4.2, targetHours: 4.0, p95Hours: 12.5, compliancePercent: 87, totalEvents: 312, breaches: 41 },
  { category: 'Time-to-Deprovision (Leavers)', avgHours: 2.8, targetHours: 2.0, p95Hours: 8.0, compliancePercent: 78, totalEvents: 198, breaches: 44 },
  { category: 'Time-to-Role-Change (Movers)', avgHours: 6.5, targetHours: 8.0, p95Hours: 18.0, compliancePercent: 92, totalEvents: 267, breaches: 21 },
  { category: 'Emergency Access Grant', avgHours: 0.5, targetHours: 1.0, p95Hours: 1.5, compliancePercent: 96, totalEvents: 34, breaches: 1 },
  { category: 'Access Recertification', avgHours: 48.0, targetHours: 72.0, p95Hours: 120.0, compliancePercent: 85, totalEvents: 156, breaches: 23 },
];

// ── Access Accumulation ──

export const accessAccumulationData: AccessAccumulationEntry[] = [
  { department: 'Engineering', avgAtJoin: 12, avgCurrent: 28, excessPercent: 133, identitiesAboveThreshold: 24, totalMovers: 45 },
  { department: 'Finance', avgAtJoin: 8, avgCurrent: 18, excessPercent: 125, identitiesAboveThreshold: 12, totalMovers: 22 },
  { department: 'Sales', avgAtJoin: 10, avgCurrent: 15, excessPercent: 50, identitiesAboveThreshold: 5, totalMovers: 30 },
  { department: 'HR', avgAtJoin: 6, avgCurrent: 14, excessPercent: 133, identitiesAboveThreshold: 8, totalMovers: 15 },
  { department: 'Operations', avgAtJoin: 9, avgCurrent: 19, excessPercent: 111, identitiesAboveThreshold: 14, totalMovers: 28 },
  { department: 'Legal', avgAtJoin: 5, avgCurrent: 7, excessPercent: 40, identitiesAboveThreshold: 2, totalMovers: 8 },
  { department: 'IT', avgAtJoin: 15, avgCurrent: 35, excessPercent: 133, identitiesAboveThreshold: 18, totalMovers: 32 },
  { department: 'Marketing', avgAtJoin: 7, avgCurrent: 11, excessPercent: 57, identitiesAboveThreshold: 4, totalMovers: 18 },
];

// ── Pending Lifecycle Actions ──

export const pendingLifecycleActions: PendingLifecycleAction[] = [
  { id: 'pla-1', identityName: 'Sarah Mitchell', identityId: 'ID-2341', actionType: 'offboarding', daysPending: 8, priority: 'critical', blocker: 'Manager approval timeout — escalated to VP', targetApplication: 'SAP ERP', assignee: 'David Chen', createdDate: '2026-02-28', slaDeadline: '2026-03-02', slaBreached: true, affectedEntitlements: 14 },
  { id: 'pla-2', identityName: 'James Rodriguez', identityId: 'ID-1876', actionType: 'onboarding', daysPending: 5, priority: 'high', blocker: 'License procurement pending for Salesforce', targetApplication: 'Salesforce', assignee: 'Amy Park', createdDate: '2026-03-03', slaDeadline: '2026-03-06', slaBreached: true, affectedEntitlements: 8 },
  { id: 'pla-3', identityName: 'NHI-Deploy-Bot-v2', identityId: 'NHI-0145', actionType: 'onboarding', daysPending: 3, priority: 'high', blocker: 'Security review required for privileged service account', targetApplication: 'AWS IAM', assignee: 'Mike Torres', createdDate: '2026-03-05', slaDeadline: '2026-03-07', slaBreached: true, affectedEntitlements: 6 },
  { id: 'pla-4', identityName: 'Emily Watson', identityId: 'ID-1543', actionType: 'role-change', daysPending: 4, priority: 'medium', blocker: 'SoD conflict detected — compensating control review', targetApplication: 'Oracle DB', assignee: 'Lisa Chen', createdDate: '2026-03-04', slaDeadline: '2026-03-10', slaBreached: false, affectedEntitlements: 11 },
  { id: 'pla-5', identityName: 'Tom Baker', identityId: 'ID-0998', actionType: 'deprovision', daysPending: 12, priority: 'critical', blocker: 'Application owner unreachable', targetApplication: 'Active Directory', assignee: 'Kevin Brown', createdDate: '2026-02-24', slaDeadline: '2026-02-26', slaBreached: true, affectedEntitlements: 22 },
  { id: 'pla-6', identityName: 'Maria Garcia', identityId: 'ID-2102', actionType: 'recertification', daysPending: 2, priority: 'medium', blocker: 'Certifier on PTO — auto-escalation in 24h', targetApplication: 'ServiceNow', assignee: 'Robert Jones', createdDate: '2026-03-06', slaDeadline: '2026-03-12', slaBreached: false, affectedEntitlements: 5 },
  { id: 'pla-7', identityName: 'Chris Lee', identityId: 'ID-1789', actionType: 'offboarding', daysPending: 6, priority: 'high', blocker: 'Shared account ownership transfer incomplete', targetApplication: 'GitHub Enterprise', assignee: 'David Chen', createdDate: '2026-03-02', slaDeadline: '2026-03-04', slaBreached: true, affectedEntitlements: 9 },
  { id: 'pla-8', identityName: 'Rachel Kim', identityId: 'ID-2450', actionType: 'access-review', daysPending: 1, priority: 'low', blocker: 'Awaiting identity verification', targetApplication: 'Workday', assignee: 'Amy Park', createdDate: '2026-03-07', slaDeadline: '2026-03-14', slaBreached: false, affectedEntitlements: 3 },
  { id: 'pla-9', identityName: 'Alex Turner', identityId: 'ID-0876', actionType: 'onboarding', daysPending: 7, priority: 'high', blocker: 'Background check pending — HR hold', targetApplication: 'SAP ERP', assignee: 'Lisa Chen', createdDate: '2026-03-01', slaDeadline: '2026-03-04', slaBreached: true, affectedEntitlements: 10 },
  { id: 'pla-10', identityName: 'svc_monitoring', identityId: 'NHI-0167', actionType: 'deprovision', daysPending: 15, priority: 'critical', blocker: 'Dependency mapping incomplete — active integrations', targetApplication: 'AWS IAM', assignee: 'Mike Torres', createdDate: '2026-02-21', slaDeadline: '2026-02-23', slaBreached: true, affectedEntitlements: 18 },
];

// ── JML Pipeline Stages ──

export const jmlPipelineStages: JmlPipelineStage[] = [
  { stage: 'Request Received', joinerCount: 70, leaverCount: 0 },
  { stage: 'Approved', joinerCount: 62, leaverCount: 0 },
  { stage: 'Provisioning', joinerCount: 43, leaverCount: 0 },
  { stage: 'Active', joinerCount: 38, leaverCount: 24 },
  { stage: 'Deprovisioning', joinerCount: 0, leaverCount: 17 },
  { stage: 'Archived', joinerCount: 0, leaverCount: 12 },
];

// ── Compliance Audit Readiness ──

export const complianceAuditData: ComplianceAuditEntry[] = [
  { framework: 'SOX', completeness: 94, totalEvents: 420, auditedEvents: 395, missingTrails: 25, nextDeadline: '2026-03-31', status: 'compliant' },
  { framework: 'GDPR', completeness: 88, totalEvents: 380, auditedEvents: 334, missingTrails: 46, nextDeadline: '2026-04-15', status: 'at-risk' },
  { framework: 'HIPAA', completeness: 91, totalEvents: 210, auditedEvents: 191, missingTrails: 19, nextDeadline: '2026-06-30', status: 'compliant' },
  { framework: 'SOC 2', completeness: 86, totalEvents: 350, auditedEvents: 301, missingTrails: 49, nextDeadline: '2026-05-15', status: 'at-risk' },
  { framework: 'ISO 27001', completeness: 79, totalEvents: 290, auditedEvents: 229, missingTrails: 61, nextDeadline: '2026-04-30', status: 'non-compliant' },
  { framework: 'PCI-DSS', completeness: 96, totalEvents: 180, auditedEvents: 173, missingTrails: 7, nextDeadline: '2026-09-30', status: 'compliant' },
];

// ── Provisioning Health Summary (for donut chart) ──

export const provisioningHealthSummary = {
  success: 946,
  failed: 43,
  pending: 32,
  slaBreached: 40,
};

// ══════════════════════════════════════════════════════════════
// LIFECYCLE DRAWER DATA — Identity / Role / Entitlement CRUD
// ══════════════════════════════════════════════════════════════

// ── Identity Catalog (for search/select in drawers) ──

export interface IdentityCatalogEntry {
  id: string;
  name: string;
  email: string;
  type: 'Employee' | 'Contractor' | 'Service Account' | 'Bot';
  department: string;
  status: 'Active' | 'Suspended' | 'Pending';
  riskScore: number;
  manager: string;
  joinDate: string;
  accountCount: number;
  roleCount: number;
  entitlementCount: number;
}

export const identityCatalog: IdentityCatalogEntry[] = [
  { id: 'ID-1001', name: 'John Doe', email: 'john.doe@corp.com', type: 'Employee', department: 'Engineering', status: 'Active', riskScore: 35, manager: 'Sarah Mitchell', joinDate: '2023-03-15', accountCount: 6, roleCount: 3, entitlementCount: 18 },
  { id: 'ID-1002', name: 'Jane Smith', email: 'jane.smith@corp.com', type: 'Contractor', department: 'Marketing', status: 'Active', riskScore: 22, manager: 'Tom Baker', joinDate: '2024-06-01', accountCount: 3, roleCount: 2, entitlementCount: 8 },
  { id: 'ID-1003', name: 'API-Service-01', email: 'svc-api@corp.com', type: 'Service Account', department: 'IT', status: 'Active', riskScore: 72, manager: 'Mike Torres', joinDate: '2022-11-10', accountCount: 4, roleCount: 1, entitlementCount: 12 },
  { id: 'ID-1004', name: 'Emily Watson', email: 'emily.watson@corp.com', type: 'Employee', department: 'Finance', status: 'Active', riskScore: 48, manager: 'Lisa Chen', joinDate: '2021-08-22', accountCount: 5, roleCount: 4, entitlementCount: 22 },
  { id: 'ID-1005', name: 'Robert Jones', email: 'robert.jones@corp.com', type: 'Employee', department: 'Sales', status: 'Active', riskScore: 28, manager: 'Maria Garcia', joinDate: '2022-01-10', accountCount: 4, roleCount: 2, entitlementCount: 10 },
  { id: 'ID-1006', name: 'Deploy-Bot-v2', email: 'deploy-bot@corp.com', type: 'Bot', department: 'DevOps', status: 'Active', riskScore: 65, manager: 'Chris Lee', joinDate: '2024-02-14', accountCount: 3, roleCount: 1, entitlementCount: 8 },
  { id: 'ID-1007', name: 'Amy Park', email: 'amy.park@corp.com', type: 'Employee', department: 'HR', status: 'Active', riskScore: 18, manager: 'Kevin Brown', joinDate: '2020-05-03', accountCount: 3, roleCount: 2, entitlementCount: 7 },
  { id: 'ID-1008', name: 'Carlos Rivera', email: 'carlos.rivera@vendor.com', type: 'Contractor', department: 'Engineering', status: 'Active', riskScore: 55, manager: 'Sarah Mitchell', joinDate: '2025-01-15', accountCount: 4, roleCount: 2, entitlementCount: 14 },
  { id: 'ID-1009', name: 'Rachel Kim', email: 'rachel.kim@corp.com', type: 'Employee', department: 'Legal', status: 'Active', riskScore: 15, manager: 'David Chen', joinDate: '2021-11-28', accountCount: 2, roleCount: 1, entitlementCount: 5 },
  { id: 'ID-1010', name: 'svc_monitoring', email: 'svc-monitor@corp.com', type: 'Service Account', department: 'IT', status: 'Suspended', riskScore: 80, manager: 'Mike Torres', joinDate: '2023-07-20', accountCount: 5, roleCount: 2, entitlementCount: 16 },
];

// ── Pending Identity Modifications ──

export interface PendingIdentityModification {
  id: string;
  identityId: string;
  identityName: string;
  identityType: string;
  modificationType: 'Department Transfer' | 'Role Change' | 'Access Extension' | 'Attribute Update' | 'Sponsor Change';
  currentValue: string;
  proposedValue: string;
  status: 'Pending Approval' | 'In Progress' | 'Scheduled' | 'Under Review' | 'Approved';
  requestedBy: string;
  requestDate: string;
  approvers: { name: string; status: 'approved' | 'pending' | 'rejected' }[];
  justification: string;
  impactedAccounts: number;
  impactedRoles: number;
  complianceFlags: string[];
}

export const pendingIdentityModifications: PendingIdentityModification[] = [
  { id: 'mod-1', identityId: 'ID-1001', identityName: 'John Doe', identityType: 'Employee', modificationType: 'Department Transfer', currentValue: 'Engineering', proposedValue: 'Product Management', status: 'Pending Approval', requestedBy: 'Sarah Mitchell', requestDate: '2026-03-05', approvers: [{ name: 'Sarah Mitchell', status: 'approved' }, { name: 'VP Product', status: 'pending' }], justification: 'Internal transfer to PM role', impactedAccounts: 6, impactedRoles: 3, complianceFlags: ['SoD Review Required'] },
  { id: 'mod-2', identityId: 'ID-1002', identityName: 'Jane Smith', identityType: 'Contractor', modificationType: 'Access Extension', currentValue: '2026-03-31', proposedValue: '2026-06-30', status: 'In Progress', requestedBy: 'Tom Baker', requestDate: '2026-03-03', approvers: [{ name: 'Tom Baker', status: 'approved' }, { name: 'Procurement', status: 'approved' }], justification: 'Project Phase 2 extension', impactedAccounts: 3, impactedRoles: 2, complianceFlags: [] },
  { id: 'mod-3', identityId: 'ID-1003', identityName: 'API-Service-01', identityType: 'Service Account', modificationType: 'Attribute Update', currentValue: 'Standard SLA', proposedValue: 'Premium SLA', status: 'Scheduled', requestedBy: 'Mike Torres', requestDate: '2026-03-01', approvers: [{ name: 'Mike Torres', status: 'approved' }], justification: 'Production dependency upgrade', impactedAccounts: 4, impactedRoles: 1, complianceFlags: ['Change Management'] },
  { id: 'mod-4', identityId: 'ID-1004', identityName: 'Emily Watson', identityType: 'Employee', modificationType: 'Role Change', currentValue: 'Financial Analyst', proposedValue: 'Finance Manager', status: 'Under Review', requestedBy: 'Lisa Chen', requestDate: '2026-03-04', approvers: [{ name: 'Lisa Chen', status: 'approved' }, { name: 'CISO', status: 'pending' }, { name: 'HR Director', status: 'pending' }], justification: 'Promotion - Q1 2026', impactedAccounts: 5, impactedRoles: 4, complianceFlags: ['SOX Sensitive', 'SoD Review Required'] },
  { id: 'mod-5', identityId: 'ID-1005', identityName: 'Robert Jones', identityType: 'Employee', modificationType: 'Department Transfer', currentValue: 'Sales', proposedValue: 'Customer Success', status: 'Approved', requestedBy: 'Maria Garcia', requestDate: '2026-02-28', approvers: [{ name: 'Maria Garcia', status: 'approved' }, { name: 'VP Sales', status: 'approved' }], justification: 'Organizational restructuring', impactedAccounts: 4, impactedRoles: 2, complianceFlags: [] },
  { id: 'mod-6', identityId: 'ID-1008', identityName: 'Carlos Rivera', identityType: 'Contractor', modificationType: 'Sponsor Change', currentValue: 'Sarah Mitchell', proposedValue: 'Chris Lee', status: 'Pending Approval', requestedBy: 'HR System', requestDate: '2026-03-06', approvers: [{ name: 'Sarah Mitchell', status: 'approved' }, { name: 'Chris Lee', status: 'pending' }], justification: 'Manager change - team restructuring', impactedAccounts: 4, impactedRoles: 2, complianceFlags: ['Contractor Oversight'] },
  { id: 'mod-7', identityId: 'ID-1006', identityName: 'Deploy-Bot-v2', identityType: 'Bot', modificationType: 'Attribute Update', currentValue: 'CI/CD Pipeline v1', proposedValue: 'CI/CD Pipeline v2', status: 'In Progress', requestedBy: 'Chris Lee', requestDate: '2026-03-02', approvers: [{ name: 'Chris Lee', status: 'approved' }, { name: 'Security Team', status: 'approved' }], justification: 'Pipeline upgrade migration', impactedAccounts: 3, impactedRoles: 1, complianceFlags: ['Security Review'] },
  { id: 'mod-8', identityId: 'ID-1007', identityName: 'Amy Park', identityType: 'Employee', modificationType: 'Role Change', currentValue: 'HR Specialist', proposedValue: 'HR Business Partner', status: 'Pending Approval', requestedBy: 'Kevin Brown', requestDate: '2026-03-07', approvers: [{ name: 'Kevin Brown', status: 'approved' }, { name: 'CHRO', status: 'pending' }], justification: 'Career progression', impactedAccounts: 3, impactedRoles: 2, complianceFlags: ['PII Access Review'] },
];

// ── Scheduled Identity Disables ──

export interface ScheduledDisable {
  id: string;
  identityId: string;
  identityName: string;
  identityType: string;
  mode: 'Immediate' | 'Scheduled';
  scheduledDate: string;
  reason: string;
  requestedBy: string;
  status: 'Scheduled' | 'Processing' | 'Completed' | 'Cancelled';
  impactedAccounts: number;
  activeSessions: number;
  pendingRequests: number;
  autoReactivation: boolean;
  reactivationDate?: string;
  complianceChecks: { check: string; passed: boolean }[];
}

export const scheduledIdentityDisables: ScheduledDisable[] = [
  { id: 'dis-1', identityId: 'ID-1002', identityName: 'Jane Smith', identityType: 'Contractor', mode: 'Scheduled', scheduledDate: '2026-03-31', reason: 'Contract end date', requestedBy: 'HR System', status: 'Scheduled', impactedAccounts: 3, activeSessions: 2, pendingRequests: 0, autoReactivation: false, complianceChecks: [{ check: 'Data retention verified', passed: true }, { check: 'Audit trail preserved', passed: true }, { check: 'Manager notified', passed: true }] },
  { id: 'dis-2', identityId: 'ID-1008', identityName: 'Carlos Rivera', identityType: 'Contractor', mode: 'Scheduled', scheduledDate: '2026-04-15', reason: 'Project completion', requestedBy: 'Sarah Mitchell', status: 'Scheduled', impactedAccounts: 4, activeSessions: 1, pendingRequests: 1, autoReactivation: false, complianceChecks: [{ check: 'Data retention verified', passed: true }, { check: 'Audit trail preserved', passed: true }, { check: 'Manager notified', passed: false }] },
  { id: 'dis-3', identityId: 'ID-1010', identityName: 'svc_monitoring', identityType: 'Service Account', mode: 'Immediate', scheduledDate: '2026-03-08', reason: 'Security incident - suspicious activity', requestedBy: 'Security Team', status: 'Processing', impactedAccounts: 5, activeSessions: 3, pendingRequests: 0, autoReactivation: true, reactivationDate: '2026-03-15', complianceChecks: [{ check: 'Data retention verified', passed: true }, { check: 'Audit trail preserved', passed: true }, { check: 'Manager notified', passed: true }] },
  { id: 'dis-4', identityId: 'ID-1005', identityName: 'Robert Jones', identityType: 'Employee', mode: 'Scheduled', scheduledDate: '2026-03-20', reason: 'Extended leave of absence', requestedBy: 'HR System', status: 'Scheduled', impactedAccounts: 4, activeSessions: 0, pendingRequests: 2, autoReactivation: true, reactivationDate: '2026-06-20', complianceChecks: [{ check: 'Data retention verified', passed: true }, { check: 'Audit trail preserved', passed: true }, { check: 'Manager notified', passed: true }] },
  { id: 'dis-5', identityId: 'ID-1006', identityName: 'Deploy-Bot-v2', identityType: 'Bot', mode: 'Scheduled', scheduledDate: '2026-03-25', reason: 'Migration to new deployment system', requestedBy: 'Chris Lee', status: 'Scheduled', impactedAccounts: 3, activeSessions: 1, pendingRequests: 0, autoReactivation: false, complianceChecks: [{ check: 'Data retention verified', passed: true }, { check: 'Audit trail preserved', passed: false }, { check: 'Manager notified', passed: true }] },
];

// ── Identity Deletion History ──

export interface DeletionRecord {
  id: string;
  identityId: string;
  identityName: string;
  identityType: string;
  deleteType: 'Soft Delete' | 'Hard Delete';
  deletedDate: string;
  deletedBy: string;
  reason: string;
  status: 'Archived' | 'Permanently Deleted' | 'Restored';
  canRestore: boolean;
  dependenciesResolved: boolean;
  complianceApproved: boolean;
  preChecksPassed: { check: string; passed: boolean }[];
}

export const identityDeletionHistory: DeletionRecord[] = [
  { id: 'del-1', identityId: 'ID-0501', identityName: 'Former Employee A', identityType: 'Employee', deleteType: 'Soft Delete', deletedDate: '2026-02-15', deletedBy: 'HR System', reason: 'Voluntary resignation', status: 'Archived', canRestore: true, dependenciesResolved: true, complianceApproved: true, preChecksPassed: [{ check: 'All accounts deprovisioned', passed: true }, { check: 'No active sessions', passed: true }, { check: 'No pending requests', passed: true }, { check: 'Manager approval', passed: true }, { check: 'Compliance review', passed: true }] },
  { id: 'del-2', identityId: 'ID-0445', identityName: 'Legacy Bot Account', identityType: 'Bot', deleteType: 'Hard Delete', deletedDate: '2026-02-01', deletedBy: 'Mike Torres', reason: 'System decommissioned', status: 'Permanently Deleted', canRestore: false, dependenciesResolved: true, complianceApproved: true, preChecksPassed: [{ check: 'All accounts deprovisioned', passed: true }, { check: 'No active sessions', passed: true }, { check: 'No pending requests', passed: true }, { check: 'Manager approval', passed: true }, { check: 'Compliance review', passed: true }] },
  { id: 'del-3', identityId: 'ID-0672', identityName: 'Temp Contractor X', identityType: 'Contractor', deleteType: 'Soft Delete', deletedDate: '2026-02-20', deletedBy: 'Procurement', reason: 'Contract not renewed', status: 'Archived', canRestore: true, dependenciesResolved: true, complianceApproved: true, preChecksPassed: [{ check: 'All accounts deprovisioned', passed: true }, { check: 'No active sessions', passed: true }, { check: 'No pending requests', passed: true }, { check: 'Manager approval', passed: true }, { check: 'Compliance review', passed: true }] },
  { id: 'del-4', identityId: 'ID-0390', identityName: 'Restored User B', identityType: 'Employee', deleteType: 'Soft Delete', deletedDate: '2026-01-10', deletedBy: 'HR System', reason: 'Termination error', status: 'Restored', canRestore: false, dependenciesResolved: true, complianceApproved: true, preChecksPassed: [{ check: 'All accounts deprovisioned', passed: true }, { check: 'No active sessions', passed: true }, { check: 'No pending requests', passed: true }, { check: 'Manager approval', passed: true }, { check: 'Compliance review', passed: true }] },
];

// ── Role Catalog ──

export interface RoleCatalogEntry {
  id: string;
  name: string;
  type: 'Business' | 'Technical' | 'Privileged';
  owner: string;
  description: string;
  userCount: number;
  entitlementCount: number;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  lastUsed: string;
  status: 'Active' | 'Under Review' | 'Deprecated';
  sodConflicts: number;
}

export const roleCatalog: RoleCatalogEntry[] = [
  { id: 'ROL-001', name: 'Finance Manager', type: 'Business', owner: 'Lisa Chen', description: 'Full financial operations access', userCount: 12, entitlementCount: 18, riskLevel: 'High', lastUsed: '2026-03-07', status: 'Active', sodConflicts: 2 },
  { id: 'ROL-002', name: 'Developer', type: 'Technical', owner: 'Sarah Mitchell', description: 'Standard development environment access', userCount: 45, entitlementCount: 22, riskLevel: 'Medium', lastUsed: '2026-03-08', status: 'Active', sodConflicts: 0 },
  { id: 'ROL-003', name: 'System Administrator', type: 'Privileged', owner: 'Mike Torres', description: 'Full system administration privileges', userCount: 5, entitlementCount: 35, riskLevel: 'Critical', lastUsed: '2026-03-08', status: 'Active', sodConflicts: 3 },
  { id: 'ROL-004', name: 'Sales Representative', type: 'Business', owner: 'Maria Garcia', description: 'CRM and sales tools access', userCount: 30, entitlementCount: 12, riskLevel: 'Low', lastUsed: '2026-03-07', status: 'Active', sodConflicts: 0 },
  { id: 'ROL-005', name: 'HR Specialist', type: 'Business', owner: 'Kevin Brown', description: 'Human resources systems access', userCount: 8, entitlementCount: 14, riskLevel: 'High', lastUsed: '2026-03-06', status: 'Active', sodConflicts: 1 },
  { id: 'ROL-006', name: 'Legacy Approver', type: 'Business', owner: 'Unassigned', description: 'Deprecated approval workflow role', userCount: 3, entitlementCount: 6, riskLevel: 'Low', lastUsed: '2026-02-01', status: 'Deprecated', sodConflicts: 0 },
  { id: 'ROL-007', name: 'Database Administrator', type: 'Privileged', owner: 'Mike Torres', description: 'Database management privileges', userCount: 4, entitlementCount: 28, riskLevel: 'Critical', lastUsed: '2026-03-08', status: 'Active', sodConflicts: 2 },
  { id: 'ROL-008', name: 'Marketing Analyst', type: 'Business', owner: 'Tom Baker', description: 'Marketing analytics and campaign tools', userCount: 15, entitlementCount: 10, riskLevel: 'Low', lastUsed: '2026-03-05', status: 'Active', sodConflicts: 0 },
];

// ── Pending Role Modifications ──

export interface PendingRoleModification {
  id: string;
  roleId: string;
  roleName: string;
  roleType: string;
  modificationType: 'Add Entitlements' | 'Remove Entitlements' | 'Change Owner' | 'Risk Reclassification' | 'Adjust SoD Rules' | 'Modify Approval Policy';
  currentValue: string;
  proposedValue: string;
  status: 'Pending Review' | 'Approved' | 'In Progress' | 'Under Review' | 'Rejected';
  requestedBy: string;
  requestDate: string;
  usersAffected: number;
  sodConflicts: number;
  approvers: { name: string; status: 'approved' | 'pending' | 'rejected' }[];
  justification: string;
}

export const pendingRoleModifications: PendingRoleModification[] = [
  { id: 'rmod-1', roleId: 'ROL-001', roleName: 'Finance Manager', roleType: 'Business', modificationType: 'Add Entitlements', currentValue: '18 entitlements', proposedValue: '20 entitlements (+SAP_POSTING, SAP_APPROVAL)', status: 'Pending Review', requestedBy: 'Lisa Chen', requestDate: '2026-03-05', usersAffected: 12, sodConflicts: 1, approvers: [{ name: 'Lisa Chen', status: 'approved' }, { name: 'CISO', status: 'pending' }], justification: 'New quarter-end closing process requires additional SAP access' },
  { id: 'rmod-2', roleId: 'ROL-002', roleName: 'Developer', roleType: 'Technical', modificationType: 'Remove Entitlements', currentValue: '22 entitlements', proposedValue: '20 entitlements (-PROD_DEPLOY, PROD_DB_READ)', status: 'Approved', requestedBy: 'Security Team', requestDate: '2026-03-03', usersAffected: 45, sodConflicts: 0, approvers: [{ name: 'Sarah Mitchell', status: 'approved' }, { name: 'CISO', status: 'approved' }], justification: 'Prod access removed per least-privilege policy' },
  { id: 'rmod-3', roleId: 'ROL-003', roleName: 'System Administrator', roleType: 'Privileged', modificationType: 'Adjust SoD Rules', currentValue: '3 SoD policies', proposedValue: '5 SoD policies (+Payment+Approval, +UserCreate+UserApprove)', status: 'In Progress', requestedBy: 'Compliance Team', requestDate: '2026-03-01', usersAffected: 5, sodConflicts: 3, approvers: [{ name: 'CISO', status: 'approved' }, { name: 'CRO', status: 'approved' }], justification: 'SOX audit finding requires additional SoD controls' },
  { id: 'rmod-4', roleId: 'ROL-005', roleName: 'HR Specialist', roleType: 'Business', modificationType: 'Change Owner', currentValue: 'Kevin Brown', proposedValue: 'Amy Park', status: 'Under Review', requestedBy: 'Kevin Brown', requestDate: '2026-03-06', usersAffected: 8, sodConflicts: 0, approvers: [{ name: 'Kevin Brown', status: 'approved' }, { name: 'Amy Park', status: 'pending' }], justification: 'Role ownership transfer due to reorg' },
  { id: 'rmod-5', roleId: 'ROL-004', roleName: 'Sales Representative', roleType: 'Business', modificationType: 'Risk Reclassification', currentValue: 'Low Risk', proposedValue: 'Medium Risk', status: 'Pending Review', requestedBy: 'Risk Team', requestDate: '2026-03-07', usersAffected: 30, sodConflicts: 0, approvers: [{ name: 'Maria Garcia', status: 'pending' }, { name: 'Risk Committee', status: 'pending' }], justification: 'Data export capability warrants higher risk rating' },
  { id: 'rmod-6', roleId: 'ROL-007', roleName: 'Database Administrator', roleType: 'Privileged', modificationType: 'Modify Approval Policy', currentValue: '2-level approval', proposedValue: '3-level approval (+ executive sign-off)', status: 'Approved', requestedBy: 'Audit Team', requestDate: '2026-03-02', usersAffected: 4, sodConflicts: 0, approvers: [{ name: 'Mike Torres', status: 'approved' }, { name: 'CTO', status: 'approved' }], justification: 'Critical role requires additional approval layer' },
  { id: 'rmod-7', roleId: 'ROL-008', roleName: 'Marketing Analyst', roleType: 'Business', modificationType: 'Add Entitlements', currentValue: '10 entitlements', proposedValue: '12 entitlements (+ANALYTICS_EXPORT, CAMPAIGN_ADMIN)', status: 'In Progress', requestedBy: 'Tom Baker', requestDate: '2026-03-04', usersAffected: 15, sodConflicts: 0, approvers: [{ name: 'Tom Baker', status: 'approved' }], justification: 'New analytics platform integration' },
  { id: 'rmod-8', roleId: 'ROL-006', roleName: 'Legacy Approver', roleType: 'Business', modificationType: 'Remove Entitlements', currentValue: '6 entitlements', proposedValue: '0 entitlements (full deprecation)', status: 'Under Review', requestedBy: 'IT Governance', requestDate: '2026-03-01', usersAffected: 3, sodConflicts: 0, approvers: [{ name: 'IT Director', status: 'approved' }, { name: 'Compliance', status: 'pending' }], justification: 'Role deprecated - migrating users to new workflow' },
];

// ── Scheduled Role Disables ──

export interface ScheduledRoleDisable {
  id: string;
  roleId: string;
  roleName: string;
  roleType: string;
  usersAffected: number;
  lastUsed: string;
  scheduledDate: string;
  reason: string;
  status: 'Scheduled' | 'Processing' | 'Completed';
  alternativeRole?: string;
  gracePeriodDays: number;
  notificationSent: boolean;
}

export const scheduledRoleDisables: ScheduledRoleDisable[] = [
  { id: 'rdis-1', roleId: 'ROL-006', roleName: 'Legacy Approver', roleType: 'Business', usersAffected: 3, lastUsed: '2026-02-01', scheduledDate: '2026-03-15', reason: 'Deprecated workflow replacement', status: 'Scheduled', alternativeRole: 'Modern Approver', gracePeriodDays: 14, notificationSent: true },
  { id: 'rdis-2', roleId: 'ROL-009', roleName: 'Temp Contractor Access', roleType: 'Business', usersAffected: 8, lastUsed: '2026-03-01', scheduledDate: '2026-03-31', reason: 'Project completion', status: 'Scheduled', gracePeriodDays: 7, notificationSent: false },
  { id: 'rdis-3', roleId: 'ROL-010', roleName: 'Legacy Report Viewer', roleType: 'Technical', usersAffected: 12, lastUsed: '2026-01-15', scheduledDate: '2026-04-01', reason: 'Reporting system migration', status: 'Scheduled', alternativeRole: 'BI Dashboard User', gracePeriodDays: 30, notificationSent: true },
];

// ── Role Deletion Candidates ──

export interface RoleDeletionCandidate {
  id: string;
  roleId: string;
  roleName: string;
  roleType: string;
  activeUsers: number;
  lastUsed: string;
  canDelete: boolean;
  blockingReasons: string[];
  complianceStatus: 'Approved' | 'Pending' | 'N/A';
  dependentRoles: string[];
}

export const roleDeletionCandidates: RoleDeletionCandidate[] = [
  { id: 'rdel-1', roleId: 'ROL-011', roleName: 'Deprecated System Role', roleType: 'Technical', activeUsers: 0, lastUsed: '2025-12-01', canDelete: true, blockingReasons: [], complianceStatus: 'Approved', dependentRoles: [] },
  { id: 'rdel-2', roleId: 'ROL-012', roleName: 'Old Finance Role', roleType: 'Business', activeUsers: 0, lastUsed: '2026-01-05', canDelete: true, blockingReasons: [], complianceStatus: 'Pending', dependentRoles: [] },
  { id: 'rdel-3', roleId: 'ROL-013', roleName: 'Active Marketing Role', roleType: 'Business', activeUsers: 5, lastUsed: '2026-03-08', canDelete: false, blockingReasons: ['5 active user assignments', 'Referenced in 2 policies'], complianceStatus: 'N/A', dependentRoles: ['Marketing Admin'] },
  { id: 'rdel-4', roleId: 'ROL-014', roleName: 'Retired Vendor Access', roleType: 'Business', activeUsers: 0, lastUsed: '2025-10-20', canDelete: true, blockingReasons: [], complianceStatus: 'Approved', dependentRoles: [] },
];

// ── Entitlement Catalog ──

export interface EntitlementCatalogEntry {
  id: string;
  name: string;
  application: string;
  type: 'Standard' | 'Sensitive' | 'Administrative';
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  owner: string;
  userCount: number;
  roleCount: number;
  lastCertified: string;
  status: 'Active' | 'Under Review' | 'Deprecated';
}

export const entitlementCatalog: EntitlementCatalogEntry[] = [
  { id: 'ENT-001', name: 'SAP_FI_READ', application: 'SAP Finance', type: 'Standard', riskLevel: 'Medium', owner: 'Lisa Chen', userCount: 45, roleCount: 4, lastCertified: '2026-02-15', status: 'Active' },
  { id: 'ENT-002', name: 'DB_ADMIN_WRITE', application: 'Oracle Database', type: 'Administrative', riskLevel: 'Critical', owner: 'Mike Torres', userCount: 4, roleCount: 2, lastCertified: '2026-01-30', status: 'Active' },
  { id: 'ENT-003', name: 'JIRA_PROJECT_LEAD', application: 'Jira', type: 'Standard', riskLevel: 'Low', owner: 'Sarah Mitchell', userCount: 20, roleCount: 3, lastCertified: '2026-02-28', status: 'Active' },
  { id: 'ENT-004', name: 'AWS_EC2_FULL', application: 'AWS IAM', type: 'Sensitive', riskLevel: 'High', owner: 'Mike Torres', userCount: 8, roleCount: 2, lastCertified: '2026-03-01', status: 'Active' },
  { id: 'ENT-005', name: 'SF_DATA_EXPORT', application: 'Salesforce', type: 'Sensitive', riskLevel: 'High', owner: 'Maria Garcia', userCount: 12, roleCount: 2, lastCertified: '2026-02-20', status: 'Under Review' },
  { id: 'ENT-006', name: 'AD_USER_ADMIN', application: 'Active Directory', type: 'Administrative', riskLevel: 'Critical', owner: 'Mike Torres', userCount: 3, roleCount: 1, lastCertified: '2026-03-05', status: 'Active' },
  { id: 'ENT-007', name: 'LEGACY_REPORT_ACCESS', application: 'Legacy Reports', type: 'Standard', riskLevel: 'Low', owner: 'Unassigned', userCount: 0, roleCount: 0, lastCertified: '2025-12-01', status: 'Deprecated' },
  { id: 'ENT-008', name: 'WORKDAY_HR_ADMIN', application: 'Workday', type: 'Sensitive', riskLevel: 'High', owner: 'Kevin Brown', userCount: 6, roleCount: 2, lastCertified: '2026-02-10', status: 'Active' },
];

// ── Pending Entitlement Modifications ──

export interface PendingEntitlementModification {
  id: string;
  entitlementId: string;
  entitlementName: string;
  application: string;
  modificationType: 'Risk Reclassification' | 'Scope Change' | 'Access Restriction' | 'Owner Transfer' | 'Compliance Mapping Update';
  currentValue: string;
  proposedValue: string;
  status: 'Under Review' | 'Approved' | 'In Progress' | 'Pending Review';
  requestedBy: string;
  requestDate: string;
  usersAffected: number;
  rolesAffected: number;
  riskImpact: string;
  approvers: { name: string; status: 'approved' | 'pending' | 'rejected' }[];
  justification: string;
}

export const pendingEntitlementModifications: PendingEntitlementModification[] = [
  { id: 'emod-1', entitlementId: 'ENT-001', entitlementName: 'SAP_FI_READ', application: 'SAP Finance', modificationType: 'Risk Reclassification', currentValue: 'Medium Risk', proposedValue: 'High Risk', status: 'Under Review', requestedBy: 'Risk Team', requestDate: '2026-03-05', usersAffected: 45, rolesAffected: 4, riskImpact: 'Triggers quarterly recertification for 45 users', approvers: [{ name: 'Lisa Chen', status: 'approved' }, { name: 'Risk Committee', status: 'pending' }], justification: 'Financial data access requires higher risk classification per audit finding' },
  { id: 'emod-2', entitlementId: 'ENT-002', entitlementName: 'DB_ADMIN_WRITE', application: 'Oracle Database', modificationType: 'Access Restriction', currentValue: 'Full write access', proposedValue: 'Schema-restricted write', status: 'Approved', requestedBy: 'Security Team', requestDate: '2026-03-03', usersAffected: 4, rolesAffected: 2, riskImpact: 'Reduces blast radius for privileged DB operations', approvers: [{ name: 'Mike Torres', status: 'approved' }, { name: 'CISO', status: 'approved' }], justification: 'Least-privilege enforcement for database administrators' },
  { id: 'emod-3', entitlementId: 'ENT-003', entitlementName: 'JIRA_PROJECT_LEAD', application: 'Jira', modificationType: 'Scope Change', currentValue: 'Single project', proposedValue: 'Multi-project (up to 5)', status: 'In Progress', requestedBy: 'Sarah Mitchell', requestDate: '2026-03-04', usersAffected: 20, rolesAffected: 3, riskImpact: 'Low — expanded project visibility only', approvers: [{ name: 'Sarah Mitchell', status: 'approved' }], justification: 'Cross-functional project management requirement' },
  { id: 'emod-4', entitlementId: 'ENT-005', entitlementName: 'SF_DATA_EXPORT', application: 'Salesforce', modificationType: 'Owner Transfer', currentValue: 'Maria Garcia', proposedValue: 'Robert Jones', status: 'Pending Review', requestedBy: 'Maria Garcia', requestDate: '2026-03-06', usersAffected: 12, rolesAffected: 2, riskImpact: 'No access change — ownership governance only', approvers: [{ name: 'Maria Garcia', status: 'approved' }, { name: 'Robert Jones', status: 'pending' }], justification: 'Reorg — CRM ownership moving to Customer Success' },
  { id: 'emod-5', entitlementId: 'ENT-004', entitlementName: 'AWS_EC2_FULL', application: 'AWS IAM', modificationType: 'Compliance Mapping Update', currentValue: 'SOX only', proposedValue: 'SOX + SOC2 + PCI-DSS', status: 'Under Review', requestedBy: 'Compliance Team', requestDate: '2026-03-02', usersAffected: 8, rolesAffected: 2, riskImpact: 'Additional certification requirements for holders', approvers: [{ name: 'Mike Torres', status: 'approved' }, { name: 'Compliance Officer', status: 'pending' }], justification: 'Multi-framework compliance alignment initiative' },
  { id: 'emod-6', entitlementId: 'ENT-008', entitlementName: 'WORKDAY_HR_ADMIN', application: 'Workday', modificationType: 'Risk Reclassification', currentValue: 'High Risk', proposedValue: 'Critical Risk', status: 'Pending Review', requestedBy: 'Risk Team', requestDate: '2026-03-07', usersAffected: 6, rolesAffected: 2, riskImpact: 'Requires executive approval and monthly recertification', approvers: [{ name: 'Kevin Brown', status: 'pending' }, { name: 'CISO', status: 'pending' }], justification: 'PII/compensation data access warrants critical classification' },
  { id: 'emod-7', entitlementId: 'ENT-006', entitlementName: 'AD_USER_ADMIN', application: 'Active Directory', modificationType: 'Access Restriction', currentValue: 'Domain-wide user management', proposedValue: 'OU-restricted user management', status: 'In Progress', requestedBy: 'Security Team', requestDate: '2026-03-01', usersAffected: 3, rolesAffected: 1, riskImpact: 'Limits AD admin scope to assigned organizational units', approvers: [{ name: 'Mike Torres', status: 'approved' }, { name: 'CISO', status: 'approved' }], justification: 'Zero-trust AD administration model implementation' },
  { id: 'emod-8', entitlementId: 'ENT-007', entitlementName: 'LEGACY_REPORT_ACCESS', application: 'Legacy Reports', modificationType: 'Scope Change', currentValue: 'All legacy reports', proposedValue: 'Read-only archive access', status: 'Approved', requestedBy: 'IT Governance', requestDate: '2026-02-28', usersAffected: 0, rolesAffected: 0, riskImpact: 'None — deprecated entitlement being restricted before deletion', approvers: [{ name: 'IT Director', status: 'approved' }], justification: 'Pre-deletion restriction as part of system decommission' },
];

// ── Scheduled Entitlement Disables ──

export interface ScheduledEntitlementDisable {
  id: string;
  entitlementId: string;
  entitlementName: string;
  application: string;
  usersAffected: number;
  rolesAffected: number;
  lastUsed: string;
  scheduledDate: string;
  reason: string;
  status: 'Scheduled' | 'Processing' | 'Completed';
  alternativeEntitlement?: string;
  gracePeriodDays: number;
  riskLevel: string;
}

export const scheduledEntitlementDisables: ScheduledEntitlementDisable[] = [
  { id: 'edis-1', entitlementId: 'ENT-007', entitlementName: 'LEGACY_REPORT_ACCESS', application: 'Legacy Reports', usersAffected: 0, rolesAffected: 0, lastUsed: '2025-12-01', scheduledDate: '2026-03-15', reason: 'System decommission', status: 'Scheduled', gracePeriodDays: 30, riskLevel: 'Low' },
  { id: 'edis-2', entitlementId: 'ENT-009', entitlementName: 'TEMP_CONTRACTOR_READ', application: 'File Server', usersAffected: 8, rolesAffected: 1, lastUsed: '2026-02-20', scheduledDate: '2026-03-31', reason: 'Project completion', status: 'Scheduled', alternativeEntitlement: 'STANDARD_FILE_READ', gracePeriodDays: 14, riskLevel: 'Medium' },
  { id: 'edis-3', entitlementId: 'ENT-010', entitlementName: 'DEPRECATED_API_KEY', application: 'Legacy API', usersAffected: 0, rolesAffected: 2, lastUsed: '2025-11-15', scheduledDate: '2026-03-20', reason: 'API version sunset', status: 'Scheduled', alternativeEntitlement: 'NEW_API_ACCESS', gracePeriodDays: 21, riskLevel: 'Low' },
  { id: 'edis-4', entitlementId: 'ENT-011', entitlementName: 'OLD_CRM_ADMIN', application: 'Old CRM', usersAffected: 3, rolesAffected: 1, lastUsed: '2026-01-10', scheduledDate: '2026-04-01', reason: 'CRM migration to Salesforce', status: 'Scheduled', alternativeEntitlement: 'SF_ADMIN_LITE', gracePeriodDays: 30, riskLevel: 'Medium' },
];

// ── Entitlement Deletion Candidates ──

export interface EntitlementDeletionCandidate {
  id: string;
  entitlementId: string;
  entitlementName: string;
  application: string;
  activeAssignments: number;
  lastUsed: string;
  canDelete: boolean;
  blockingReasons: string[];
  complianceStatus: 'Approved' | 'Pending' | 'N/A';
  containingRoles: string[];
}

export const entitlementDeletionCandidates: EntitlementDeletionCandidate[] = [
  { id: 'edel-1', entitlementId: 'ENT-007', entitlementName: 'OBSOLETE_REPORT_ACCESS', application: 'Legacy Reports', activeAssignments: 0, lastUsed: '2025-12-01', canDelete: true, blockingReasons: [], complianceStatus: 'Approved', containingRoles: [] },
  { id: 'edel-2', entitlementId: 'ENT-012', entitlementName: 'OLD_DATABASE_READ', application: 'Deprecated DB', activeAssignments: 0, lastUsed: '2025-11-20', canDelete: true, blockingReasons: [], complianceStatus: 'Pending', containingRoles: [] },
  { id: 'edel-3', entitlementId: 'ENT-013', entitlementName: 'ACTIVE_USER_PERMISSION', application: 'Current System', activeAssignments: 25, lastUsed: '2026-03-08', canDelete: false, blockingReasons: ['25 active assignments', 'Referenced in 3 roles', 'SOX controlled'], complianceStatus: 'N/A', containingRoles: ['Finance Manager', 'Auditor', 'Compliance Officer'] },
  { id: 'edel-4', entitlementId: 'ENT-014', entitlementName: 'RETIRED_VPN_ACCESS', application: 'VPN Gateway', activeAssignments: 0, lastUsed: '2025-09-30', canDelete: true, blockingReasons: [], complianceStatus: 'Approved', containingRoles: [] },
];
