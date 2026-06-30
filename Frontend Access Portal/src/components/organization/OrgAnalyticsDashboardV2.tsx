import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrgNodeData } from '@/types/organization';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { OrgKpiDrilldownModal } from './OrgKpiDrilldownModal';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  Building2, Users, UserX, AlertTriangle, Eye, CheckCircle, ShieldAlert,
  TrendingUp, TrendingDown, ArrowUpRight, Minus, Brain,
} from 'lucide-react';
import { useCssVariable } from "@/hooks/useCssVariable";


interface OrgAnalyticsDashboardV2Props {
  data: OrgNodeData;
}

// Flatten org tree helper
function flattenOrg(node: OrgNodeData): OrgNodeData[] {
  const result: OrgNodeData[] = [node];
  if (node.children) node.children.forEach((c) => result.push(...flattenOrg(c)));
  return result;
}

// KPI config
const kpiTooltips: Record<string, string> = {
  totalUnits: 'Total count of organizational units (divisions, departments, teams) in the hierarchy.',
  totalIdentities: 'Count of all identity types (employees, non-employees, non-human) across organizational units. Breakdown helps detect over-reliance on contractors or unmanaged service accounts.',
  missingOwner: 'Units without an assigned business owner. Missing ownership is the #1 cause of ungoverned access in IGA programs.',
  highRisk: 'Units with a risk score above 65 or a "High" risk classification. These require immediate governance attention.',
  orphanExposure: 'Total orphan accounts (accounts without a linked identity) across all units. Orphan accounts represent untracked access.',
  reviewCoverage: 'Percentage of units that have active or recently completed access reviews. Low coverage indicates governance gaps.',
  complianceScore: 'Percentage of units meeting configured compliance controls. Calculated from individual unit compliance statuses.',
};

