import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Activity, TrendingDown, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { eventVolumeData, errorRateData, connectorLatencyData, provisioningThroughputData } from './data/monitoring-analytics-data';
import { useCssVariable } from '@/hooks/useCssVariable';
import { MonitoringDrilldownDrawer } from './MonitoringDrilldownDrawer';

interface DrilldownState {
  open: boolean;
  title: string;
  description: string;
  items: any[];
}

const kpiDrilldownData: Record<string, { description: string; items: any[] }> = {
  'System Health': {
    description: 'Component-level health breakdown across the IGA platform',
    items: [
      { id: 'SH-001', name: 'Identity Store', type: 'Core', status: 'Healthy', detail: 'Uptime 99.99% — Last check 30s ago', severity: 'low' },
      { id: 'SH-002', name: 'Provisioning Engine', type: 'Core', status: 'Healthy', detail: 'Uptime 99.95% — 2 minor delays today', severity: 'low' },
      { id: 'SH-003', name: 'Policy Engine', type: 'Core', status: 'Degraded', detail: 'Uptime 98.7% — High evaluation latency', severity: 'medium' },
      { id: 'SH-004', name: 'Workflow Engine', type: 'Core', status: 'Healthy', detail: 'Uptime 99.98% — 1,247 executions today', severity: 'low' },
      { id: 'SH-005', name: 'Connector Gateway', type: 'Integration', status: 'Healthy', detail: 'Uptime 99.91% — All connectors responsive', severity: 'low' },
      { id: 'SH-006', name: 'Audit Logger', type: 'Compliance', status: 'Healthy', detail: 'Uptime 100% — 54,821 events captured', severity: 'low' },
      { id: 'SH-007', name: 'Certification Scheduler', type: 'Governance', status: 'Warning', detail: 'Uptime 99.5% — 1 missed schedule', severity: 'medium' },
      { id: 'SH-008', name: 'API Gateway', type: 'Infrastructure', status: 'Healthy', detail: 'Uptime 99.97% — p99 latency 120ms', severity: 'low' },
    ],
  },
  'Events (24h)': {
    description: 'Event distribution by severity over the last 24 hours',
    items: [
      { id: 'EVT-001', name: 'Info Events', type: 'Severity', status: '892', detail: 'User logins, sync completions, access grants', severity: 'low' },
      { id: 'EVT-002', name: 'Warning Events', type: 'Severity', status: '214', detail: 'Slow connectors, retry attempts, near-SLA breaches', severity: 'medium' },
      { id: 'EVT-003', name: 'Error Events', type: 'Severity', status: '108', detail: 'Provisioning failures, API timeouts, auth errors', severity: 'high' },
      { id: 'EVT-004', name: 'Critical Events', type: 'Severity', status: '33', detail: 'Connector outages, SoD violations, privilege escalations', severity: 'critical' },
      { id: 'EVT-005', name: 'Top Source: SAP Connector', type: 'Source', status: '312 events', detail: '25% of total volume — mostly sync events', severity: 'low' },
      { id: 'EVT-006', name: 'Top Source: Provisioning Engine', type: 'Source', status: '287 events', detail: '23% of total volume — create/update/delete ops', severity: 'low' },
    ],
  },
  'Error Rate': {
    description: 'Top error sources and failure categories',
    items: [
      { id: 'ERR-001', name: 'LDAP Connection Timeout', type: 'Connector', status: '34 occurrences', detail: 'Avg response time 8.2s — threshold 5s', severity: 'high' },
      { id: 'ERR-002', name: 'SAP API Rate Limit', type: 'Connector', status: '28 occurrences', detail: 'Hitting 429 errors during bulk sync', severity: 'high' },
      { id: 'ERR-003', name: 'Provisioning Permission Denied', type: 'Provisioning', status: '19 occurrences', detail: 'Service account lacks write access on target', severity: 'critical' },
      { id: 'ERR-004', name: 'Certification Email Bounce', type: 'Notification', status: '12 occurrences', detail: 'Invalid reviewer email addresses', severity: 'medium' },
      { id: 'ERR-005', name: 'SoD Policy Evaluation Timeout', type: 'Policy', status: '9 occurrences', detail: 'Complex rule sets exceeding 10s limit', severity: 'high' },
      { id: 'ERR-006', name: 'Workflow Step Failure', type: 'Workflow', status: '6 occurrences', detail: 'Custom script errors in approval chain', severity: 'medium' },
    ],
  },
  'Active Alerts': {
    description: 'Currently active alerts requiring attention',
    items: [
      { id: 'ALT-001', name: 'LDAP Connector Degraded', type: 'Connector', status: 'Active', detail: 'Response time >5s for 15 minutes — auto-retry engaged', severity: 'high' },
      { id: 'ALT-002', name: 'Provisioning Queue Backlog', type: 'Provisioning', status: 'Active', detail: '47 jobs queued — avg wait time 12m (SLA: 5m)', severity: 'critical' },
      { id: 'ALT-003', name: 'Certification Campaign Overdue', type: 'Governance', status: 'Active', detail: 'Q1 Finance review — 3 days past deadline', severity: 'medium' },
    ],
  },
};

