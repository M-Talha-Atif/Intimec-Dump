import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { ResponsibilitiesKpiDrilldownModal, DrilldownItem } from './ResponsibilitiesKpiDrilldownModal';
import { useQuery } from '@tanstack/react-query';
import {
  fetchMyTasks, fetchMyBusinessRoles, fetchMyInternalRoles,
  fetchMyTeam, fetchMySoDPolicies, fetchMyApplications,
  InternalRole
} from '@/services/responsibilities';
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  ListChecks, Clock, AlertTriangle, Award, Monitor, Shield,
  Users, Ban, FileSearch, TrendingUp, TrendingDown,
  KeyRound, UserX, Zap, CalendarX
} from 'lucide-react';
import { useCssVariable } from '@/hooks/useCssVariable';
import { useResponsibilitiesAnalytics } from '@/hooks/responsibilities/analytics/useResponsibilitiesAnalytics';
import { Loader2 } from "lucide-react";

export const ResponsibilitiesAnalyticsDashboard: React.FC = () => {
  const [drilldownOpen, setDrilldownOpen] = useState(false);
  const [drilldownTitle, setDrilldownTitle] = useState('');
  const [drilldownItems, setDrilldownItems] = useState<DrilldownItem[]>([]);

  // Real KPIs from backend -- totalResponsibilities, pendingTasks, ownedRoles, ownedRolesTotalMembers
  const { kpis: analyticsKpis, kpisLoading } = useResponsibilitiesAnalytics({ autoFetch: true });

  const { data: tasks = [] } = useQuery({ queryKey: ['resp-tasks'], queryFn: () => fetchMyTasks() });
  const { data: roles = [] } = useQuery({ queryKey: ['resp-roles'], queryFn: fetchMyBusinessRoles });
  const { data: internalRoles = [] } = useQuery({ queryKey: ['resp-iroles'], queryFn: fetchMyInternalRoles });
  const { data: team = [] } = useQuery({ queryKey: ['resp-team'], queryFn: fetchMyTeam });
  const { data: policies = [] } = useQuery({ queryKey: ['resp-policies'], queryFn: fetchMySoDPolicies });
  const { data: apps = [] } = useQuery({ queryKey: ['resp-apps'], queryFn: fetchMyApplications });

  const openDrilldown = (title: string, items: DrilldownItem[]) => {
    setDrilldownTitle(title);
    setDrilldownItems(items);
    setDrilldownOpen(true);
  };

  // Frontend-computed metrics used by the mock KPI cards and charts.
  // The three real KPI cards (Total Responsibilities, Pending Tasks, Owned Roles)
  // now use analyticsKpis from the backend and fall back to these when loading.
  const metrics = useMemo(() => {
    const totalResp = tasks.length + internalRoles.length;
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const overdue = tasks.filter(t => new Date(t.dueDate) < new Date());
    const certifications = tasks.filter(t => t.type === 'certification');
    const highRiskTeam = Math.max(...team.map(m => m.riskScore), 0);
    const sodViolations = policies.reduce((s, p) => s + p.violationCount, 0);
    const unreviewedPolicies = policies.filter(p => p.complianceStatus === 'review_needed');

    return {
      totalResp, pendingTasks, overdue, certifications,
      ownedApps: apps.length, ownedRoles: internalRoles.length,
      highRiskTeam, sodViolations, unreviewedPolicies,
    };
  }, [tasks, internalRoles, team, policies, apps]);

  // ---- Drilldown mappers ----

  const tasksToDrilldown = (items: typeof tasks): DrilldownItem[] =>
    items.map(t => ({ id: t.id, name: t.title, type: t.type, status: t.status, risk: t.priority, date: t.dueDate.split('T')[0] }));

  const rolesToDrilldown = (items: typeof roles): DrilldownItem[] =>
    items.map(r => ({ id: r.id, name: r.name, type: r.type, status: r.status, risk: r.riskLevel, date: r.lastModified.split('T')[0] }));

  const internalRolesToDrilldown = (items: InternalRole[]): DrilldownItem[] =>
    items.map(ir => ({
      id: ir.id,
      name: ir.name,
      type: ir.roleType,
      status: ir.isActive ? "active" : "inactive",
      risk: ir.riskLevel ?? "low",
      date: ir.lastModified ? ir.lastModified.split("T")[0] : "",
    }));

  const appsToDrilldown = (items: typeof apps): DrilldownItem[] =>
    items.map(a => ({ id: a.id, name: a.name, type: a.connectorType, status: a.environment, risk: 'medium', date: a.lastSync.split('T')[0] }));

  const teamToDrilldown = (items: typeof team): DrilldownItem[] =>
    items.map(m => ({
      id: m.userId,
      name: m.displayName,
      type: m.jobTitle,
      status: m.status,
      risk: m.riskScore > 25 ? 'high' : m.riskScore > 15 ? 'medium' : 'low',
      date: m.lastLogin?.split('T')[0] ?? '-'
    }));

  const policiesToDrilldown = (items: typeof policies): DrilldownItem[] =>
    items.map(p => ({ id: p.id, name: p.name, type: 'SoD Policy', status: p.complianceStatus, risk: p.severity, date: p.lastReview.split('T')[0] }));

  // ---- KPI cards ----
  // First three use real backend values from analyticsKpis.
  // Remaining six stay frontend-computed from individual service queries.

  const kpis = [
    {
      title: 'Total Responsibilities',
      value: kpisLoading ? '...' : (analyticsKpis?.totalResponsibilities ?? metrics.totalResp).toString(),
      sub: `${analyticsKpis?.ownedRoles ?? internalRoles.length} roles owned`,
      icon: ListChecks,
      trend: '+3', trendDir: 'up' as const,
      tooltip: 'Total governance objects under your ownership -- tasks, roles, team members, policies, and applications. Growth indicates expanding accountability scope.',
      onClick: () => openDrilldown(
        'All Responsibilities',
        // Full list: tasks first then owned roles -- modal paginates 10 per page
        [
          ...tasksToDrilldown(tasks),
          ...internalRolesToDrilldown(internalRoles),
        ]
      ),
    },
    // Pending Tasks -- passes only pending tasks so the modal counts and paginates correctly
    {
      title: 'Pending Tasks',
      value: kpisLoading ? '...' : (analyticsKpis?.pendingTasks ?? metrics.pendingTasks.length).toString(),
      sub: 'Awaiting your action',
      icon: Clock,
      trend: `${analyticsKpis?.pendingTasks ?? metrics.pendingTasks.length}`, trendDir: 'up' as const,
      tooltip: 'Tasks awaiting your approval or governance action. Delayed processing may impact access provisioning, compliance attestations, or incident response timelines.',
      onClick: () => openDrilldown(
        'Pending Tasks',
        // Only pending tasks -- filters locally from the already-fetched tasks array
        tasksToDrilldown(tasks.filter(t => t.status === 'pending'))
      ),
    },
    {
      title: 'Overdue Approvals',
      // Frontend-computed: tasks past their dueDate
      value: metrics.overdue.length.toString(),
      sub: 'Past due date',
      icon: AlertTriangle,
      trend: `${metrics.overdue.length}`, trendDir: 'up' as const,
      tooltip: 'Approvals that have exceeded their deadline. Overdue items create compliance risk and may trigger audit findings or escalation workflows.',
      onClick: () => openDrilldown('Overdue Approvals', tasksToDrilldown(metrics.overdue)),
    },
    {
      title: 'Active Certifications',
      // Frontend-computed: tasks where type=certification
      value: metrics.certifications.length.toString(),
      sub: 'In progress',
      icon: Award,
      trend: '+1', trendDir: 'up' as const,
      tooltip: 'Access certification campaigns currently requiring your review. Incomplete certifications leave access unvalidated and increase audit risk.',
      onClick: () => openDrilldown('Active Certifications', tasksToDrilldown(metrics.certifications)),
    },
    {
      title: 'Owned Applications',
      // Frontend-computed: apps.length from fetchMyApplications
      value: metrics.ownedApps.toString(),
      sub: `${apps.reduce((s, a) => s + a.activeUsers, 0)} active users`,
      icon: Monitor,
      trend: '0', trendDir: 'down' as const,
      tooltip: 'Applications where you are the designated governance owner. Ownership includes certification scheduling, connector health monitoring, and entitlement reviews.',
      onClick: () => openDrilldown('Owned Applications', appsToDrilldown(apps)),
    },
    // Owned Roles -- passes the full internalRoles list so the modal paginates through all owned roles
    {
      title: 'Owned Roles',
      value: kpisLoading ? '...' : (analyticsKpis?.ownedRoles ?? metrics.ownedRoles).toString(),
      sub: `${analyticsKpis?.ownedRolesTotalMembers ?? internalRoles.reduce((s, r) => s + (r.userCount ?? 0), 0)} members total`,
      icon: Shield,
      trend: '+1', trendDir: 'up' as const,
      tooltip: 'Business and application roles under your governance ownership. Role owners are accountable for membership accuracy, entitlement appropriateness, and periodic reviews.',
      onClick: () => openDrilldown(
        'Owned Roles',
        // Full owned roles list -- modal shows 10 per page with pagination
        internalRolesToDrilldown(internalRoles)
      ),
    },
    {
      title: 'Team Risk Exposure',
      // Frontend-computed: highest riskScore among team members
      value: `${metrics.highRiskTeam}%`,
      sub: `${team.length} team members`,
      icon: Users,
      trend: '+5%', trendDir: 'up' as const,
      tooltip: 'Highest individual risk score among your direct reports. Elevated scores indicate excessive access accumulation, policy violations, or anomalous behavior patterns.',
      onClick: () => openDrilldown('Team Members', teamToDrilldown(team)),
    },
    {
      title: 'SoD Violations',
      // Frontend-computed: sum of violationCount across owned policies
      value: metrics.sodViolations.toString(),
      sub: `Across ${policies.length} policies`,
      icon: Ban,
      trend: '+2', trendDir: 'up' as const,
      tooltip: 'Active segregation of duties violations under your policy ownership. Unresolved violations represent material compliance risks and may require compensating controls.',
      onClick: () => openDrilldown('SoD Policies with Violations', policiesToDrilldown(policies.filter(p => p.violationCount > 0))),
    },
    {
      title: 'Unreviewed Items',
      // Frontend-computed: policies with complianceStatus=review_needed
      value: metrics.unreviewedPolicies.length.toString(),
      sub: 'Awaiting review',
      icon: FileSearch,
      trend: `${metrics.unreviewedPolicies.length}`, trendDir: 'up' as const,
      tooltip: 'Governance objects pending periodic review. Unreviewed items may not meet audit requirements for timely access validation.',
      onClick: () => openDrilldown('Unreviewed Policies', policiesToDrilldown(metrics.unreviewedPolicies)),
    },
  ];

  // ---- Chart data ----

  const responsibilityDistribution = useMemo(() => [
    { name: 'Tasks', value: tasks.length },
    { name: 'Business Roles', value: roles.length },
    { name: 'Internal Roles', value: internalRoles.length },
    { name: 'Team Members', value: team.length },
    { name: 'SoD Policies', value: policies.length },
    { name: 'Applications', value: apps.length },
  ], [tasks, roles, internalRoles, team, policies, apps]);

  const workloadTrend = [
    { month: 'Jul', tasks: 8, approvals: 5, certs: 2 },
    { month: 'Aug', tasks: 12, approvals: 7, certs: 1 },
    { month: 'Sep', tasks: 10, approvals: 6, certs: 3 },
    { month: 'Oct', tasks: 15, approvals: 9, certs: 2 },
    { month: 'Nov', tasks: 11, approvals: 8, certs: 4 },
    { month: 'Dec', tasks: 14, approvals: 10, certs: 3 },
  ];

  const teamRiskData = useMemo(() => {
    if (!Array.isArray(team) || team.length === 0) return [];
    return team.map(m => ({
      name: m.displayName?.split(' ')[0] ?? 'User',
      risk: Number(m.riskScore ?? 0),
    }));
  }, [team]);

  const approvalTurnaround = [
    { type: 'Role Approval', avgHours: 4.2 },
    { type: 'Certification', avgHours: 18.5 },
    { type: 'Workflow', avgHours: 2.1 },
    { type: 'Delegation', avgHours: 6.8 },
  ];

  // ---- Risk insights ----

  const riskInsights = useMemo(() => [
    {
      label: 'Roles with High-Risk Entitlements',
      count: roles.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length,
      icon: KeyRound,
      onClick: () => openDrilldown('High-Risk Roles', rolesToDrilldown(roles.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical'))),
    },
    {
      label: 'Team Members with Excessive Access',
      count: team.filter(m => m.riskScore > 25).length,
      icon: UserX,
      onClick: () => openDrilldown('Excessive Access Members', teamToDrilldown(team.filter(m => m.riskScore > 25))),
    },
    {
      label: 'Policies Awaiting Remediation',
      count: policies.filter(p => p.complianceStatus !== 'compliant').length,
      icon: AlertTriangle,
      onClick: () => openDrilldown('Non-Compliant Policies', policiesToDrilldown(policies.filter(p => p.complianceStatus !== 'compliant'))),
    },
    {
      label: 'Applications Missing Recent Sync',
      count: apps.filter(a => Date.now() - new Date(a.lastSync).getTime() > 86400000).length,
      icon: Zap,
      onClick: () => openDrilldown('Stale Applications', appsToDrilldown(apps.filter(a => Date.now() - new Date(a.lastSync).getTime() > 86400000))),
    },
  ], [roles, team, policies, apps]);

  const ownershipHealth = useMemo(() => [
    {
      label: 'Objects Without Backup Owner',
      count: 3,
      icon: Users,
      onClick: () => openDrilldown('No Backup Owner', rolesToDrilldown(roles.slice(0, 3))),
    },
    {
      label: 'Roles Not Reviewed Within Policy Period',
      count: roles.filter(r => Date.now() - new Date(r.lastModified).getTime() > 90 * 86400000).length,
      icon: CalendarX,
      onClick: () => openDrilldown('Overdue Role Reviews', rolesToDrilldown(roles.filter(r => Date.now() - new Date(r.lastModified).getTime() > 90 * 86400000))),
    },
    {
      label: 'Applications Missing Certification Campaigns',
      count: 1,
      icon: Monitor,
      onClick: () => openDrilldown('Uncertified Applications', appsToDrilldown(apps.slice(0, 1))),
    },
    {
      label: 'Inactive Responsibilities (>90 days)',
      count: 2,
      icon: FileSearch,
      onClick: () => openDrilldown('Inactive Items', [...rolesToDrilldown(roles.slice(0, 1)), ...policiesToDrilldown(policies.slice(0, 1))]),
    },
  ], [roles, apps, policies]);

  // ---- Chart colors ----

  const chart1Color = `hsl(${useCssVariable('--chart-1')})`;
  const chart2Color = `hsl(${useCssVariable('--chart-2')})`;
  const chart3Color = `hsl(${useCssVariable('--chart-3')})`;
  const chart4Color = `hsl(${useCssVariable('--chart-4')})`;
  const chart5Color = `hsl(${useCssVariable('--chart-5')})`;
  const destructive = `hsl(${useCssVariable('--chart-6')})`;

  const COLORS = [chart1Color, chart2Color, chart3Color, chart4Color, chart5Color, destructive];

  return (
    <div className="space-y-6">

      {/* Tier 1: KPI Cards */}
      {/* Tier 1: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpisLoading ? (
          Array.from({ length: 9 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      Loading...
                    </span>
                  </div>
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>

                <div className="flex items-center py-2">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>

                <div className="mt-2">
                  <span className="text-xs text-muted-foreground">Loading...</span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          kpis.map((kpi) => (
            <Card
              key={kpi.title}
              className="cursor-pointer hover:shadow-md transition-all duration-200"
              onClick={kpi.onClick}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      {kpi.title}
                    </span>
                    <InfoTooltip text={kpi.tooltip} />
                  </div>
                  <kpi.icon className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="text-2xl font-bold text-foreground">{kpi.value}</div>

                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{kpi.sub}</span>
                  <span
                    className={`text-xs flex items-center gap-0.5 ${kpi.trendDir === "down"
                        ? "text-green-600"
                        : [
                          "Total Responsibilities",
                          "Active Certifications",
                          "Owned Applications",
                          "Owned Roles",
                        ].includes(kpi.title)
                          ? "text-green-600"
                          : "text-destructive"
                      }`}
                  >
                    {kpi.trendDir === "up" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {kpi.trend}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Tier 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-medium">Responsibility Distribution</CardTitle>
              <InfoTooltip text="Breakdown of governance objects by category. Imbalanced distribution may indicate ownership concentration risk." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={responsibilityDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {responsibilityDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-medium">Task Workload Trend</CardTitle>
              <InfoTooltip text="Monthly trend of task volume, approvals, and certifications. Increasing trends may require delegation or capacity review." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={workloadTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="tasks" stackId="1" stroke={chart1Color} fill={chart1Color} fillOpacity={0.3} />
                <Area type="monotone" dataKey="approvals" stackId="1" stroke={chart2Color} fill={chart2Color} fillOpacity={0.3} />
                <Area type="monotone" dataKey="certs" stackId="1" stroke={chart3Color} fill={chart3Color} fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-medium">Team Risk Distribution</CardTitle>
              <InfoTooltip text="Risk score per team member under your supervision. Scores above 25 indicate excessive access accumulation requiring review." />
            </div>
          </CardHeader>
          <CardContent>
            {teamRiskData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={teamRiskData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="risk" fill={chart4Color} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                No team data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-medium">Approval Turnaround Time</CardTitle>
              <InfoTooltip text="Average hours to complete approvals by task type. Long turnaround times delay access provisioning and increase compliance exposure." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={approvalTurnaround} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis dataKey="type" type="category" tick={{ fontSize: 11 }} width={100} className="text-muted-foreground" />
                <Tooltip />
                <Bar dataKey="avgHours" fill={chart2Color} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tier 3: Risk Insights + Ownership Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-medium">Governance Risk Insights</CardTitle>
              <InfoTooltip text="Actionable risk indicators derived from your owned governance objects. Each finding represents a potential compliance gap requiring attention." />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {riskInsights.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-2.5 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={item.onClick}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
                <Badge variant={item.count > 0 ? 'destructive' : 'secondary'} className="text-xs">
                  {item.count}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-medium">Ownership Health Indicators</CardTitle>
              <InfoTooltip text="Governance maturity metrics for your owned objects. Gaps in ownership health increase audit risk and reduce operational resilience." />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {ownershipHealth.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-2.5 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={item.onClick}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
                <Badge variant={item.count > 0 ? 'warning' : 'secondary'} className="text-xs">
                  {item.count}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <ResponsibilitiesKpiDrilldownModal
        open={drilldownOpen}
        onOpenChange={setDrilldownOpen}
        title={drilldownTitle}
        items={drilldownItems}
      />
    </div>
  );
};