import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, RefreshCw, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStatusBadgeClass } from '@/utils/getBadgeClass';
import { useCssVariable } from '@/hooks/useCssVariable';
import { downloadJson } from '@/utils/download';
import type { ConnectorMetric } from './data/monitoring-data';
import { toast } from 'sonner';

interface ConnectorDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connector: ConnectorMetric | null;
}

export const ConnectorDetailDrawer = ({ open, onOpenChange, connector }: ConnectorDetailDrawerProps) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'fail' | null>(null);
  const chart1 = useCssVariable('--chart-1');
  const muted = useCssVariable('--muted-foreground');

  if (!connector) return null;

  const handleTestConnection = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      const success = connector.status !== 'failing';
      setTestResult(success ? 'success' : 'fail');
      toast[success ? 'success' : 'error'](`Connection ${success ? 'successful' : 'failed'}`);
    }, 2000);
  };

  const handleExport = () => {
    downloadJson({ connector: connector.name, syncHistory: connector.syncHistory, errorLog: connector.errorLog, config: connector.config }, `connector-${connector.name.toLowerCase().replace(/\s/g, '-')}.json`);
    toast.success('Connector data exported');
  };

  const statusColor = getStatusBadgeClass(connector.status === 'failing' ? 'failed' : connector.status);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] flex flex-col p-0 h-full">
        <div className="flex-shrink-0 px-6 py-4">
          <SheetHeader className="space-y-1">
            <SheetTitle className="flex items-center gap-3">
              {connector.name}
              <Badge className={cn(statusColor, "border text-xs")}>{connector.status.toUpperCase()}</Badge>
            </SheetTitle>
            <SheetDescription>{connector.type} • Uptime: {connector.uptime}%</SheetDescription>
          </SheetHeader>
          <div className="flex items-center gap-3 mt-3">
            <Button variant="outline" size="sm" onClick={handleTestConnection} disabled={testing}>
              {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : testResult === 'success' ? <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> : testResult === 'fail' ? <XCircle className="h-4 w-4 mr-2 text-destructive" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="px-6 py-4 space-y-6">
            {/* Latency Chart */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Latency Trend</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={connector.latencyHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke={`hsl(${muted} / 0.2)`} />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: `hsl(${muted})` }} />
                  <YAxis tick={{ fontSize: 10, fill: `hsl(${muted})` }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke={`hsl(${chart1})`} strokeWidth={2} name="Latency (s)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Sync History */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Sync History</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {connector.syncHistory.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs">{s.date}</TableCell>
                      <TableCell>{s.records.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === 'Success' ? 'secondary' : 'destructive'}>{s.status}</Badge>
                      </TableCell>
                      <TableCell>{s.duration}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Error Log */}
            {connector.errorLog.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Error Log</h4>
                <div className="space-y-2">
                  {connector.errorLog.map((e, i) => (
                    <div key={i} className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg text-sm">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs font-mono">{e.code}</Badge>
                        <span className="text-xs text-muted-foreground">{e.ts}</span>
                      </div>
                      <p className="text-foreground mt-1">{e.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Config */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Configuration</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(connector.config).map(([key, val]) => (
                  <div key={key} className="text-sm">
                    <p className="text-muted-foreground">{key}</p>
                    <p className="font-medium text-foreground font-mono text-xs">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
