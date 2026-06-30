export interface MonitoringEvent {
  id: string;
  timestamp: string;
  type: 'provisioning' | 'access_request' | 'connector' | 'certification' | 'workflow' | 'policy' | 'audit';
  severity: 'info' | 'warn' | 'error' | 'critical';
  user: string;
  application: string;
  message: string;
  correlationId: string;
  details: Record<string, string | number>;
}

export interface ConnectorMetric {
  name: string;
  type: string;
  status: 'healthy' | 'degraded' | 'failing';
  uptime: number;
  lastSync: string;
  syncTime: string;
  throughput: string;
  errors: number;
  jobs: { successful: number; failed: number; pending: number };
  latencyHistory: { time: string; value: number }[];
  syncHistory: { date: string; records: number; status: string; duration: string }[];
  errorLog: { ts: string; code: string; message: string }[];
  config: Record<string, string>;
}

export interface JobQueueEntry {
  id: string;
  name: string;
  type: 'provisioning' | 'sync' | 'certification_scan' | 'policy_evaluation' | 'report_generation';
  status: 'running' | 'queued' | 'completed' | 'failed' | 'cancelled';
  connector: string;
  startedAt: string;
  estimatedEnd?: string;
  progress: number;
  recordsProcessed: number;
  recordsTotal: number;
  operator: string;
  retryCount: number;
  error?: string;
}

export interface SLAEntry {
  id: string;
  name: string;
  category: 'access_request' | 'provisioning' | 'certification' | 'incident_response';
  target: string;
  current: string;
  status: 'met' | 'at_risk' | 'breached';
  breachCount: number;
  avgFulfillmentTime: string;
  trend: number;
  history: { date: string; value: number; target: number }[];
}

export interface SystemHealthEntry {
  timestamp: string;
  status: 'healthy' | 'degraded' | 'incident';
  uptime: number;
  incidentId?: string;
  incidentTitle?: string;
}

