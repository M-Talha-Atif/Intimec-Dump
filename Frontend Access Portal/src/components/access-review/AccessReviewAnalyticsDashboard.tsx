import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield, Users, CheckCircle, AlertTriangle, Clock, TrendingUp, TrendingDown,
  BarChart3, Target, Zap, FileCheck, Scale, Lock, Eye, Percent,
} from "lucide-react";
import InfoTooltip from "@/components/dashboard/InfoTooltip";
import { AccessReviewKpiDrilldownModal } from "./AccessReviewKpiDrilldownModal";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, PieChart, Pie, Legend,
} from "recharts";
import { useCssVariable } from "@/hooks/useCssVariable";

// --- Mock Data ---

const kpis = [
  { id: "active-campaigns", title: "Active Campaigns", value: "3", change: "+1", trend: "up" as const, trendDir: "neutral" as const, icon: Shield, tooltip: "Number of certification campaigns currently in progress. Active campaigns require reviewer attention and resource allocation." },
  { id: "total-reviews", title: "Total Reviews", value: "1,475", change: "+12%", trend: "up" as const, trendDir: "positive" as const, icon: Users, tooltip: "Total review items across all active campaigns in the current period. Tracks certification workload volume." },
  { id: "completion-rate", title: "Completion Rate", value: "85%", change: "+5%", trend: "up" as const, trendDir: "positive" as const, icon: CheckCircle, tooltip: "Percentage of assigned review items completed within campaign timeframe. Low rates indicate governance fatigue or poor reviewer accountability." },
  { id: "overdue-items", title: "Overdue Items", value: "23", change: "+3", trend: "up" as const, trendDir: "negative" as const, icon: AlertTriangle, tooltip: "Review decisions pending past defined SLA. High overdue counts increase compliance exposure and audit risk." },
  { id: "critical-risk", title: "Critical Risk Pending", value: "12", change: "-2", trend: "down" as const, trendDir: "positive" as const, icon: Target, tooltip: "Access items classified as high or critical risk awaiting reviewer decision. These represent the highest governance priority." },
  { id: "sla-breach", title: "SLA Breach Rate", value: "8%", change: "-2%", trend: "down" as const, trendDir: "positive" as const, icon: Clock, tooltip: "Percentage of review items where the reviewer exceeded the defined SLA threshold. High breach rates indicate capacity or engagement issues." },
  { id: "cert-coverage", title: "Certification Coverage", value: "78%", change: "+4%", trend: "up" as const, trendDir: "positive" as const, icon: FileCheck, tooltip: "Percentage of identities, roles, or entitlements included in active certification programs. Gaps indicate uncertified access risk." },
  { id: "revocation-rate", title: "Revocation Rate", value: "15%", change: "+2%", trend: "up" as const, trendDir: "positive" as const, icon: Scale, tooltip: "Percentage of reviewed access items revoked. High rates may indicate overprovisioning or weak role design." },
  { id: "avg-decision", title: "Avg Decision Time", value: "2.3d", change: "-0.4d", trend: "down" as const, trendDir: "positive" as const, icon: Zap, tooltip: "Average time taken by reviewers to make a certification decision. Long times suggest review complexity or reviewer disengagement." },
  { id: "escalated", title: "Escalated Reviews", value: "7", change: "+1", trend: "up" as const, trendDir: "negative" as const, icon: Eye, tooltip: "Review items escalated due to SLA breach, risk threshold, or policy conflict. Escalations indicate governance bottlenecks requiring management attention." },
];

const riskByCampaign = [
  { name: "Q1 User Access", low: 120, medium: 85, high: 32, critical: 8 },
  { name: "Privileged Access", low: 15, medium: 28, high: 45, critical: 22 },
  { name: "SOX Controls", low: 45, medium: 62, high: 38, critical: 12 },
];

const campaignHealth = [
  { name: "Q1 User Access Review", progress: 87, total: 245 },
  { name: "Privileged Access Cert", progress: 62, total: 110 },
  { name: "SOX Critical Systems", progress: 45, total: 157 },
];

const reviewerPerformance = [
  { name: "Sarah Chen", avgTime: 1.2, completion: 95 },
  { name: "Mike Johnson", avgTime: 2.8, completion: 78 },
  { name: "Lisa Park", avgTime: 1.8, completion: 88 },
  { name: "David Kim", avgTime: 3.5, completion: 65 },
  { name: "Amy Rodriguez", avgTime: 1.5, completion: 92 },
];

const certTrend = [
  { month: "Aug", rate: 68 },
  { month: "Sep", rate: 72 },
  { month: "Oct", rate: 75 },
  { month: "Nov", rate: 79 },
  { month: "Dec", rate: 82 },
  { month: "Jan", rate: 85 },
];

const riskInsights = [
  { label: "Privileged access reviews pending", value: "18", severity: "high" as const },
  { label: "SoD violations in certifications", value: "6", severity: "critical" as const },
  { label: "Access approved despite policy violation", value: "4", severity: "high" as const },
  { label: "Recurring approvals without justification", value: "11", severity: "medium" as const },
  { label: "AI recommendation acceptance rate", value: "73%", severity: "low" as const },
];

const complianceReadiness = [
  { label: "SOX-aligned certifications", value: "3 active", severity: "low" as const },
  { label: "GDPR-scoped reviews", value: "2 active", severity: "low" as const },
  { label: "Critical system coverage", value: "82%", severity: "medium" as const },
  { label: "Audit evidence completeness", value: "91%", severity: "low" as const },
];

