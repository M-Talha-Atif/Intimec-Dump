import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { slaEntries } from './data/monitoring-data';
import { slaComplianceTrendData } from './data/monitoring-analytics-data';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { useCssVariable } from '@/hooks/useCssVariable';
import { CheckCircle, AlertTriangle, XCircle, TrendingDown, TrendingUp } from 'lucide-react';

const statusConfig = {
  met: { icon: CheckCircle, badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', color: 'text-green-600' },
  at_risk: { icon: AlertTriangle, badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', color: 'text-yellow-600' },
  breached: { icon: XCircle, badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', color: 'text-destructive' },
};

export const SLAMonitor = () => {
  const chart1 = useCssVariable('--chart-1');
  const chart2 = useCssVariable('--chart-2');
  const chart3 = useCssVariable('--chart-3');
  const chart4 = useCssVariable('--chart-4');
  const muted = useCssVariable('--muted-foreground');

  return (
    <div className="space-y-6">
      {/* SLA Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slaEntries.map(sla => {
          const cfg = statusConfig[sla.status];
          const Icon = cfg.icon;
          return (
            <Card key={sla.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{sla.name}</CardTitle>
                  <Badge className={cfg.badge}>{sla.status.replace('_', ' ').toUpperCase()}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Target</p>
                    <p className="font-semibold text-foreground">{sla.target}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current</p>
                    <p className={`font-semibold ${cfg.color}`}>{sla.current}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Breaches</p>
                    <p className="font-semibold text-foreground">{sla.breachCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {sla.trend < 0 ? (
                    <TrendingDown className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-destructive" />
                  )}
                  <span className={sla.trend < 0 ? 'text-green-600' : 'text-destructive'}>
                    {Math.abs(sla.trend)}% {sla.trend < 0 ? 'improvement' : 'degradation'} this week
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={80}>
                  <LineChart data={sla.history}>
                    <Line type="monotone" dataKey="value" stroke={`hsl(${chart1})`} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="target" stroke={`hsl(${muted} / 0.4)`} strokeWidth={1} strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">SLA Compliance Trend (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={slaComplianceTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={`hsl(${muted} / 0.2)`} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: `hsl(${muted})` }} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: `hsl(${muted})` }} />
              <Tooltip contentStyle={{ background: `hsl(var(--background))`, border: '1px solid hsl(var(--border))' }} />
              <Legend />
              <ReferenceLine y={95} stroke={`hsl(${muted} / 0.3)`} strokeDasharray="4 4" label="Target" />
              <Line type="monotone" dataKey="accessRequest" stroke={`hsl(${chart1})`} strokeWidth={2} name="Access Request" />
              <Line type="monotone" dataKey="provisioning" stroke={`hsl(${chart2})`} strokeWidth={2} name="Provisioning" />
              <Line type="monotone" dataKey="certification" stroke={`hsl(${chart3})`} strokeWidth={2} name="Certification" />
              <Line type="monotone" dataKey="incident" stroke={`hsl(${chart4})`} strokeWidth={2} name="Incident Response" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
