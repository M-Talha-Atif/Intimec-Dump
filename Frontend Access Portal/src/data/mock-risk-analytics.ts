
import {
  RiskKPI,
  RiskTrendDataPoint,
  HighRiskIdentity,
  SoDViolation,
  AppRiskMatrix,
  CertificationCampaign,
  ComplianceFramework,
  IdentityRiskSegment,
} from '@/types/riskAnalytics';

export const riskKPIs: RiskKPI[] = [
  {
    id: 'overall-risk',
    name: 'Overall Risk Score',
    value: 72,
    previousValue: 65,
    trend: 'up',
    severity: 'high',
    tooltip: 'Composite IGA risk posture scored 0-100 based on weighted factors: access risk, SoD violations, certification compliance, and privilege exposure. Higher scores indicate greater organizational risk.',
  },
  {
    id: 'sod-violations',
    name: 'SoD Violations',
    value: 14,
    previousValue: 19,
    trend: 'down',
    severity: 'critical',
    tooltip: 'Active Segregation of Duties policy conflicts where a single identity holds conflicting entitlements (e.g., create & approve payments). Each violation is a potential compliance and fraud risk.',
  },
  {
    id: 'orphaned-accounts',
    name: 'Orphaned Accounts',
    value: 38,
    previousValue: 45,
    trend: 'down',
    severity: 'high',
    tooltip: 'Application accounts without an active identity owner — typically from terminated employees or unlinked service accounts. Each orphan is an unmonitored access vector.',
  },
  {
    id: 'excessive-access',
    name: 'Excessive Access',
    value: 156,
    previousValue: 142,
    trend: 'up',
    severity: 'high',
    tooltip: 'Identities holding entitlements beyond their role-based requirements. Detected via peer-group analysis and role mining. Increases blast radius of compromised accounts.',
  },
  {
    id: 'unused-access',
    name: 'Unused Access',
    value: 243,
    previousValue: 210,
    trend: 'up',
    severity: 'medium',
    tooltip: 'Entitlements not exercised in 90+ days. Represents standing privileges that violate least-privilege principle and inflate the access surface without operational need.',
  },
  {
    id: 'overdue-certs',
    name: 'Overdue Certifications',
    value: 31,
    previousValue: 22,
    trend: 'up',
    severity: 'high',
    tooltip: 'Access certification reviews that have passed their due date without completion. Overdue reviews create compliance gaps and may indicate rubber-stamping or reviewer fatigue.',
  },
  {
    id: 'privileged-risk',
    name: 'Privileged Access Risk',
    value: 18,
    previousValue: 20,
    trend: 'down',
    severity: 'critical',
    tooltip: 'High-privilege accounts (admin, root, service) without adequate controls such as MFA, session recording, or just-in-time elevation. Top target for attackers.',
  },
  {
    id: 'compliance-gaps',
    name: 'Compliance Gaps',
    value: 9,
    previousValue: 12,
    trend: 'down',
    severity: 'medium',
    tooltip: 'Missing or failed controls across SOX, GDPR, HIPAA, and SOC2 frameworks. Each gap represents a potential audit finding or regulatory penalty.',
  },
];

export const riskTrendData: RiskTrendDataPoint[] = [
  { month: 'Apr 2025', accessRisk: 42, policyViolations: 18, certificationRisk: 12, lifecycleRisk: 8 },
  { month: 'May 2025', accessRisk: 45, policyViolations: 22, certificationRisk: 14, lifecycleRisk: 10 },
  { month: 'Jun 2025', accessRisk: 48, policyViolations: 20, certificationRisk: 16, lifecycleRisk: 9 },
  { month: 'Jul 2025', accessRisk: 52, policyViolations: 25, certificationRisk: 18, lifecycleRisk: 11 },
  { month: 'Aug 2025', accessRisk: 50, policyViolations: 23, certificationRisk: 15, lifecycleRisk: 12 },
  { month: 'Sep 2025', accessRisk: 55, policyViolations: 28, certificationRisk: 20, lifecycleRisk: 14 },
  { month: 'Oct 2025', accessRisk: 53, policyViolations: 26, certificationRisk: 22, lifecycleRisk: 13 },
  { month: 'Nov 2025', accessRisk: 58, policyViolations: 24, certificationRisk: 25, lifecycleRisk: 15 },
  { month: 'Dec 2025', accessRisk: 60, policyViolations: 22, certificationRisk: 28, lifecycleRisk: 16 },
  { month: 'Jan 2026', accessRisk: 56, policyViolations: 19, certificationRisk: 30, lifecycleRisk: 14 },
  { month: 'Feb 2026', accessRisk: 54, policyViolations: 17, certificationRisk: 26, lifecycleRisk: 12 },
  { month: 'Mar 2026', accessRisk: 52, policyViolations: 14, certificationRisk: 24, lifecycleRisk: 11 },
];

