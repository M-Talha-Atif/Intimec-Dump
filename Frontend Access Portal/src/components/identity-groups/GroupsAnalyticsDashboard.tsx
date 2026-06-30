import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { UsersRound, Layers, UserX, AppWindow, Clock, TrendingUp, CheckCircle, XCircle, Shield } from 'lucide-react';
import { IdentityGroup } from '@/services/groups';
import { GroupKpiDrilldownModal } from './GroupKpiDrilldownModal';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { useCssVariable } from '@/hooks/useCssVariable';
import { getRiskBadgeClass } from '@/utils/getRiskColor';
import { privileges } from '../entitlements/data/mock-users';

interface GroupsAnalyticsDashboardProps {
  groups: IdentityGroup[];
}

// const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
const RISK_COLORS = { high: 'hsl(0, 84%, 60%)', medium: 'hsl(45, 93%, 47%)', low: 'hsl(142, 71%, 45%)' };

export default function GroupsAnalyticsDashboard({ groups }: GroupsAnalyticsDashboardProps) {
  const [drilldown, setDrilldown] = useState<{ title: string; description: string; groups: IdentityGroup[] } | null>(null);

  const primaryColor = useCssVariable('--primary');
  // use the useCssvariable for const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
  const COLORS = [primaryColor, 'hsl(var(--chart-2))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const staticGroups = groups.filter(g => g.type === 'static');
  const dynamicGroups = groups.filter(g => g.type === 'dynamic');
  const unownedGroups = groups.filter(g => g.owners.length === 0);
  const usedInApps = groups.filter(g => g.usedIn.length > 0);
  const notReviewed = groups.filter(g => {
    const lastDate = g.updatedAt || g.createdAt;
    return (Date.now() - new Date(lastDate).getTime()) > 90 * 24 * 60 * 60 * 1000;
  });
  const excessiveGrowth = groups.filter(g => g.memberCount > 30);
  const highRisk = groups.filter(g => g.riskLevel === 'high');
  const mediumRisk = groups.filter(g => g.riskLevel === 'medium');
  const lowRisk = groups.filter(g => g.riskLevel === 'low');

  const kpis = [
    { label: 'Total Identity Groups', value: groups.length, icon: UsersRound, color: 'text-primary', tooltip: 'Total number of identity groups governing access across the organization. Groups bundle identities for efficient access management.', filter: () => setDrilldown({ title: 'All Identity Groups', description: 'Complete list of identity groups', groups }) },
    { label: 'Static / Dynamic', value: `${staticGroups.length} / ${dynamicGroups.length}`, icon: Layers, color: 'text-chart-2', tooltip: 'Static groups have manually managed membership. Dynamic groups auto-populate based on rules (e.g., department, job title). A healthy mix reduces manual overhead.', filter: () => setDrilldown({ title: 'Static vs Dynamic Groups', description: 'All groups by type', groups }) },
    { label: 'Groups Without Owners', value: unownedGroups.length, icon: UserX, color: 'text-destructive', tooltip: 'Groups lacking an assigned owner have no one accountable for membership accuracy or certification. This is a critical governance gap flagged in audits.', filter: () => setDrilldown({ title: 'Unowned Groups', description: 'Groups with no assigned owner', groups: unownedGroups }) },
    { label: 'Used in Applications', value: usedInApps.length, icon: AppWindow, color: 'text-chart-3', tooltip: 'Groups actively linked to applications for access provisioning. Groups not used in any application may be orphaned and should be reviewed for cleanup.', filter: () => setDrilldown({ title: 'Groups Used in Applications', description: 'Groups linked to at least one application', groups: usedInApps }) },
    { label: 'Not Reviewed (90d)', value: notReviewed.length, icon: Clock, color: 'text-chart-4', tooltip: 'Groups not reviewed in the last 90 days may contain stale memberships or outdated access rights. Regular reviews are required for SOX, ISO 27001, and SOC 2 compliance.', filter: () => setDrilldown({ title: 'Groups Not Reviewed', description: 'Groups not updated in the last 90 days', groups: notReviewed }) },
    { label: 'Excessive Membership', value: excessiveGrowth.length, icon: TrendingUp, color: 'text-chart-5', tooltip: 'Groups with more than 30 members may indicate overly broad access grants. Large groups increase blast radius in the event of a compromise and should be segmented.', filter: () => setDrilldown({ title: 'Large Groups', description: 'Groups with more than 30 members', groups: excessiveGrowth }) },
  ];

  const typeData = [
    { name: 'Static', value: staticGroups.length },
    { name: 'Dynamic', value: dynamicGroups.length },
  ];

  const riskData = [
    { name: 'High', value: highRisk.length },
    { name: 'Medium', value: mediumRisk.length },
    { name: 'Low', value: lowRisk.length },
  ];

  const deptData = [
    { name: 'Engineering', count: 2 },
    { name: 'Sales', count: 1 },
    { name: 'IT', count: 1 },
    { name: 'Finance', count: 1 },
    { name: 'Security', count: 1 },
    { name: 'Cross-Func', count: 2 },
  ];

  const trendData = [
    { month: 'Sep', members: 145 },
    { month: 'Oct', members: 158 },
    { month: 'Nov', members: 162 },
    { month: 'Dec', members: 175 },
    { month: 'Jan', members: 188 },
    { month: 'Feb', members: 201 },
  ];

  // Removed local InfoTip — using shared InfoTooltip component

  return (
    <div className="space-y-6 pt-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={kpi.filter}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                <InfoTooltip text={kpi.tooltip} />
              </div>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Type + Dept */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-1.5">Static vs Dynamic Distribution <InfoTooltip text="Shows the balance between manually managed (static) and rule-based (dynamic) groups. Organizations should aim to increase dynamic groups to reduce manual overhead and errors." /></CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {typeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-1.5">Department Distribution <InfoTooltip text="How groups are distributed across departments. Uneven distribution may indicate over-provisioning in some areas or missing group coverage in others." /></CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill={primaryColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right: Risk + Trend */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-1.5">Risk Distribution <InfoTooltip text="Aggregated risk levels across all groups. High-risk groups typically contain privileged access or lack proper governance controls like ownership and certification." /></CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={riskData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    <Cell fill={RISK_COLORS.high} />
                    <Cell fill={RISK_COLORS.medium} />
                    <Cell fill={RISK_COLORS.low} />
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-1.5">Membership Growth Trend <InfoTooltip text="Tracks total group membership over time. Rapid growth without corresponding reviews may indicate access creep, a common audit finding." /></CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="members" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Governance Maturity Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-1.5">Governance Maturity Overview <InfoTooltip text="Per-group governance scorecard. Green indicators show proper controls are in place; red flags highlight gaps that need immediate attention for compliance readiness." /></CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">Owner</TableHead>
                <TableHead className="text-center">Certified</TableHead>
                <TableHead className="text-center">Apps</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Rule Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map(g => {
                const hasCert = !!(g.updatedAt && (Date.now() - new Date(g.updatedAt).getTime()) < 90 * 24 * 60 * 60 * 1000);
                return (
                  <TableRow key={g.id}>
                    <TableCell className="font-medium">{g.name}</TableCell>
                    <TableCell><Badge variant={g.type === 'dynamic' ? 'default' : 'secondary'}>{g.type}</Badge></TableCell>
                    <TableCell className="text-center">{g.owners.length > 0 ? <CheckCircle className="h-4 w-4 text-green-600 mx-auto" /> : <XCircle className="h-4 w-4 text-destructive mx-auto" />}</TableCell>
                    <TableCell className="text-center">{hasCert ? <CheckCircle className="h-4 w-4 text-green-600 mx-auto" /> : <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />}</TableCell>
                    <TableCell className="text-center">{g.usedIn.length}</TableCell>
                    <TableCell>
                      <Badge className={getRiskBadgeClass(g.riskLevel)}>
                        {g.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {g.type === 'dynamic' ? (
                        <Badge variant="outline" className="text-xs">{g.rules && g.rules.length > 0 ? 'Valid' : 'No Rules'}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {drilldown && (
        <GroupKpiDrilldownModal
          isOpen={!!drilldown}
          onClose={() => setDrilldown(null)}
          title={drilldown.title}
          description={drilldown.description}
          groups={drilldown.groups}
        />
      )}
    </div>
  );
}
