"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InfoTooltip from "@/components/dashboard/InfoTooltip";
import CatalogKpiDrilldownModal, { KpiDrilldownItem } from "@/components/access-catalog/modals/CatalogKpiDrilldownModal";
import CatalogChartDrilldownModal from "@/components/access-catalog/modals/CatalogChartDrilldownModal";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import {
  Shield, Users, Layers, AlertTriangle, Link2, Target,
  TrendingUp, TrendingDown, ArrowRight, Sparkles, Eye,
  UserX, ShieldAlert, GitBranch, Zap, Brain
} from "lucide-react";
import { useCssVariable } from "@/hooks/useCssVariable";

// ── Mock Data ──

const kpis = [
  {
    id: "role-coverage",
    label: "Role Coverage Ratio",
    value: "73%",
    trend: "+4%",
    trendUp: true,
    icon: Shield,
    tooltip: "Percentage of access delivered through governed roles rather than manual assignments. Higher values indicate stronger identity governance maturity.",
    drilldown: {
      title: "Role Coverage Breakdown",
      description: "Identities receiving access through roles vs direct assignment",
      items: [
        { id: "1", name: "Engineering Dept", detail: "89% role-based coverage", badge: "High", badgeVariant: "default" as const },
        { id: "2", name: "Sales Dept", detail: "71% role-based coverage", badge: "Medium", badgeVariant: "secondary" as const },
        { id: "3", name: "Finance Dept", detail: "62% role-based coverage", badge: "Low", badgeVariant: "destructive" as const },
        { id: "4", name: "Marketing Dept", detail: "78% role-based coverage", badge: "Medium", badgeVariant: "secondary" as const },
        { id: "5", name: "HR Dept", detail: "55% role-based coverage", badge: "Low", badgeVariant: "destructive" as const },
      ],
    },
  },
  {
    id: "direct-exposure",
    label: "Direct Access Exposure",
    value: "142",
    trend: "-12",
    trendUp: false,
    icon: UserX,
    tooltip: "Number of identities receiving entitlements outside the role model through direct assignments. Reducing this number strengthens governance posture.",
    drilldown: {
      title: "Direct Access Exposure",
      description: "Identities with entitlements assigned outside role governance",
      items: [
        { id: "1", name: "john.smith@corp.com", detail: "AWS Admin — direct assignment, no role", badge: "Critical", badgeVariant: "destructive" as const },
        { id: "2", name: "svc-deploy-01", detail: "Kubernetes Cluster Admin — direct", badge: "High", badgeVariant: "destructive" as const },
        { id: "3", name: "jane.doe@corp.com", detail: "Salesforce Export — direct assignment", badge: "Medium", badgeVariant: "secondary" as const },
        { id: "4", name: "api-gateway-prod", detail: "Database Write — direct", badge: "High", badgeVariant: "destructive" as const },
      ],
    },
  },
  {
    id: "role-complexity",
    label: "Role Complexity Index",
    value: "8.4",
    trend: "+0.6",
    trendUp: true,
    icon: Layers,
    tooltip: "Average number of entitlements bundled per role. High values often indicate over-engineered or risky roles that should be decomposed.",
    drilldown: {
      title: "Most Complex Roles",
      description: "Roles with highest entitlement count",
      items: [
        { id: "1", name: "Super Admin", detail: "34 entitlements across 8 apps", badge: "Critical", badgeVariant: "destructive" as const },
        { id: "2", name: "DevOps Lead", detail: "22 entitlements across 6 apps", badge: "High", badgeVariant: "destructive" as const },
        { id: "3", name: "Platform Engineer", detail: "18 entitlements across 5 apps", badge: "High", badgeVariant: "destructive" as const },
        { id: "4", name: "Security Analyst", detail: "15 entitlements across 4 apps", badge: "Medium", badgeVariant: "secondary" as const },
      ],
    },
  },
  {
    id: "orphaned-access",
    label: "Orphaned Access Objects",
    value: "31",
    trend: "+5",
    trendUp: true,
    icon: AlertTriangle,
    tooltip: "Roles or entitlements without a designated governance owner. These objects cannot be certified and represent unmanaged access risk.",
    drilldown: {
      title: "Orphaned Access Objects",
      description: "Roles and entitlements without assigned owners",
      items: [
        { id: "1", name: "Legacy Reporting Role", detail: "No owner since Jan 2024", badge: "Role", badgeVariant: "outline" as const },
        { id: "2", name: "Temp Contractor Access", detail: "Owner left organization", badge: "Role", badgeVariant: "outline" as const },
        { id: "3", name: "S3 Bucket Write (prod-data)", detail: "No entitlement owner", badge: "Entitlement", badgeVariant: "secondary" as const },
        { id: "4", name: "DB Admin (finance-db)", detail: "No entitlement owner", badge: "Entitlement", badgeVariant: "secondary" as const },
      ],
    },
  },
  {
    id: "toxic-access",
    label: "Toxic Access Candidates",
    value: "7",
    trend: "+2",
    trendUp: true,
    icon: ShieldAlert,
    tooltip: "Roles containing entitlements that create Separation of Duties violations when combined. These roles must be decomposed to eliminate inherent policy conflicts.",
    drilldown: {
      title: "Toxic Access Candidates",
      description: "Roles with built-in SoD conflicts",
      items: [
        { id: "1", name: "Finance Manager", detail: "Approve + Execute payments", badge: "SoD Violation", badgeVariant: "destructive" as const },
        { id: "2", name: "HR Admin Plus", detail: "Create + Approve employee records", badge: "SoD Violation", badgeVariant: "destructive" as const },
        { id: "3", name: "Procurement Lead", detail: "Create PO + Approve PO", badge: "SoD Violation", badgeVariant: "destructive" as const },
      ],
    },
  },
  {
    id: "access-reuse",
    label: "Access Reuse Score",
    value: "64%",
    trend: "+8%",
    trendUp: true,
    icon: Target,
    tooltip: "Measures how well roles are standardized and reused across the organization. Higher scores mean less role sprawl and more consistent access models.",
    drilldown: {
      title: "Role Reuse Analysis",
      description: "Role standardization and reuse metrics by department",
      items: [
        { id: "1", name: "Engineering", detail: "82% reuse — 6 standard roles", badge: "Strong", badgeVariant: "default" as const },
        { id: "2", name: "Sales", detail: "71% reuse — 4 standard roles", badge: "Good", badgeVariant: "secondary" as const },
        { id: "3", name: "Finance", detail: "45% reuse — 12 custom roles", badge: "Weak", badgeVariant: "destructive" as const },
        { id: "4", name: "Operations", detail: "58% reuse — 8 custom roles", badge: "Medium", badgeVariant: "secondary" as const },
      ],
    },
  },
];