export const highRiskIdentities: HighRiskIdentity[] = [
  { id: 'ID-001', name: 'John Smith', type: 'Employee', department: 'Finance', riskScore: 95, accessScore: 88, sodScore: 100, certScore: 92, privilegeScore: 95, violations: 4, lastReview: '2025-11-15', remediationStatus: 'Open' },
  { id: 'ID-002', name: 'svc_payment_api', type: 'NHI', department: 'IT Infrastructure', riskScore: 91, accessScore: 95, sodScore: 0, certScore: 100, privilegeScore: 98, violations: 2, lastReview: '2025-09-20', remediationStatus: 'Open' },
  { id: 'ID-003', name: 'Maria Garcia', type: 'Contractor', department: 'Marketing', riskScore: 87, accessScore: 82, sodScore: 75, certScore: 90, privilegeScore: 60, violations: 3, lastReview: '2025-12-01', remediationStatus: 'In Progress' },
  { id: 'ID-004', name: 'admin_backup_svc', type: 'NHI', department: 'IT Security', riskScore: 85, accessScore: 90, sodScore: 0, certScore: 95, privilegeScore: 100, violations: 1, lastReview: '2025-10-10', remediationStatus: 'Accepted' },
  { id: 'ID-005', name: 'Robert Chen', type: 'Employee', department: 'IT Operations', riskScore: 83, accessScore: 78, sodScore: 85, certScore: 70, privilegeScore: 92, violations: 3, lastReview: '2025-11-28', remediationStatus: 'In Progress' },
  { id: 'ID-006', name: 'Sarah Williams', type: 'Privileged', department: 'Finance', riskScore: 80, accessScore: 72, sodScore: 90, certScore: 65, privilegeScore: 88, violations: 2, lastReview: '2026-01-05', remediationStatus: 'Open' },
  { id: 'ID-007', name: 'ext_audit_tool', type: 'NHI', department: 'Compliance', riskScore: 78, accessScore: 85, sodScore: 0, certScore: 88, privilegeScore: 75, violations: 1, lastReview: '2025-12-15', remediationStatus: 'Mitigated' },
  { id: 'ID-008', name: 'David Patel', type: 'Contractor', department: 'Engineering', riskScore: 76, accessScore: 70, sodScore: 65, certScore: 80, privilegeScore: 55, violations: 2, lastReview: '2026-01-20', remediationStatus: 'In Progress' },
  { id: 'ID-009', name: 'Lisa Thompson', type: 'Employee', department: 'HR', riskScore: 74, accessScore: 68, sodScore: 80, certScore: 60, privilegeScore: 70, violations: 2, lastReview: '2026-02-01', remediationStatus: 'Open' },
  { id: 'ID-010', name: 'James Wilson', type: 'Privileged', department: 'IT Security', riskScore: 71, accessScore: 65, sodScore: 55, certScore: 72, privilegeScore: 95, violations: 1, lastReview: '2026-02-10', remediationStatus: 'Mitigated' },
];

