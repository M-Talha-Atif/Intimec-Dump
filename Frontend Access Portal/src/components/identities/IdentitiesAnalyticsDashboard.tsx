import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, UserX, Shield, Clock, AlertTriangle, KeyRound,
  UserCheck, UsersRound, Bot, TrendingUp, TrendingDown,
  ChevronRight, ShieldAlert, CheckCircle2, BarChart3
} from 'lucide-react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { IdentitiesKpiDrilldownModal, IdentityDrilldownItem } from './IdentitiesKpiDrilldownModal';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts';

// --- Mock Data ---
const COLORS = ['#0ea5e9', '#f97316', '#8b5cf6', '#10b981', '#ef4444', '#6366f1'];

const kpiData = [
  { key: 'total', label: 'Total Identities', value: '2,847', change: '+3.2%', trend: 'up' as const, trendDir: 'positive' as const, icon: Users, tooltip: 'Total number of identities managed across all categories including employees, non-employees, and non-human accounts.' },
  { key: 'employees', label: 'Employees', value: '1,842', change: '+1.8%', trend: 'up' as const, trendDir: 'positive' as const, icon: UserCheck, tooltip: 'Active employee identities sourced from authoritative HR systems with lifecycle automation.' },
  { key: 'non-employees', label: 'Non-Employees', value: '438', change: '+5.1%', trend: 'up' as const, trendDir: 'negative' as const, icon: Users, tooltip: 'External identities including contractors, vendors, and consultants with time-bound access.' },
  { key: 'nhi', label: 'Non-Human Accounts', value: '412', change: '+2.4%', trend: 'up' as const, trendDir: 'negative' as const, icon: Bot, tooltip: 'Service accounts, bots, and API identities used by applications and automation systems.' },
  { key: 'groups', label: 'Identity Groups', value: '155', change: '+1.2%', trend: 'up' as const, trendDir: 'positive' as const, icon: UsersRound, tooltip: 'Reusable collections of identities used for collective access assignment and governance.' },
  { key: 'orphan', label: 'Orphan Identities', value: '67', change: '-12.3%', trend: 'down' as const, trendDir: 'positive' as const, icon: UserX, tooltip: 'Identities without an accountable owner or valid lifecycle source. Orphan identities represent a major audit and security risk because access cannot be validated.' },
  { key: 'privileged', label: 'Privileged Identities', value: '184', change: '+2.1%', trend: 'up' as const, trendDir: 'negative' as const, icon: KeyRound, tooltip: 'Identities with elevated permissions capable of administrative or sensitive actions. Requires periodic review and certification.' },
  { key: 'dormant', label: 'Dormant Accounts', value: '203', change: '-8.5%', trend: 'down' as const, trendDir: 'positive' as const, icon: Clock, tooltip: 'Identities inactive for 90+ days. Dormant accounts increase attack surface and should be reviewed for deprovisioning.' },
  { key: 'high-risk', label: 'High-Risk Identities', value: '91', change: '-4.2%', trend: 'down' as const, trendDir: 'positive' as const, icon: AlertTriangle, tooltip: 'Identities flagged with elevated risk due to excessive entitlements, policy violations, or anomalous behavior.' },
  { key: 'no-manager', label: 'Without Manager', value: '124', change: '-6.1%', trend: 'down' as const, trendDir: 'positive' as const, icon: UserX, tooltip: 'Identities without an assigned manager. Manager accountability is essential for access reviews and lifecycle governance.' },
  { key: 'no-owner', label: 'Without Owner', value: '89', change: '-3.8%', trend: 'down' as const, trendDir: 'positive' as const, icon: ShieldAlert, tooltip: 'Identities lacking a designated owner responsible for governance decisions and access validation.' },
  { key: 'cert-coverage', label: 'Certification Coverage', value: '78.4%', change: '+5.2%', trend: 'up' as const, trendDir: 'positive' as const, icon: CheckCircle2, tooltip: 'Percentage of identities covered by active certification campaigns. Target is 95%+ for audit readiness.' },
];