export const monitoringEvents: MonitoringEvent[] = [
  { id: 'evt-001', timestamp: '2024-06-17 14:45:32', type: 'provisioning', severity: 'info', user: 'john.doe@company.com', application: 'SAP ERP', message: 'User account provisioned successfully', correlationId: 'corr-prov-001', details: { operation: 'CREATE_USER', status: 'SUCCESS', duration: '2.3s' } },
  { id: 'evt-002', timestamp: '2024-06-17 14:44:15', type: 'access_request', severity: 'warn', user: 'jane.smith@company.com', application: 'Salesforce', message: 'SoD policy violation detected during access request', correlationId: 'corr-req-002', details: { operation: 'ACCESS_REQUEST', status: 'POLICY_VIOLATION', conflictingRoles: 'Sales_Manager, Finance_Approver' } },
  { id: 'evt-003', timestamp: '2024-06-17 14:43:08', type: 'connector', severity: 'error', user: 'system', application: 'Active Directory', message: 'Connection timeout during sync operation', correlationId: 'corr-sync-003', details: { operation: 'SYNC_USERS', status: 'TIMEOUT', retryCount: 3 } },
  { id: 'evt-004', timestamp: '2024-06-17 14:42:45', type: 'certification', severity: 'info', user: 'manager@company.com', application: 'Multiple', message: 'Access certification approved for 25 entitlements', correlationId: 'corr-cert-004', details: { operation: 'CERTIFY_ACCESS', status: 'APPROVED', entitlementCount: 25 } },
  { id: 'evt-005', timestamp: '2024-06-17 14:41:30', type: 'workflow', severity: 'info', user: 'alice.wilson@company.com', application: 'Jira', message: 'Workflow escalated to L2 approver', correlationId: 'corr-wf-005', details: { operation: 'ESCALATE_APPROVAL', status: 'ESCALATED', approver: 'senior.manager@company.com' } },
  { id: 'evt-006', timestamp: '2024-06-17 14:40:12', type: 'policy', severity: 'critical', user: 'system', application: 'Policy Engine', message: 'Critical SoD violation: user granted conflicting roles in Finance', correlationId: 'corr-pol-006', details: { operation: 'POLICY_CHECK', status: 'CRITICAL_VIOLATION', rule: 'SOD-FIN-003' } },
  { id: 'evt-007', timestamp: '2024-06-17 14:39:55', type: 'provisioning', severity: 'error', user: 'system', application: 'Workday', message: 'Batch provisioning failed: API rate limit exceeded', correlationId: 'corr-prov-007', details: { operation: 'BATCH_PROVISION', status: 'RATE_LIMITED', affectedUsers: 45 } },
  { id: 'evt-008', timestamp: '2024-06-17 14:38:20', type: 'audit', severity: 'warn', user: 'admin@company.com', application: 'IGA Platform', message: 'Admin role assigned without manager approval', correlationId: 'corr-aud-008', details: { operation: 'ROLE_ASSIGN', status: 'POLICY_BYPASS', role: 'System_Admin' } },
  { id: 'evt-009', timestamp: '2024-06-17 14:37:10', type: 'connector', severity: 'info', user: 'system', application: 'ServiceNow', message: 'Full reconciliation completed successfully', correlationId: 'corr-sync-009', details: { operation: 'FULL_RECON', status: 'SUCCESS', recordsProcessed: 12450 } },
  { id: 'evt-010', timestamp: '2024-06-17 14:36:05', type: 'certification', severity: 'warn', user: 'hr.director@company.com', application: 'Oracle HCM', message: 'Certification deadline approaching: 48 hours remaining', correlationId: 'corr-cert-010', details: { operation: 'CERT_REMINDER', status: 'WARNING', pendingReviews: 132 } },
  { id: 'evt-011', timestamp: '2024-06-17 14:35:00', type: 'provisioning', severity: 'info', user: 'system', application: 'Azure AD', message: 'Group membership sync completed for 8 groups', correlationId: 'corr-prov-011', details: { operation: 'GROUP_SYNC', status: 'SUCCESS', groupCount: 8 } },
  { id: 'evt-012', timestamp: '2024-06-17 14:34:22', type: 'access_request', severity: 'info', user: 'bob.jones@company.com', application: 'AWS Console', message: 'Emergency access request auto-approved via break-glass procedure', correlationId: 'corr-req-012', details: { operation: 'BREAK_GLASS', status: 'AUTO_APPROVED', expiresIn: '4h' } },
  { id: 'evt-013', timestamp: '2024-06-17 14:33:15', type: 'workflow', severity: 'error', user: 'system', application: 'Approval Engine', message: 'Approval workflow stuck: approver unavailable for 72 hours', correlationId: 'corr-wf-013', details: { operation: 'APPROVAL_CHECK', status: 'STUCK', request: 'REQ-4521' } },
  { id: 'evt-014', timestamp: '2024-06-17 14:32:08', type: 'policy', severity: 'info', user: 'security.admin@company.com', application: 'Policy Engine', message: 'New password policy deployed to production', correlationId: 'corr-pol-014', details: { operation: 'POLICY_DEPLOY', status: 'SUCCESS', policyId: 'PWD-2024-Q3' } },
  { id: 'evt-015', timestamp: '2024-06-17 14:31:00', type: 'connector', severity: 'warn', user: 'system', application: 'SAP ERP', message: 'Delta sync detected 15 orphaned accounts', correlationId: 'corr-sync-015', details: { operation: 'DELTA_SYNC', status: 'ORPHANS_DETECTED', orphanCount: 15 } },
  { id: 'evt-016', timestamp: '2024-06-17 14:30:45', type: 'audit', severity: 'info', user: 'compliance@company.com', application: 'IGA Platform', message: 'Quarterly compliance report generated successfully', correlationId: 'corr-aud-016', details: { operation: 'REPORT_GEN', status: 'SUCCESS', reportType: 'SOX_QUARTERLY' } },
  { id: 'evt-017', timestamp: '2024-06-17 14:29:30', type: 'provisioning', severity: 'warn', user: 'system', application: 'Google Workspace', message: 'License assignment delayed: insufficient licenses available', correlationId: 'corr-prov-017', details: { operation: 'LICENSE_ASSIGN', status: 'DELAYED', available: 2, requested: 8 } },
  { id: 'evt-018', timestamp: '2024-06-17 14:28:15', type: 'certification', severity: 'error', user: 'system', application: 'Multiple', message: 'Micro-certification campaign failed to launch: invalid scope definition', correlationId: 'corr-cert-018', details: { operation: 'CAMPAIGN_LAUNCH', status: 'FAILED', campaignId: 'MC-2024-Q2-04' } },
  { id: 'evt-019', timestamp: '2024-06-17 14:27:00', type: 'access_request', severity: 'info', user: 'carol.white@company.com', application: 'GitHub Enterprise', message: 'Access request approved and fulfilled in 12 minutes', correlationId: 'corr-req-019', details: { operation: 'ACCESS_FULFILL', status: 'SUCCESS', fulfillmentTime: '12m' } },
  { id: 'evt-020', timestamp: '2024-06-17 14:26:10', type: 'connector', severity: 'error', user: 'system', application: 'Salesforce', message: 'OAuth token expired, automatic refresh failed', correlationId: 'corr-sync-020', details: { operation: 'TOKEN_REFRESH', status: 'FAILED', lastSuccess: '6h ago' } },
  { id: 'evt-021', timestamp: '2024-06-17 14:25:00', type: 'provisioning', severity: 'info', user: 'system', application: 'Active Directory', message: 'User deprovisioning completed for terminated employee', correlationId: 'corr-prov-021', details: { operation: 'DEPROVISION', status: 'SUCCESS', accounts: 7 } },
  { id: 'evt-022', timestamp: '2024-06-17 14:24:30', type: 'policy', severity: 'warn', user: 'system', application: 'Risk Engine', message: 'Risk score threshold exceeded for 3 users', correlationId: 'corr-pol-022', details: { operation: 'RISK_EVAL', status: 'THRESHOLD_EXCEEDED', maxScore: 87 } },
  { id: 'evt-023', timestamp: '2024-06-17 14:23:15', type: 'workflow', severity: 'info', user: 'david.chen@company.com', application: 'IGA Platform', message: 'Bulk role request submitted for 12 team members', correlationId: 'corr-wf-023', details: { operation: 'BULK_REQUEST', status: 'SUBMITTED', requestCount: 12 } },
  { id: 'evt-024', timestamp: '2024-06-17 14:22:00', type: 'audit', severity: 'critical', user: 'system', application: 'IGA Platform', message: 'Privileged access used outside business hours', correlationId: 'corr-aud-024', details: { operation: 'PRIV_ACCESS', status: 'ALERT', user: 'it.admin@company.com' } },
  { id: 'evt-025', timestamp: '2024-06-17 14:21:00', type: 'connector', severity: 'info', user: 'system', application: 'Workday', message: 'HR feed processed: 3 new hires, 1 termination, 2 transfers', correlationId: 'corr-sync-025', details: { operation: 'HR_FEED', status: 'SUCCESS', changes: 6 } },
  { id: 'evt-026', timestamp: '2024-06-17 14:20:00', type: 'provisioning', severity: 'info', user: 'system', application: 'Office 365', message: 'Mailbox provisioning completed for new hire', correlationId: 'corr-prov-026', details: { operation: 'MAILBOX_CREATE', status: 'SUCCESS', duration: '45s' } },
  { id: 'evt-027', timestamp: '2024-06-17 14:19:00', type: 'certification', severity: 'info', user: 'vp.engineering@company.com', application: 'Multiple', message: 'Access review completed: 45 entitlements certified, 3 revoked', correlationId: 'corr-cert-027', details: { operation: 'CERT_COMPLETE', status: 'SUCCESS', certified: 45, revoked: 3 } },
  { id: 'evt-028', timestamp: '2024-06-17 14:18:00', type: 'access_request', severity: 'warn', user: 'eve.taylor@company.com', application: 'Database Admin', message: 'High-risk access request requires additional justification', correlationId: 'corr-req-028', details: { operation: 'ACCESS_REQUEST', status: 'PENDING_JUSTIFICATION', riskLevel: 'HIGH' } },
  { id: 'evt-029', timestamp: '2024-06-17 14:17:00', type: 'policy', severity: 'info', user: 'system', application: 'Policy Engine', message: 'Automated policy evaluation completed for 2,340 users', correlationId: 'corr-pol-029', details: { operation: 'BATCH_EVAL', status: 'SUCCESS', violations: 12 } },
  { id: 'evt-030', timestamp: '2024-06-17 14:16:00', type: 'connector', severity: 'warn', user: 'system', application: 'Active Directory', message: 'Certificate expiration warning: SSL cert expires in 14 days', correlationId: 'corr-sync-030', details: { operation: 'CERT_CHECK', status: 'WARNING', expiresIn: '14d' } },
];