export const sodViolations: SoDViolation[] = [
  { id: 'SOD-001', policyName: 'Finance Segregation', violator: 'John Smith', conflictingEntitlements: ['AP_Create_Invoice', 'AP_Approve_Payment'], application: 'SAP ERP', severity: 'Critical', daysOpen: 45, remediationStatus: 'Open', compensatingControl: null },
  { id: 'SOD-002', policyName: 'IT Admin Separation', violator: 'Robert Chen', conflictingEntitlements: ['DB_Admin_Full', 'Security_Config_Write'], application: 'Oracle DB', severity: 'Critical', daysOpen: 32, remediationStatus: 'In Review', compensatingControl: 'Session recording enabled' },
  { id: 'SOD-003', policyName: 'HR Data Protection', violator: 'Lisa Thompson', conflictingEntitlements: ['HR_Salary_View', 'HR_Salary_Modify'], application: 'Workday', severity: 'High', daysOpen: 18, remediationStatus: 'In Review', compensatingControl: null },
  { id: 'SOD-004', policyName: 'Procurement Segregation', violator: 'Sarah Williams', conflictingEntitlements: ['PO_Create', 'PO_Approve'], application: 'SAP ERP', severity: 'Critical', daysOpen: 60, remediationStatus: 'Exception Granted', compensatingControl: 'Manager co-approval required' },
  { id: 'SOD-005', policyName: 'Access Provisioning', violator: 'Robert Chen', conflictingEntitlements: ['User_Create', 'Role_Assign_Admin'], application: 'SailPoint', severity: 'High', daysOpen: 12, remediationStatus: 'Open', compensatingControl: null },
  { id: 'SOD-006', policyName: 'Financial Reporting', violator: 'Maria Garcia', conflictingEntitlements: ['GL_Post_Journal', 'GL_Approve_Journal'], application: 'SAP ERP', severity: 'High', daysOpen: 25, remediationStatus: 'In Review', compensatingControl: 'Quarterly audit review' },
  { id: 'SOD-007', policyName: 'Vendor Management', violator: 'David Patel', conflictingEntitlements: ['Vendor_Create', 'Vendor_Payment_Release'], application: 'SAP Ariba', severity: 'Medium', daysOpen: 8, remediationStatus: 'Open', compensatingControl: null },
  { id: 'SOD-008', policyName: 'System Configuration', violator: 'James Wilson', conflictingEntitlements: ['Firewall_Config', 'Firewall_Audit_Log_Delete'], application: 'Palo Alto', severity: 'Critical', daysOpen: 5, remediationStatus: 'In Review', compensatingControl: null },
  { id: 'SOD-009', policyName: 'Customer Data Access', violator: 'Maria Garcia', conflictingEntitlements: ['CRM_Export_All', 'CRM_Delete_Records'], application: 'Salesforce', severity: 'High', daysOpen: 15, remediationStatus: 'Open', compensatingControl: null },
  { id: 'SOD-010', policyName: 'Payroll Processing', violator: 'Lisa Thompson', conflictingEntitlements: ['Payroll_Run', 'Payroll_Approve'], application: 'Workday', severity: 'Critical', daysOpen: 38, remediationStatus: 'Open', compensatingControl: null },
];

export const appRiskMatrix: AppRiskMatrix[] = [
  { application: 'SAP ERP', sod: 92, excessive: 78, unused: 65, orphaned: 45, privileged: 82 },
  { application: 'Salesforce', sod: 35, excessive: 88, unused: 72, orphaned: 28, privileged: 40 },
  { application: 'Workday', sod: 78, excessive: 55, unused: 42, orphaned: 15, privileged: 60 },
  { application: 'Oracle DB', sod: 45, excessive: 62, unused: 38, orphaned: 52, privileged: 95 },
  { application: 'ServiceNow', sod: 22, excessive: 70, unused: 80, orphaned: 35, privileged: 48 },
  { application: 'Azure AD', sod: 30, excessive: 45, unused: 55, orphaned: 68, privileged: 75 },
  { application: 'AWS Console', sod: 40, excessive: 58, unused: 48, orphaned: 22, privileged: 90 },
  { application: 'Jira', sod: 15, excessive: 82, unused: 88, orphaned: 42, privileged: 20 },
];

export const certificationCampaigns: CertificationCampaign[] = [
  { id: 'CERT-001', name: 'Q1 2026 Manager Cert', completion: 72, rubberStampRate: 34, overdueCount: 18, autoApproveRate: 12, riskAccepted: 8, totalItems: 1240, dueDate: '2026-03-31', status: 'Active' },
  { id: 'CERT-002', name: 'Privileged Access Review', completion: 45, rubberStampRate: 8, overdueCount: 22, autoApproveRate: 2, riskAccepted: 3, totalItems: 180, dueDate: '2026-03-15', status: 'Overdue' },
  { id: 'CERT-003', name: 'SOX Critical Apps', completion: 88, rubberStampRate: 15, overdueCount: 5, autoApproveRate: 0, riskAccepted: 12, totalItems: 520, dueDate: '2026-04-15', status: 'Active' },
  { id: 'CERT-004', name: 'Contractor Quarterly', completion: 100, rubberStampRate: 42, overdueCount: 0, autoApproveRate: 28, riskAccepted: 15, totalItems: 340, dueDate: '2026-02-28', status: 'Completed' },
  { id: 'CERT-005', name: 'NHI Service Account Review', completion: 30, rubberStampRate: 5, overdueCount: 35, autoApproveRate: 0, riskAccepted: 1, totalItems: 95, dueDate: '2026-03-10', status: 'Overdue' },
  { id: 'CERT-006', name: 'GDPR Data Access Cert', completion: 65, rubberStampRate: 20, overdueCount: 12, autoApproveRate: 8, riskAccepted: 6, totalItems: 410, dueDate: '2026-04-01', status: 'Active' },
];