const grantSourceData = [
  { name: "Business Roles", value: 42, color: "hsl(var(--chart-1))" }, // blue color
  { name: "Technical Roles", value: 21, color: "hsl(var(--chart-2))" }, // green color
  { name: "Direct Assignment", value: 18, color: "hsl(var(--chart-5))" }, // red color
  { name: "Dynamic Rules", value: 9, color: "hsl(var(--chart-4))" }, // yellow color
  { name: "Groups", value: 7, color: "hsl(var(--chart-5))" }, // red color
  { name: "Exceptions", value: 3, color: "hsl(var(--chart-3))" }, // purple color
];

const grantSourceDrilldowns: Record<string, KpiDrilldownItem[]> = {
  "Business Roles": [
    { id: "1", name: "Sales Representative", detail: "328 identities — Salesforce, HubSpot", badge: "Active" },
    { id: "2", name: "Finance Analyst", detail: "142 identities — SAP, Oracle", badge: "Active" },
    { id: "3", name: "Engineering IC", detail: "256 identities — GitHub, AWS, Jira", badge: "Active" },
  ],
  "Direct Assignment": [
    { id: "1", name: "john.smith@corp.com", detail: "AWS Admin — no governing role", badge: "Risk", badgeVariant: "destructive" },
    { id: "2", name: "svc-deploy-01", detail: "K8s Cluster Admin — direct grant", badge: "Risk", badgeVariant: "destructive" },
    { id: "3", name: "contractor-ext-04", detail: "DB Read — temporary direct", badge: "Review", badgeVariant: "secondary" },
  ],
};