export const connectorMetrics: ConnectorMetric[] = [
  {
    name: 'Active Directory', type: 'LDAP', status: 'healthy', uptime: 99.98,
    lastSync: '2 minutes ago', syncTime: '1.2s', throughput: '150 users/min', errors: 0,
    jobs: { successful: 247, failed: 0, pending: 3 },
    latencyHistory: [
      { time: '14:00', value: 1.1 }, { time: '14:05', value: 1.3 }, { time: '14:10', value: 1.0 },
      { time: '14:15', value: 1.2 }, { time: '14:20', value: 1.4 }, { time: '14:25', value: 1.1 },
      { time: '14:30', value: 1.2 }, { time: '14:35', value: 1.3 }, { time: '14:40', value: 1.0 },
      { time: '14:45', value: 1.2 },
    ],
    syncHistory: [
      { date: '2024-06-17 14:45', records: 1250, status: 'Success', duration: '1.2s' },
      { date: '2024-06-17 14:30', records: 1248, status: 'Success', duration: '1.1s' },
      { date: '2024-06-17 14:15', records: 1250, status: 'Success', duration: '1.3s' },
      { date: '2024-06-17 14:00', records: 1245, status: 'Success', duration: '1.0s' },
    ],
    errorLog: [],
    config: { host: 'ldap://ad.company.com:389', baseDN: 'DC=company,DC=com', bindUser: 'svc-iga@company.com', syncInterval: '15 min' },
  },
  {
    name: 'SAP ERP', type: 'Database', status: 'healthy', uptime: 99.95,
    lastSync: '5 minutes ago', syncTime: '3.1s', throughput: '45 users/min', errors: 1,
    jobs: { successful: 89, failed: 1, pending: 2 },
    latencyHistory: [
      { time: '14:00', value: 2.8 }, { time: '14:05', value: 3.2 }, { time: '14:10', value: 3.0 },
      { time: '14:15', value: 2.9 }, { time: '14:20', value: 3.4 }, { time: '14:25', value: 3.1 },
      { time: '14:30', value: 3.3 }, { time: '14:35', value: 3.0 }, { time: '14:40', value: 2.8 },
      { time: '14:45', value: 3.1 },
    ],
    syncHistory: [
      { date: '2024-06-17 14:40', records: 450, status: 'Success', duration: '3.1s' },
      { date: '2024-06-17 14:25', records: 448, status: 'Failed', duration: '8.2s' },
      { date: '2024-06-17 14:10', records: 450, status: 'Success', duration: '3.0s' },
    ],
    errorLog: [{ ts: '2024-06-17 14:25:12', code: 'SAP-CONN-408', message: 'Request timeout during role sync' }],
    config: { host: 'sap-erp.company.com:8443', client: '100', systemId: 'PRD', syncInterval: '15 min' },
  },
  {
    name: 'Salesforce', type: 'REST API', status: 'degraded', uptime: 97.2,
    lastSync: '15 minutes ago', syncTime: '8.7s', throughput: '20 users/min', errors: 5,
    jobs: { successful: 156, failed: 5, pending: 8 },
    latencyHistory: [
      { time: '14:00', value: 4.2 }, { time: '14:05', value: 5.8 }, { time: '14:10', value: 7.2 },
      { time: '14:15', value: 8.1 }, { time: '14:20', value: 9.3 }, { time: '14:25', value: 8.7 },
      { time: '14:30', value: 7.5 }, { time: '14:35', value: 8.9 }, { time: '14:40', value: 9.1 },
      { time: '14:45', value: 8.7 },
    ],
    syncHistory: [
      { date: '2024-06-17 14:30', records: 320, status: 'Failed', duration: '15.2s' },
      { date: '2024-06-17 14:15', records: 318, status: 'Failed', duration: '12.8s' },
      { date: '2024-06-17 14:00', records: 322, status: 'Success', duration: '4.5s' },
    ],
    errorLog: [
      { ts: '2024-06-17 14:30:05', code: 'SF-AUTH-401', message: 'OAuth token expired, refresh failed' },
      { ts: '2024-06-17 14:15:12', code: 'SF-RATE-429', message: 'API rate limit exceeded' },
      { ts: '2024-06-17 14:10:30', code: 'SF-CONN-503', message: 'Service temporarily unavailable' },
    ],
    config: { instanceUrl: 'https://company.my.salesforce.com', apiVersion: 'v58.0', authType: 'OAuth 2.0', syncInterval: '15 min' },
  },
  {
    name: 'Workday', type: 'SOAP API', status: 'healthy', uptime: 99.9,
    lastSync: '1 minute ago', syncTime: '2.8s', throughput: '75 users/min', errors: 0,
    jobs: { successful: 203, failed: 0, pending: 1 },
    latencyHistory: [
      { time: '14:00', value: 2.5 }, { time: '14:05', value: 2.7 }, { time: '14:10', value: 2.9 },
      { time: '14:15', value: 2.6 }, { time: '14:20', value: 2.8 }, { time: '14:25', value: 2.7 },
      { time: '14:30', value: 2.9 }, { time: '14:35', value: 2.8 }, { time: '14:40', value: 2.6 },
      { time: '14:45', value: 2.8 },
    ],
    syncHistory: [
      { date: '2024-06-17 14:44', records: 890, status: 'Success', duration: '2.8s' },
      { date: '2024-06-17 14:29', records: 888, status: 'Success', duration: '2.7s' },
      { date: '2024-06-17 14:14', records: 890, status: 'Success', duration: '2.9s' },
    ],
    errorLog: [],
    config: { endpoint: 'https://wd5-impl.workday.com/ccx/service/company', tenant: 'company_impl', authType: 'WS-Security', syncInterval: '15 min' },
  },
];