export const complianceFrameworks: ComplianceFramework[] = [
  { id: 'sox', name: 'SOX', icon: '📋', controlCoverage: 87, failedControls: 4, totalControls: 32, openFindings: 6, lastAudit: '2026-01-15', status: 'At Risk' },
  { id: 'gdpr', name: 'GDPR', icon: '🇪🇺', controlCoverage: 92, failedControls: 2, totalControls: 28, openFindings: 3, lastAudit: '2026-02-01', status: 'Compliant' },
  { id: 'hipaa', name: 'HIPAA', icon: '🏥', controlCoverage: 78, failedControls: 7, totalControls: 45, openFindings: 11, lastAudit: '2025-12-10', status: 'Non-Compliant' },
  { id: 'soc2', name: 'SOC 2', icon: '🔒', controlCoverage: 94, failedControls: 1, totalControls: 24, openFindings: 2, lastAudit: '2026-02-20', status: 'Compliant' },
];

export const identityRiskSegments: IdentityRiskSegment[] = [
  { type: 'Employee', count: 2450, highRiskCount: 45, avgRiskScore: 38, color: 'hsl(var(--primary))' },
  { type: 'Contractor', count: 380, highRiskCount: 28, avgRiskScore: 52, color: 'hsl(220, 70%, 55%)' },
  { type: 'NHI', count: 195, highRiskCount: 42, avgRiskScore: 61, color: 'hsl(280, 60%, 55%)' },
  { type: 'Privileged', count: 85, highRiskCount: 18, avgRiskScore: 74, color: 'hsl(0, 70%, 55%)' },
];

// Unused Access Entries
export interface UnusedAccessEntry {
  id: string;
  identity: string;
  identityType: 'Employee' | 'Contractor' | 'NHI';
  entitlement: string;
  application: string;
  lastUsed: string;
  daysInactive: number;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  grantedDate: string;
}

export const unusedAccessEntries: UnusedAccessEntry[] = [
  { id: 'UA-001', identity: 'John Smith', identityType: 'Employee', entitlement: 'SAP_FI_PostGL', application: 'SAP ERP', lastUsed: '2025-10-15', daysInactive: 144, riskLevel: 'Critical', grantedDate: '2024-03-01' },
  { id: 'UA-002', identity: 'Maria Garcia', identityType: 'Contractor', entitlement: 'SFDC_Admin_Console', application: 'Salesforce', lastUsed: '2025-09-20', daysInactive: 169, riskLevel: 'Critical', grantedDate: '2024-06-15' },
  { id: 'UA-003', identity: 'Robert Chen', identityType: 'Employee', entitlement: 'AWS_EC2_FullAccess', application: 'AWS Console', lastUsed: '2025-11-01', daysInactive: 127, riskLevel: 'High', grantedDate: '2024-01-10' },
  { id: 'UA-004', identity: 'svc_payment_api', identityType: 'NHI', entitlement: 'DB_ReadWrite_Prod', application: 'Oracle DB', lastUsed: '2025-12-01', daysInactive: 97, riskLevel: 'High', grantedDate: '2023-08-20' },
  { id: 'UA-005', identity: 'Lisa Thompson', identityType: 'Employee', entitlement: 'Workday_Comp_Admin', application: 'Workday', lastUsed: '2025-10-22', daysInactive: 137, riskLevel: 'Critical', grantedDate: '2024-02-14' },
  { id: 'UA-006', identity: 'David Patel', identityType: 'Contractor', entitlement: 'JIRA_Project_Admin', application: 'Jira', lastUsed: '2025-11-15', daysInactive: 113, riskLevel: 'Medium', grantedDate: '2024-07-01' },
  { id: 'UA-007', identity: 'Sarah Williams', identityType: 'Employee', entitlement: 'AzureAD_Global_Reader', application: 'Azure AD', lastUsed: '2025-12-10', daysInactive: 88, riskLevel: 'Medium', grantedDate: '2024-04-20' },
  { id: 'UA-008', identity: 'James Wilson', identityType: 'Employee', entitlement: 'PaloAlto_Config_Write', application: 'Palo Alto', lastUsed: '2025-09-05', daysInactive: 184, riskLevel: 'Critical', grantedDate: '2023-11-15' },
  { id: 'UA-009', identity: 'admin_backup_svc', identityType: 'NHI', entitlement: 'SNOW_Incident_Create', application: 'ServiceNow', lastUsed: '2025-11-28', daysInactive: 100, riskLevel: 'Medium', grantedDate: '2024-05-10' },
  { id: 'UA-010', identity: 'ext_audit_tool', identityType: 'NHI', entitlement: 'SAP_Audit_Full', application: 'SAP ERP', lastUsed: '2025-12-20', daysInactive: 78, riskLevel: 'Low', grantedDate: '2024-01-25' },
  { id: 'UA-011', identity: 'John Smith', identityType: 'Employee', entitlement: 'SFDC_Reports_Export', application: 'Salesforce', lastUsed: '2025-10-05', daysInactive: 154, riskLevel: 'High', grantedDate: '2024-03-15' },
  { id: 'UA-012', identity: 'Maria Garcia', identityType: 'Contractor', entitlement: 'Workday_Benefits_View', application: 'Workday', lastUsed: '2025-08-20', daysInactive: 200, riskLevel: 'Critical', grantedDate: '2024-02-01' },
  { id: 'UA-013', identity: 'Robert Chen', identityType: 'Employee', entitlement: 'SNOW_Change_Approve', application: 'ServiceNow', lastUsed: '2025-12-05', daysInactive: 93, riskLevel: 'Medium', grantedDate: '2024-06-01' },
  { id: 'UA-014', identity: 'Lisa Thompson', identityType: 'Employee', entitlement: 'AzureAD_User_Admin', application: 'Azure AD', lastUsed: '2025-11-10', daysInactive: 118, riskLevel: 'High', grantedDate: '2024-04-15' },
  { id: 'UA-015', identity: 'David Patel', identityType: 'Contractor', entitlement: 'AWS_S3_FullAccess', application: 'AWS Console', lastUsed: '2025-10-01', daysInactive: 158, riskLevel: 'Critical', grantedDate: '2024-01-05' },
  { id: 'UA-016', identity: 'Sarah Williams', identityType: 'Employee', entitlement: 'OracleDB_Schema_DDL', application: 'Oracle DB', lastUsed: '2025-09-28', daysInactive: 161, riskLevel: 'Critical', grantedDate: '2023-12-10' },
];

