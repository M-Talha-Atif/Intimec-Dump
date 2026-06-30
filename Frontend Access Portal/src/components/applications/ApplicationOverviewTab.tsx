import React, { useState } from 'react';
import { Application } from '@/data/mock-applications';
import { mockUsers } from '@/data/mock-users';
import { mockEntitlements } from '@/data/mock-entitlements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, ShieldAlert, AlertCircle, BarChart2, Activity, Shield, Clock, CheckCircle2, XCircle, RefreshCw, UserCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import AppDetailDrilldownDialog, { DrilldownColumn } from './AppDetailDrilldownDialog';
import { getStatusBadgeClass, getSeverityBadgeClass } from '@/utils/getBadgeClass';
import { cn } from '@/lib/utils';

type ApplicationOverviewTabProps = {
  application: Application;
};

// Status colors now come from getStatusBadgeClass

const complianceFrameworks = [
  { name: 'SOX', pass: true, lastReview: '2025-01-15', certDate: '2025-01-20' },
  { name: 'GDPR', pass: false, lastReview: '2024-11-01', certDate: null },
  { name: 'ISO 27001', pass: true, lastReview: '2025-02-10', certDate: '2025-02-15' },
  { name: 'HIPAA', pass: true, lastReview: '2025-01-30', certDate: '2025-02-01' },
];

const syncHistory = [
  { time: '14:00', status: 'success' },
  { time: '12:00', status: 'success' },
  { time: '10:00', status: 'success' },
  { time: '08:00', status: 'warning' },
  { time: '06:00', status: 'success' },
];

const accountAgeData = [
  { name: '0-30d', value: 120 },
  { name: '30-90d', value: 300 },
  { name: '90-180d', value: 200 },
  { name: '180d+', value: 50 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-2.5 shadow-md">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="text-sm font-bold" style={{ color: '#4F8EF7' }}>{payload[0].value} accounts</p>
    </div>
  );
};

type DrilldownState = {
  title: string;
  description: string;
  items: any[];
  columns: DrilldownColumn[];
  badgeLabel?: string;
  badgeVariant?: 'default' | 'destructive' | 'secondary' | 'outline';
} | null;

