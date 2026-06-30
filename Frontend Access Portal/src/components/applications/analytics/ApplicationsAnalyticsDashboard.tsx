"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  AppWindow,
  Shield,
  AlertTriangle,
  ShieldAlert,
  UserX,
  CheckCircle2,
  Settings2,
  Wifi,
  WifiOff,
  Activity,
  CircleDot,
  HelpCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Application } from "@/types/application";
import { PaginatedSpringData } from "@/types/pagination";
import { getFetcher } from "@/hooks/applications/fetcher";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import AppDetailDrilldownDialog, {
  DrilldownColumn,
} from "./AppDetailDrilldownDialog";

// ---------- helpers ----------

function InfoTooltip({
  text,
  side = "top",
}: {
  text: string;
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-3.5 w-3.5 shrink-0 cursor-help text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-[260px] text-xs">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function getRiskLevel(app: Application): "High" | "Medium" | "Low" {
  return app.riskLevel || "Low";
}

function getStatusBadgeClass(status: string): string {
  const m: Record<string, string> = {
    connected:
      "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    "connection problem":
      "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    offline:
      "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  };
  return (
    m[status?.toLowerCase()] ||
    "bg-muted text-muted-foreground border-border"
  );
}

const RISK_COLORS = {
  High: "hsl(0 84.2% 60.2%)",
  Medium: "hsl(38 92% 50%)",
  Low: "hsl(142 76% 36%)",
};

const STATUS_COLORS = {
  Connected: "hsl(142 76% 36%)",
  "Connection Problem": "hsl(38 92% 50%)",
  Offline: "hsl(0 84.2% 60.2%)",
};

// ---------- drilldown types ----------

type DrilldownState = {
  title: string;
  description: string;
  items: Record<string, unknown>[];
  columns: DrilldownColumn[];
  badgeVariant?: "default" | "destructive" | "secondary" | "outline";
  badgeLabel?: string;
} | null;

const appDrilldownColumns: DrilldownColumn[] = [
  { key: "name", label: "Application" },
  { key: "category", label: "Category" },
  { key: "users", label: "Users" },
  {
    key: "connectionStatus",
    label: "Status",
    render: (v: unknown) => (
      <Badge className={cn(getStatusBadgeClass(v as string), "border text-xs")}>
        {v as string}
      </Badge>
    ),
  },
  { key: "riskyCount", label: "Risky Accounts" },
  { key: "orphanCount", label: "Orphan Accounts" },
];

// ---------- main ----------

export default function ApplicationsAnalyticsDashboard() {
  const { data: response, isLoading } = useSWR<
    PaginatedSpringData<Application>
  >("/api/applications?page=0&size=10000", getFetcher("Failed to fetch"), {
    keepPreviousData: true,
  });

  const applications = response?.content || [];
  const [drilldown, setDrilldown] = useState<DrilldownState>(null);

  // ---- computed stats ----
  const stats = useMemo(() => {
    const total = applications.length;
    const authoritative = applications.filter((a) => a.authoritative);
    const governanceGaps = applications.filter(
      (a) => a.orphanCount > 0 || getRiskLevel(a) !== "Low",
    );
    const highRisk = applications.filter((a) => getRiskLevel(a) === "High");
    const orphanExposure = applications.filter((a) => a.orphanCount > 0);
    const provisioningEnabled = applications.filter((a) => a.flows > 0);
    const connected = applications.filter(
      (a) => a.connectionStatus === "Connected",
    );
    const problem = applications.filter(
      (a) => a.connectionStatus === "Connection Problem",
    );
    const offline = applications.filter(
      (a) => a.connectionStatus === "Offline",
    );

    return {
      total,
      authoritative,
      governanceGaps,
      highRisk,
      orphanExposure,
      provisioningEnabled,
      connected,
      problem,
      offline,
    };
  }, [applications]);

  const riskDistribution = useMemo(() => {
    const high = applications.filter((a) => getRiskLevel(a) === "High").length;
    const medium = applications.filter(
      (a) => getRiskLevel(a) === "Medium",
    ).length;
    const low = applications.filter((a) => getRiskLevel(a) === "Low").length;
    return [
      { name: "High", value: high, color: RISK_COLORS.High },
      { name: "Medium", value: medium, color: RISK_COLORS.Medium },
      { name: "Low", value: low, color: RISK_COLORS.Low },
    ];
  }, [applications]);

  const top5Risk = useMemo(() => {
    return [...applications]
      .sort((a, b) => b.riskyCount - a.riskyCount)
      .slice(0, 5)
      .map((a) => ({ name: a.name, riskyCount: a.riskyCount }));
  }, [applications]);

  const statusDistribution = useMemo(
    () => [
      {
        name: "Connected",
        value: stats.connected.length,
        color: STATUS_COLORS.Connected,
      },
      {
        name: "Problem",
        value: stats.problem.length,
        color: STATUS_COLORS["Connection Problem"],
      },
      {
        name: "Offline",
        value: stats.offline.length,
        color: STATUS_COLORS.Offline,
      },
    ],
    [stats],
  );

  const governanceMaturity = useMemo(() => {
    return applications.map((app) => ({
      ...app,
      ownerAssigned: app.authoritative,
      workflowsConfigured: app.flows > 0,
      sodMonitoring: false, // no real data yet
      activeCertification: false, // no real data yet
      complianceTags: [] as string[], // no real data yet
    }));
  }, [applications]);

  const maturityPercentages = useMemo(() => {
    const total = governanceMaturity.length || 1;
    return {
      owners: Math.round(
        (governanceMaturity.filter((a) => a.ownerAssigned).length / total) * 100,
      ),
      workflows: Math.round(
        (governanceMaturity.filter((a) => a.workflowsConfigured).length /
          total) *
          100,
      ),
      sod: Math.round(
        (governanceMaturity.filter((a) => a.sodMonitoring).length / total) * 100,
      ),
      certification: Math.round(
        (governanceMaturity.filter((a) => a.activeCertification).length /
          total) *
          100,
      ),
      compliance: Math.round(
        (governanceMaturity.filter((a) => a.complianceTags.length > 0).length /
          total) *
          100,
      ),
    };
  }, [governanceMaturity]);

  // ---- drill-down helper ----

  const openDrilldown = (
    title: string,
    description: string,
    items: Application[],
    badgeLabel?: string,
    badgeVariant?: "default" | "destructive" | "secondary" | "outline",
  ) => {
    setDrilldown({
      title,
      description,
      items: items as unknown as Record<string, unknown>[],
      columns: appDrilldownColumns,
      badgeLabel,
      badgeVariant,
    });
  };

  // ---- KPI cards ----

  const certCoverage = useMemo(() => {
    if (applications.length === 0) return "0%";
    const covered = governanceMaturity.filter(
      (a) => a.activeCertification,
    ).length;
    return `${Math.round((covered / applications.length) * 100)}%`;
  }, [applications, governanceMaturity]);

  const kpis = [
    {
      label: "Total Applications",
      value: stats.total,
      icon: AppWindow,
      tooltip:
        "Total number of integrated applications in the governance platform.",
      onClick: () =>
        openDrilldown(
          "All Applications",
          "Complete list of integrated applications.",
          applications,
          `${stats.total}`,
          "secondary",
        ),
    },
    {
      label: "Authoritative Sources",
      value: stats.authoritative.length,
      icon: Shield,
      tooltip:
        "Applications designated as authoritative identity sources.",
      onClick: () =>
        openDrilldown(
          "Authoritative Sources",
          "Applications serving as authoritative identity sources.",
          stats.authoritative,
          `${stats.authoritative.length}`,
          "default",
        ),
    },
    {
      label: "Governance Gaps",
      value: stats.governanceGaps.length,
      icon: AlertTriangle,
      tooltip:
        "Applications with orphan or risky accounts requiring attention.",
      onClick: () =>
        openDrilldown(
          "Governance Gaps",
          "Applications with orphan or risky accounts.",
          stats.governanceGaps,
          `${stats.governanceGaps.length}`,
          "destructive",
        ),
    },
    {
      label: "High-Risk Apps",
      value: stats.highRisk.length,
      icon: ShieldAlert,
      tooltip: "Applications with more than 20 risky accounts.",
      onClick: () =>
        openDrilldown(
          "High-Risk Applications",
          "Applications with significant risky account exposure.",
          stats.highRisk,
          `${stats.highRisk.length}`,
          "destructive",
        ),
    },
    {
      label: "Orphan Exposure",
      value: stats.orphanExposure.length,
      icon: UserX,
      tooltip:
        "Applications containing orphan accounts without valid owners.",
      onClick: () =>
        openDrilldown(
          "Orphan Account Exposure",
          "Applications with unowned orphan accounts.",
          stats.orphanExposure,
          `${stats.orphanExposure.length}`,
          "destructive",
        ),
    },
    {
      label: "Certification Coverage",
      value: certCoverage,
      icon: CheckCircle2,
      tooltip:
        "Percentage of applications covered by active certification campaigns.",
    },
    {
      label: "Provisioning Enabled",
      value: `${stats.provisioningEnabled.length}/${stats.total}`,
      icon: Settings2,
      tooltip:
        "Applications with automated provisioning workflows configured.",
      onClick: () =>
        openDrilldown(
          "Provisioning Enabled",
          "Applications with active provisioning workflows.",
          stats.provisioningEnabled,
          `${stats.provisioningEnabled.length}`,
          "secondary",
        ),
    },
  ];

  // ---- loading skeleton ----

  if (isLoading) {
    return (
      <div className="space-y-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-3.5 w-3.5 rounded-full" />
                </div>
                <Skeleton className="h-8 w-12 rounded mb-1" />
                <Skeleton className="h-3 w-20 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-48 w-full rounded" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-48 w-full rounded" />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No application data available for analytics.
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {/* Tier 1: Executive KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {kpis.map((kpi) => (
          <Card
            key={kpi.label}
            className={
              kpi.onClick
                ? "cursor-pointer hover:shadow-md transition-shadow"
                : ""
            }
            onClick={kpi.onClick}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
                <InfoTooltip text={kpi.tooltip} />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {kpi.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-tight">
                {kpi.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tier 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Risk Distribution</CardTitle>
              <InfoTooltip text="Distribution of applications by risk tier based on risky account counts." />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                      paddingAngle={3}
                      onClick={(entry) => {
                        const riskApps = applications.filter(
                          (a) => getRiskLevel(a) === entry.name,
                        );
                        openDrilldown(
                          `${entry.name} Risk Applications`,
                          `Applications classified as ${entry.name.toLowerCase()} risk.`,
                          riskApps,
                          `${riskApps.length}`,
                          "destructive",
                        );
                      }}
                      className="cursor-pointer"
                    >
                      {riskDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend
                      iconSize={8}
                      wrapperStyle={{ fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="h-48">
                <p className="text-xs text-muted-foreground mb-2 font-medium">
                  Top 5 Risk Contributors
                </p>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart
                    data={top5Risk}
                    layout="vertical"
                    margin={{ left: 0, right: 8, top: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                    />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      width={70}
                    />
                    <RechartsTooltip />
                    <Bar
                      dataKey="riskyCount"
                      fill="hsl(0 84.2% 60.2%)"
                      radius={[0, 4, 4, 0]}
                      barSize={14}
                      onClick={(entry) => {
                        const app = applications.find(
                          (a) => a.name === entry.name,
                        );
                        if (app)
                          openDrilldown(
                            app.name,
                            `Risk details for ${app.name}.`,
                            [app],
                            `${app.riskyCount}`,
                            "destructive",
                          );
                      }}
                      className="cursor-pointer"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Health */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Integration Health</CardTitle>
              <InfoTooltip text="Connectivity status of all integrated applications." />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                      paddingAngle={3}
                      onClick={(entry) => {
                        const statusMap: Record<string, Application[]> = {
                          Connected: stats.connected,
                          Problem: stats.problem,
                          Offline: stats.offline,
                        };
                        const apps = statusMap[entry.name] || [];
                        openDrilldown(
                          `${entry.name} Applications`,
                          `Applications with status: ${entry.name}.`,
                          apps,
                          `${apps.length}`,
                          "secondary",
                        );
                      }}
                      className="cursor-pointer"
                    >
                      {statusDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend
                      iconSize={8}
                      wrapperStyle={{ fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center gap-3">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-foreground">
                    {stats.connected.length} Connected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-foreground">
                    {stats.problem.length} Connection Issues
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <WifiOff className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-foreground">
                    {stats.offline.length} Offline
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier 3: Governance Maturity Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">
                Governance Maturity
              </CardTitle>
              <InfoTooltip text="Overview of governance configuration coverage across all applications." />
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                Owners:{" "}
                <strong className="text-foreground">
                  {maturityPercentages.owners}%
                </strong>
              </span>
              <span>
                Workflows:{" "}
                <strong className="text-foreground">
                  {maturityPercentages.workflows}%
                </strong>
              </span>
              <span>
                SoD:{" "}
                <strong className="text-foreground">
                  {maturityPercentages.sod}%
                </strong>
              </span>
              <span>
                Certification:{" "}
                <strong className="text-foreground">
                  {maturityPercentages.certification}%
                </strong>
              </span>
              <span>
                Compliance:{" "}
                <strong className="text-foreground">
                  {maturityPercentages.compliance}%
                </strong>
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application</TableHead>
                  <TableHead className="text-center">Owner</TableHead>
                  <TableHead className="text-center">Workflows</TableHead>
                  <TableHead className="text-center">
                    SoD Monitoring
                  </TableHead>
                  <TableHead className="text-center">
                    Certification
                  </TableHead>
                  <TableHead className="text-center">Compliance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {governanceMaturity.map((app) => (
                  <TableRow
                    key={app.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      openDrilldown(
                        app.name,
                        `Governance maturity details for ${app.name}.`,
                        [app],
                        undefined,
                        "secondary",
                      )
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <AppWindow className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">
                          {app.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <CircleDot
                        className={`h-4 w-4 mx-auto ${
                          app.ownerAssigned
                            ? "text-green-600"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <CircleDot
                        className={`h-4 w-4 mx-auto ${
                          app.workflowsConfigured
                            ? "text-green-600"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <CircleDot
                        className={`h-4 w-4 mx-auto ${
                          app.sodMonitoring
                            ? "text-green-600"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <CircleDot
                        className={`h-4 w-4 mx-auto ${
                          app.activeCertification
                            ? "text-green-600"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-1 justify-center">
                        {app.complianceTags.length > 0 ? (
                          app.complianceTags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground/40 text-xs">
                            —
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Drill-down Dialog */}
      {drilldown && (
        <AppDetailDrilldownDialog
          isOpen={!!drilldown}
          onClose={() => setDrilldown(null)}
          title={drilldown.title}
          description={drilldown.description}
          items={drilldown.items}
          columns={drilldown.columns}
          badgeVariant={drilldown.badgeVariant}
          badgeLabel={drilldown.badgeLabel}
        />
      )}
    </div>
  );
}