// Overdue Certification Items
export interface OverdueCertItem {
  id: string;
  campaignName: string;
  campaignId: string;
  reviewer: string;
  identity: string;
  entitlement: string;
  application: string;
  daysOverdue: number;
  escalationStatus: 'Not Escalated' | 'L1 Escalated' | 'L2 Escalated' | 'Auto-Revoked';
  priority: 'Critical' | 'High' | 'Medium';
}

export const overdueCertItems: OverdueCertItem[] = [
  { id: 'OC-001', campaignName: 'Privileged Access Review', campaignId: 'CERT-002', reviewer: 'Michael Brown', identity: 'svc_payment_api', entitlement: 'DB_Admin_Full', application: 'Oracle DB', daysOverdue: 22, escalationStatus: 'L2 Escalated', priority: 'Critical' },
  { id: 'OC-002', campaignName: 'Privileged Access Review', campaignId: 'CERT-002', reviewer: 'Michael Brown', identity: 'admin_backup_svc', entitlement: 'Root_SSH_Access', application: 'AWS Console', daysOverdue: 18, escalationStatus: 'L1 Escalated', priority: 'Critical' },
  { id: 'OC-003', campaignName: 'Q1 2026 Manager Cert', campaignId: 'CERT-001', reviewer: 'Jennifer Lee', identity: 'John Smith', entitlement: 'SAP_FI_All', application: 'SAP ERP', daysOverdue: 12, escalationStatus: 'L1 Escalated', priority: 'High' },
  { id: 'OC-004', campaignName: 'NHI Service Account Review', campaignId: 'CERT-005', reviewer: 'IT Security Team', identity: 'ext_audit_tool', entitlement: 'Audit_Full_Read', application: 'SAP ERP', daysOverdue: 35, escalationStatus: 'L2 Escalated', priority: 'Critical' },
  { id: 'OC-005', campaignName: 'GDPR Data Access Cert', campaignId: 'CERT-006', reviewer: 'Privacy Officer', identity: 'Maria Garcia', entitlement: 'CRM_Export_All', application: 'Salesforce', daysOverdue: 8, escalationStatus: 'Not Escalated', priority: 'High' },
  { id: 'OC-006', campaignName: 'Q1 2026 Manager Cert', campaignId: 'CERT-001', reviewer: 'David Kim', identity: 'Robert Chen', entitlement: 'IT_Admin_Console', application: 'ServiceNow', daysOverdue: 5, escalationStatus: 'Not Escalated', priority: 'Medium' },
  { id: 'OC-007', campaignName: 'NHI Service Account Review', campaignId: 'CERT-005', reviewer: 'IT Security Team', identity: 'svc_monitoring', entitlement: 'Infra_Read_All', application: 'AWS Console', daysOverdue: 28, escalationStatus: 'L1 Escalated', priority: 'High' },
  { id: 'OC-008', campaignName: 'Privileged Access Review', campaignId: 'CERT-002', reviewer: 'CISO Office', identity: 'James Wilson', entitlement: 'Firewall_Admin', application: 'Palo Alto', daysOverdue: 15, escalationStatus: 'L1 Escalated', priority: 'Critical' },
  { id: 'OC-009', campaignName: 'GDPR Data Access Cert', campaignId: 'CERT-006', reviewer: 'Privacy Officer', identity: 'Lisa Thompson', entitlement: 'HR_PII_Access', application: 'Workday', daysOverdue: 10, escalationStatus: 'Not Escalated', priority: 'High' },
  { id: 'OC-010', campaignName: 'Q1 2026 Manager Cert', campaignId: 'CERT-001', reviewer: 'Jennifer Lee', identity: 'Sarah Williams', entitlement: 'Finance_Reports_All', application: 'SAP ERP', daysOverdue: 3, escalationStatus: 'Not Escalated', priority: 'Medium' },
  { id: 'OC-011', campaignName: 'NHI Service Account Review', campaignId: 'CERT-005', reviewer: 'IT Security Team', identity: 'batch_etl_proc', entitlement: 'DB_ReadWrite_Staging', application: 'Oracle DB', daysOverdue: 30, escalationStatus: 'L2 Escalated', priority: 'High' },
  { id: 'OC-012', campaignName: 'SOX Critical Apps', campaignId: 'CERT-003', reviewer: 'Compliance Team', identity: 'John Smith', entitlement: 'AP_Approve_Payment', application: 'SAP ERP', daysOverdue: 7, escalationStatus: 'L1 Escalated', priority: 'Critical' },
];

