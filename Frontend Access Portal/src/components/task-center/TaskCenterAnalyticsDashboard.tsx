
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { TaskCenterKpiDrilldownModal } from './TaskCenterKpiDrilldownModal';
import { Task } from './TaskCenterContent';
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  ListChecks, CheckCircle, XCircle, AlertTriangle, Clock,
  RefreshCw, ArrowUp, Shield, Database, TrendingUp, TrendingDown,
  Zap, UserX, KeyRound, Moon
} from 'lucide-react';

interface TaskCenterAnalyticsDashboardProps {
  tasks: Task[];
}

export const TaskCenterAnalyticsDashboard: React.FC<TaskCenterAnalyticsDashboardProps> = ({ tasks }) => {
  const [drilldownOpen, setDrilldownOpen] = useState(false);
  const [drilldownTitle, setDrilldownTitle] = useState('');
  const [drilldownTasks, setDrilldownTasks] = useState<Task[]>([]);

  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed');
    const failed = tasks.filter(t => t.status === 'failed');
    const escalated = tasks.filter(t => t.status === 'escalated');
    const slaBreaches = tasks.filter(t => t.slaCountdown < 0);
    const highRisk = tasks.filter(t => (t as any).riskLevel === 'high' || (t as any).riskLevel === 'critical');
    const avgDuration = completed.filter(t => t.duration).reduce((s, t) => s + (t.duration || 0), 0) / (completed.filter(t => t.duration).length || 1);
    const totalRetries = tasks.reduce((s, t) => s + (t.retryCount || 0), 0);
    const totalProcessed = tasks.reduce((s, t) => s + (t.result?.processed || 0), 0);
    const successRate = total > 0 ? ((completed.length / total) * 100).toFixed(1) : '0.0';
    const failureRate = total > 0 ? ((failed.length / total) * 100).toFixed(1) : '0.0';

    return {
      total, completed, failed, escalated, slaBreaches, highRisk,
      avgDuration: Math.round(avgDuration / 60),
      avgRetry: total > 0 ? (totalRetries / total).toFixed(1) : '0',
      totalProcessed,
      successRate, failureRate
    };
  }, [tasks]);

  const openDrilldown = (title: string, filtered: Task[]) => {
    setDrilldownTitle(title);
    setDrilldownTasks(filtered);
    setDrilldownOpen(true);
  };

  // Mock execution trend data
  const executionTrend = [
    { day: 'Mon', total: 18, success: 15, failed: 3 },
    { day: 'Tue', total: 22, success: 19, failed: 3 },
    { day: 'Wed', total: 16, success: 14, failed: 2 },
    { day: 'Thu', total: 25, success: 21, failed: 4 },
    { day: 'Fri', total: 20, success: 18, failed: 2 },
    { day: 'Sat', total: 8, success: 7, failed: 1 },
    { day: 'Sun', total: 5, success: 5, failed: 0 },
  ];

  const slaTrend = [
    { day: 'Mon', compliant: 92, breached: 8 },
    { day: 'Tue', compliant: 88, breached: 12 },
    { day: 'Wed', compliant: 95, breached: 5 },
    { day: 'Thu', compliant: 84, breached: 16 },
    { day: 'Fri', compliant: 91, breached: 9 },
    { day: 'Sat', compliant: 97, breached: 3 },
    { day: 'Sun', compliant: 100, breached: 0 },
  ];

  // Task type distribution from actual data
  const typeDistribution = useMemo(() => {
    const typeMap: Record<string, { count: number; failed: number; slaOk: number }> = {};
    tasks.forEach(t => {
      if (!typeMap[t.type]) typeMap[t.type] = { count: 0, failed: 0, slaOk: 0 };
      typeMap[t.type].count++;
      if (t.status === 'failed') typeMap[t.type].failed++;
      if (t.slaCountdown >= 0) typeMap[t.type].slaOk++;
    });
    return Object.entries(typeMap).map(([type, data]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' '),
      volume: data.count,
      failureRate: data.count > 0 ? Math.round((data.failed / data.count) * 100) : 0,
      slaCompliance: data.count > 0 ? Math.round((data.slaOk / data.count) * 100) : 0,
    }));
  }, [tasks]);

  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [tasks]);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--destructive))'];

  const kpis = [
    {
      title: 'Total Tasks',
      value: metrics.total.toString(),
      sub: `${tasks.filter(t => t.status === 'running').length} running now`,
      icon: ListChecks,
      trend: '+12%',
      trendDir: 'up' as const,
      tooltip: 'Total number of tasks across all types and statuses. Tracks operational volume and capacity utilization.',
      onClick: () => openDrilldown('All Tasks', tasks),
    },
    {
      title: 'Success Rate',
      value: `${metrics.successRate}%`,
      sub: `${metrics.completed.length} completed`,
      icon: CheckCircle,
      trend: '+2.3%',
      trendDir: 'up' as const,
      tooltip: 'Percentage of tasks that completed successfully. Below 90% indicates systemic issues requiring investigation.',
      onClick: () => openDrilldown('Completed Tasks', metrics.completed),
    },
    {
      title: 'Failure Rate',
      value: `${metrics.failureRate}%`,
      sub: `${metrics.failed.length} failed`,
      icon: XCircle,
      trend: '-1.1%',
      trendDir: 'down' as const,
      tooltip: 'Percentage of tasks that failed during execution. High failure rates may indicate connector instability or workflow misconfiguration.',
      onClick: () => openDrilldown('Failed Tasks', metrics.failed),
    },
    {
      title: 'SLA Breaches',
      value: metrics.slaBreaches.length.toString(),
      sub: 'Last 24 hours',
      icon: AlertTriangle,
      trend: '+2',
      trendDir: 'up' as const,
      tooltip: 'Tasks that exceeded their defined SLA threshold. Repeated breaches may delay provisioning/deprovisioning, increasing compliance exposure.',
      onClick: () => openDrilldown('SLA Breached Tasks', metrics.slaBreaches),
    },
    {
      title: 'Avg Duration',
      value: `${metrics.avgDuration}m`,
      sub: 'Per completed task',
      icon: Clock,
      trend: '-5m',
      trendDir: 'down' as const,
      tooltip: 'Average execution time across completed tasks. Long durations may indicate performance bottlenecks or complex approval chains.',
      onClick: () => openDrilldown('Completed Tasks', metrics.completed),
    },
    {
      title: 'Avg Retry Count',
      value: metrics.avgRetry,
      sub: 'Per task execution',
      icon: RefreshCw,
      trend: '-0.2',
      trendDir: 'down' as const,
      tooltip: 'Average number of automatic retry attempts per task. High retry counts indicate connector instability or transient failures.',
      onClick: () => openDrilldown('Tasks with Retries', tasks.filter(t => (t.retryCount || 0) > 0)),
    },
    {
      title: 'Escalated Tasks',
      value: metrics.escalated.length.toString(),
      sub: 'Awaiting action',
      icon: ArrowUp,
      trend: '+1',
      trendDir: 'up' as const,
      tooltip: 'Tasks that exceeded SLA and triggered escalation to governance owners. Requires immediate managerial attention.',
      onClick: () => openDrilldown('Escalated Tasks', metrics.escalated),
    },
    {
      title: 'High-Risk Tasks',
      value: metrics.highRisk.length.toString(),
      sub: 'Critical + High risk',
      icon: Shield,
      trend: '0',
      trendDir: 'down' as const,
      tooltip: 'Tasks classified as high or critical risk. These impact privileged access, sensitive data, or critical systems.',
      onClick: () => openDrilldown('High-Risk Tasks', metrics.highRisk),
    },
    {
      title: 'Records Processed',
      value: metrics.totalProcessed.toLocaleString(),
      sub: 'Across all tasks',
      icon: Database,
      trend: '+340',
      trendDir: 'up' as const,
      tooltip: 'Total identity records processed by all tasks. Tracks automation throughput and operational capacity.',
      onClick: () => openDrilldown('Tasks with Results', tasks.filter(t => t.result)),
    },
  ];

  // Risk governance insights
  const riskInsights = useMemo(() => {
    const privilegedTasks = tasks.filter(t => (t as any).riskLevel === 'critical' || t.tags?.includes('emergency'));
    const emergencyRevocations = tasks.filter(t => t.type === 'deprovisioning' && t.tags?.includes('urgent'));
    const manualOverride = tasks.filter(t => t.triggerSource === 'ui' && ((t as any).riskLevel === 'high' || (t as any).riskLevel === 'critical'));
    const outsideHours = tasks.filter(t => {
      const hour = new Date(t.createdAt).getHours();
      return hour < 7 || hour > 19;
    });
    return [
      { label: 'Tasks Affecting Privileged Accounts', count: privilegedTasks.length, icon: KeyRound, tasks: privilegedTasks },
      { label: 'Emergency Revocation Tasks', count: emergencyRevocations.length, icon: UserX, tasks: emergencyRevocations },
      { label: 'Tasks Requiring Manual Override', count: manualOverride.length, icon: Zap, tasks: manualOverride },
      { label: 'Tasks Executed Outside Business Hours', count: outsideHours.length, icon: Moon, tasks: outsideHours },
    ];
  }, [tasks]);

  // Efficiency table: top 5 by execution count (mock)
  const efficiencyTable = useMemo(() => {
    return tasks
      .filter(t => t.duration || t.result)
      .sort((a, b) => (b.result?.processed || 0) - (a.result?.processed || 0))
      .slice(0, 5)
      .map(t => ({
        name: t.name,
        executions: t.result?.processed || 1,
        avgTime: t.duration ? `${Math.round(t.duration / 60)}m` : 'N/A',
        status: t.status,
        risk: (t as any).riskLevel || 'low',
      }));
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Tier 1: Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <Card
            key={kpi.title}
            className="cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={kpi.onClick}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">{kpi.title}</span>
                  <InfoTooltip text={kpi.tooltip} />
                </div>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">{kpi.sub}</span>
                <span className={`text-xs flex items-center gap-0.5 ${kpi.trendDir === 'down' ? 'text-green-600' : kpi.title === 'Total Tasks' || kpi.title === 'Success Rate' || kpi.title === 'Records Processed' ? 'text-green-600' : 'text-destructive'}`}>
                  {kpi.trendDir === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {kpi.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tier 2: Execution Health Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Execution Trend */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Task Execution Trend</CardTitle>
              <InfoTooltip text="Daily task execution volume over the past week. Rising trends may indicate increased operational load or batch processing activity." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={executionTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Area type="monotone" dataKey="success" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} name="Success" />
                <Area type="monotone" dataKey="failed" stackId="1" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.6} name="Failed" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* SLA Compliance Trend */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">SLA Compliance Trend</CardTitle>
              <InfoTooltip text="Percentage of tasks meeting SLA targets daily. Below 90% compliance requires process review to prevent governance exposure." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={slaTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="compliant" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.4} name="Compliant %" />
                <Area type="monotone" dataKey="breached" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.4} name="Breached %" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution Donut */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Task Status Distribution</CardTitle>
              <InfoTooltip text="Breakdown of tasks by current status. High ratios of failed or escalated tasks indicate operational issues." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task Type Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Task Type Distribution</CardTitle>
              <InfoTooltip text="Volume and failure rates by task type. Types with high failure rates need connector or workflow configuration review." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={typeDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis type="category" dataKey="type" className="text-xs" width={100} />
                <Tooltip />
                <Bar dataKey="volume" fill="hsl(var(--chart-1))" name="Volume" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tier 3: Risk & Governance + Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk & Governance Impact */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Risk & Governance Impact</CardTitle>
              <InfoTooltip text="Tasks with elevated governance implications. Privileged account tasks and emergency revocations require heightened monitoring." />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {riskInsights.map((insight) => (
                <div
                  key={insight.label}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => openDrilldown(insight.label, insight.tasks)}
                >
                  <div className="flex items-center gap-3">
                    <insight.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{insight.label}</span>
                  </div>
                  <Badge variant={insight.count > 0 ? 'destructive' : 'secondary'}>
                    {insight.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Efficiency Intelligence */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Efficiency Intelligence</CardTitle>
              <InfoTooltip text="Top tasks by processing volume and execution time. Identifies automation bottlenecks and capacity optimization opportunities." />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-5 gap-2 text-xs font-medium text-muted-foreground pb-1 border-b">
                <span className="col-span-2">Task</span>
                <span>Records</span>
                <span>Duration</span>
                <span>Risk</span>
              </div>
              {efficiencyTable.map((row, i) => (
                <div key={i} className="grid grid-cols-5 gap-2 text-sm items-center py-1.5">
                  <span className="col-span-2 truncate" title={row.name}>{row.name}</span>
                  <span className="font-mono text-xs">{row.executions.toLocaleString()}</span>
                  <span className="text-xs">{row.avgTime}</span>
                  <Badge variant={row.risk === 'critical' ? 'destructive' : row.risk === 'high' ? 'warning' : 'secondary'} className="text-xs w-fit">
                    {row.risk}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-accent/50 border">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-chart-4" />
                <span className="text-sm font-medium">Automation Savings</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">~180 hours saved this quarter through automated task execution</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <TaskCenterKpiDrilldownModal
        open={drilldownOpen}
        onOpenChange={setDrilldownOpen}
        title={drilldownTitle}
        tasks={drilldownTasks}
      />
    </div>
  );
};
