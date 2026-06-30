import { useState, useMemo } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Activity, AlertTriangle, ShieldAlert, FileCheck,
  UserCog, Lock, AlertCircle, Clock, Zap, Loader2,
} from "lucide-react";
import InfoTooltip from "@/components/dashboard/InfoTooltip";
import AuditDrilldownDrawer, {
  type DrilldownContext,
} from "./AuditDrilldownDrawer";
import { useCssVariable } from "@/hooks/useCssVariable";
import { useAuditAnalytics } from "@/hooks/auditing/analytics/useAuditAnalytics";
import { getRiskBadgeClass } from "@/utils/getRiskColor";

// Mock data -- used only for sections without backend endpoints yet
import {
  complianceFrameworkData,
  failedOperations,
  anomalies,
} from "@/data/audit-analytics-data";
import { mockAuditLogs, type AuditLog } from "@/data/mock-audit-logs";

// Chart color assignment for event distribution bars
// Colors cycle through the chart palette in order of entry index
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const AuditAnalyticsDashboard = () => {
  // Drawer state -- context holds title, description, and backend filters
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContext, setDrawerContext] = useState<DrilldownContext | null>(null);

  // CSS variables for themed chart colors
  const chart1 = useCssVariable("--chart-1");
  const chart2 = useCssVariable("--chart-2");
  const chart3 = useCssVariable("--chart-3");
  const chart5 = useCssVariable("--chart-5");

  // All analytics data from backend APIs -- each section has independent loading state
  const {
    kpis,
    eventVolume,
    eventDistribution,
    topActors,
    heatmap,
    kpisLoading,
    volumeLoading,
    distributionLoading,
    actorsLoading,
    heatmapLoading,
  } = useAuditAnalytics({ autoFetch: true });

  // Opens the drilldown drawer with backend filter context
  // The drawer will fetch paginated audit logs matching these filters
  const openDrilldown = (ctx: DrilldownContext) => {
    setDrawerContext(ctx);
    setDrawerOpen(true);
  };

  // ---- KPI cards ----
  // First 3 come from real backend data (totalEvents, highRiskCount, failedOperations)
  // Last 3 remain from mock data until backend endpoints are added
  const mockPrivileged = mockAuditLogs.filter(
    (l) => l.actor.type === "system" || l.actor.type === "service"
  );
  const mockSod = mockAuditLogs.filter(
    (l) => l.eventType === "approve" || l.eventType === "provision"
  );
  const mockComplianceTagged = mockAuditLogs.filter(
    (l) => l.complianceFlags.length > 0
  );
  const mockCompliancePct =
    mockAuditLogs.length > 0
      ? ((mockComplianceTagged.length / mockAuditLogs.length) * 100).toFixed(0)
      : "0";

  const kpiCards = [
    {
      title: "Total Events",
      // Real data: totalEvents from backend KPI endpoint
      value: kpisLoading
        ? "..."
        : (kpis?.totalEvents ?? 0).toLocaleString(),
      icon: Activity,
      tooltip: "Total audit events captured across all systems in the selected period",
      color: "text-primary",
      onClick: () =>
        openDrilldown({
          title: "All Audit Events",
          description: "Complete audit trail",
          filters: {},
        }),
    },
    {
      title: "High Risk",
      // Real data: highRiskCount from backend KPI endpoint
      value: kpisLoading ? "..." : String(kpis?.highRiskCount ?? 0),
      icon: AlertTriangle,
      tooltip: "Events flagged as high risk requiring immediate review",
      color: "text-destructive",
      onClick: () =>
        openDrilldown({
          title: "High Risk Events",
          description: "Events requiring immediate attention",
          filters: { risk: "high" },
        }),
    },
    {
      title: "Failed Operations",
      // Real data: failedOperationsCount + failedOperationsPercentage from backend
      value: kpisLoading
        ? "..."
        : `${kpis?.failedOperationsCount ?? 0} (${kpis?.failedOperationsPercentage ?? "0"}%)`,
      icon: ShieldAlert,
      tooltip: "Operations that failed -- investigate for provisioning gaps",
      color: "text-destructive",
      onClick: () =>
        openDrilldown({
          title: "Failed Operations",
          description: "All operations with failure outcome",
          filters: { status: "failure" },
        }),
    },
    {
      title: "Compliance Coverage",
      // Mock: no compliance endpoint yet
      value: `${mockCompliancePct}%`,
      icon: FileCheck,
      tooltip:
        "Percentage of events tagged with at least one compliance framework (SOX, GDPR, etc.)",
      color: "text-primary",
      // Mock drilldown uses local filtered data since no backend filter for compliance flags
      onClick: () =>
        openDrilldown({
          title: "Compliance-Tagged Events",
          description: "Events mapped to compliance frameworks",
          filters: {},
        }),
    },
    {
      title: "Privileged Actions",
      // Mock: no actor type filter endpoint yet
      value: String(mockPrivileged.length),
      icon: UserCog,
      tooltip:
        "Events performed by system or service accounts -- monitor for unauthorized automation",
      color: "text-warning",
      onClick: () =>
        openDrilldown({
          title: "Privileged Actions",
          description: "Events by system and service accounts",
          filters: {},
        }),
    },
    {
      title: "SoD-Relevant Events",
      // Mock: no SoD filter endpoint yet
      value: String(mockSod.length),
      icon: Lock,
      tooltip:
        "Approve + Provision events on the same object -- potential separation of duties concern",
      color: "text-warning",
      onClick: () =>
        openDrilldown({
          title: "SoD-Relevant Events",
          description: "Approve and provision events for SoD analysis",
          filters: {},
        }),
    },
  ];

  // ---- Heatmap helpers ----
  // Derive unique objectType rows and eventName columns from backend heatmap data
  const heatObjectTypes = useMemo(
    () => [...new Set(heatmap.map((h) => h.objectType))],
    [heatmap]
  );
  const heatEventNames = useMemo(
    () => [...new Set(heatmap.map((h) => h.eventName))],
    [heatmap]
  );
  const maxHeatCount = useMemo(
    () => Math.max(...heatmap.map((h) => h.count), 1),
    [heatmap]
  );

  const getHeatColor = (count: number) => {
    if (count === 0) return "bg-muted";
    const intensity = count / maxHeatCount;
    if (intensity > 0.7)
      return "bg-destructive/80 text-destructive-foreground";
    if (intensity > 0.4) return "bg-warning/60 text-warning-foreground";
    if (intensity > 0.15) return "bg-primary/30 text-primary-foreground";
    return "bg-primary/10 text-foreground";
  };

  const getHeatCount = (obj: string, evt: string) =>
    heatmap.find((h) => h.objectType === obj && h.eventName === evt)?.count ?? 0;

  // ---- Risk badge helpers (mock sections still use these) ----
  const getSeverityBadge = (severity: string) => {
    const map: Record<string, string> = {
      critical: "high",
      high: "high",
      medium: "medium",
      low: "low",
    };
    const mapped = map[severity?.toLowerCase()] ?? "medium";
    return `${getRiskBadgeClass(mapped)} border`;
  };

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case "bulk-operation": return <Zap className="h-4 w-4 text-destructive" />;
      case "off-hours": return <Clock className="h-4 w-4 text-warning" />;
      case "privilege-escalation": return <ShieldAlert className="h-4 w-4 text-destructive" />;
      case "first-time": return <AlertCircle className="h-4 w-4 text-primary" />;
      default: return <AlertTriangle className="h-4 w-4 text-warning" />;
    }
  };

  // Risk badge for top actors -- backend now returns riskLevel string
  const getActorRiskBadgeClass = (riskLevel: string) => {
    switch (riskLevel) {
      case "high": return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
      case "medium": return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      default: return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
    }
  };
  // Risk colors from CSS variables
  const riskLow = useCssVariable("--risk-low");
  const riskMedium = useCssVariable("--risk-medium");
  const riskHigh = useCssVariable("--risk-high");

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Row 1: KPI Cards                                                    */}
      {/* First 3 = real backend data. Last 3 = mock until endpoints added.  */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpisLoading ? (
          // Loading state for KPI cards - matching WorkflowsAnalyticsDashboard style
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                <div className="flex items-center gap-1.5">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Loading...
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ))
        ) : (
          kpiCards.map((kpi) => (
            <Card
              key={kpi.title}
              className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30"
              onClick={kpi.onClick}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {kpi.title}
                  </span>
                  <div className="flex items-center gap-1">
                    <InfoTooltip text={kpi.tooltip} />
                    <kpi.icon className={`h-3.5 w-3.5 ${kpi.color}`} />
                  </div>
                </div>
                <div className="text-xl font-bold text-foreground">
                  {kpi.value}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Row 2: Event Volume Timeline + Event Type Distribution              */}
      {/* Both from real backend data                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Event Volume Timeline -- backend returns [{date, low, medium, high}] */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                Event Volume (30 Days)
              </CardTitle>
              <InfoTooltip text="Daily event volume by risk level from the last 30 days. Click a data point to see logs for that day." />
            </div>
          </CardHeader>
          <CardContent>
            {volumeLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={eventVolume}
                  onClick={(e) => {
                    if (!e?.activeLabel) return;

                    const label = e.activeLabel as string;

                    // Find the matching entry by label to get the pre-computed isoDate.
                    // isoDate was computed in the hook using UTC parsing so it is immune
                    // to local timezone drift that would affect new Date("Mar 18 2026").
                    const matched = eventVolume.find((v) => v.date === label);

                    if (!matched || !matched.isoDate) return;

                    // isoDate is "YYYY-MM-DD" in UTC e.g. "2026-03-18"
                    // Build full-day UTC bounds:
                    //   dateFrom = 2026-03-18T00:00:00.000Z  (start of day UTC)
                    //   dateTo   = 2026-03-18T23:59:59.999Z  (end of day UTC)
                    // These are passed directly to the backend Instant parameters which
                    // expect ISO-8601 UTC strings. No local timezone conversion happens.
                    const dateFrom = `${matched.isoDate}T00:00:00.000Z`;
                    const dateTo = `${matched.isoDate}T23:59:59.999Z`;

                    openDrilldown({
                      title: `Events on ${label}`,
                      description: `All audit events on ${matched.isoDate}`,
                      filters: {
                        dateFrom,
                        dateTo,
                      },
                    });
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  {/* Backend confirmed: no critical field, only low/medium/high */}
                  <Area
                    type="monotone"
                    dataKey="low"
                    stackId="1"
                    stroke={riskLow ? `hsl(${riskLow})` : "#22c55e"}
                    fill={riskLow ? `hsl(${riskLow})` : "#22c55e"}
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="medium"
                    stackId="1"
                    stroke={riskMedium ? `hsl(${riskMedium})` : "#eab308"}
                    fill={riskMedium ? `hsl(${riskMedium})` : "#eab308"}
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="high"
                    stackId="1"
                    stroke={riskHigh ? `hsl(${riskHigh})` : "#ef4444"}
                    fill={riskHigh ? `hsl(${riskHigh})` : "#ef4444"}
                    fillOpacity={0.6}
                  />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Event Type Distribution -- backend returns [{eventName, count}] */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                Event Type Distribution
              </CardTitle>
              <InfoTooltip text="Top 10 event types by occurrence count. Click a bar to see all logs for that event." />
            </div>
          </CardHeader>
          <CardContent>
            {distributionLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={eventDistribution}
                  layout="vertical"
                  onClick={(e) => {
                    if (e?.activePayload?.[0]) {
                      const eventName: string =
                        e.activePayload[0].payload.eventName;
                      openDrilldown({
                        title: `${eventName} Events`,
                        description: `All ${eventName} operations`,
                        // event filter maps to audit log event field
                        filters: { event: eventName },
                      });
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis type="number" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  {/* Backend uses eventName field -- mapped to YAxis dataKey */}
                  <YAxis
                    dataKey="eventName"
                    type="category"
                    tick={{ fontSize: 10 }}
                    width={120}
                    className="fill-muted-foreground"
                    tickFormatter={(value) =>
                      value.length > 15 ? `${value.substring(0, 15)}...` : value
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} cursor="pointer">
                    {eventDistribution.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Row 3: Top Actors + Compliance Framework (compliance still mock)    */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Actors -- real backend data, riskLevel is now a string badge */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                Top Actors by Activity
              </CardTitle>
              <InfoTooltip text="Most active actors ranked by event count. Risk level is computed from the weighted average of their event risk levels. Click a row to drill down." />
            </div>
          </CardHeader>
          <CardContent>
            {actorsLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Actor</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs text-right">Events</TableHead>
                    <TableHead className="text-xs text-right">Failures</TableHead>
                    <TableHead className="text-xs text-right">Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topActors.map((actor) => (
                    <TableRow
                      key={actor.name}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        openDrilldown({
                          title: `Events by ${actor.name}`,
                          description: `${actor.type} account activity`,
                          // search by actor name since there is no actorName filter param
                          filters: { search: actor.name },
                        })
                      }
                    >
                      <TableCell className="text-sm font-medium py-2">
                        {actor.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {actor.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-right">
                        {actor.events}
                      </TableCell>
                      <TableCell
                        className={`text-sm text-right ${actor.failures > 10
                          ? "text-destructive font-medium"
                          : ""
                          }`}
                      >
                        {actor.failures}
                      </TableCell>
                      <TableCell className="text-right">
                        {/* riskLevel is now a string: low/medium/high from backend */}
                        <Badge
                          className={`text-xs border ${getActorRiskBadgeClass(actor.riskLevel)}`}
                        >
                          {actor.riskLevel?.charAt(0).toUpperCase() + actor.riskLevel?.slice(1).toLowerCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {topActors.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-6 text-sm"
                      >
                        No actor data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Compliance Framework -- mock data, no backend endpoint yet */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                Compliance Framework Coverage
              </CardTitle>
              <InfoTooltip text="Distribution of audit events tagged by compliance framework. Mock data -- backend endpoint not yet available." />
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={complianceFrameworkData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="count"
                  nameKey="framework"
                  cursor="pointer"
                  onClick={(entry) => {
                    const filtered = mockAuditLogs.filter((l) =>
                      l.complianceFlags.includes(entry.framework)
                    );
                    openDrilldown({
                      title: `${entry.framework} Events`,
                      description: `Events tagged with ${entry.framework}`,
                      filters: {},
                    });
                  }}
                >
                  {complianceFrameworkData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Row 4: Failed Operations (mock) + Change Impact Heatmap (real)      */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Failed Operations -- mock data, no dedicated backend endpoint yet */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                Failed Operations Analysis
              </CardTitle>
              <InfoTooltip text="Recent provisioning and operational failures. Mock data -- backend endpoint not yet available." />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {failedOperations.map((op) => (
              <div
                key={op.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() =>
                  openDrilldown({
                    title: `Failed: ${op.operation}`,
                    description: op.error,
                    filters: { status: "failure" },
                  })
                }
              >
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">
                      {op.operation}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs shrink-0 ${op.status === "unresolved" || op.status === "blocked"
                        ? "border-destructive/30 text-destructive"
                        : op.status === "retrying"
                          ? "border-warning/30 text-warning"
                          : ""
                        }`}
                    >
                      {op.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {op.target} → {op.system}
                  </div>
                  <div className="text-xs text-destructive/80 mt-1">
                    {op.error}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span>{new Date(op.timestamp).toLocaleString()}</span>
                    {op.retries > 0 && <span>{op.retries} retries</span>}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>


        {/* ---------------------------------------------------------------- */}
        {/* Anomaly Detection -- mock data, moved here from Row 5            */}
        {/* No backend endpoint yet -- keep mock until anomaly API is built  */}
        {/* ---------------------------------------------------------------- */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                Anomaly Detection Summary
              </CardTitle>
              <InfoTooltip text="Automatically detected unusual patterns: off-hours access, bulk operations, privilege escalation, and first-time actions. Mock data -- backend endpoint not yet available." />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {anomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() =>
                  openDrilldown({
                    title: anomaly.title,
                    description: anomaly.description,
                    filters: { search: anomaly.actor },
                  })
                }
              >
                {getAnomalyIcon(anomaly.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{anomaly.title}</span>
                    <Badge
                      className={`${getSeverityBadge(anomaly.severity)} border text-xs`}
                    >
                      {anomaly.severity?.charAt(0).toUpperCase() + anomaly.severity?.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {anomaly.description}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span>Actor: {anomaly.actor}</span>
                    <span>Affected: {anomaly.affectedCount}</span>
                    <span>{new Date(anomaly.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>


        {/* Change Impact Heatmap -- real backend data */}
        {/* objectType rows x eventName columns, count drives cell intensity */}
        {/* <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                Change Impact Heatmap
              </CardTitle>
              <InfoTooltip text="Event count by object type and event name. Hotter cells indicate higher activity. Click a cell to drill into that combination." />
            </div>
          </CardHeader>
          <CardContent>
            {heatmapLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : heatmap.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 text-sm">
                No heatmap data available
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="text-left p-1.5 font-medium text-muted-foreground">
                        Object / Event
                      </th>
                      {heatEventNames.map((en) => (
                        <th
                          key={en}
                          className="text-center p-1.5 font-medium text-muted-foreground capitalize"
                        >
                          {en}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {heatObjectTypes.map((ot) => (
                      <tr key={ot}>
                        <td className="p-1.5 font-medium">{ot}</td>
                        {heatEventNames.map((en) => {
                          const count = getHeatCount(ot, en);
                          return (
                            <td key={en} className="p-1">
                              <div
                                className={`rounded text-center py-1.5 px-1 cursor-pointer transition-colors hover:ring-1 hover:ring-primary/50 ${getHeatColor(count)}`}
                                onClick={() =>
                                  openDrilldown({
                                    title: `${ot} -- ${en}`,
                                    description: `${count} events`,
                                    // Both objectType and event filter are forwarded to backend
                                    filters: {
                                      objectType: ot,
                                      event: en,
                                    },
                                  })
                                }
                              >
                                {count > 0 ? count : "—"}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card> */}
      </div>


      {/* Drilldown drawer -- receives backend filter context and fetches real paginated logs */}
      <AuditDrilldownDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        context={drawerContext}
      />
    </div>
  );
};

export default AuditAnalyticsDashboard;