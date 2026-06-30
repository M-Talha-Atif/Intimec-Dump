import { useState, useMemo } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  AlertTriangle, Zap, Clock, RefreshCw, RotateCcw,
  Link2, AlertCircle, Loader2, ChevronLeft, ChevronRight 
} from "lucide-react";
import InfoTooltip from "@/components/dashboard/InfoTooltip";
import DebugDrilldownDrawer, {
  type DebugDrilldownContext,
} from "./DebugDrilldownDrawer";
import { Button } from "@/components/ui/button";
import { useCssVariable } from "@/hooks/useCssVariable";
import { useLogAnalytics } from "@/hooks/logging/analytics/useLogAnalytics";
import { getRiskBadgeClass } from "@/utils/getRiskColor";
import {
  topFailingConnectors,
  recurringErrorPatterns,
  mttrTrendData,
  correlationChains,
} from "@/data/debug-analytics-data";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const DebugAnalyticsDashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContext, setDrawerContext] = useState<DebugDrilldownContext | null>(null);

  const chart1 = useCssVariable("--chart-1");

  const {
    kpis,
    errorVolume,
    errorCategory,
    heatmap,
    kpisLoading,
    volumeLoading,
    categoryLoading,
    heatmapLoading,
    browserTimezone,
    errorVolumeHours,
    heatmapHours,
    recurringPatternsData,
    recurringPatternsPage,
    recurringPatternsLoading,
    loadRecurringPatterns,
    mttrTrend,
    mttrTrendLoading,
  } = useLogAnalytics({ autoFetch: true });

  const recurringPatterns = recurringPatternsData?.patterns ?? [];
  const recurringPagination = recurringPatternsData?.pagination;
  const recurringTotalPages = recurringPagination?.totalPages ?? 0;
  const recurringTotalElements = recurringPagination?.totalElements ?? 0;

  const openDrilldown = (ctx: DebugDrilldownContext) => {
    setDrawerContext(ctx);
    setDrawerOpen(true);
  };

  const last24hFrom = Date.now() - 24 * 60 * 60 * 1000;

  // ---- Heatmap helpers ----

  const heatLookup = useMemo(() => {
    const map = new Map<string, number>();
    heatmap?.data.forEach((cell) => {
      map.set(`${cell.source}:${cell.hour}`, cell.count);
    });
    return map;
  }, [heatmap]);

  const hoursLabels = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) =>
        `${i.toString().padStart(2, "0")}:00`
      ),
    []
  );

  const maxHeatCount = useMemo(
    () => Math.max(...(heatmap?.data.map((c) => c.count) ?? [1]), 1),
    [heatmap]
  );

  const getHeatColor = (count: number) => {
    if (count === 0) return "bg-muted";
    const intensity = count / maxHeatCount;
    if (intensity > 0.7) return "bg-destructive/80 text-destructive-foreground";
    if (intensity > 0.4) return "bg-warning/60 text-warning-foreground";
    if (intensity > 0.15) return "bg-primary/30";
    return "bg-primary/10";
  };

  const getHeatCount = (source: string, hour: string) =>
    heatLookup.get(`${source}:${hour}`) ?? 0;

  // ---- Badge helpers ----

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "failing": return "border-destructive/30 text-destructive";
      case "degraded": return "border-warning/30 text-warning";
      default: return "";
    }
  };

  const formatResponseTime = (ms: number) => {
    if (ms === 0) return "N/A";
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // ---- KPI cards ----
  const kpiCards = [
    {
      title: "Important events (24h)",
      value: kpisLoading ? "..." : (kpis?.totalErrors24h ?? 0).toLocaleString(),
      icon: AlertTriangle,
      tooltip: "Important error and warning events in the last 24 hours across all sources",
      color: "text-destructive",
      onClick: () => openDrilldown({
        title: "Important events (24h)",
        description: "All ERROR and WARN events from the last 24 hours",
        mode: "kpi",  // Changed from "search" to "kpi"
        filters: {
          kpiType: "total_errors",
        },
      }),
    },
    // {
    //   title: "Critical Failures",
    //   value: kpisLoading ? "..." : String(kpis?.criticalFailures ?? 0),
    //   icon: AlertCircle,
    //   tooltip: "Errors that caused complete operation failure requiring immediate attention",
    //   color: "text-destructive",
    //   onClick: () => openDrilldown({
    //     title: "Critical Failures",
    //     description: "All ERROR level log entries",
    //     mode: "kpi",  // Changed from "search" to "kpi"
    //     filters: {
    //       kpiType: "critical",
    //     },
    //   }),
    // },
    {
      title: "Avg Response Time",
      value: kpisLoading ? "..." : formatResponseTime(kpis?.avgResponseTimeMs ?? 0),
      icon: Clock,
      tooltip: "Average API/connector response time -- high values indicate performance degradation",
      color: "text-warning",
      onClick: () => {
        const avgResponseTime = kpis?.avgResponseTimeMs ?? 0;
        const thresholdSeconds = (avgResponseTime / 1000).toFixed(1);
        openDrilldown({
          title: "Slow Responses",
          description: `Log entries with response times > ${thresholdSeconds}s (above average)`,
          mode: "kpi",
          filters: {
            kpiType: "slow_responses",
          },
        });
      },
    },
    {
      title: "MTTR (minutes)",
      value: kpisLoading ? "..." : String(Math.round(kpis?.mttrMinutes ?? 0)),
      icon: RotateCcw,
      tooltip: "Mean Time To Resolution -- average minutes from error detection to fix",
      color: "text-primary",
      onClick: () => openDrilldown({
        title: "Resolved Errors",
        description: "Errors that have been marked as resolved",
        mode: "search",  // Keep as search since no dedicated KPI type for MTTR
        filters: { isResolved: true },
      }),
    },
    {
      title: "Recurring Patterns",
      value: kpisLoading ? "..." : String(kpis?.recurringPatterns ?? 0),
      icon: RefreshCw,
      tooltip: "Unique messages that repeated 3+ times -- silent recurring failures indicate systemic issues",
      color: "text-destructive",
      onClick: () => openDrilldown({
        title: "Recurring Error Patterns",
        description: "ERROR and WARN messages repeating 3 or more times",
        mode: "kpi",  // Changed from "search" to "kpi"
        filters: {
          kpiType: "recurring",
        },
      }),
    },
    {
      title: "Retry Success Rate",
      value: "68%",
      icon: Zap,
      tooltip: "Percentage of auto-retried operations that eventually succeeded",
      color: "text-primary",
      onClick: () => openDrilldown({
        title: "Retried Operations",
        description: "Mock data -- retry tracking not yet in backend",
        mode: "search",  // Keep as search for mock data
        filters: {},
      }),
    },
  ];

  return (
    <div className="space-y-6">

      {/* ------------------------------------------------------------------ */}
      {/* Row 1: KPI Cards                                                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
      {/* Row 2: Error Volume (real) + Error Category (real)                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                Error Volume by Source (24h)
              </CardTitle>
              <InfoTooltip text="Stacked area chart of log events by top sources over the last 24 hours. Hour labels are in your local timezone. Click a point to see entries for that hour." />
            </div>
          </CardHeader>
          <CardContent>
            {volumeLoading ? (
              <div className="flex items-center justify-center h-[260px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !errorVolume || errorVolume.timeline?.length === 0 || errorVolume.sources?.length === 0 ? (
              <div className="flex items-center justify-center h-[260px] text-center text-muted-foreground text-sm">
                No error volume data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart
                  data={errorVolume?.timeline ?? []}
                  onClick={(e) => {
                    if (!e?.activeLabel) return;
                    const hourLabel = e.activeLabel as string;

                    // Find by label to get epochMs -- avoids date math on the label string.
                    // epochMs = windowStartMs + (index * 3600000) computed in the hook.
                    // Without epochMs we would build "today 15:00" when the chart
                    // might be showing "yesterday 15:00" causing zero results.
                    const matched = errorVolume?.timeline.find(
                      (entry) => entry.hour === hourLabel
                    );
                    if (!matched) return;

                    // All sources rendered at the clicked x-position.
                    // dataKey on each activePayload item is the source name
                    // which matches source.keyword in OpenSearch exactly.
                    const activeSources: string[] = (e.activePayload ?? [])
                      .map((p: { dataKey?: string }) => p.dataKey)
                      .filter((k): k is string => Boolean(k));

                    openDrilldown({
                      title: `Events at ${hourLabel}`,
                      description: activeSources.length > 0
                        ? `Sources: ${activeSources.join(", ")}`
                        : "All sources at this hour",
                      mode: "volume",
                      filters: {
                        hour: hourLabel,
                        timezone: browserTimezone,
                        sources: activeSources,
                        windowHours: errorVolumeHours,
                      },
                    });
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 10 }}
                    className="fill-muted-foreground"
                    interval={3}
                  />
                  <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  {(errorVolume?.sources ?? []).map((source, i) => (
                    <Area
                      key={source}
                      type="monotone"
                      dataKey={source}
                      stackId="1"
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                      fillOpacity={0.6}
                    />
                  ))}
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                Error Category Distribution
              </CardTitle>
              <InfoTooltip text="Breakdown of log events by category field. Categories are the actual values stored in the index. Full history shown by default. Click a bar to see entries for that category." />
            </div>
          </CardHeader>
          <CardContent>
            {categoryLoading ? (
              <div className="flex items-center justify-center h-[260px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !errorCategory || errorCategory.length === 0 ? (
              <div className="flex items-center justify-center h-[260px] text-center text-muted-foreground text-sm">
                No error category data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={errorCategory}
                  layout="vertical"
                  onClick={(e) => {
                    if (e?.activePayload?.[0]) {
                      const category: string = e.activePayload[0].payload.category;
                      openDrilldown({
                        title: `${category} Events`,
                        description: `All log entries with category: ${category}`,
                        mode: "category",
                        filters: {
                          category,
                          categoryHours: 0,
                        },
                      });
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    dataKey="category"
                    type="category"
                    tick={{ fontSize: 11 }}
                    width={160}
                    className="fill-muted-foreground"
                    tickFormatter={(value) =>
                      value.length > 20 ? `${value.substring(0, 20)}...` : value
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
                    {errorCategory.map((_, i) => (
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
      {/* Row 3: Top Failing Connectors (mock) + Error Heatmap (real)         */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                Top Failing Connectors
              </CardTitle>
              <InfoTooltip text="Connectors ranked by failure count. Mock data -- backend endpoint not yet available." />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Connector</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs text-right">Failures</TableHead>
                  <TableHead className="text-xs text-right">Avg Latency</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topFailingConnectors.map((conn) => (
                  <TableRow
                    key={conn.name}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      openDrilldown({
                        title: `Errors: ${conn.name}`,
                        description: `${conn.type} connector failures`,
                        mode: "search",
                        filters: { globalSearch: conn.name },
                      })
                    }
                  >
                    <TableCell className="text-sm font-medium py-2">
                      {conn.name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {conn.type}
                    </TableCell>
                    <TableCell
                      className={`text-sm text-right ${conn.failures > 20 ? "text-destructive font-medium" : ""
                        }`}
                    >
                      {conn.failures}
                    </TableCell>
                    <TableCell
                      className={`text-sm text-right ${parseFloat(conn.avgLatency) > 4 ? "text-warning" : ""
                        }`}
                    >
                      {conn.avgLatency}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${getStatusBadge(conn.status)}`}
                      >
                        {conn.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                Error Heatmap (Hour x Source)
              </CardTitle>
              <InfoTooltip text="Event density by hour and source in your local timezone. Top sources by total count shown as rows. Click a cell to see entries for that source and hour." />
            </div>
          </CardHeader>
          <CardContent>
            {heatmapLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !heatmap || heatmap.sources.length === 0 ? (
              <div className="flex items-center justify-center h-[260px] text-center text-muted-foreground text-sm">
                No heatmap data available
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="text-left p-1 font-medium text-muted-foreground sticky left-0 bg-card z-10">
                          Source
                        </th>
                        {hoursLabels.map((hour, index) => (
                          <th
                            key={hour}
                            className="text-center p-1 font-medium text-muted-foreground"
                          >
                            {index % 3 === 0 ? hour : ""}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {heatmap.sources.map((source) => (

                        <tr key={source}>
                          <td className="p-1 font-medium whitespace-nowrap sticky left-0 bg-card z-10">
                            {source.split('.').pop()}
                          </td>
                          {hoursLabels.map((hour) => {
                            const count = getHeatCount(source, hour);
                            const formattedSource = source.split('.').pop() || source;
                            return (
                              <td key={hour} className="p-0.5">
                                <div
                                  className={`rounded text-center py-1 cursor-pointer transition-colors hover:ring-1 hover:ring-primary/50 min-w-[40px] ${getHeatColor(count)}`}
                                  onClick={() => {
                                    openDrilldown({
                                      title: `${formattedSource} at ${hour}`,
                                      description: `${count} events from this source at this hour`,
                                      mode: "heatmap",
                                      filters: {
                                        hour,
                                        timezone: browserTimezone,
                                        sources: [source],
                                        windowHours: heatmapHours,
                                      },
                                    });
                                  }}
                                  title={`${count} events`}
                                >
                                  {count > 0 ? count : ""}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Row 4: Recurring Error Patterns + MTTR Trend         */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">
                  Recurring Error Patterns
                </CardTitle>
                <InfoTooltip text="Messages repeating 3 or more times across all log history. Ranked by occurrence count. The most frequent unresolved pattern appears first." />
              </div>
              {recurringTotalElements > 0 && (
                <span className="text-xs text-muted-foreground">
                  {recurringTotalElements} patterns
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            {recurringPatternsLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recurringPatterns.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-center text-muted-foreground text-sm">
                No recurring error patterns found
              </div>
            ) : (
              <>
                {/* Pattern list */}
                <div className="space-y-2">
                  {recurringPatterns.map((pattern) => (
                    <div
                      key={pattern.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                      onClick={() =>
                        openDrilldown({
                          title:
                            pattern.message.slice(0, 60) +
                            (pattern.message.length > 60 ? "..." : ""),
                          description: `${pattern.occurrences} occurrences -- source: ${pattern.source}`,
                          mode: "recurring",
                          filters: {
                            patternMessage: pattern.message,
                            patternHours: 0,
                          },
                        })
                      }
                    >
                      <RefreshCw className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-sm font-medium truncate"
                            title={pattern.message}
                          >
                            {pattern.message}
                          </span>
                          <Badge
                            className={`${getSeverityBadge(pattern.severity)} border text-xs shrink-0`}
                          >
                            {pattern.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                          <span>{pattern.occurrences}x repeated</span>
                          <span>Source: {pattern.source}</span>
                          {pattern.firstSeen && (
                            <span>
                              First: {new Date(pattern.firstSeen).toLocaleString()}
                            </span>
                          )}
                          {pattern.lastSeen && (
                            <span>
                              Last: {new Date(pattern.lastSeen).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination footer -- only shown when more than one page */}
                {recurringTotalPages > 1 && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      Page {recurringPatternsPage + 1} of {recurringTotalPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          loadRecurringPatterns(
                            Math.max(0, recurringPatternsPage - 1)
                          )
                        }
                        disabled={recurringPatternsPage === 0 || recurringPatternsLoading}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          loadRecurringPatterns(
                            Math.min(recurringTotalPages - 1, recurringPatternsPage + 1)
                          )
                        }
                        disabled={
                          recurringPatternsPage >= recurringTotalPages - 1 ||
                          recurringPatternsLoading
                        }
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>



        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                Correlation Chain Analysis
              </CardTitle>
              <InfoTooltip text="Correlated error chains tracing a root cause across multiple systems. Mock data -- backend endpoint not yet available." />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {correlationChains.map((chain) => (
              <div
                key={chain.id}
                className="p-4 rounded-lg border border-border/50 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() =>
                  openDrilldown({
                    title: `Chain: ${chain.rootCause}`,
                    description: `${chain.affectedCount} affected objects`,
                    mode: "search",
                    filters: { correlationId: chain.id },
                  })
                }
              >
                <div className="flex items-center gap-2 mb-3">
                  <Link2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-medium">{chain.rootCause}</span>
                  <Badge
                    className={`${getSeverityBadge(chain.severity)} border text-xs shrink-0`}
                  >
                    {chain.severity.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {chain.affectedCount} affected
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {chain.chain.map((step, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div
                        className={`px-2 py-1 rounded text-xs ${step.level === "ERROR"
                          ? "bg-destructive/10 text-destructive"
                          : step.level === "WARN"
                            ? "bg-warning/10 text-warning"
                            : "bg-primary/10 text-primary"
                          }`}
                      >
                        <span className="font-medium">{step.source}</span>
                        <span className="hidden sm:inline">
                          : {step.message.slice(0, 40)}...
                        </span>
                      </div>
                      {i < chain.chain.length - 1 && (
                        <span className="text-muted-foreground text-xs">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Row 5: Correlation Chain Analysis -- mock, not integrated yet       */}
      {/* ------------------------------------------------------------------ */}

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">
              MTTR Trend (7 Days)
            </CardTitle>
            <InfoTooltip text="Mean Time To Resolution trend. Mock data -- backend endpoint not yet available." />
          </div>
        </CardHeader>
        <CardContent>
          {!mttrTrend || mttrTrend.length === 0 ? (
            <div className="flex items-center justify-center h-[260px] text-center text-muted-foreground text-sm">
              No MTTR trend data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={mttrTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11 }}
                  className="fill-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  className="fill-muted-foreground"
                  unit=" min"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(val: number) => [`${val} min`, "MTTR"]}
                />
                <Line
                  type="monotone"
                  dataKey="mttr"
                  stroke={chart1 ? `hsl(${chart1})` : "hsl(var(--primary))"}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>


      <DebugDrilldownDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        context={drawerContext}
      />
    </div>
  );
};

export default DebugAnalyticsDashboard;