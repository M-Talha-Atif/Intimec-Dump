import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStatusBadgeClass } from '@/utils/getBadgeClass';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { provisioningThroughputData, jobSuccessFailureData } from './data/monitoring-analytics-data';
import { useCssVariable } from '@/hooks/useCssVariable';
import { MonitoringDrilldownDrawer } from './MonitoringDrilldownDrawer';
import type { TimeRange } from './MonitoringTimeRangeSelector';

interface OperationalDashboardProps {
  timeRange?: TimeRange;
}

export const OperationalDashboard = ({ timeRange }: OperationalDashboardProps) => {
  const [drilldown, setDrilldown] = useState<{ title: string; description: string } | null>(null);
  const chart1 = useCssVariable('--chart-1');
  const chart2 = useCssVariable('--chart-2');
  const chart3 = useCssVariable('--chart-3');
  const muted = useCssVariable('--muted-foreground');

  const kpis = [
    { title: "Provisioning Success Rate", value: "98.4%", trend: "+2.1%", status: "success", description: "Last 24 hours" },
    { title: "Average Sync Latency", value: "2.3s", trend: "-0.5s", status: "success", description: "Connector sync time" },
    { title: "Failed Jobs", value: "7", trend: "+3", status: "warning", description: "Requiring attention" },
    { title: "Processing Time", value: "45m", trend: "-12m", status: "success", description: "Avg access request" },
  ];

  const components = [
    { name: "Provisioning Engine", status: "healthy", uptime: "99.98%", lastCheck: "2 mins ago", jobs: { active: 12, queued: 3, failed: 0 } },
    { name: "Access Request Workflow", status: "healthy", uptime: "99.95%", lastCheck: "1 min ago", jobs: { active: 8, queued: 15, failed: 1 } },
    { name: "SoD Policy Engine", status: "degraded", uptime: "98.2%", lastCheck: "5 mins ago", jobs: { active: 2, queued: 0, failed: 3 } },
    { name: "Certification Manager", status: "healthy", uptime: "99.9%", lastCheck: "3 mins ago", jobs: { active: 5, queued: 8, failed: 0 } },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      default: return 'bg-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    return <Badge className={cn(getStatusBadgeClass(status), "border text-xs")}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Activity className="h-5 w-5" /> Key Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {kpis.map((kpi, i) => (
              <div key={i} className="text-center cursor-pointer hover:bg-muted/50 rounded-lg p-3 transition-colors" onClick={() => setDrilldown({ title: kpi.title, description: `Detailed breakdown of ${kpi.title.toLowerCase()}.` })}>
                <div className="text-3xl font-bold text-foreground mb-1">{kpi.value}</div>
                <div className="text-sm text-muted-foreground mb-2">{kpi.title}</div>
                <div className={`text-xs font-medium ${kpi.status === 'success' ? 'text-green-600' : 'text-orange-600'}`}>{kpi.trend} {kpi.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Provisioning Throughput</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={provisioningThroughputData}>
                <CartesianGrid strokeDasharray="3 3" stroke={`hsl(${muted} / 0.2)`} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: `hsl(${muted})` }} />
                <YAxis tick={{ fontSize: 11, fill: `hsl(${muted})` }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                <Legend />
                <Area type="monotone" dataKey="created" stackId="1" stroke={`hsl(${chart1})`} fill={`hsl(${chart1} / 0.4)`} name="Created" />
                <Area type="monotone" dataKey="updated" stackId="1" stroke={`hsl(${chart2})`} fill={`hsl(${chart2} / 0.4)`} name="Updated" />
                <Area type="monotone" dataKey="failed" stackId="1" stroke={`hsl(${chart3})`} fill={`hsl(${chart3} / 0.4)`} name="Failed" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Job Success / Failure</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={jobSuccessFailureData}>
                <CartesianGrid strokeDasharray="3 3" stroke={`hsl(${muted} / 0.2)`} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: `hsl(${muted})` }} />
                <YAxis tick={{ fontSize: 11, fill: `hsl(${muted})` }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                <Legend />
                <Bar dataKey="success" stackId="1" fill={`hsl(${chart1})`} radius={[0, 0, 0, 0]} name="Success" />
                <Bar dataKey="failed" stackId="1" fill={`hsl(${chart3})`} radius={[4, 4, 0, 0]} name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Component Health */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base"><CheckCircle className="h-5 w-5" /> Component Health Status</CardTitle>
            <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-2" /> Refresh All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {components.map((component, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setDrilldown({ title: component.name, description: `Health details for ${component.name}.` })}>
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(component.status)}`} />
                  <div>
                    <h4 className="font-medium text-foreground">{component.name}</h4>
                    <p className="text-sm text-muted-foreground">Uptime: {component.uptime} • Last check: {component.lastCheck}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <div className="text-muted-foreground">Active: <span className="font-medium text-blue-600">{component.jobs.active}</span></div>
                    <div className="text-muted-foreground">
                      Queued: <span className="font-medium text-orange-600">{component.jobs.queued}</span>
                      {component.jobs.failed > 0 && <span className="ml-2">Failed: <span className="font-medium text-destructive">{component.jobs.failed}</span></span>}
                    </div>
                  </div>
                  {getStatusBadge(component.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <MonitoringDrilldownDrawer open={!!drilldown} onOpenChange={open => { if (!open) setDrilldown(null); }} title={drilldown?.title || ''} description={drilldown?.description || ''} items={[]} />
    </div>
  );
};
