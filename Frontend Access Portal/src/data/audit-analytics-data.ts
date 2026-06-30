
// 30-day event volume by risk level
export const eventVolumeTimeline = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const base = 40 + Math.floor(Math.random() * 30);
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    low: Math.floor(base * 0.5 + Math.random() * 15),
    medium: Math.floor(base * 0.25 + Math.random() * 10),
    high: Math.floor(base * 0.15 + Math.random() * 8),
    critical: Math.floor(Math.random() * 5),
  };
});

export const eventTypeDistribution = [
  { type: 'Create', count: 312, color: 'hsl(var(--chart-1))' },
  { type: 'Update', count: 487, color: 'hsl(var(--chart-2))' },
  { type: 'Approve', count: 198, color: 'hsl(var(--chart-3))' },
  { type: 'Provision', count: 256, color: 'hsl(var(--chart-4))' },
  { type: 'Revoke', count: 89, color: 'hsl(var(--chart-5))' },
  { type: 'Delete', count: 67, color: 'hsl(var(--chart-5))' },
  { type: 'Fail', count: 43, color: 'hsl(var(--chart-5))' },
  { type: 'Certify', count: 134, color: 'hsl(var(--chart-1))' },
  { type: 'Escalate', count: 28, color: 'hsl(var(--chart-4))' },
];

export const topActors = [
  { name: 'System Administrator', type: 'user' as const, events: 342, failures: 3, riskScore: 12 },
  { name: 'IDM Service Account', type: 'service' as const, events: 289, failures: 18, riskScore: 45 },
  { name: 'HR Connector', type: 'system' as const, events: 234, failures: 8, riskScore: 22 },
  { name: 'John Martinez', type: 'user' as const, events: 187, failures: 2, riskScore: 8 },
  { name: 'AD Sync Service', type: 'system' as const, events: 176, failures: 24, riskScore: 58 },
  { name: 'Sarah Chen', type: 'user' as const, events: 145, failures: 1, riskScore: 5 },
  { name: 'Provisioning Engine', type: 'service' as const, events: 134, failures: 12, riskScore: 34 },
  { name: 'Michael Park', type: 'user' as const, events: 98, failures: 0, riskScore: 3 },
  { name: 'SCIM Gateway', type: 'system' as const, events: 87, failures: 9, riskScore: 41 },
  { name: 'Compliance Bot', type: 'service' as const, events: 76, failures: 0, riskScore: 2 },
];

export const complianceFrameworkData = [
  { framework: 'SOX', count: 412, fill: 'hsl(var(--chart-1))' },
  { framework: 'GDPR', count: 287, fill: 'hsl(var(--chart-2))' },
  { framework: 'SOC2', count: 356, fill: 'hsl(var(--chart-3))' },
  { framework: 'HIPAA', count: 198, fill: 'hsl(var(--chart-4))' },
  { framework: 'PCI-DSS', count: 134, fill: 'hsl(var(--chart-5))' },
  { framework: 'ISO 27001', count: 223, fill: 'hsl(var(--chart-6))' },
];

export const failedOperations = [
  { id: 'f1', timestamp: '2024-06-16T08:12:00Z', operation: 'Provision AD Account', target: 'sarah.chen@corp.com', system: 'Active Directory', error: 'LDAP connection timeout after 30s', retries: 3, status: 'unresolved' },
  { id: 'f2', timestamp: '2024-06-16T07:45:00Z', operation: 'Role Assignment', target: 'Finance_Approver role', system: 'SAP GRC', error: 'Conflicting SoD rule: FIN-001', retries: 0, status: 'blocked' },
  { id: 'f3', timestamp: '2024-06-16T06:30:00Z', operation: 'Entitlement Revocation', target: 'VPN Access', system: 'Cisco ISE', error: 'API rate limit exceeded (429)', retries: 5, status: 'retrying' },
  { id: 'f4', timestamp: '2024-06-15T22:15:00Z', operation: 'Group Membership Sync', target: 'Engineering_Team', system: 'Azure AD', error: 'Graph API token expired', retries: 1, status: 'resolved' },
  { id: 'f5', timestamp: '2024-06-15T19:00:00Z', operation: 'Access Certification', target: 'Q2 Review Campaign', system: 'IGA Platform', error: 'Reviewer not found: mgr-deleted-user', retries: 0, status: 'escalated' },
];