const ApplicationOverviewTab = ({ application }: ApplicationOverviewTabProps) => {
  const [drilldown, setDrilldown] = useState<DrilldownState>(null);

  const appAccounts = mockUsers.flatMap(u =>
    (u.accounts || []).filter(a => a.appName === application.name).map(a => ({ ...a, userName: u.name, department: u.department, riskLevel: u.riskLevel, isOrphan: u.isOrphan }))
  );
  const orphanAccounts = appAccounts.filter(a => a.isOrphan);
  const appEntitlements = mockEntitlements.filter(e => e.application === application.name);
  const riskyEntitlements = appEntitlements.filter(e => e.risk === 'High');

  const kpiCards = [
    {
      title: 'Total Accounts',
      value: application.users,
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      tooltip: 'Total number of accounts provisioned in this application.',
      onClick: () => setDrilldown({
        title: 'All Accounts',
        description: `All accounts in ${application.name}`,
        items: appAccounts,
        columns: [
          { key: 'accountName', label: 'Account' },
          { key: 'userName', label: 'Identity' },
          { key: 'status', label: 'Status', render: (v: string) => <Badge className={cn(getStatusBadgeClass(v), "border text-xs")}>{v}</Badge> },
          { key: 'department', label: 'Department' },
        ],
      }),
    },
    {
      title: 'Orphan Accounts',
      value: application.orphanCount,
      icon: <AlertCircle className="h-5 w-5" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      tooltip: 'Accounts without a correlated identity — potential security risk.',
      onClick: () => setDrilldown({
        title: 'Orphan Accounts',
        description: 'Accounts with no correlated identity owner.',
        items: orphanAccounts,
        columns: [
          { key: 'accountName', label: 'Account' },
          { key: 'userName', label: 'Last Known Identity' },
          { key: 'status', label: 'Status', render: (v: string) => <Badge variant={v === 'Active' ? 'default' : 'destructive'}>{v}</Badge> },
        ],
        badgeLabel: `${application.orphanCount} found`,
        badgeVariant: 'destructive',
      }),
    },
    {
      title: 'Risky Entitlements',
      value: application.riskyCount,
      icon: <ShieldAlert className="h-5 w-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      tooltip: 'Entitlements classified as High Risk based on privilege level and data sensitivity.',
      onClick: () => setDrilldown({
        title: 'Risky Entitlements',
        description: 'High-risk entitlements requiring governance attention.',
        items: riskyEntitlements,
        columns: [
          { key: 'displayName', label: 'Name' },
          { key: 'type', label: 'Type', render: (v: string) => <Badge variant="outline">{v}</Badge> },
          { key: 'owner', label: 'Owner', render: (v: string) => v || <Badge variant="destructive">Unowned</Badge> },
          { key: 'risk', label: 'Risk', render: () => <Badge variant="destructive">High</Badge> },
        ],
        badgeLabel: `${application.riskyCount} high-risk`,
        badgeVariant: 'destructive',
      }),
    },
    {
      title: 'Policy Violations',
      value: 3,
      icon: <BarChart2 className="h-5 w-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      tooltip: 'Active policy violations detected for identities with access to this application.',
      onClick: () => setDrilldown({
        title: 'Policy Violations',
        description: 'Active policy violations across application accounts.',
        items: [
          { policy: 'SoD Policy 4.5', identity: 'Sarah Johnson', description: 'Dev vs Reviewer conflict', status: 'Open' },
          { policy: 'Stale Access Policy', identity: 'Diana Prince', description: 'No activity in 120+ days', status: 'Open' },
          { policy: 'Orphan Account Policy', identity: 'temp-adm-01', description: 'No correlated identity', status: 'Open' },
        ],
        columns: [
          { key: 'policy', label: 'Policy' },
          { key: 'identity', label: 'Identity' },
          { key: 'description', label: 'Description' },
          { key: 'status', label: 'Status', render: () => <Badge variant="destructive">Open</Badge> },
        ],
        badgeLabel: '3 active',
        badgeVariant: 'destructive',
      }),
    },
  ];

  return (
    <div className="space-y-6 mt-4">
      {/* Application Metadata + Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Application Metadata
              <InfoTooltip text="Core configuration and connectivity details for this application connector." />
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div><span className="text-muted-foreground">Owner:</span> <span className="font-medium">{application.source === 'authoritative' ? 'IT Department' : 'Business Unit'}</span></div>
            <div><span className="text-muted-foreground">Connector Type:</span> <span className="font-medium">{application.category}</span></div>
            <div><span className="text-muted-foreground">Onboarded:</span> <span className="font-medium">2024-01-15</span></div>
            <div><span className="text-muted-foreground">Last Sync:</span> <span className="font-medium">{application.lastSync}</span></div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Source:</span>
              <Badge className={cn(getStatusBadgeClass(application.source === 'authoritative' ? 'active' : 'inactive'), "border text-xs")}>
                {application.source === 'authoritative' ? 'Authoritative' : 'Non-Authoritative'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Health:</span>
              <Badge className={cn(getStatusBadgeClass(application.status), "border text-xs")}>{application.status}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Connector Health */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" /> Sync Health
              <InfoTooltip text="Last 5 synchronization attempts showing connector reliability." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {syncHistory.map((sync, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {sync.status === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="text-muted-foreground">Today {sync.time}</span>
                  </div>
                  <Badge className={cn(getStatusBadgeClass(sync.status === 'success' ? 'completed' : 'pending'), "border text-xs")}>
                    {sync.status === 'success' ? 'Success' : 'Warning'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Governance KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card
            key={kpi.title}
            className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group"
            onClick={kpi.onClick}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-xs font-medium text-muted-foreground">{kpi.title}</p>
                    <InfoTooltip text={kpi.tooltip} />
                  </div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <div className={kpi.color}>{kpi.icon}</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 group-hover:text-primary transition-colors">Click to drill down →</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts + Compliance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Account Age Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Account Age Distribution
              <InfoTooltip text="Distribution of accounts by age. Older accounts may indicate stale access requiring review." />
            </CardTitle>
          </CardHeader>
          <CardContent style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accountAgeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#4F8EF7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Compliance Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" /> Compliance & Certification
              <InfoTooltip text="Compliance posture across regulatory frameworks. Red indicates failed or overdue certification." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {complianceFrameworks.map((fw) => (
                <div key={fw.name} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    {fw.pass ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-green-500" />
                    ) : (
                      <XCircle className="h-4.5 w-4.5 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{fw.name}</p>
                      <p className="text-xs text-muted-foreground">Last review: {fw.lastReview}</p>
                    </div>
                  </div>
                  <Badge className={cn(getStatusBadgeClass(fw.pass ? 'compliant' : 'failed'), "border text-xs")}>
                    {fw.pass ? 'Compliant' : 'Non-Compliant'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ownership & Lifecycle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4" /> Ownership Accountability
              <InfoTooltip text="Application ownership chain for governance accountability and escalation." />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Primary Owner</span>
              <span className="font-medium">IT Security Team</span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Backup Owner</span>
              <span className="font-medium">Infrastructure Team</span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Last Ownership Review</span>
              <span className="font-medium">2025-01-15</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Governance Committee</span>
              <span className="font-medium">IAM Steering Committee</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Lifecycle Posture
              <InfoTooltip text="Application lifecycle metrics indicating governance maturity and review cadence." />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Onboarding Date</span>
              <span className="font-medium">2024-01-15</span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Days Since Last Review</span>
              <span className="font-medium">42 days</span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Next Certification Due</span>
              <Badge className={cn(getStatusBadgeClass('pending'), "border text-xs")}>
                <RefreshCw className="h-3 w-3 mr-1" /> In 18 days
              </Badge>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Review Cadence</span>
              <span className="font-medium">Quarterly</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drill-down Dialog */}
      {drilldown && (
        <AppDetailDrilldownDialog
          isOpen={!!drilldown}
          onClose={() => setDrilldown(null)}
          title={drilldown.title}
          description={drilldown.description}
          items={drilldown.items}
          columns={drilldown.columns}
          badgeLabel={drilldown.badgeLabel}
          badgeVariant={drilldown.badgeVariant}
        />
      )}
    </div>
  );
};

export default ApplicationOverviewTab;
