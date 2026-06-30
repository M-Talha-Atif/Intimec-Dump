import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSeverityBadgeClass } from '@/utils/getBadgeClass';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { complianceScoreTrendData } from './data/monitoring-analytics-data';
import { useCssVariable } from '@/hooks/useCssVariable';
import { MonitoringDrilldownDrawer } from './MonitoringDrilldownDrawer';
import { downloadJson } from '@/utils/download';
import { toast } from 'sonner';

export const ComplianceDashboard = () => {
  const [drilldown, setDrilldown] = useState<{ title: string; description: string } | null>(null);
  const chart1 = useCssVariable('--chart-1');
  const chart2 = useCssVariable('--chart-2');
  const chart3 = useCssVariable('--chart-3');
  const chart4 = useCssVariable('--chart-4');
  const muted = useCssVariable('--muted-foreground');

  const controls = [
    { name: 'Access Review Automation', framework: 'SOX', lastRun: '2024-06-17 08:00', status: 'passed', nextScheduled: '2024-06-24 08:00', successRate: 98 },
    { name: 'SoD Policy Enforcement', framework: 'SOX', lastRun: '2024-06-17 14:20', status: 'passed', nextScheduled: 'Continuous', successRate: 100 },
    { name: 'Data Minimization Check', framework: 'GDPR', lastRun: '2024-06-17 06:00', status: 'failed', nextScheduled: '2024-06-18 06:00', successRate: 85 },
    { name: 'Patient Data Access Audit', framework: 'HIPAA', lastRun: '2024-06-17 12:00', status: 'warning', nextScheduled: '2024-06-18 12:00', successRate: 92 },
    { name: 'Encryption Validation', framework: 'PCI DSS', lastRun: '2024-06-17 10:00', status: 'passed', nextScheduled: '2024-06-24 10:00', successRate: 100 },
    { name: 'Privilege Escalation Detection', framework: 'SOX', lastRun: '2024-06-17 14:00', status: 'passed', nextScheduled: 'Continuous', successRate: 97 },
  ];

  const auditEvents = [
    { ts: '14:45', action: 'Admin role granted', user: 'john.doe@company.com', framework: 'SOX', risk: 'high' },
    { ts: '14:30', action: 'Data export initiated', user: 'analyst@company.com', framework: 'GDPR', risk: 'medium' },
    { ts: '14:15', action: 'Patient record accessed', user: 'nurse@company.com', framework: 'HIPAA', risk: 'low' },
    { ts: '14:00', action: 'Payment config changed', user: 'devops@company.com', framework: 'PCI DSS', risk: 'high' },
    { ts: '13:45', action: 'Bulk user deletion', user: 'admin@company.com', framework: 'GDPR', risk: 'critical' },
  ];

  const statusIcon = (s: string) => {
    if (s === 'passed') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (s === 'failed') return <XCircle className="h-4 w-4 text-destructive" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
  };


  const handleExport = () => {
    downloadJson({ controls, auditEvents }, 'compliance-report.json');
    toast.success('Compliance report exported');
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 text-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setDrilldown({ title: 'Overall Compliance Score', description: 'Score breakdown across frameworks.' })}>
            <div className="text-3xl font-bold text-green-600 mb-1">94.5%</div>
            <div className="text-sm text-muted-foreground">Overall Compliance Score</div>
            <div className="text-xs text-green-600 mt-1">+2.1% this month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setDrilldown({ title: 'Open Violations', description: 'All open compliance violations.' })}>
            <div className="text-3xl font-bold text-orange-600 mb-1">8</div>
            <div className="text-sm text-muted-foreground">Open Violations</div>
            <div className="text-xs text-orange-600 mt-1">-3 from last week</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setDrilldown({ title: 'Control Execution', description: 'Control pass/fail rates.' })}>
            <div className="text-3xl font-bold text-foreground mb-1">{controls.filter(c => c.status === 'passed').length}/{controls.length}</div>
            <div className="text-sm text-muted-foreground">Controls Passing</div>
            <div className="text-xs text-green-600 mt-1">Last check: 14:20</div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Score Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Compliance Score Trend by Framework</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={complianceScoreTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={`hsl(${muted} / 0.2)`} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: `hsl(${muted})` }} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: `hsl(${muted})` }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
              <Legend />
              <Line type="monotone" dataKey="sox" stroke={`hsl(${chart1})`} strokeWidth={2} name="SOX" />
              <Line type="monotone" dataKey="gdpr" stroke={`hsl(${chart2})`} strokeWidth={2} name="GDPR" />
              <Line type="monotone" dataKey="hipaa" stroke={`hsl(${chart3})`} strokeWidth={2} name="HIPAA" />
              <Line type="monotone" dataKey="pci" stroke={`hsl(${chart4})`} strokeWidth={2} name="PCI DSS" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Control Execution Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Shield className="h-5 w-5" /> Control Execution Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {controls.map((ctrl, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setDrilldown({ title: ctrl.name, description: `Execution history for ${ctrl.name}` })}>
                <div className="flex items-center gap-3">
                  {statusIcon(ctrl.status)}
                  <div>
                    <p className="font-medium text-foreground">{ctrl.name}</p>
                    <p className="text-xs text-muted-foreground">{ctrl.framework} • Last: {ctrl.lastRun}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-xs text-muted-foreground">
                    <div>Next: {ctrl.nextScheduled}</div>
                    <div>Success: {ctrl.successRate}%</div>
                  </div>
                  <Progress value={ctrl.successRate} className="h-2 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-5 w-5 text-orange-600" /> Compliance Audit Log</CardTitle>
            <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 mr-2" /> Export Report</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditEvents.map((evt, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-12">{evt.ts}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{evt.action}</p>
                    <p className="text-xs text-muted-foreground">{evt.user}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{evt.framework}</Badge>
                  <Badge className={cn(getSeverityBadgeClass(evt.risk), "border text-xs")}>{evt.risk}</Badge>
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