export const heatmapData: { objectType: string; eventType: string; count: number }[] = [
  { objectType: 'User', eventType: 'Create', count: 89 },
  { objectType: 'User', eventType: 'Update', count: 234 },
  { objectType: 'User', eventType: 'Delete', count: 12 },
  { objectType: 'User', eventType: 'Provision', count: 156 },
  { objectType: 'Role', eventType: 'Create', count: 23 },
  { objectType: 'Role', eventType: 'Update', count: 67 },
  { objectType: 'Role', eventType: 'Approve', count: 45 },
  { objectType: 'Role', eventType: 'Revoke', count: 34 },
  { objectType: 'Entitlement', eventType: 'Create', count: 56 },
  { objectType: 'Entitlement', eventType: 'Provision', count: 178 },
  { objectType: 'Entitlement', eventType: 'Revoke', count: 89 },
  { objectType: 'Entitlement', eventType: 'Certify', count: 134 },
  { objectType: 'Application', eventType: 'Create', count: 8 },
  { objectType: 'Application', eventType: 'Update', count: 34 },
  { objectType: 'Application', eventType: 'Fail', count: 19 },
  { objectType: 'Request', eventType: 'Create', count: 198 },
  { objectType: 'Request', eventType: 'Approve', count: 167 },
  { objectType: 'Request', eventType: 'Reject', count: 31 },
  { objectType: 'Request', eventType: 'Escalate', count: 28 },
  { objectType: 'Workflow', eventType: 'Create', count: 15 },
  { objectType: 'Workflow', eventType: 'Update', count: 42 },
  { objectType: 'Workflow', eventType: 'Fail', count: 11 },
];

export interface AnomalyEntry {
  id: string;
  type: 'off-hours' | 'bulk-operation' | 'first-time' | 'privilege-escalation' | 'unusual-pattern';
  severity: 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  affectedCount: number;
}

export const anomalies: AnomalyEntry[] = [
  { id: 'a1', type: 'bulk-operation', severity: 'critical', title: 'Mass Role Assignment Detected', description: '47 role assignments by IDM Service Account in 12 minutes — exceeds threshold of 10/hour', timestamp: '2024-06-16T03:22:00Z', actor: 'IDM Service Account', affectedCount: 47 },
  { id: 'a2', type: 'off-hours', severity: 'high', title: 'Off-Hours Privileged Access', description: 'Admin console access at 2:45 AM from unfamiliar IP 203.0.113.42', timestamp: '2024-06-16T02:45:00Z', actor: 'John Martinez', affectedCount: 1 },
  { id: 'a3', type: 'privilege-escalation', severity: 'critical', title: 'Privilege Escalation Sequence', description: 'User approved own access request, then provisioned elevated entitlement within 5 minutes — potential SoD violation', timestamp: '2024-06-15T16:30:00Z', actor: 'Michael Park', affectedCount: 2 },
  { id: 'a4', type: 'first-time', severity: 'medium', title: 'First-Time Service Account Action', description: 'SCIM Gateway performed "delete" operation for the first time — verify authorization', timestamp: '2024-06-15T14:00:00Z', actor: 'SCIM Gateway', affectedCount: 3 },
  { id: 'a5', type: 'unusual-pattern', severity: 'high', title: 'Certification Bypass Pattern', description: '8 entitlements certified as "approved" in under 30 seconds — rubber-stamping suspected', timestamp: '2024-06-15T11:20:00Z', actor: 'Sarah Chen', affectedCount: 8 },
];