// Privileged Accounts with Missing Controls
export interface PrivilegedAccount {
  id: string;
  account: string;
  identity: string;
  identityType: 'Employee' | 'NHI' | 'Privileged';
  application: string;
  privilegeLevel: 'Root' | 'Admin' | 'Elevated';
  hasMFA: boolean;
  hasJIT: boolean;
  hasSessionRecording: boolean;
  hasPAMVault: boolean;
  riskScore: number;
  lastPasswordRotation: string;
  lastAccess: string;
}

export const privilegedAccounts: PrivilegedAccount[] = [
  { id: 'PA-001', account: 'root_admin', identity: 'James Wilson', identityType: 'Privileged', application: 'AWS Console', privilegeLevel: 'Root', hasMFA: true, hasJIT: false, hasSessionRecording: false, hasPAMVault: false, riskScore: 95, lastPasswordRotation: '2025-06-15', lastAccess: '2026-03-07' },
  { id: 'PA-002', account: 'svc_payment_api', identity: 'svc_payment_api', identityType: 'NHI', application: 'Oracle DB', privilegeLevel: 'Admin', hasMFA: false, hasJIT: false, hasSessionRecording: false, hasPAMVault: false, riskScore: 98, lastPasswordRotation: '2024-11-20', lastAccess: '2026-03-08' },
  { id: 'PA-003', account: 'admin_backup_svc', identity: 'admin_backup_svc', identityType: 'NHI', application: 'AWS Console', privilegeLevel: 'Admin', hasMFA: false, hasJIT: false, hasSessionRecording: true, hasPAMVault: false, riskScore: 88, lastPasswordRotation: '2025-01-10', lastAccess: '2026-03-08' },
  { id: 'PA-004', account: 'sa_finance', identity: 'Sarah Williams', identityType: 'Privileged', application: 'SAP ERP', privilegeLevel: 'Admin', hasMFA: true, hasJIT: false, hasSessionRecording: true, hasPAMVault: true, riskScore: 62, lastPasswordRotation: '2026-01-05', lastAccess: '2026-03-07' },
  { id: 'PA-005', account: 'dba_prod', identity: 'Robert Chen', identityType: 'Employee', application: 'Oracle DB', privilegeLevel: 'Admin', hasMFA: true, hasJIT: false, hasSessionRecording: false, hasPAMVault: true, riskScore: 75, lastPasswordRotation: '2025-09-18', lastAccess: '2026-03-06' },
  { id: 'PA-006', account: 'firewall_admin', identity: 'James Wilson', identityType: 'Privileged', application: 'Palo Alto', privilegeLevel: 'Root', hasMFA: true, hasJIT: true, hasSessionRecording: true, hasPAMVault: false, riskScore: 55, lastPasswordRotation: '2026-02-01', lastAccess: '2026-03-05' },
  { id: 'PA-007', account: 'azure_ga', identity: 'Robert Chen', identityType: 'Employee', application: 'Azure AD', privilegeLevel: 'Root', hasMFA: true, hasJIT: false, hasSessionRecording: false, hasPAMVault: false, riskScore: 82, lastPasswordRotation: '2025-08-20', lastAccess: '2026-03-08' },
  { id: 'PA-008', account: 'workday_admin', identity: 'Lisa Thompson', identityType: 'Employee', application: 'Workday', privilegeLevel: 'Admin', hasMFA: true, hasJIT: false, hasSessionRecording: false, hasPAMVault: false, riskScore: 70, lastPasswordRotation: '2025-12-01', lastAccess: '2026-03-04' },
  { id: 'PA-009', account: 'svc_etl_master', identity: 'svc_etl_master', identityType: 'NHI', application: 'Oracle DB', privilegeLevel: 'Elevated', hasMFA: false, hasJIT: false, hasSessionRecording: false, hasPAMVault: false, riskScore: 90, lastPasswordRotation: '2024-08-15', lastAccess: '2026-03-08' },
  { id: 'PA-010', account: 'snow_admin', identity: 'David Patel', identityType: 'Employee', application: 'ServiceNow', privilegeLevel: 'Admin', hasMFA: true, hasJIT: false, hasSessionRecording: false, hasPAMVault: true, riskScore: 58, lastPasswordRotation: '2026-01-20', lastAccess: '2026-03-03' },
];

