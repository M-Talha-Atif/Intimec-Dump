import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TrendingUp, TrendingDown, Users, UserMinus, UserPlus, Ghost, Clock, XCircle, AlertTriangle, Shield, ArrowRightLeft, ChevronDown, ChevronRight, BarChart3, Activity } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import LifecycleDrilldownDrawer from './LifecycleDrilldownDrawer';
import {
  lifecycleKpis, jmlMonthlyData, provisioningMetrics, orphanedAccounts,
  lifecycleSlaData, accessAccumulationData, pendingLifecycleActions,
  jmlPipelineStages, complianceAuditData, provisioningHealthSummary,
} from '@/data/mock-lifecycle';
import { cn } from '@/lib/utils';

const COLORS = {
  success: 'hsl(var(--chart-1))',
  failed: 'hsl(var(--destructive))',
  pending: 'hsl(var(--chart-2))',
  sla: 'hsl(var(--chart-3))',
  joiners: 'hsl(var(--chart-1))',
  movers: 'hsl(var(--chart-2))',
  leavers: 'hsl(var(--chart-3))',
};

const PIE_COLORS = ['#34D399', '#EF4444', '#F59E0B', '#8B5CF6'];

type DrawerState = React.ComponentProps<typeof LifecycleDrilldownDrawer> | null;

