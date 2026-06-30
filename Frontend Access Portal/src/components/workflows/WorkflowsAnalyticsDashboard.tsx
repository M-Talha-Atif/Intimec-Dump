'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InfoTooltip from "@/components/dashboard/InfoTooltip";
import {
  Activity, CheckCircle, XCircle, Clock, AlertTriangle, Cpu,
  TrendingUp, Zap, BarChart3, Users, Loader2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend
} from 'recharts';
import WorkflowKpiDrilldownModal from './WorkflowKpiDrilldownModal';
import { useCssVariable } from '@/hooks/useCssVariable';
import { useWorkflowAnalytics } from '@/hooks/workflows/analytics/useWorkflowAnalytics';

interface DrilldownState {
  open: boolean;
  kpiType: string;
  title: string;
  description: string;
}

const WorkflowsAnalyticsDashboard: React.FC = () => {
  const {
    overview,
    executionTrend,
    executionDistribution,
    categoryDistribution,
    loading,
    error,
    overviewLoading,
    trendLoading,
    distributionLoading,
    categoryLoading,
  } = useWorkflowAnalytics();

  const [drilldown, setDrilldown] = useState<DrilldownState>({
    open: false,
    kpiType: '',
    title: '',
    description: '',
  });

  const primaryColor = useCssVariable("--primary");
  const destructiveColor = `hsl(${useCssVariable("--chart-5")})`;
  
  const COLORS = [
    useCssVariable("--primary"),
    `hsl(${useCssVariable("--chart-5")})`,
    useCssVariable("--muted-foreground")
  ];
  
  const CATEGORY_COLORS = [
    `hsl(${useCssVariable("--chart-1")})`,
    `hsl(${useCssVariable("--chart-2")})`,
    `hsl(${useCssVariable("--chart-3")})`,
    `hsl(${useCssVariable("--chart-4")})`,
    `hsl(${useCssVariable("--chart-5")})`,
    `hsl(${useCssVariable("--chart-6")})`,
  ];

  const openDrilldown = (kpiType: string, title: string, description: string) => {
    setDrilldown({ open: true, kpiType, title, description });
  };

  // KPI Cards Configuration (uses real API data)
  const kpis = overview ? [
    {
      title: 'Total Workflows',
      value: String(overview.totalWorkflows),
      icon: Activity,
      tooltip: 'Total number of lifecycle automation workflows defined in the platform across all statuses (active, draft, deprecated). This metric reflects your complete workflow inventory at any point in time. Data source: Real-time from workflows service (all-time count).',
      onClick: () => openDrilldown('TOTAL_WORKFLOWS', 'All Workflows', 'Complete workflow inventory'),
    },
    {
      title: 'Active / Draft',
      value: `${overview.activeWorkflows} / ${overview.draftWorkflows}`,
      icon: CheckCircle,
      tooltip: 'Active workflows are live in production and processing events. Draft workflows are under development and testing, not yet deployed. This shows your current operational vs. development pipeline split. Data source: Real-time from workflows service (all-time count).',
      onClick: () => openDrilldown('ACTIVE_DRAFT_WORKFLOWS', 'Active & Draft Workflows', 'Workflows by lifecycle status'),
    },
    {
      title: 'Automated / Manual',
      value: `${overview.automatedWorkflows} / ${overview.manualWorkflows}`,
      icon: Zap,
      tooltip: 'Automated workflows trigger on events or schedules without human intervention. Manual workflows require human initiation, reducing operational efficiency. Higher automation ratio indicates mature IAM operations. Data source: Real-time from workflows service (all-time count by trigger type).',
      onClick: () => openDrilldown('AUTOMATED_MANUAL_WORKFLOWS', 'Automation Ratio', 'Automated vs manually triggered workflows'),
    },
    {
      title: 'Success Rate',
      value: `${overview.successRate.toFixed(1)}%`,
      icon: TrendingUp,
      tooltip: 'Percentage of workflow executions that completed successfully without errors or timeouts in the last 30 days. Calculated from execution history filtered by LAST_30_DAYS time period. Target: >95% for production workflows. Data source: Real-time from execution-distribution API (last 30 days).',
      onClick: () => openDrilldown('SUCCESS_RATE_WORKFLOWS', 'Workflow Success', 'All workflows contributing to success rate'),
    },
    {
      title: 'Avg Execution Time',
      value: `${overview.averageExecutionTimeHours}h`,
      icon: Clock,
      tooltip: 'Mean time from workflow trigger to completion across all active workflows (last 30 days). High values indicate bottlenecks in approval chains, provisioning delays, or integration latency. Measured in hours from execution start to final completion. Data source: Real-time from analytics-overview API (last 30 days, milliseconds converted to hours).',
      onClick: () => openDrilldown('AVERAGE_EXECUTION_TIME_WORKFLOWS', 'Execution Times', 'Workflows sorted by average completion time'),
    },
    {
      title: 'Failed (30 Days)',
      value: String(overview.failedExecutions),
      icon: XCircle,
      tooltip: 'Total number of workflow executions that failed due to errors, timeouts, or cancellations in the past 30 days. Includes FAILED, TIMEOUT, and CANCELLED statuses. Requires investigation and remediation to prevent recurring issues. Data source: Real-time from analytics-overview API (last 30 days).',
      onClick: () => openDrilldown('FAILED_EXECUTION_WORKFLOWS', 'Failed Executions', 'Workflows with recent failures'),
    },
    {
      title: 'High-Risk Workflows',
      value: String(overview.highRiskWorkflows),
      icon: AlertTriangle,
      tooltip: 'Workflows with risk score ≥ 7/10 that handle privileged access, financial systems, production environments, or bypass standard approval chains. These workflows require enhanced monitoring, audit trails, and governance controls. Count reflects all-time high-risk workflow inventory. Data source: Real-time from workflows service (all-time count where riskScore >= 7).',
      onClick: () => openDrilldown('HIGH_RISK_WORKFLOWS', 'High-Risk Workflows', 'Workflows with risk score ≥ 7'),
    },
    {
      title: 'AI-Driven Workflows',
      value: String(overview.aiDrivenWorkflows),
      icon: Cpu,
      tooltip: 'Workflows leveraging AI/ML for intelligent risk assessment, anomaly detection, behavioral analysis, or automated decision-making in the access lifecycle. These workflows use advanced algorithms to enhance security posture and reduce manual review overhead. Data source: Real-time from workflows service (all-time count where category = AI_RISK).',
      onClick: () => openDrilldown('AI_DRIVEN_WORKFLOWS', 'AI-Driven Workflows', 'Workflows using AI capabilities'),
    },
  ] : [];

  // MOCK DATA - Automation Coverage (unchanged)
  const coverageData = [
    { name: 'JML', coverage: 78 },
    { name: 'Access Request', coverage: 65 },
    { name: 'Certification', coverage: 82 },
    { name: 'Revocation', coverage: 55 },
    { name: 'Exception', coverage: 40 },
  ];

  // Transform execution distribution for pie chart (real API data)
  const executionPieData = executionDistribution?.distribution.map(item => ({
    name: item.name,
    value: item.value,
  })) || [];

  // Transform category distribution for bar chart (real API data)
  const categoryChartData = categoryDistribution?.distribution.map(item => ({
    name: item.name,
    count: item.count,
  })) || [];

  // MOCK DATA - Risk Insights (unchanged)
  const riskInsights = useMemo(() => {
    if (!overview) return [];
    
    return [
      { label: 'Without approval steps', count: 5, items: [] },
      { label: 'Without assigned owners', count: overview.totalWorkflows, items: [] },
      { label: 'High-risk with manual trigger', count: 3, items: [] },
      { label: 'Disabled but still referenced', count: 0, items: [] },
    ];
  }, [overview]);

  // MOCK DATA - Efficiency Table (unchanged)
  const efficiencyTable = [
    { id: '1', name: 'Contractor Offboarding', executionCount: 42, averageCompletionTime: 2.3, status: 'enabled' },
    { id: '2', name: 'Executive Access Provisioning', executionCount: 18, averageCompletionTime: 4.1, status: 'enabled' },
    { id: '3', name: 'SOD Conflict Resolution', executionCount: 31, averageCompletionTime: 3.7, status: 'enabled' },
    { id: '4', name: 'Emergency Access Grant', executionCount: 9, averageCompletionTime: 1.2, status: 'enabled' },
    { id: '5', name: 'Quarterly Certification', executionCount: 156, averageCompletionTime: 5.8, status: 'enabled' },
  ];

  return (
    <div className="space-y-6 p-6 overflow-y-auto max-h-[calc(100vh-140px)]">
      {/* Tier 1: KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {overviewLoading ? (
          // Loading state for KPI cards
          Array.from({ length: 8 }).map((_, i) => (
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
        ) : error ? (
          // Error state for KPI cards
          <Card className="col-span-full">
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-destructive font-semibold">Failed to load KPIs</p>
                <p className="text-muted-foreground text-sm mt-1">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          kpis.map(kpi => (
            <Card 
              key={kpi.title} 
              className="cursor-pointer hover:shadow-md transition-shadow" 
              onClick={kpi.onClick}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                <div className="flex items-center gap-1.5">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    {kpi.title}
                  </CardTitle>
                  <InfoTooltip text={kpi.tooltip} />
                </div>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <div className="text-xl font-bold text-foreground">{kpi.value}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Tier 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Automation Coverage - MOCK DATA */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-semibold">Automation Coverage</CardTitle>
              <InfoTooltip text="Percentage of each lifecycle domain covered by automated workflows (MOCK DATA for demonstration). Shows theoretical coverage across JML (Joiner/Mover/Leaver), Access Requests, Certifications, Revocations, and Exceptions. Higher coverage reduces manual effort, human error, and compliance risk. Future versions will calculate real coverage percentages from workflow definitions." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={coverageData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} className="text-xs" />
                <YAxis type="category" dataKey="name" width={100} className="text-xs" />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="coverage" fill={primaryColor} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Execution Trend - REAL API DATA */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-semibold">Execution Trend</CardTitle>
              <InfoTooltip text="Monthly workflow execution volume and failure count over the last 6 months (REAL DATA from execution-trend API). Displays total executions per month alongside failure counts. Spikes may indicate bulk lifecycle events (e.g., mass onboarding, quarterly reviews). Rising failures require root-cause investigation and process improvements. Data refreshed on page load." />
            </div>
          </CardHeader>
          <CardContent>
            {trendLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !executionTrend || executionTrend.trend?.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-center text-muted-foreground text-sm">
                No execution trend data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={executionTrend.trend}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="executions" 
                    stroke={primaryColor} 
                    fill={primaryColor} 
                    fillOpacity={0.15} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="failures" 
                    stroke={destructiveColor} 
                    fill={destructiveColor} 
                    fillOpacity={0.15} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Success / Failure Distribution - REAL API DATA */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-semibold">Success vs Failure</CardTitle>
              <InfoTooltip text="Overall execution outcome distribution for the last 30 days (REAL DATA from execution-distribution API, time period: LAST_30_DAYS). Shows percentage breakdown: Success (COMPLETED status), Failed (FAILED + TIMEOUT + CANCELLED statuses), and Pending (RUNNING + PAUSED + PARTIAL statuses). A success rate above 95% indicates mature, well-tested workflows. Failures above 5% warrant immediate process review and remediation." />
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {distributionLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !executionDistribution || executionPieData.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-center text-muted-foreground text-sm">
                No execution distribution data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie 
                    data={executionPieData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={50} 
                    outerRadius={80} 
                    dataKey="value" 
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {executionPieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution - REAL API DATA */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-semibold">Category Distribution</CardTitle>
              <InfoTooltip text="Workflow distribution across all lifecycle categories (REAL DATA from category-distribution API, all-time count). Shows total workflow count by category: Joiner Mover Leaver, Access Request, Certification, Revocation, Exception, and AI Risk. A balanced portfolio indicates comprehensive governance automation across JML, access provisioning, compliance, and risk management domains. Data includes percentages calculated from total workflow count." />
            </div>
          </CardHeader>
          <CardContent>
            {categoryLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !categoryDistribution || categoryChartData.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-center text-muted-foreground text-sm">
                No category distribution data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryChartData}>
                  <XAxis 
                    dataKey="name" 
                    className="text-xs" 
                    angle={-15} 
                    textAnchor="end" 
                    height={50} 
                  />
                  <YAxis className="text-xs" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {categoryChartData.map((_, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tier 3: Risk Insights + Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Governance Risk Insights - MOCK DATA */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-semibold">Governance Risk Insights</CardTitle>
              <InfoTooltip text="Operational risk indicators highlighting workflows that may bypass governance controls (MOCK DATA for demonstration). Identifies workflows without approval steps, missing owners, high-risk manual triggers, and orphaned references. Each finding represents a potential audit gap requiring remediation. Future versions will integrate with real-time governance engine to analyze workflow definitions and detect control bypasses." />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {riskInsights.map(ri => (
              <div
                key={ri.label}
                className={`flex items-center justify-between p-2.5 rounded-md border ${ri.count > 0 ? 'cursor-pointer hover:bg-muted/50' : 'opacity-50'}`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-3.5 w-3.5 ${ri.count > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
                  <span className="text-sm">{ri.label}</span>
                </div>
                <Badge variant={ri.count > 0 ? 'destructive' : 'secondary'} className="text-xs">{ri.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Efficiency Intelligence - MOCK DATA */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-semibold">Efficiency Intelligence</CardTitle>
              <InfoTooltip text="Top 5 workflows ranked by execution time and volume (MOCK DATA for demonstration). Displays workflows with highest average completion time (in hours) and total execution count. Use this to identify optimization candidates, bottleneck workflows, and calculate automation ROI. Future versions will pull real execution analytics from the analytics-overview API to surface actual performance bottlenecks, SLA violations, and efficiency opportunities sorted by business impact." />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {efficiencyTable.map(w => (
                <div key={w.id} className="flex items-center justify-between text-sm p-2 rounded border">
                  <span className="font-medium truncate max-w-[40%]">{w.name}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{w.executionCount} runs</span>
                    <span>{w.averageCompletionTime}h avg</span>
                    <Badge variant="outline" className="text-xs">{w.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-md bg-muted/50 border">
              <div className="flex items-center gap-1.5 mb-1">
                <BarChart3 className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">Automation Savings</span>
              </div>
              <p className="text-xs text-muted-foreground">~320 hours saved this quarter through automated lifecycle workflows</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drilldown Modal */}
      <WorkflowKpiDrilldownModal
        open={drilldown.open}
        onOpenChange={(open) => setDrilldown(prev => ({ ...prev, open }))}
        kpiType={drilldown.kpiType}
        title={drilldown.title}
        description={drilldown.description}
      />
    </div>
  );
};

export default WorkflowsAnalyticsDashboard;