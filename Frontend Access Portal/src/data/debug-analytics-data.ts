
// 24h error volume by source (hourly intervals)
export const errorVolumeTimeline = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, '0')}:00`,
  Connectors: Math.floor(Math.random() * 15) + (i >= 2 && i <= 4 ? 20 : 2),
  Workflows: Math.floor(Math.random() * 10) + (i >= 8 && i <= 10 ? 12 : 1),
  Access: Math.floor(Math.random() * 6) + 1,
  Webhooks: Math.floor(Math.random() * 8) + (i >= 2 && i <= 4 ? 10 : 0),
}));

export const errorCategoryDistribution = [
  { category: 'Auth Failures', count: 87, color: 'hsl(var(--chart-5))' },
  { category: 'Timeouts', count: 54, color: 'hsl(var(--chart-2))' },
  { category: 'Schema Mismatch', count: 38, color: 'hsl(var(--chart-3))' },
  { category: 'Permission Denied', count: 31, color: 'hsl(var(--chart-4))' },
  { category: 'Rate Limit', count: 22, color: 'hsl(var(--chart-5))' },
  { category: 'Connection Reset', count: 18, color: 'hsl(var(--chart-1))' },
];

export const topFailingConnectors = [
  { name: 'AD-Primary', type: 'Active Directory', failures: 42, avgLatency: '3.2s', lastFailure: '2024-01-15T10:30:15', status: 'degraded' },
  { name: 'ServiceNow-Prod', type: 'ServiceNow', failures: 28, avgLatency: '5.8s', lastFailure: '2024-01-15T10:28:00', status: 'failing' },
  { name: 'Azure-AD-Sync', type: 'Azure AD', failures: 19, avgLatency: '1.4s', lastFailure: '2024-01-15T09:45:22', status: 'degraded' },
  { name: 'LDAP-Secondary', type: 'LDAP', failures: 15, avgLatency: '2.1s', lastFailure: '2024-01-15T08:12:33', status: 'intermittent' },
  { name: 'Workday-HR', type: 'Workday', failures: 11, avgLatency: '4.5s', lastFailure: '2024-01-15T07:30:00', status: 'healthy' },
  { name: 'Salesforce-CRM', type: 'Salesforce', failures: 8, avgLatency: '1.9s', lastFailure: '2024-01-14T22:15:10', status: 'healthy' },
  { name: 'SAP-ERP', type: 'SAP', failures: 6, avgLatency: '6.2s', lastFailure: '2024-01-14T18:45:00', status: 'healthy' },
];

// Hourly error heatmap (hour x source)
const sources = ['Connectors', 'Workflows', 'Access', 'Webhooks', 'Provisioning', 'Authentication'];
export const errorHeatmapData = sources.flatMap(source =>
  Array.from({ length: 24 }, (_, hour) => ({
    source,
    hour,
    count: Math.floor(Math.random() * (source === 'Connectors' && (hour >= 2 && hour <= 4) ? 30 : 10)),
  }))
);

export const recurringErrorPatterns = [
  { id: 'rep-1', message: 'LDAP bind failed: invalid credentials for service account', occurrences: 47, firstSeen: '2024-01-14T02:15:00', lastSeen: '2024-01-15T10:30:00', affectedObjects: ['john.doe@company.com', 'jane.smith@company.com', '+12 more'], source: 'Connectors', severity: 'critical' as const },
  { id: 'rep-2', message: 'Timeout waiting for ServiceNow API response (>30s)', occurrences: 23, firstSeen: '2024-01-14T08:00:00', lastSeen: '2024-01-15T09:45:00', affectedObjects: ['alice.brown@company.com', 'bob.wilson@company.com', '+8 more'], source: 'Connectors', severity: 'high' as const },
  { id: 'rep-3', message: 'Schema validation failed: missing required attribute "department"', occurrences: 15, firstSeen: '2024-01-13T14:20:00', lastSeen: '2024-01-15T10:15:00', affectedObjects: ['new-hire-batch-jan15', '+14 identities'], source: 'Workflows', severity: 'high' as const },
  { id: 'rep-4', message: 'Rate limit exceeded for Azure AD Graph API', occurrences: 12, firstSeen: '2024-01-15T03:00:00', lastSeen: '2024-01-15T04:30:00', affectedObjects: ['bulk-sync-job-001'], source: 'Connectors', severity: 'medium' as const },
  { id: 'rep-5', message: 'Webhook delivery failed: connection refused by external endpoint', occurrences: 9, firstSeen: '2024-01-14T22:00:00', lastSeen: '2024-01-15T10:28:00', affectedObjects: ['identity-lifecycle-hook', 'access-change-hook'], source: 'Webhooks', severity: 'high' as const },
];

export const mttrTrendData = [
  { day: 'Mon', mttr: 45 },
  { day: 'Tue', mttr: 38 },
  { day: 'Wed', mttr: 52 },
  { day: 'Thu', mttr: 33 },
  { day: 'Fri', mttr: 28 },
  { day: 'Sat', mttr: 22 },
  { day: 'Sun', mttr: 25 },
];

export const correlationChains = [
  {
    id: 'chain-1',
    rootCause: 'AD service account password expired',
    severity: 'critical' as const,
    timestamp: '2024-01-15T02:15:00',
    chain: [
      { step: 1, source: 'Connectors', message: 'LDAP bind failed: invalid credentials', level: 'ERROR' },
      { step: 2, source: 'Workflows', message: 'User provisioning workflow failed at step 2: connector unavailable', level: 'ERROR' },
      { step: 3, source: 'Provisioning', message: 'Account creation failed for 14 identities in batch job', level: 'ERROR' },
      { step: 4, source: 'Webhooks', message: 'Failure notification webhook triggered for batch-prov-001', level: 'INFO' },
    ],
    affectedCount: 14,
  },
  {
    id: 'chain-2',
    rootCause: 'ServiceNow API rate limiting during peak sync',
    severity: 'high' as const,
    timestamp: '2024-01-15T08:30:00',
    chain: [
      { step: 1, source: 'Connectors', message: 'HTTP 429 Too Many Requests from ServiceNow API', level: 'WARN' },
      { step: 2, source: 'Workflows', message: 'Ticket creation step delayed: connector in backoff mode', level: 'WARN' },
      { step: 3, source: 'Provisioning', message: 'Access request fulfillment delayed for 8 pending requests', level: 'WARN' },
    ],
    affectedCount: 8,
  },
  {
    id: 'chain-3',
    rootCause: 'Schema change in Workday HR feed broke attribute mapping',
    severity: 'high' as const,
    timestamp: '2024-01-14T14:00:00',
    chain: [
      { step: 1, source: 'Connectors', message: 'Unexpected attribute "cost_center_v2" in Workday response', level: 'WARN' },
      { step: 2, source: 'Workflows', message: 'Identity correlation failed: missing mapped attribute "costCenter"', level: 'ERROR' },
      { step: 3, source: 'Provisioning', message: 'New hire onboarding incomplete: identity not correlated', level: 'ERROR' },
    ],
    affectedCount: 6,
  },
];

// Summary KPI data
export const debugKpiSummary = {
  totalErrors24h: 247,
  criticalFailures: 18,
  avgResponseTime: '2.8s',
  mttrMinutes: 32,
  recurringPatterns: recurringErrorPatterns.length,
  retrySuccessRate: 68,
};