const LifecycleAnalytics: React.FC = () => {
  const [drawerState, setDrawerState] = useState<DrawerState>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ pipeline: true, accumulation: false, compliance: false });

  const toggleSection = (key: string) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const kpis = lifecycleKpis;

  const kpiCards = [
    { title: 'Total Lifecycle Events', value: kpis.totalEventsQuarter.toLocaleString(), trend: kpis.totalEventsTrend, icon: Activity, tooltip: 'Total JML events processed this quarter including joiners, movers, and leavers across all identity types', onClick: () => setDrawerState({ open: true, onOpenChange: () => setDrawerState(null), title: 'Lifecycle Events', description: 'All JML events by month', mode: 'events', events: jmlMonthlyData }) },
    { title: 'Active Joiners Pipeline', value: kpis.activeJoinersPipeline.toString(), trend: kpis.activeJoinersTrend, icon: UserPlus, tooltip: 'Identities currently in the onboarding pipeline awaiting provisioning completion', onClick: () => setDrawerState({ open: true, onOpenChange: () => setDrawerState(null), title: 'Joiner Pipeline', description: 'Active onboarding actions', mode: 'actions', actions: pendingLifecycleActions.filter(a => a.actionType === 'onboarding') }) },
    { title: 'Pending Leavers', value: kpis.pendingLeavers.toString(), trend: kpis.pendingLeaversTrend, icon: UserMinus, tooltip: 'Identities awaiting offboarding — access must be revoked within SLA to prevent orphaned accounts', trendPositive: 'down', onClick: () => setDrawerState({ open: true, onOpenChange: () => setDrawerState(null), title: 'Pending Leavers', description: 'Offboarding and deprovision actions', mode: 'actions', actions: pendingLifecycleActions.filter(a => a.actionType === 'offboarding' || a.actionType === 'deprovision') }) },
    { title: 'Orphaned Accounts', value: kpis.orphanedAccounts.toString(), trend: kpis.orphanedAccountsTrend, icon: Ghost, tooltip: 'Accounts with no valid identity link — security risk requiring immediate remediation', trendPositive: 'down', onClick: () => setDrawerState({ open: true, onOpenChange: () => setDrawerState(null), title: 'Orphaned Accounts', description: 'Accounts without valid identity association', mode: 'accounts', accounts: orphanedAccounts }) },
    { title: 'Avg Time-to-Provision', value: `${kpis.avgTimeToProvision}h`, trend: kpis.avgTimeToProvision <= kpis.avgTimeToProvisionTarget ? -5 : 8, icon: Clock, tooltip: `Average hours to complete provisioning. Target: ${kpis.avgTimeToProvisionTarget}h. Above target indicates bottlenecks`, trendPositive: 'down', onClick: () => setDrawerState({ open: true, onOpenChange: () => setDrawerState(null), title: 'Provisioning SLA', description: 'SLA compliance across lifecycle categories', mode: 'sla', sla: lifecycleSlaData }) },
    { title: 'Avg Time-to-Deprovision', value: `${kpis.avgTimeToDeprovision}h`, trend: kpis.avgTimeToDeprovision <= kpis.avgTimeToDeprovisionTarget ? -3 : 12, icon: Clock, tooltip: `Average hours to complete deprovisioning. Target: ${kpis.avgTimeToDeprovisionTarget}h. Delays create orphaned account risk`, trendPositive: 'down', onClick: () => setDrawerState({ open: true, onOpenChange: () => setDrawerState(null), title: 'Deprovisioning SLA', description: 'SLA compliance for deprovisioning events', mode: 'sla', sla: lifecycleSlaData }) },
    { title: 'Provisioning Failures', value: kpis.provisioningFailures.toString(), trend: kpis.provisioningFailuresTrend, icon: XCircle, tooltip: 'Failed or stalled provisioning actions this month requiring manual intervention', trendPositive: 'down', onClick: () => setDrawerState({ open: true, onOpenChange: () => setDrawerState(null), title: 'Provisioning Details', description: 'Per-application provisioning health', mode: 'provisioning', provisioning: provisioningMetrics }) },
    { title: 'Lifecycle Coverage', value: `${kpis.lifecycleCoverage}%`, trend: kpis.lifecycleCoverageTrend, icon: Shield, tooltip: 'Percentage of identities with complete lifecycle policies including JML automation, SLA rules, and compliance mapping' },
  ];

  const provHealthData = [
    { name: 'Success', value: provisioningHealthSummary.success },
    { name: 'Failed', value: provisioningHealthSummary.failed },
    { name: 'Pending', value: provisioningHealthSummary.pending },
    { name: 'SLA Breached', value: provisioningHealthSummary.slaBreached },
  ];

  return (
    <div className="space-y-6">
      {/* ── Tier 1: Executive KPIs ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          const trendPositiveDir = (kpi as any).trendPositive || 'up';
          const isPositive = trendPositiveDir === 'up' ? kpi.trend > 0 : kpi.trend < 0;
          const TrendIcon = kpi.trend > 0 ? TrendingUp : TrendingDown;
          return (
            <Card key={idx} className={cn("transition-all duration-200", kpi.onClick && "cursor-pointer hover:shadow-md")} onClick={kpi.onClick}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-4">
                <div className="flex items-center gap-1">
                  <CardTitle className="text-xs font-medium text-muted-foreground">{kpi.title}</CardTitle>
                  <InfoTooltip text={kpi.tooltip} />
                </div>
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <div className="text-xl font-bold text-foreground">{kpi.value}</div>
                <p className="mt-1 flex items-center text-xs text-muted-foreground">
                  <TrendIcon className={cn("mr-1 h-3 w-3", isPositive ? "text-emerald-600" : "text-destructive")} />
                  <span className={isPositive ? "text-emerald-600" : "text-destructive"}>{Math.abs(kpi.trend)}%</span>
                  <span className="ml-1">vs last period</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Tier 2: Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* JML Event Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm">JML Event Trend</CardTitle>
              <InfoTooltip text="12-month trend of Joiner, Mover, and Leaver events. Spikes in leavers without matching deprovisioning indicate orphan risk." />
            </div>
            <CardDescription>Joiners / Movers / Leavers — 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={jmlMonthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="joiners" stackId="1" stroke={COLORS.joiners} fill={COLORS.joiners} fillOpacity={0.4}
                    onClick={(data: any) => {
                      if (data?.payload) {
                        const m = data.payload;
                        setDrawerState({ open: true, onOpenChange: () => setDrawerState(null), title: 'JML Events', description: `Events for ${m.month}`, segmentLabel: m.month, segmentColor: COLORS.joiners, mode: 'events', events: [m] });
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  <Area type="monotone" dataKey="movers" stackId="1" stroke={COLORS.movers} fill={COLORS.movers} fillOpacity={0.4} />
                  <Area type="monotone" dataKey="leavers" stackId="1" stroke={COLORS.leavers} fill={COLORS.leavers} fillOpacity={0.4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {[['Joiners', COLORS.joiners], ['Movers', COLORS.movers], ['Leavers', COLORS.leavers]].map(([label, color]) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color as string }} />
                  {label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Provisioning Health Donut */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm">Provisioning Health</CardTitle>
              <InfoTooltip text="Distribution of provisioning outcomes. Click segments to drill into per-application details." />
            </div>
            <CardDescription>Success / Failed / Pending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={provHealthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    onClick={(_, idx) => {
                      const segment = provHealthData[idx];
                      setDrawerState({
                        open: true, onOpenChange: () => setDrawerState(null),
                        title: 'Provisioning Details', description: `Filtered by: ${segment.name}`,
                        segmentLabel: segment.name, segmentColor: PIE_COLORS[idx],
                        mode: 'provisioning', provisioning: provisioningMetrics,
                      });
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {provHealthData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-1">
              {provHealthData.map((d, idx) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }} />
                  {d.name}: {d.value}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lifecycle SLA Compliance */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">Lifecycle SLA Compliance</CardTitle>
            <InfoTooltip text="Compares actual lifecycle processing times against SLA targets. Click bars to drill into breach details." />
          </div>
          <CardDescription>Actual vs Target by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lifecycleSlaData} layout="vertical" margin={{ left: 140 }}
                onClick={(data) => {
                  if (data?.activePayload?.[0]) {
                    setDrawerState({ open: true, onOpenChange: () => setDrawerState(null), title: 'SLA Details', description: 'Full SLA compliance breakdown', mode: 'sla', sla: lifecycleSlaData });
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis type="category" dataKey="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} width={135} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="avgHours" fill={COLORS.movers} name="Actual (hours)" radius={[0, 4, 4, 0]} style={{ cursor: 'pointer' }} />
                <Bar dataKey="targetHours" fill={COLORS.joiners} name="Target (hours)" radius={[0, 4, 4, 0]} fillOpacity={0.4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ── Tier 3: Operational Tables ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Actions */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">Pending Lifecycle Actions</CardTitle>
                <InfoTooltip text="Top pending lifecycle actions requiring attention. SLA-breached items are flagged for escalation." />
              </div>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setDrawerState({ open: true, onOpenChange: () => setDrawerState(null), title: 'All Pending Actions', description: 'Complete list of pending lifecycle actions', mode: 'actions', actions: pendingLifecycleActions })}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {pendingLifecycleActions.slice(0, 5).map(action => (
                <div key={action.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setDrawerState({ open: true, onOpenChange: () => setDrawerState(null), title: action.identityName, description: `${action.actionType} — ${action.targetApplication}`, mode: 'actions', actions: [action] })}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{action.identityName}</span>
                      <Badge variant="outline" className="text-[10px]">{action.actionType}</Badge>
                      {action.slaBreached && <Badge variant="destructive" className="text-[10px]">SLA</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{action.blocker}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={cn("text-xs font-medium",
                      action.priority === 'critical' ? 'text-destructive' :
                      action.priority === 'high' ? 'text-amber-600' : 'text-muted-foreground'
                    )}>{action.daysPending}d</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Orphaned Accounts */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">Orphaned Account Detection</CardTitle>
                <InfoTooltip text="Accounts flagged as orphaned — no valid identity link. Critical risk accounts require immediate action." />
              </div>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setDrawerState({ open: true, onOpenChange: () => setDrawerState(null), title: 'All Orphaned Accounts', description: 'Complete orphaned account inventory', mode: 'accounts', accounts: orphanedAccounts })}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {orphanedAccounts.slice(0, 5).map(acc => (
                <div key={acc.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setDrawerState({ open: true, onOpenChange: () => setDrawerState(null), title: acc.accountName, description: `${acc.application} — ${acc.identityName}`, mode: 'accounts', accounts: [acc] })}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{acc.accountName}</span>
                      <Badge variant={acc.riskLevel === 'critical' ? 'destructive' : acc.riskLevel === 'high' ? 'secondary' : 'outline'} className="text-[10px]">{acc.riskLevel}</Badge>
                      <Badge variant="outline" className="text-[10px]">{acc.accountType}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{acc.application} • {acc.daysOrphaned}d orphaned</p>
                  </div>
                  {acc.riskLevel === 'critical' && <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Governance Sections (Collapsible) ── */}

      {/* JML Pipeline Health */}
      <Collapsible open={openSections.pipeline} onOpenChange={() => toggleSection('pipeline')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm">JML Pipeline Health</CardTitle>
                  <InfoTooltip text="Funnel visualization of joiner and leaver pipeline stages. Bottleneck stages with high counts indicate process failures." />
                </div>
                {openSections.pipeline ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Joiner Funnel */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                    <UserPlus className="h-3.5 w-3.5" /> Joiner Pipeline
                  </p>
                  <div className="space-y-2">
                    {jmlPipelineStages.filter(s => s.joinerCount > 0).map((stage, idx) => {
                      const maxCount = 70;
                      const width = (stage.joinerCount / maxCount) * 100;
                      return (
                        <div key={idx}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{stage.stage}</span>
                            <span className="font-medium">{stage.joinerCount}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-5 flex items-center">
                            <div className="h-5 rounded-full bg-emerald-500/70 flex items-center justify-center transition-all" style={{ width: `${width}%` }}>
                              {width > 20 && <span className="text-[10px] text-white font-medium">{stage.joinerCount}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Leaver Funnel */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                    <UserMinus className="h-3.5 w-3.5" /> Leaver Pipeline
                  </p>
                  <div className="space-y-2">
                    {jmlPipelineStages.filter(s => s.leaverCount > 0).map((stage, idx) => {
                      const maxCount = 24;
                      const width = (stage.leaverCount / maxCount) * 100;
                      return (
                        <div key={idx}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{stage.stage}</span>
                            <span className="font-medium">{stage.leaverCount}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-5 flex items-center">
                            <div className="h-5 rounded-full bg-destructive/60 flex items-center justify-center transition-all" style={{ width: `${width}%` }}>
                              {width > 30 && <span className="text-[10px] text-white font-medium">{stage.leaverCount}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Access Accumulation Monitor */}
      <Collapsible open={openSections.accumulation} onOpenChange={() => toggleSection('accumulation')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm">Access Accumulation Monitor</CardTitle>
                  <InfoTooltip text="Tracks entitlement growth for movers. Departments with >100% excess indicate access creep requiring cleanup." />
                </div>
                {openSections.accumulation ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="h-[250px] mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={accessAccumulationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    onClick={(data) => {
                      if (data?.activePayload?.[0]) {
                        setDrawerState({ open: true, onOpenChange: () => setDrawerState(null), title: 'Access Accumulation', description: 'Entitlement growth by department', mode: 'accumulation', accumulation: accessAccumulationData });
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="department" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="avgAtJoin" fill={COLORS.joiners} name="At Join" radius={[0, 0, 0, 0]} style={{ cursor: 'pointer' }} />
                    <Bar dataKey="avgCurrent" fill={COLORS.leavers} name="Current" radius={[4, 4, 0, 0]} style={{ cursor: 'pointer' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.joiners }} /> At Join
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.leavers }} /> Current
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {accessAccumulationData.filter(a => a.excessPercent > 100).map(a => (
                  <div key={a.department} className="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-center">
                    <p className="text-xs font-medium">{a.department}</p>
                    <p className="text-lg font-bold text-destructive">+{a.excessPercent}%</p>
                    <p className="text-[10px] text-muted-foreground">{a.identitiesAboveThreshold} identities &gt;150%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Compliance & Audit Readiness */}
      <Collapsible open={openSections.compliance} onOpenChange={() => toggleSection('compliance')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm">Compliance & Audit Readiness</CardTitle>
                  <InfoTooltip text="Lifecycle event audit trail completeness per compliance framework. Non-compliant frameworks require immediate remediation." />
                </div>
                {openSections.compliance ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {complianceAuditData.map(c => (
                  <div key={c.framework} className="rounded-lg border bg-card p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setDrawerState({ open: true, onOpenChange: () => setDrawerState(null), title: `${c.framework} Audit`, description: 'Lifecycle audit trail completeness', mode: 'compliance', compliance: [c] })}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{c.framework}</span>
                        <Badge variant={c.status === 'compliant' ? 'default' : c.status === 'at-risk' ? 'secondary' : 'destructive'} className="text-[10px]">{c.status}</Badge>
                      </div>
                      <span className={cn("text-lg font-bold", c.completeness >= 90 ? 'text-emerald-600' : c.completeness >= 80 ? 'text-amber-600' : 'text-destructive')}>{c.completeness}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mb-2">
                      <div className={cn("h-2 rounded-full", c.completeness >= 90 ? "bg-emerald-500" : c.completeness >= 80 ? "bg-amber-500" : "bg-destructive")} style={{ width: `${c.completeness}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{c.missingTrails} missing trails</span>
                      <span>Due: {c.nextDeadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Drilldown Drawer */}
      {drawerState && <LifecycleDrilldownDrawer {...drawerState} open={!!drawerState} onOpenChange={() => setDrawerState(null)} />}
    </div>
  );
};

export default LifecycleAnalytics;