const chartDrilldownData: Record<string, { description: string; items: any[] }> = {
  'Event Volume by Severity': {
    description: 'Detailed event breakdown by severity level and time period',
    items: [
      { id: 'EV-001', name: '00:00–04:00 — Info Spike', type: 'Time Window', status: '142 events', detail: 'Scheduled LDAP full sync generated bulk info events', severity: 'low' },
      { id: 'EV-002', name: '06:00–08:00 — Warning Surge', type: 'Time Window', status: '38 warnings', detail: 'SAP connector latency increased during morning batch', severity: 'medium' },
      { id: 'EV-003', name: '09:00–10:00 — Error Peak', type: 'Time Window', status: '24 errors', detail: 'AD provisioning failures — service account token expired', severity: 'high' },
      { id: 'EV-004', name: '14:00–15:00 — Critical Incident', type: 'Time Window', status: '8 critical', detail: 'Salesforce connector outage — OAuth token revoked', severity: 'critical' },
      { id: 'EV-005', name: 'Overall Info', type: 'Aggregate', status: '892 total', detail: 'Normal operational events — logins, syncs, grants', severity: 'low' },
      { id: 'EV-006', name: 'Overall Errors', type: 'Aggregate', status: '108 total', detail: 'Provisioning and connector failures dominate', severity: 'high' },
    ],
  },
  'Error Rate Trend (%)': {
    description: 'Error rate analysis with contributing factors per time window',
    items: [
      { id: 'ER-001', name: '00:00 — 1.8%', type: 'Baseline', status: 'Normal', detail: 'Within acceptable range — routine sync errors', severity: 'low' },
      { id: 'ER-002', name: '04:00 — 3.2%', type: 'Elevated', status: 'Above Threshold', detail: 'LDAP timeout errors during full sync window', severity: 'medium' },
      { id: 'ER-003', name: '08:00 — 4.5%', type: 'Spike', status: 'Alert Triggered', detail: 'AD provisioning failures + SAP rate limiting', severity: 'high' },
      { id: 'ER-004', name: '12:00 — 2.1%', type: 'Recovery', status: 'Improving', detail: 'Auto-retry resolved most transient failures', severity: 'low' },
      { id: 'ER-005', name: '16:00 — 1.5%', type: 'Baseline', status: 'Normal', detail: 'Low activity period — minimal errors', severity: 'low' },
    ],
  },
  'Connector Latency (seconds)': {
    description: 'Per-connector latency analysis with SLA compliance',
    items: [
      { id: 'CL-001', name: 'Active Directory', type: 'Connector', status: 'Avg 1.2s', detail: 'SLA: <2s — Compliant — p99: 1.8s', severity: 'low' },
      { id: 'CL-002', name: 'SAP ERP', type: 'Connector', status: 'Avg 2.8s', detail: 'SLA: <3s — At Risk — p99: 4.1s during batch', severity: 'medium' },
      { id: 'CL-003', name: 'Salesforce', type: 'Connector', status: 'Avg 1.5s', detail: 'SLA: <2s — Compliant — p99: 2.0s', severity: 'low' },
      { id: 'CL-004', name: 'Workday', type: 'Connector', status: 'Avg 3.5s', detail: 'SLA: <3s — Breached — API throttling detected', severity: 'high' },
      { id: 'CL-005', name: 'LDAP', type: 'Connector', status: 'Avg 5.2s', detail: 'SLA: <3s — Critical Breach — Connection pool exhausted', severity: 'critical' },
      { id: 'CL-006', name: 'ServiceNow', type: 'Connector', status: 'Avg 1.1s', detail: 'SLA: <2s — Compliant — Stable performance', severity: 'low' },
    ],
  },
  'Provisioning Throughput': {
    description: 'Provisioning operation breakdown by type and outcome',
    items: [
      { id: 'PT-001', name: 'Accounts Created', type: 'Create', status: '156 total', detail: 'Avg processing time 45s — 98% success rate', severity: 'low' },
      { id: 'PT-002', name: 'Accounts Updated', type: 'Update', status: '312 total', detail: 'Attribute syncs and role changes — 99% success', severity: 'low' },
      { id: 'PT-003', name: 'Accounts Deleted', type: 'Delete', status: '43 total', detail: 'Deprovisioning on termination — 95% success', severity: 'low' },
      { id: 'PT-004', name: 'Failed Operations', type: 'Failed', status: '18 total', detail: 'Permission denied (8), timeout (6), conflict (4)', severity: 'high' },
      { id: 'PT-005', name: 'Peak Window: 09:00–10:00', type: 'Time Window', status: '89 ops/hr', detail: 'Morning onboarding batch — highest throughput', severity: 'low' },
      { id: 'PT-006', name: 'Retry Queue', type: 'Pending', status: '7 pending', detail: 'Auto-retry scheduled for failed operations', severity: 'medium' },
    ],
  },
};