// Compliance Control Details
export interface ComplianceControl {
  id: string;
  controlId: string;
  description: string;
  framework: string;
  frameworkId: string;
  status: 'Pass' | 'Fail' | 'Not Assessed';
  remediationOwner: string;
  daysOpen: number;
  findings: string;
  lastAssessed: string;
}

export const complianceControls: ComplianceControl[] = [
  { id: 'CC-001', controlId: 'SOX-AC-01', description: 'Access provisioning requires manager approval', framework: 'SOX', frameworkId: 'sox', status: 'Pass', remediationOwner: '', daysOpen: 0, findings: '', lastAssessed: '2026-01-15' },
  { id: 'CC-002', controlId: 'SOX-AC-02', description: 'Quarterly access certification for SOX apps', framework: 'SOX', frameworkId: 'sox', status: 'Fail', remediationOwner: 'Compliance Team', daysOpen: 45, findings: 'Certification completion below 80% threshold', lastAssessed: '2026-01-15' },
  { id: 'CC-003', controlId: 'SOX-SoD-01', description: 'SoD policies enforced across financial systems', framework: 'SOX', frameworkId: 'sox', status: 'Fail', remediationOwner: 'IT Security', daysOpen: 60, findings: '6 active SoD violations in SAP ERP', lastAssessed: '2026-01-15' },
  { id: 'CC-004', controlId: 'SOX-PA-01', description: 'Privileged access reviewed monthly', framework: 'SOX', frameworkId: 'sox', status: 'Fail', remediationOwner: 'IT Security', daysOpen: 30, findings: 'Privileged access review overdue by 22 days', lastAssessed: '2026-01-15' },
  { id: 'CC-005', controlId: 'SOX-AL-01', description: 'Audit logging enabled for financial transactions', framework: 'SOX', frameworkId: 'sox', status: 'Pass', remediationOwner: '', daysOpen: 0, findings: '', lastAssessed: '2026-01-15' },
  { id: 'CC-006', controlId: 'GDPR-DP-01', description: 'Personal data access logged and auditable', framework: 'GDPR', frameworkId: 'gdpr', status: 'Pass', remediationOwner: '', daysOpen: 0, findings: '', lastAssessed: '2026-02-01' },
  { id: 'CC-007', controlId: 'GDPR-DP-02', description: 'Data subject access requests fulfilled within 30 days', framework: 'GDPR', frameworkId: 'gdpr', status: 'Pass', remediationOwner: '', daysOpen: 0, findings: '', lastAssessed: '2026-02-01' },
  { id: 'CC-008', controlId: 'GDPR-AC-01', description: 'Access to PII limited to authorized personnel', framework: 'GDPR', frameworkId: 'gdpr', status: 'Fail', remediationOwner: 'Privacy Officer', daysOpen: 15, findings: '3 users with unauthorized PII access in Workday', lastAssessed: '2026-02-01' },
  { id: 'CC-009', controlId: 'GDPR-RET-01', description: 'Data retention policies enforced automatically', framework: 'GDPR', frameworkId: 'gdpr', status: 'Fail', remediationOwner: 'Data Governance', daysOpen: 20, findings: 'Retention policy not applied to 2 Salesforce objects', lastAssessed: '2026-02-01' },
  { id: 'CC-010', controlId: 'HIPAA-AC-01', description: 'PHI access requires role-based authorization', framework: 'HIPAA', frameworkId: 'hipaa', status: 'Fail', remediationOwner: 'IT Security', daysOpen: 90, findings: '12 users with broad PHI access beyond role need', lastAssessed: '2025-12-10' },
  { id: 'CC-011', controlId: 'HIPAA-AC-02', description: 'Emergency access break-glass procedure documented', framework: 'HIPAA', frameworkId: 'hipaa', status: 'Pass', remediationOwner: '', daysOpen: 0, findings: '', lastAssessed: '2025-12-10' },
  { id: 'CC-012', controlId: 'HIPAA-AU-01', description: 'PHI access audited quarterly', framework: 'HIPAA', frameworkId: 'hipaa', status: 'Fail', remediationOwner: 'Compliance Team', daysOpen: 75, findings: 'Last PHI audit conducted 6 months ago', lastAssessed: '2025-12-10' },
  { id: 'CC-013', controlId: 'HIPAA-TR-01', description: 'HIPAA training completed annually', framework: 'HIPAA', frameworkId: 'hipaa', status: 'Fail', remediationOwner: 'HR', daysOpen: 40, findings: '28% of staff overdue for annual HIPAA training', lastAssessed: '2025-12-10' },
  { id: 'CC-014', controlId: 'HIPAA-RA-01', description: 'Annual risk assessment completed', framework: 'HIPAA', frameworkId: 'hipaa', status: 'Pass', remediationOwner: '', daysOpen: 0, findings: '', lastAssessed: '2025-12-10' },
  { id: 'CC-015', controlId: 'HIPAA-EN-01', description: 'PHI encrypted at rest and in transit', framework: 'HIPAA', frameworkId: 'hipaa', status: 'Fail', remediationOwner: 'IT Infrastructure', daysOpen: 55, findings: 'Legacy database lacks encryption at rest', lastAssessed: '2025-12-10' },
  { id: 'CC-016', controlId: 'HIPAA-BP-01', description: 'Business associate agreements current', framework: 'HIPAA', frameworkId: 'hipaa', status: 'Fail', remediationOwner: 'Legal', daysOpen: 30, findings: '2 BAAs expired and not renewed', lastAssessed: '2025-12-10' },
  { id: 'CC-017', controlId: 'HIPAA-IR-01', description: 'Breach notification procedures tested', framework: 'HIPAA', frameworkId: 'hipaa', status: 'Fail', remediationOwner: 'IT Security', daysOpen: 65, findings: 'No tabletop exercise conducted this year', lastAssessed: '2025-12-10' },
  { id: 'CC-018', controlId: 'SOC2-CC6.1', description: 'Logical access controls implemented', framework: 'SOC 2', frameworkId: 'soc2', status: 'Pass', remediationOwner: '', daysOpen: 0, findings: '', lastAssessed: '2026-02-20' },
  { id: 'CC-019', controlId: 'SOC2-CC6.3', description: 'Role-based access enforcement validated', framework: 'SOC 2', frameworkId: 'soc2', status: 'Pass', remediationOwner: '', daysOpen: 0, findings: '', lastAssessed: '2026-02-20' },
  { id: 'CC-020', controlId: 'SOC2-CC6.2', description: 'Access removal upon termination within 24h', framework: 'SOC 2', frameworkId: 'soc2', status: 'Fail', remediationOwner: 'IT Ops', daysOpen: 10, findings: 'Average termination deprovisioning takes 48h', lastAssessed: '2026-02-20' },
];