export const jobQueue: JobQueueEntry[] = [
  { id: 'job-001', name: 'AD Full Reconciliation', type: 'sync', status: 'running', connector: 'Active Directory', startedAt: '14:42:00', estimatedEnd: '14:50:00', progress: 72, recordsProcessed: 900, recordsTotal: 1250, operator: 'system', retryCount: 0 },
  { id: 'job-002', name: 'SAP Role Provisioning Batch', type: 'provisioning', status: 'running', connector: 'SAP ERP', startedAt: '14:40:00', estimatedEnd: '14:55:00', progress: 35, recordsProcessed: 16, recordsTotal: 45, operator: 'admin@company.com', retryCount: 0 },
  { id: 'job-003', name: 'Q2 Access Certification Scan', type: 'certification_scan', status: 'queued', connector: 'Multiple', startedAt: '', estimatedEnd: '', progress: 0, recordsProcessed: 0, recordsTotal: 2340, operator: 'compliance@company.com', retryCount: 0 },
  { id: 'job-004', name: 'Salesforce Delta Sync', type: 'sync', status: 'failed', connector: 'Salesforce', startedAt: '14:30:00', progress: 45, recordsProcessed: 144, recordsTotal: 320, operator: 'system', retryCount: 3, error: 'OAuth token expired - automatic refresh failed after 3 retries' },
  { id: 'job-005', name: 'SoD Policy Evaluation', type: 'policy_evaluation', status: 'completed', connector: 'Policy Engine', startedAt: '14:20:00', estimatedEnd: '14:28:00', progress: 100, recordsProcessed: 2340, recordsTotal: 2340, operator: 'system', retryCount: 0 },
  { id: 'job-006', name: 'Workday HR Feed Import', type: 'sync', status: 'completed', connector: 'Workday', startedAt: '14:15:00', estimatedEnd: '14:18:00', progress: 100, recordsProcessed: 890, recordsTotal: 890, operator: 'system', retryCount: 0 },
  { id: 'job-007', name: 'Monthly Compliance Report', type: 'report_generation', status: 'queued', connector: 'IGA Platform', startedAt: '', progress: 0, recordsProcessed: 0, recordsTotal: 0, operator: 'compliance@company.com', retryCount: 0 },
  { id: 'job-008', name: 'Google Workspace License Sync', type: 'provisioning', status: 'running', connector: 'Google Workspace', startedAt: '14:38:00', estimatedEnd: '14:48:00', progress: 55, recordsProcessed: 44, recordsTotal: 80, operator: 'system', retryCount: 0 },
];