export const MonitoringAnalytics = () => {
  const chart1 = useCssVariable('--chart-1');
  const chart2 = useCssVariable('--chart-2');
  const chart3 = useCssVariable('--chart-3');
  const chart4 = useCssVariable('--chart-4');
  const chart5 = useCssVariable('--chart-5');
  const foreground = useCssVariable('--foreground');
  const muted = useCssVariable('--muted-foreground');

  const [drilldown, setDrilldown] = useState<DrilldownState>({
    open: false, title: '', description: '', items: [],
  });

  const openKpiDrilldown = (title: string) => {
    const data = kpiDrilldownData[title];
    if (data) {
      setDrilldown({ open: true, title, description: data.description, items: data.items });
    }
  };

  const openChartDrilldown = (title: string) => {
    const data = chartDrilldownData[title];
    if (data) {
      setDrilldown({ open: true, title, description: data.description, items: data.items });
    }
  };

  const kpis = [
    { title: 'System Health', value: '99.8%', trend: '+0.2%', icon: Monitor, positive: true },
    { title: 'Events (24h)', value: '1,247', trend: '+12%', icon: Activity, positive: true },
    { title: 'Error Rate', value: '2.1%', trend: '-0.8%', icon: TrendingDown, positive: true },
    { title: 'Active Alerts', value: '3', trend: '+1', icon: AlertTriangle, positive: false },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card
            key={kpi.title}
            className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
            onClick={() => openKpiDrilldown(kpi.title)}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
                  <p className={`text-xs mt-1 font-medium ${kpi.positive ? 'text-green-600' : 'text-destructive'}`}>
                    {kpi.trend}
                  </p>
                </div>
                <kpi.icon className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
          onClick={() => openChartDrilldown('Event Volume by Severity')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Event Volume by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={eventVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke={`hsl(${muted} / 0.2)`} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: `hsl(${muted})` }} />
                <YAxis tick={{ fontSize: 11, fill: `hsl(${muted})` }} />
                <Tooltip contentStyle={{ background: `hsl(${foreground} / 0.05)`, border: '1px solid hsl(var(--border))' }} />
                <Legend />
                <Area type="monotone" dataKey="info" stackId="1" stroke={`hsl(${chart1})`} fill={`hsl(${chart1} / 0.4)`} name="Info" />
                <Area type="monotone" dataKey="warn" stackId="1" stroke={`hsl(${chart2})`} fill={`hsl(${chart2} / 0.4)`} name="Warning" />
                <Area type="monotone" dataKey="error" stackId="1" stroke={`hsl(${chart3})`} fill={`hsl(${chart3} / 0.4)`} name="Error" />
                <Area type="monotone" dataKey="critical" stackId="1" stroke={`hsl(${chart4})`} fill={`hsl(${chart4} / 0.4)`} name="Critical" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
          onClick={() => openChartDrilldown('Error Rate Trend (%)')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Error Rate Trend (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={errorRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke={`hsl(${muted} / 0.2)`} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: `hsl(${muted})` }} />
                <YAxis tick={{ fontSize: 11, fill: `hsl(${muted})` }} />
                <Tooltip contentStyle={{ background: `hsl(${foreground} / 0.05)`, border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="rate" fill={`hsl(${chart3})`} radius={[4, 4, 0, 0]} name="Error Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
          onClick={() => openChartDrilldown('Connector Latency (seconds)')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Connector Latency (seconds)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={connectorLatencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={`hsl(${muted} / 0.2)`} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: `hsl(${muted})` }} />
                <YAxis tick={{ fontSize: 11, fill: `hsl(${muted})` }} />
                <Tooltip contentStyle={{ background: `hsl(${foreground} / 0.05)`, border: '1px solid hsl(var(--border))' }} />
                <Legend />
                <Line type="monotone" dataKey="ad" stroke={`hsl(${chart1})`} strokeWidth={2} dot={false} name="Active Directory" />
                <Line type="monotone" dataKey="sap" stroke={`hsl(${chart2})`} strokeWidth={2} dot={false} name="SAP ERP" />
                <Line type="monotone" dataKey="sf" stroke={`hsl(${chart3})`} strokeWidth={2} dot={false} name="Salesforce" />
                <Line type="monotone" dataKey="wd" stroke={`hsl(${chart4})`} strokeWidth={2} dot={false} name="Workday" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
          onClick={() => openChartDrilldown('Provisioning Throughput')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Provisioning Throughput</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={provisioningThroughputData}>
                <CartesianGrid strokeDasharray="3 3" stroke={`hsl(${muted} / 0.2)`} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: `hsl(${muted})` }} />
                <YAxis tick={{ fontSize: 11, fill: `hsl(${muted})` }} />
                <Tooltip contentStyle={{ background: `hsl(${foreground} / 0.05)`, border: '1px solid hsl(var(--border))' }} />
                <Legend />
                <Area type="monotone" dataKey="created" stackId="1" stroke={`hsl(${chart1})`} fill={`hsl(${chart1} / 0.4)`} name="Created" />
                <Area type="monotone" dataKey="updated" stackId="1" stroke={`hsl(${chart2})`} fill={`hsl(${chart2} / 0.4)`} name="Updated" />
                <Area type="monotone" dataKey="deleted" stackId="1" stroke={`hsl(${chart5})`} fill={`hsl(${chart5} / 0.4)`} name="Deleted" />
                <Area type="monotone" dataKey="failed" stackId="1" stroke={`hsl(${chart3})`} fill={`hsl(${chart3} / 0.4)`} name="Failed" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <MonitoringDrilldownDrawer
        open={drilldown.open}
        onOpenChange={(open) => setDrilldown(prev => ({ ...prev, open }))}
        title={drilldown.title}
        description={drilldown.description}
        items={drilldown.items}
      />
    </div>
  );
};