const typeDistribution = [
  { name: 'Employee', value: 1842 },
  { name: 'Contractor', value: 245 },
  { name: 'Vendor', value: 128 },
  { name: 'Service Account', value: 312 },
  { name: 'Bot/API', value: 100 },
  { name: 'Intern', value: 65 },
];

const lifecycleCoverage = [
  { name: 'Joiner', automated: 92, manual: 8 },
  { name: 'Mover', automated: 74, manual: 26 },
  { name: 'Leaver', automated: 88, manual: 12 },
];

const riskDistribution = [
  { name: 'Excessive Entitlements', count: 142 },
  { name: 'Direct Access', count: 98 },
  { name: 'Policy Violations', count: 67 },
  { name: 'Privileged Anomaly', count: 34 },
  { name: 'Unreviewed Access', count: 156 },
];

const activityTrend = [
  { month: 'Sep', created: 45, modified: 120, deactivated: 28 },
  { month: 'Oct', created: 62, modified: 98, deactivated: 35 },
  { month: 'Nov', created: 38, modified: 145, deactivated: 42 },
  { month: 'Dec', created: 28, modified: 88, deactivated: 55 },
  { month: 'Jan', created: 71, modified: 132, deactivated: 31 },
  { month: 'Feb', created: 54, modified: 110, deactivated: 38 },
];

const riskInsights = [
  { label: 'Identities without owners', count: 89, severity: 'high' },
  { label: 'Groups without owners', count: 23, severity: 'high' },
  { label: 'Expired contractors still active', count: 14, severity: 'critical' },
  { label: 'Service accounts without rotation', count: 37, severity: 'high' },
  { label: 'Privileged access concentration', count: 8, severity: 'medium' },
];

const complianceInsights = [
  { label: 'Certification participation rate', value: '82%', status: 'warning' },
  { label: 'Overdue reviews', value: '34', status: 'critical' },
  { label: 'Uncertified access items', value: '267', status: 'warning' },
  { label: 'Compliance-tagged identities', value: '1,204', status: 'ok' },
  { label: 'Audit readiness score', value: '74%', status: 'warning' },
];

const mockDrilldownItems: IdentityDrilldownItem[] = [
  { id: 'IDN-001', name: 'John Smith', type: 'Employee', status: 'active', risk: 'low', owner: 'Jane Doe', date: '2025-12-01' },
  { id: 'IDN-002', name: 'SVC-Payment-API', type: 'Service Account', status: 'active', risk: 'high', owner: 'DevOps Team', date: '2025-11-15' },
  { id: 'IDN-003', name: 'Maria Garcia', type: 'Contractor', status: 'expired', risk: 'critical', owner: 'Unassigned', date: '2025-10-22' },
  { id: 'IDN-004', name: 'BOT-DataSync', type: 'Bot/API', status: 'active', risk: 'medium', owner: 'Platform Team', date: '2025-09-10' },
  { id: 'IDN-005', name: 'Alex Chen', type: 'Employee', status: 'active', risk: 'high', owner: 'Tom Wilson', date: '2026-01-05' },
  { id: 'IDN-006', name: 'SVC-HR-Integration', type: 'Service Account', status: 'inactive', risk: 'medium', owner: 'HR Systems', date: '2025-08-20' },
  { id: 'IDN-007', name: 'Rachel Kumar', type: 'Vendor', status: 'active', risk: 'low', owner: 'Procurement', date: '2026-02-14' },
  { id: 'IDN-008', name: 'Admin-Legacy', type: 'Service Account', status: 'orphaned', risk: 'critical', owner: 'Unassigned', date: '2024-06-01' },
];