export const slaEntries: SLAEntry[] = [
  {
    id: 'sla-001', name: 'Access Request Fulfillment', category: 'access_request',
    target: '< 4 hours', current: '2.8 hours', status: 'met', breachCount: 2, avgFulfillmentTime: '2.8h', trend: -12,
    history: [
      { date: 'Mon', value: 3.1, target: 4 }, { date: 'Tue', value: 2.9, target: 4 }, { date: 'Wed', value: 3.5, target: 4 },
      { date: 'Thu', value: 2.6, target: 4 }, { date: 'Fri', value: 2.8, target: 4 }, { date: 'Sat', value: 1.2, target: 4 },
      { date: 'Sun', value: 0.8, target: 4 },
    ],
  },
  {
    id: 'sla-002', name: 'Provisioning Completion', category: 'provisioning',
    target: '< 30 minutes', current: '18 minutes', status: 'met', breachCount: 5, avgFulfillmentTime: '18m', trend: -8,
    history: [
      { date: 'Mon', value: 22, target: 30 }, { date: 'Tue', value: 19, target: 30 }, { date: 'Wed', value: 25, target: 30 },
      { date: 'Thu', value: 15, target: 30 }, { date: 'Fri', value: 18, target: 30 }, { date: 'Sat', value: 12, target: 30 },
      { date: 'Sun', value: 10, target: 30 },
    ],
  },
  {
    id: 'sla-003', name: 'Certification Review Deadline', category: 'certification',
    target: '< 14 days', current: '11 days', status: 'at_risk', breachCount: 8, avgFulfillmentTime: '11d', trend: 5,
    history: [
      { date: 'W1', value: 9, target: 14 }, { date: 'W2', value: 10, target: 14 }, { date: 'W3', value: 12, target: 14 },
      { date: 'W4', value: 11, target: 14 },
    ],
  },
  {
    id: 'sla-004', name: 'Incident Response Time', category: 'incident_response',
    target: '< 15 minutes', current: '22 minutes', status: 'breached', breachCount: 14, avgFulfillmentTime: '22m', trend: 18,
    history: [
      { date: 'Mon', value: 18, target: 15 }, { date: 'Tue', value: 25, target: 15 }, { date: 'Wed', value: 20, target: 15 },
      { date: 'Thu', value: 22, target: 15 }, { date: 'Fri', value: 28, target: 15 }, { date: 'Sat', value: 12, target: 15 },
      { date: 'Sun', value: 10, target: 15 },
    ],
  },
];

export const systemHealthHistory: SystemHealthEntry[] = Array.from({ length: 48 }, (_, i) => {
  const hour = 48 - i;
  const isIncident = hour === 12 || hour === 36;
  return {
    timestamp: `${Math.floor(hour / 24)}d ${hour % 24}h ago`,
    status: isIncident ? 'incident' as const : hour === 13 ? 'degraded' as const : 'healthy' as const,
    uptime: isIncident ? 94.5 : hour === 13 ? 97.8 : 99.9 + Math.random() * 0.09,
    ...(isIncident ? { incidentId: `INC-${1000 + hour}`, incidentTitle: hour === 12 ? 'Salesforce connector outage' : 'Database latency spike' } : {}),
  };
});
