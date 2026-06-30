import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, Clock, AlertCircle, CheckCircle, RefreshCw, Settings, Loader2 } from 'lucide-react';
import { connectorMetrics, type ConnectorMetric } from './data/monitoring-data';
import { ConnectorDetailDrawer } from './ConnectorDetailDrawer';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useCssVariable } from '@/hooks/useCssVariable';
import { toast } from 'sonner';

export const ConnectorHealth = () => {
  const [selectedConnector, setSelectedConnector] = useState<ConnectorMetric | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const chart1 = useCssVariable('--chart-1');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'failing': return 'bg-destructive';
      default: return 'bg-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Healthy</Badge>;
      case 'degraded': return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Degraded</Badge>;
      case 'failing': return <Badge variant="destructive">Failing</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleTest = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTestingId(name);
    setTimeout(() => {
      setTestingId(null);
      const connector = connectorMetrics.find(c => c.name === name);
      const ok = connector?.status !== 'failing';
      toast[ok ? 'success' : 'error'](`${name}: Connection ${ok ? 'successful' : 'failed'}`);
    }, 2000);
  };

  const handleSync = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSyncingId(name);
    setTimeout(() => {
      setSyncingId(null);
      toast.success(`${name}: Sync initiated`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {connectorMetrics.map((connector) => (
          <Card
            key={connector.name}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedConnector(connector)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(connector.status)}`} />
                  <div>
                    <CardTitle className="text-lg">{connector.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{connector.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(connector.status)}
                  <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelectedConnector(connector); }}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sparkline */}
              <ResponsiveContainer width="100%" height={40}>
                <LineChart data={connector.latencyHistory}>
                  <Line type="monotone" dataKey="value" stroke={`hsl(${chart1})`} strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Uptime</span>
                  <span className="font-medium text-foreground">{connector.uptime}%</span>
                </div>
                <Progress value={connector.uptime} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Last Sync</p>
                  <p className="font-medium text-foreground">{connector.lastSync}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sync Time</p>
                  <p className="font-medium text-foreground">{connector.syncTime}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Throughput</p>
                  <p className="font-medium text-foreground">{connector.throughput}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Errors</p>
                  <p className={`font-medium ${connector.errors > 0 ? 'text-destructive' : 'text-green-600'}`}>
                    {connector.errors}
                  </p>
                </div>
              </div>

              <div className="border-t pt-3">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Jobs (Last 24h)</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{connector.jobs.successful}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span>{connector.jobs.failed}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span>{connector.jobs.pending}</span>
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={e => handleTest(connector.name, e)} disabled={testingId === connector.name}>
                  {testingId === connector.name ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                  {testingId === connector.name ? 'Testing...' : 'Test'}
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={e => handleSync(connector.name, e)} disabled={syncingId === connector.name}>
                  {syncingId === connector.name ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Activity className="h-4 w-4 mr-2" />}
                  {syncingId === connector.name ? 'Syncing...' : 'Sync Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConnectorDetailDrawer open={!!selectedConnector} onOpenChange={open => { if (!open) setSelectedConnector(null); }} connector={selectedConnector} />
    </div>
  );
};