const IdentitiesAnalyticsDashboard: React.FC = () => {
  const [drilldownOpen, setDrilldownOpen] = useState(false);
  const [drilldownTitle, setDrilldownTitle] = useState('');
  const [drilldownItems, setDrilldownItems] = useState<IdentityDrilldownItem[]>([]);

  const openDrilldown = (title: string) => {
    setDrilldownTitle(title);
    setDrilldownItems(mockDrilldownItems);
    setDrilldownOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Tier 1: Executive KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {kpiData.map(kpi => {
          const TrendIcon = kpi.trend === 'up' ? TrendingUp : TrendingDown;
          const trendColor = kpi.trendDir === 'positive' ? 'text-green-600' : 'text-destructive';
          return (
            <Card
              key={kpi.key}
              className="cursor-pointer hover:shadow-md transition-all duration-200"
              onClick={() => openDrilldown(kpi.label)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-4">
                <div className="flex items-center gap-1">
                  <CardTitle className="text-xs font-medium text-muted-foreground">{kpi.label}</CardTitle>
                  <InfoTooltip text={kpi.tooltip} />
                </div>
                <kpi.icon className="h-3.5 w-3.5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <div className="text-xl font-bold text-foreground">{kpi.value}</div>
                <p className="mt-1 flex items-center text-xs text-muted-foreground">
                  <TrendIcon className={`mr-1 h-3 w-3 ${trendColor}`} />
                  <span className={trendColor}>{kpi.change}</span>
                  <span className="ml-1">vs last period</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tier 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identity Type Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold">Identity Type Distribution</CardTitle>
              <InfoTooltip text="Breakdown of managed identities by category. Click a segment to filter the Directory by that identity type." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  onClick={(entry) => openDrilldown(`${entry.name} Identities`)}
                  className="cursor-pointer"
                >
                  {typeDistribution.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lifecycle Coverage */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold">Lifecycle Automation Coverage</CardTitle>
              <InfoTooltip text="Percentage of Joiner/Mover/Leaver processes handled by automated provisioning vs manual intervention." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lifecycleCoverage} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" width={60} />
                <RechartsTooltip formatter={(value: number) => `${value}%`} />
                <Bar dataKey="automated" stackId="a" fill="#10b981" name="Automated" />
                <Bar dataKey="manual" stackId="a" fill="#f97316" name="Manual" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Access Risk Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold">Access Risk Distribution</CardTitle>
              <InfoTooltip text="Categorized access risk findings across all identity types. Click a bar to view affected identities." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                <YAxis />
                <RechartsTooltip />
                <Bar
                  dataKey="count"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  onClick={(entry) => openDrilldown(entry.name)}
                  className="cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Trend */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold">Identity Activity Trend</CardTitle>
              <InfoTooltip text="Monthly trend of identity lifecycle events including creation, modification, and deactivation across all identity types." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={activityTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Area type="monotone" dataKey="created" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Created" />
                <Area type="monotone" dataKey="modified" stackId="1" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} name="Modified" />
                <Area type="monotone" dataKey="deactivated" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Deactivated" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tier 3: Governance Insights + Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk & Ownership Insights */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              <CardTitle className="text-sm font-semibold">Risk & Ownership Insights</CardTitle>
              <InfoTooltip text="Actionable governance risks requiring immediate attention. Each finding links to affected identities for remediation." />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {riskInsights.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => openDrilldown(item.label)}
              >
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{item.count}</span>
                  <Badge variant={item.severity === 'critical' ? 'destructive' : 'outline'} className={
                    item.severity === 'high' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                    item.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''
                  }>
                    {item.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Compliance & Certification */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm font-semibold">Compliance & Certification</CardTitle>
              <InfoTooltip text="Certification and compliance metrics critical for audit readiness. Overdue reviews and uncertified access require immediate action." />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {complianceInsights.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => openDrilldown(item.label)}
              >
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{item.value}</span>
                  <Badge variant={item.status === 'critical' ? 'destructive' : 'outline'} className={
                    item.status === 'warning' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                    item.status === 'ok' ? 'bg-green-100 text-green-800 border-green-200' : ''
                  }>
                    {item.status === 'ok' ? 'healthy' : item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <IdentitiesKpiDrilldownModal
        open={drilldownOpen}
        onOpenChange={setDrilldownOpen}
        title={drilldownTitle}
        items={drilldownItems}
      />
    </div>
  );
};

export default IdentitiesAnalyticsDashboard;