export function OrgAnalyticsDashboardV2({ data }: OrgAnalyticsDashboardV2Props) {
  const [drilldown, setDrilldown] = useState<{ key: string; open: boolean }>({ key: '', open: false });

  const allNodes = useMemo(() => flattenOrg(data), [data]);

  const primary = useCssVariable("--primary");
  const destructive = useCssVariable("--destructive");
  const muted = useCssVariable("--muted-foreground");
  const accent = useCssVariable("--warning");

  const analytics = useMemo(() => {
    const totalUnits = allNodes.length;
    const totalUsers = allNodes.reduce((s, n) => s + n.userCount, 0);
    const contractors = allNodes.reduce((s, n) => s + (n.contractorCount || 0), 0);
    const nonHuman = 400; // mock
    const employees = totalUsers - contractors - nonHuman;
    const missingOwner = allNodes.filter((n) => !n.head || n.head === '').length || 3; // mock 3 if all have heads
    const highRisk = allNodes.filter((n) => n.riskLevel === 'High' || (n.riskScore || 0) >= 65).length;
    const orphanTotal = allNodes.reduce((s, n) => s + (n.orphanAccountCount || 0), 0);
    const compliantCount = allNodes.filter((n) => n.complianceStatus === 'compliant').length;
    const reviewCoverage = Math.round((compliantCount / totalUnits) * 100);
    const complianceScore = Math.round((compliantCount / totalUnits) * 100);

    return { totalUnits, totalUsers, employees, contractors, nonHuman, missingOwner, highRisk, orphanTotal, reviewCoverage, complianceScore, compliantCount };
  }, [allNodes]);

  // Mock drilldown data
  const getDrilldownData = (key: string) => {
    const unitItems = allNodes.map((n) => ({
      id: n.id,
      name: n.name,
      type: n.type,
      status: n.complianceStatus || 'unknown',
      detail: `${n.userCount} users, Risk: ${n.riskScore || 0}`,
      severity: (n.riskLevel === 'High' ? 'high' : n.riskLevel === 'Medium' ? 'medium' : 'low') as 'high' | 'medium' | 'low',
    }));

    const configs: Record<string, { title: string; desc: string; items: typeof unitItems; factors: string[]; actions: string[] }> = {
      totalUnits: { title: 'All Organizational Units', desc: 'Complete list of organizational units in the hierarchy.', items: unitItems, factors: [], actions: [] },
      totalIdentities: { title: 'Identity Distribution', desc: 'Breakdown of identity types across units.', items: unitItems, factors: [`${analytics.contractors} contractors across ${allNodes.filter((n) => (n.contractorCount || 0) > 0).length} units`, `${analytics.nonHuman} non-human identities (service accounts)`], actions: ['Review contractor sponsorship health', 'Audit non-human identity ownership'] },
      missingOwner: { title: 'Units with Missing Owner', desc: 'These units lack a verified business owner.', items: unitItems.filter((_, i) => i < 3), factors: ['Owner field empty or owner identity inactive', 'No backup owner assigned'], actions: ['Assign owners to all flagged units', 'Enable automated owner verification'] },
      highRisk: { title: 'High Risk Units', desc: 'Units classified as high risk based on policy violations, privileged access density, and orphan accounts.', items: unitItems.filter((i) => i.severity === 'high'), factors: ['SoD violations exceeding threshold', 'High privileged user density', 'Unmanaged application access'], actions: ['Launch targeted access review', 'Investigate SoD conflicts', 'Reduce privileged access'] },
      orphanExposure: { title: 'Orphan Account Exposure', desc: 'Orphan accounts mapped to organizational units.', items: allNodes.filter((n) => (n.orphanAccountCount || 0) > 0).map((n) => ({ id: n.id, name: n.name, type: n.type, status: 'Orphaned', detail: `${n.orphanAccountCount} orphan accounts`, severity: ((n.orphanAccountCount || 0) > 20 ? 'high' : 'medium') as 'high' | 'medium' })), factors: ['Identities terminated without access removal', 'Disconnected HR feeds'], actions: ['Run orphan account cleanup campaign', 'Validate HR-IAM connector sync'] },
      reviewCoverage: { title: 'Access Review Coverage', desc: 'Which units have active or recently completed access reviews.', items: unitItems, factors: ['Units without scheduled campaigns', 'Overdue review cycles'], actions: ['Schedule reviews for uncovered units', 'Set up recurring review campaigns'] },
      complianceScore: { title: 'Compliance Score Breakdown', desc: 'Units meeting configured governance controls.', items: unitItems, factors: ['Non-compliant units pulling score down', 'Warning status units at risk of breach'], actions: ['Address non-compliant units first', 'Convert warning units to compliant'] },
    };
    return configs[key] || configs.totalUnits;
  };

  // --- Chart data ---
  const ownershipData = [
    { name: 'Owned', value: analytics.totalUnits - 3, fill: primary },
    { name: 'Missing Owner', value: 2, fill: destructive },
    { name: 'Unverified', value: 1, fill: muted },
  ];
  const riskConcentration = allNodes
    .filter((n) => n.type === 'Division' || n.type === 'Department')
    .map((n) => ({
      name: n.name.length > 12 ? n.name.substring(0, 12) + '…' : n.name,
      SoD: n.sodViolationCount || 0,
      Privileged: n.privilegedUserCount || 0,
      Dormant: n.dormantAccountCount || 0,
      Orphan: n.orphanAccountCount || 0,
    }));

  const appCoverage = allNodes
    .filter((n) => n.type === 'Division' || n.type === 'Department')
    .map((n) => ({
      name: n.name.length > 12 ? n.name.substring(0, 12) + '…' : n.name,
      managed: n.applicationCount || Math.floor(n.userCount * 0.01) + 2,
      unmanaged: Math.floor(Math.random() * 4) + 1,
    }));

  const reviewByUnit = allNodes
    .filter((n) => n.type === 'Division' || n.type === 'Department')
    .map((n) => ({
      name: n.name.length > 12 ? n.name.substring(0, 12) + '…' : n.name,
      Active: n.complianceStatus === 'compliant' ? 1 : 0,
      Overdue: n.complianceStatus === 'warning' ? 1 : 0,
      'Not Scheduled': n.complianceStatus === 'non-compliant' ? 1 : 0,
    }));

  const maturityData = [
    { subject: 'Role Adoption', value: 72 },
    { subject: 'Direct Reduction', value: 58 },
    { subject: 'Ownership', value: 65 },
    { subject: 'Certification', value: 48 },
    { subject: 'Classification', value: 70 },
    { subject: 'SoD Alignment', value: 55 },
  ];

  const kpis = [
    { key: 'totalUnits', label: 'Total Units', value: analytics.totalUnits, icon: Building2, trend: '+2', trendUp: true, sub: 'Across all divisions' },
    { key: 'totalIdentities', label: 'Total Identities', value: analytics.totalUsers.toLocaleString(), icon: Users, trend: '+120', trendUp: true, sub: `${analytics.employees.toLocaleString()} emp · ${analytics.contractors} non-emp · ${analytics.nonHuman} non-human` },
    { key: 'missingOwner', label: 'Missing Owner', value: analytics.missingOwner, icon: UserX, trend: '-1', trendUp: false, sub: 'Units without verified owner', destructive: true },
    { key: 'highRisk', label: 'High Risk Units', value: analytics.highRisk, icon: AlertTriangle, trend: '0', trendUp: false, sub: 'Require immediate attention', destructive: true },
    { key: 'orphanExposure', label: 'Orphan Exposure', value: analytics.orphanTotal, icon: Eye, trend: '-8', trendUp: false, sub: 'Orphan accounts across units' },
    { key: 'reviewCoverage', label: 'Review Coverage', value: `${analytics.reviewCoverage}%`, icon: CheckCircle, trend: '+5%', trendUp: true, sub: `${analytics.compliantCount} of ${analytics.totalUnits} units covered` },
    { key: 'complianceScore', label: 'Compliance Score', value: `${analytics.complianceScore}%`, icon: ShieldAlert, trend: '+3%', trendUp: true, sub: 'Units meeting controls' },
  ];

  const currentDrilldown = getDrilldownData(drilldown.key);

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon

          return (
            <Card
              key={kpi.key}
              className="cursor-pointer transition-all hover:shadow-md hover:bg-muted/40"
              onClick={() => setDrilldown({ key: kpi.key, open: true })}
            >
              <CardContent className="p-3 space-y-2">

                {/* header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-muted-foreground truncate">
                      {kpi.label}
                    </span>
                    <InfoTooltip text={kpiTooltips[kpi.key]} />
                  </div>

                  <Icon
                    className={`h-3.5 w-3.5 shrink-0 ${kpi.destructive
                        ? "text-destructive"
                        : "text-muted-foreground"
                      }`}
                  />
                </div>

                {/* value */}
                <div
                  className={`text-xl font-bold tracking-tight ${kpi.destructive && Number(kpi.value) > 0
                      ? "text-destructive"
                      : "text-foreground"
                    }`}
                >
                  {kpi.value}
                </div>

                {/* footer */}
                <div className="flex items-center justify-between text-xs">

                  <span className="text-muted-foreground truncate">
                    {kpi.sub}
                  </span>

                  <div
                    className={`flex items-center gap-0.5 ${kpi.trend === "0"
                        ? "text-muted-foreground"
                        : kpi.trendUp
                          ? "text-emerald-600"
                          : "text-destructive"
                      }`}
                  >
                    {kpi.trend === "0" ? (
                      <Minus className="h-3 w-3" />
                    ) : kpi.trendUp ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}

                    <span>{kpi.trend}</span>
                  </div>

                </div>

              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Section A & B */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. Ownership & Accountability */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Ownership & Accountability</CardTitle>
              <InfoTooltip text="Shows which units have verified owners. Missing ownership is the #1 cause of ungoverned access in IGA programs." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ownershipData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} onClick={(entry: any) => setDrilldown({ key: entry.name === 'Missing Owner' ? 'missingOwner' : 'totalUnits', open: true })} className="cursor-pointer">
                  {ownershipData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-1.5">
              {[
                { unit: 'Infrastructure', owner: 'Pepper Potts', backup: 'James Rhodes', attested: '2024-10-15', tasks: 2 },
                { unit: 'Accounting', owner: '—', backup: '—', attested: '—', tasks: 5 },
                { unit: 'DevOps', owner: 'Maria Hill', backup: '—', attested: '2024-11-01', tasks: 1 },
              ].map((row) => (
                <div key={row.unit} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
                  <span className="font-medium w-24">{row.unit}</span>
                  <span className="text-muted-foreground w-24">{row.owner}</span>
                  <span className="text-muted-foreground w-24">{row.backup}</span>
                  <span className="text-muted-foreground w-20">{row.attested}</span>
                  <Badge variant={row.tasks > 3 ? 'destructive' : 'secondary'} className="text-xs">{row.tasks} tasks</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* B. Access Risk Concentration */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Access Risk Concentration</CardTitle>
              <InfoTooltip text="Distribution of risk categories across units. High concentrations indicate governance blind spots requiring targeted remediation." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={riskConcentration}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px' }} />
                <Legend />
                <Bar dataKey="SoD" stackId="a" fill={destructive} name="SoD Violations" onClick={() => setDrilldown({ key: 'highRisk', open: true })} className="cursor-pointer" />
                <Bar dataKey="Privileged" stackId="a" fill={primary} name="Privileged" onClick={() => setDrilldown({ key: 'highRisk', open: true })} className="cursor-pointer" />
                <Bar dataKey="Dormant" stackId="a" fill={muted} name="Dormant" onClick={() => setDrilldown({ key: 'orphanExposure', open: true })} className="cursor-pointer" />
                <Bar dataKey="Orphan" stackId="a" fill={accent} name="Orphan" onClick={() => setDrilldown({ key: 'orphanExposure', open: true })} className="cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Section C: JML Health */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Joiner-Mover-Leaver Health</CardTitle>
            <InfoTooltip text="Tracks lifecycle governance health: movers with access drift, leavers with remaining access, and non-employee sponsorship gaps." />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Movers with Access Drift', value: 18, desc: 'Recent org move, access not adjusted', severity: 'high' as const },
              { label: 'Leavers with Remaining Access', value: 12, desc: 'Terminated but access persists', severity: 'critical' as const },
              { label: 'Missing Sponsors', value: 5, desc: 'Non-employee without active sponsor', severity: 'medium' as const },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-lg border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors" onClick={() => setDrilldown({ key: item.label === 'Movers with Access Drift' ? 'totalIdentities' : item.label === 'Leavers with Remaining Access' ? 'orphanExposure' : 'missingOwner', open: true })}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{item.label}</span>
                  <Badge variant={item.severity === 'critical' ? 'destructive' : item.severity === 'high' ? 'destructive' : 'secondary'}>
                    {item.value}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section D & E */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* D. Application & Access Coverage */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Application & Access Coverage</CardTitle>
              <InfoTooltip text="Applications mapped per unit. Units with unmanaged applications represent governance gaps where access is granted without catalog or connector coverage." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={appCoverage}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px' }} />
                <Legend />
                <Bar dataKey="managed" fill={primary} name="Managed" radius={[4, 4, 0, 0]} onClick={() => setDrilldown({ key: 'totalUnits', open: true })} className="cursor-pointer" />
                <Bar dataKey="unmanaged" fill={destructive} name="Unmanaged" radius={[4, 4, 0, 0]} onClick={() => setDrilldown({ key: 'highRisk', open: true })} className="cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* E. Governance Execution */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Governance Execution</CardTitle>
              <InfoTooltip text="Review and certification status by unit. Active reviews indicate governed units; overdue or unscheduled reviews indicate governance gaps." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reviewByUnit}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px' }} />
                <Legend />
                <Bar dataKey="Active" fill={primary} name="Active" stackId="s" onClick={() => setDrilldown({ key: 'reviewCoverage', open: true })} className="cursor-pointer" />
                <Bar dataKey="Overdue" fill={destructive} name="Overdue" stackId="s" onClick={() => setDrilldown({ key: 'reviewCoverage', open: true })} className="cursor-pointer" />
                <Bar dataKey="Not Scheduled" fill={muted} name="Not Scheduled" stackId="s" onClick={() => setDrilldown({ key: 'reviewCoverage', open: true })} className="cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom: Maturity Radar + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Access Model Maturity */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Access Model Maturity</CardTitle>
              <InfoTooltip text="System-generated maturity indicator across 6 governance dimensions. Higher coverage across all dimensions indicates a well-governed identity environment." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={maturityData}>
                <PolarGrid className="stroke-muted" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Maturity" dataKey="value" stroke={primary} fill={primary} fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="text-center mt-2">
              <span className="text-2xl font-bold">61%</span>
              <span className="text-sm text-muted-foreground ml-2">Overall Maturity Score</span>
            </div>
          </CardContent>
        </Card>

        {/* AI Governance Insights */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">AI Governance Insights</CardTitle>
              <InfoTooltip text="Automatically generated organizational governance insights based on analysis of ownership, risk concentration, lifecycle health, and compliance patterns." />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { severity: 'high' as const, text: 'Accounting unit has 82% risk score with no verified owner. This is the highest governance risk in the organization.', action: 'Assign owner & launch review' },
                { severity: 'high' as const, text: '12 leavers retain active access across 4 units. Average days since termination: 23 days.', action: 'Run leaver cleanup campaign' },
                { severity: 'medium' as const, text: 'Infrastructure has 40 privileged users — 10% of headcount. Industry benchmark is under 5%.', action: 'Review privileged access' },
                { severity: 'medium' as const, text: '3 units have unmanaged applications with no connector or entitlement cataloging.', action: 'Onboard unmanaged apps' },
                { severity: 'low' as const, text: 'Engineering division health score improved from 72 to 80 since last quarter. Role adoption is driving improvement.', action: 'View trend' },
              ].map((insight, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                  <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${insight.severity === 'high' ? 'text-destructive' : insight.severity === 'medium' ? 'text-amber-500' : 'text-emerald-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{insight.text}</p>
                    <button className="text-xs text-primary mt-1 flex items-center gap-1 hover:underline">
                      <ArrowUpRight className="h-3 w-3" /> {insight.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drilldown Modal */}
      <OrgKpiDrilldownModal
        open={drilldown.open}
        onOpenChange={(open) => setDrilldown((prev) => ({ ...prev, open }))}
        title={currentDrilldown.title}
        description={currentDrilldown.desc}
        items={currentDrilldown.items}
        contributingFactors={currentDrilldown.factors}
        recommendedActions={currentDrilldown.actions}
      />
    </div>
  );
}