const propagationHeatmap = [
  { app: "Salesforce", entitlements: 48, roles: 12, users: 328, risk: "Medium" },
  { app: "AWS", entitlements: 86, roles: 18, users: 245, risk: "Critical" },
  { app: "SAP", entitlements: 62, roles: 15, users: 189, risk: "High" },
  { app: "GitHub", entitlements: 34, roles: 8, users: 312, risk: "Low" },
  { app: "ServiceNow", entitlements: 41, roles: 11, users: 156, risk: "Medium" },
  { app: "Oracle DB", entitlements: 29, roles: 7, users: 98, risk: "High" },
];

const appDependencyData = [
  { app: "AWS", sharedRoles: 18, shadowPaths: 4 },
  { app: "SAP", sharedRoles: 15, shadowPaths: 3 },
  { app: "Salesforce", sharedRoles: 12, shadowPaths: 2 },
  { app: "ServiceNow", sharedRoles: 11, shadowPaths: 1 },
  { app: "GitHub", sharedRoles: 8, shadowPaths: 3 },
  { app: "Oracle DB", sharedRoles: 7, shadowPaths: 2 },
];

const maturityData = [
  { dimension: "Role Adoption", score: 73 },
  { dimension: "Direct Reduction", score: 58 },
  { dimension: "Ownership", score: 65 },
  { dimension: "Certification", score: 82 },
  { dimension: "Classification", score: 71 },
  { dimension: "SoD Alignment", score: 54 },
];

const roleQualityMetrics = [
  { label: "Roles with excessive entitlement sprawl", value: 12, icon: Layers, badge: "High Risk", badgeVariant: "destructive" as const },
  { label: "Single-use roles", value: 18, icon: Target, badge: "Cleanup", badgeVariant: "secondary" as const },
  { label: "Roles bypassing SoD policies", value: 7, icon: ShieldAlert, badge: "Critical", badgeVariant: "destructive" as const },
  { label: "Users with multi-path access", value: 89, icon: GitBranch, badge: "Investigate", badgeVariant: "secondary" as const },
  { label: "Non-human identities with business roles", value: 14, icon: Zap, badge: "Review", badgeVariant: "secondary" as const },
];

const ownershipMetrics = [
  { label: "Roles without owners", value: 19, badge: "Unmanaged", badgeVariant: "destructive" as const },
  { label: "Entitlements without cert owners", value: 12, badge: "At Risk", badgeVariant: "destructive" as const },
  { label: "Apps with unmanaged entitlements", value: 4, badge: "Gap", badgeVariant: "secondary" as const },
  { label: "Review coverage vs role population", value: "78%", badge: "Good", badgeVariant: "default" as const },
];

const aiInsights = [
  { icon: Brain, text: "23% of entitlements bypass role governance — direct assignments increasing in Finance department.", severity: "warning" as const },
  { icon: AlertTriangle, text: "One role (Super Admin) grants access to 12 critical applications — recommend decomposition.", severity: "critical" as const },
  { icon: Zap, text: "14 service accounts inherit human business roles — creating privilege escalation risk.", severity: "critical" as const },
  { icon: TrendingUp, text: "Access model shows role explosion pattern: 18 single-use roles created in last quarter.", severity: "warning" as const },
  { icon: Link2, text: "Salesforce access indirectly grants AWS privileges through shared DevOps role inheritance.", severity: "critical" as const },
  { icon: Eye, text: "Role coverage improved 4% this quarter — Engineering department leading adoption at 89%.", severity: "info" as const },
];

// ── Access Flow Visualization ──

const flowLayers = [
  { label: "Identities", count: 1247, color: "hsl(var(--primary))", items: ["Engineering (312)", "Sales (284)", "Finance (189)", "Others (462)"] },
  { label: "Business Roles", count: 48, color: "hsl(var(--chart-2))", items: ["Sales Rep", "Finance Analyst", "Engineer IC", "Manager"] },
  { label: "Technical Roles", count: 86, color: "hsl(var(--chart-4))", items: ["AWS Admin", "DB Read", "API Access", "Deploy"] },
  { label: "Entitlements", count: 312, color: "hsl(var(--chart-5))", items: ["S3 Write", "DB Admin", "API Gateway", "K8s Deploy"] },
  { label: "Applications", count: 15, color: "hsl(var(--chart-3))", items: ["AWS", "Salesforce", "SAP", "GitHub", "ServiceNow"] },
];