const drilldownItems = [
  { id: "1", campaign: "Q1 User Access Review", item: "admin_role - John Smith", risk: "critical" as const, status: "Pending", reviewer: "Sarah Chen", dueDate: "2024-01-20" },
  { id: "2", campaign: "Privileged Access Cert", item: "db_admin - Mike Lee", risk: "high" as const, status: "Overdue", reviewer: "Lisa Park", dueDate: "2024-01-15" },
  { id: "3", campaign: "SOX Critical Systems", item: "finance_write - Amy Wong", risk: "high" as const, status: "In Progress", reviewer: "David Kim", dueDate: "2024-01-22" },
  { id: "4", campaign: "Q1 User Access Review", item: "vpn_access - Bob Chen", risk: "medium" as const, status: "Pending", reviewer: "Mike Johnson", dueDate: "2024-01-25" },
  { id: "5", campaign: "Privileged Access Cert", item: "root_access - Jane Doe", risk: "critical" as const, status: "Escalated", reviewer: "Amy Rodriguez", dueDate: "2024-01-18" },
];

const severityColors: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  critical: "bg-destructive/10 text-destructive",
};

const CHART_COLORS = {
  low: "hsl(var(--success-foreground, 142 71% 45%))",
  medium: "hsl(45, 93%, 47%)",
  high: "hsl(24, 95%, 53%)",
  critical: "hsl(var(--chart-5))",
  primary: "hsl(var(--primary))",
  muted: "hsl(var(--muted-foreground))",
};

export const AccessReviewAnalyticsDashboard = () => {
  const [drilldown, setDrilldown] = useState<{ open: boolean; title: string; description: string }>({
    open: false, title: "", description: "",
  });

  const primaryColor = useCssVariable("--primary");

  const openDrilldown = (title: string, description: string) => {
    setDrilldown({ open: true, title, description });
  };

  return (
    <div className="space-y-6 overflow-auto h-full pb-6">
      {/* Tier 1: Executive KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trend === "up" ? TrendingUp : TrendingDown;
          const trendColor = kpi.trendDir === "positive" ? "text-emerald-600" : kpi.trendDir === "negative" ? "text-destructive" : "text-muted-foreground";
          return (
            <Card
              key={kpi.id}
              className="cursor-pointer hover:shadow-md transition-all"
              onClick={() => openDrilldown(kpi.title, kpi.tooltip)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-muted-foreground truncate">{kpi.title}</span>
                    <InfoTooltip text={kpi.tooltip} />
                  </div>
                  <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </div>
                <div className="text-xl font-bold text-foreground">{kpi.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                  <span className={`text-xs ${trendColor}`}>{kpi.change}</span>
                  <span className="text-xs text-muted-foreground">vs last period</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tier 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk by Campaign */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Risk by Campaign</CardTitle>
              <InfoTooltip text="Distribution of risk levels across active certification campaigns. High concentration of critical risk items requires immediate attention." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={riskByCampaign}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="low" stackId="a" fill={CHART_COLORS.low} name="Low" />
                <Bar dataKey="medium" stackId="a" fill={CHART_COLORS.medium} name="Medium" />
                <Bar dataKey="high" stackId="a" fill={CHART_COLORS.high} name="High" />
                <Bar dataKey="critical" stackId="a" fill={CHART_COLORS.critical} name="Critical" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Campaign Health */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Campaign Health</CardTitle>
              <InfoTooltip text="Progress of active campaigns. Campaigns below 70% near deadline indicate risk of audit finding." />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaignHealth.map((c) => (
                <div key={c.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-foreground truncate">{c.name}</span>
                    <span className="text-muted-foreground">{c.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${c.progress >= 80 ? "bg-emerald-500" : c.progress >= 60 ? "bg-amber-500" : "bg-orange-500"}`}
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{Math.round(c.total * c.progress / 100)}/{c.total} items</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reviewer Performance */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Reviewer Performance</CardTitle>
              <InfoTooltip text="Average decision time and completion rate per reviewer. Identifies bottlenecks and high-performing reviewers for workload balancing." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={reviewerPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="completion" fill={primaryColor} name="Completion %" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Certification Trend */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Certification Trend</CardTitle>
              <InfoTooltip text="Completion rate trend over the past 6 months. Upward trends indicate improving governance maturity." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={certTrend}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[50, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="rate" stroke={primaryColor} fill={primaryColor} fillOpacity={0.15} name="Completion %" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tier 3: Governance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk & Quality */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Risk & Quality Insights</CardTitle>
              <InfoTooltip text="Quality indicators across certification decisions. Highlights policy violations, rubber-stamping patterns, and AI alignment." />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {riskInsights.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => openDrilldown(item.label, `Detailed view of ${item.label.toLowerCase()}`)}
                >
                  <span className="text-sm text-foreground">{item.label}</span>
                  <Badge variant="outline" className={severityColors[item.severity]}>
                    {item.value}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Readiness */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Compliance Readiness</CardTitle>
              <InfoTooltip text="Audit preparedness across regulatory frameworks. Tracks certification alignment with SOX, GDPR, and critical system requirements." />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {complianceReadiness.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => openDrilldown(item.label, `Compliance detail for ${item.label.toLowerCase()}`)}
                >
                  <span className="text-sm text-foreground">{item.label}</span>
                  <Badge variant="outline" className={severityColors[item.severity]}>
                    {item.value}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <AccessReviewKpiDrilldownModal
        open={drilldown.open}
        onOpenChange={(open) => setDrilldown((prev) => ({ ...prev, open }))}
        title={drilldown.title}
        description={drilldown.description}
        items={drilldownItems}
      />
    </div>
  );
};