// ── Component ──

export const AccessCatalogAnalyticsDashboard = () => {
  const [kpiModal, setKpiModal] = useState<{ title: string; description?: string; items: KpiDrilldownItem[] } | null>(null);
  const [chartModal, setChartModal] = useState<{ title: string; segmentLabel: string; segmentColor?: string; items: KpiDrilldownItem[] } | null>(null);

  const riskColor = (risk: string) => {
    switch (risk) {
      case "Critical": return "text-destructive";
      case "High": return "text-orange-500";
      case "Medium": return "text-yellow-500";
      case "Low": return "text-green-500";
      default: return "text-muted-foreground";
    }
  };
  const primaryColor = useCssVariable("--primary");

  return (
    <div className="space-y-6">
      {/* ── Tier 1: Governance KPIs ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.id}
              className="cursor-pointer hover:shadow-md transition-all"
              onClick={() => setKpiModal(kpi.drilldown)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-muted-foreground truncate">
                      {kpi.label}
                    </span>
                    <InfoTooltip text={kpi.tooltip} />
                  </div>

                  <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </div>

                <div className="text-xl font-bold text-foreground">
                  {typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}
                </div>

                <div className="flex items-center gap-1 mt-1">
                  {kpi.trendUp ? (
                    <TrendingUp
                      className={`h-3 w-3 ${kpi.id === "direct-exposure" ||
                          kpi.id === "orphaned-access" ||
                          kpi.id === "toxic-access"
                          ? "text-destructive"
                          : "text-green-500"
                        }`}
                    />
                  ) : (
                    <TrendingDown
                      className={`h-3 w-3 ${kpi.id === "direct-exposure" ||
                          kpi.id === "orphaned-access" ||
                          kpi.id === "toxic-access"
                          ? "text-green-500"
                          : "text-destructive"
                        }`}
                    />
                  )}

                  <span
                    className={`text-xs ${kpi.id === "direct-exposure" ||
                        kpi.id === "orphaned-access" ||
                        kpi.id === "toxic-access"
                        ? kpi.trendUp
                          ? "text-destructive"
                          : "text-green-500"
                        : kpi.trendUp
                          ? "text-green-500"
                          : "text-destructive"
                      }`}
                  >
                    {kpi.trend}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    vs last period
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Tier 2: Relationship Visualizations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Access Flow Visualization */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Access Propagation Flow</CardTitle>
              <InfoTooltip text="Visualizes how access flows from identities through roles to entitlements and applications. Select any layer to understand access propagation paths." />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
              {flowLayers.map((layer, idx) => (
                <div key={layer.label} className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex-1 min-w-[140px]">
                    <div
                      className="rounded-lg p-4 text-center"
                      style={{ backgroundColor: `${layer.color}15`, border: `1px solid ${layer.color}40` }}
                    >
                      <p className="text-xs font-medium text-muted-foreground">{layer.label}</p>
                      <p className="text-2xl font-bold text-foreground">{layer.count}</p>
                      <div className="mt-2 space-y-1">
                        {layer.items.slice(0, 3).map((item) => (
                          <p key={item} className="text-[10px] text-muted-foreground truncate">{item}</p>
                        ))}
                        {layer.items.length > 3 && (
                          <p className="text-[10px] text-muted-foreground">+{layer.items.length - 3} more</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {idx < flowLayers.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Access Grant Source Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Access Grant Source</CardTitle>
              <InfoTooltip text="Breakdown of how access is granted across the organization. High direct assignment indicates weak role governance." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={grantSourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  onClick={(entry) => {
                    const items = grantSourceDrilldowns[entry.name] || [
                      { id: "1", name: `Sample ${entry.name} item`, detail: "Click for details", badge: entry.name },
                    ];
                    setChartModal({ title: "Access Grant Source", segmentLabel: entry.name, segmentColor: entry.color, items });
                  }}
                  className="cursor-pointer"
                >
                  {grantSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => `${value}%`} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Application Dependency */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Application Role Dependencies</CardTitle>
              <InfoTooltip text="Shows how applications share roles and hidden access paths. Shadow paths indicate indirect access through role inheritance chains." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={appDependencyData} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="app" width={80} tick={{ fontSize: 12 }} />
                <RechartsTooltip />
                <Bar dataKey="sharedRoles" fill={primaryColor} name="Shared Roles" radius={[0, 4, 4, 0]} />
                <Bar dataKey="shadowPaths" fill="hsl(var(--chart-5))" name="Shadow Paths" radius={[0, 4, 4, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Entitlement Propagation Heatmap */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Entitlement Propagation Risk Map</CardTitle>
              <InfoTooltip text="Highlights entitlement reuse density across applications. High entitlement-to-role ratios indicate blast radius risk — a single entitlement change impacts many users." />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Application</th>
                    <th className="pb-3 font-medium text-center">Entitlements</th>
                    <th className="pb-3 font-medium text-center">Granting Roles</th>
                    <th className="pb-3 font-medium text-center">Impacted Users</th>
                    <th className="pb-3 font-medium text-center">Risk Exposure</th>
                  </tr>
                </thead>
                <tbody>
                  {propagationHeatmap.map((row) => (
                    <tr key={row.app} className="hover:bg-muted/50 transition-colors cursor-pointer">
                      <td className="py-2.5 font-medium text-foreground">{row.app}</td>
                      <td className="py-2.5 text-center text-foreground">{row.entitlements}</td>
                      <td className="py-2.5 text-center text-foreground">{row.roles}</td>
                      <td className="py-2.5 text-center text-foreground">{row.users}</td>
                      <td className="py-2.5 text-center">
                        <Badge variant={row.risk === "Critical" || row.risk === "High" ? "destructive" : row.risk === "Medium" ? "secondary" : "outline"} className="text-xs">
                          {row.risk}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Tier 3: Intelligence Panels ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Quality & Identity Impact */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Role Quality & Identity Impact</CardTitle>
              <InfoTooltip text="Cross-object quality indicators identifying roles that create governance risk through design flaws, policy bypasses, or inappropriate identity assignments." />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {roleQualityMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{metric.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{metric.value}</span>
                    <Badge variant={metric.badgeVariant} className="text-xs">{metric.badge}</Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Ownership & Maturity */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Ownership & Governance Maturity</CardTitle>
              <InfoTooltip text="Measures governance completeness across ownership assignment, certification coverage, and access model maturity dimensions." />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {ownershipMetrics.map((metric) => (
                <div key={metric.label} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <span className="text-sm text-foreground">{metric.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{metric.value}</span>
                    <Badge variant={metric.badgeVariant} className="text-xs">{metric.badge}</Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                Access Model Maturity
                <InfoTooltip text="Composite score across six governance dimensions. Target is 80%+ on each dimension for enterprise readiness." />
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={maturityData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Maturity" dataKey="score" stroke={primaryColor} fill={primaryColor} fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── AI Governance Insights ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">AI Governance Insights</CardTitle>
            <InfoTooltip text="Relationship intelligence insights generated from cross-object analysis. Each insight identifies a specific governance risk with actionable remediation." />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiInsights.map((insight, idx) => {
              const Icon = insight.icon;
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${insight.severity === "critical" ? "bg-destructive/5" : insight.severity === "warning" ? "bg-yellow-500/5" : "bg-primary/5"
                    }`}
                >
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${insight.severity === "critical" ? "text-destructive" : insight.severity === "warning" ? "text-yellow-500" : "text-primary"
                    }`} />
                  <p className="text-sm text-foreground">{insight.text}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Modals ── */}
      {kpiModal && (
        <CatalogKpiDrilldownModal
          open={!!kpiModal}
          onOpenChange={() => setKpiModal(null)}
          {...kpiModal}
        />
      )}
      {chartModal && (
        <CatalogChartDrilldownModal
          open={!!chartModal}
          onOpenChange={() => setChartModal(null)}
          {...chartModal}
        />
      )}
    </div>
  );
};
