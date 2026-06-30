import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Play, Eye, Clock, User, FileText, AlertCircle, ChevronRight, Database, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStatusBadgeClass } from '@/utils/getBadgeClass';
import { useToast } from "@/hooks/use-toast";

interface ExecutionDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  execution: {
    id: string;
    timestamp: string;
    action: string;
    reportName: string;
    user: string;
    details: string;
    status: string;
    duration?: string;
    format?: string;
    rowCount?: number;
    fileSize?: string;
    dataSource?: string;
    fieldsUsed?: string[];
    filtersApplied?: number;
    deliveryMethod?: string;
    recipients?: string[];
    errorMessage?: string;
    errorTrace?: string;
    retryCount?: number;
  } | null;
}

const getMockPreviewData = (reportName: string) => {
  const previews: Record<string, { columns: string[]; rows: string[][] }> = {
    default: {
      columns: ['Identity', 'Department', 'Risk Score', 'Last Review', 'Status'],
      rows: [
        ['john.smith@corp.com', 'Finance', '95', '2024-01-10', 'Active'],
        ['sarah.jones@corp.com', 'IT', '87', '2024-01-12', 'Active'],
        ['mike.chen@corp.com', 'Engineering', '82', '2024-01-08', 'Active'],
        ['lisa.park@corp.com', 'HR', '76', '2024-01-14', 'Active'],
        ['contractor_42', 'External', '91', '2023-12-20', 'Expiring'],
      ],
    },
  };
  return previews.default;
};

type AuditEvent = { action: string; timestamp: string; status: 'current' | 'prior' | 'subsequent' };

const getAuditChain = (action: string, timestamp: string): AuditEvent[] => {
  const chain: AuditEvent[] = [
    { action, timestamp, status: 'current' },
  ];
  if (action === 'Generated') {
    chain.push({ action: 'Downloaded', timestamp: new Date(new Date(timestamp).getTime() + 300000).toLocaleString(), status: 'subsequent' });
    chain.push({ action: 'Shared', timestamp: new Date(new Date(timestamp).getTime() + 600000).toLocaleString(), status: 'subsequent' });
  } else if (action === 'Downloaded') {
    chain.unshift({ action: 'Generated', timestamp: new Date(new Date(timestamp).getTime() - 300000).toLocaleString(), status: 'prior' });
  } else if (action === 'Shared') {
    chain.unshift({ action: 'Generated', timestamp: new Date(new Date(timestamp).getTime() - 600000).toLocaleString(), status: 'prior' });
    chain.splice(1, 0, { action: 'Downloaded', timestamp: new Date(new Date(timestamp).getTime() - 300000).toLocaleString(), status: 'prior' });
  }
  return chain;
};

export const ExecutionDetailDrawer = ({ open, onOpenChange, execution }: ExecutionDetailDrawerProps) => {
  const { toast } = useToast();
  if (!execution) return null;

  const isFailed = execution.status === 'failed';
  const isGenerated = execution.action === 'Generated' && !isFailed;
  const preview = isGenerated ? getMockPreviewData(execution.reportName) : null;
  const auditChain = getAuditChain(execution.action, execution.timestamp);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Execution Details
          </DialogTitle>
          <DialogDescription>{execution.reportName} — {execution.action}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-6 pr-4">
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Report', value: execution.reportName, icon: FileText },
                { label: 'Action', value: execution.action, icon: Play },
                { label: 'Triggered By', value: execution.user, icon: User },
                { label: 'Timestamp', value: execution.timestamp, icon: Clock },
                { label: 'Duration', value: execution.duration || 'N/A', icon: Clock },
                { label: 'Status', value: execution.status, icon: Eye, isBadge: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 rounded-md border px-3 py-2">
                  <item.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    {item.isBadge ? (
                      <Badge className={cn(getStatusBadgeClass(execution.status === 'success' ? 'active' : execution.status === 'failed' ? 'inactive' : 'pending'), "border text-xs")}>{item.value}</Badge>
                    ) : (
                      <p className="text-sm font-medium truncate">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Execution Parameters */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Database className="h-3.5 w-3.5" />Execution Parameters
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md border px-3 py-2">
                  <p className="text-xs text-muted-foreground">Data Source</p>
                  <p className="text-sm font-medium">{execution.dataSource || 'Identities'}</p>
                </div>
                <div className="rounded-md border px-3 py-2">
                  <p className="text-xs text-muted-foreground">Row Count</p>
                  <p className="text-sm font-medium">{(execution.rowCount || 1248).toLocaleString()}</p>
                </div>
                <div className="rounded-md border px-3 py-2">
                  <p className="text-xs text-muted-foreground">Fields Used</p>
                  <p className="text-sm font-medium">{(execution.fieldsUsed || ['email', 'department', 'risk_score', 'status']).length} fields</p>
                </div>
                <div className="rounded-md border px-3 py-2">
                  <p className="text-xs text-muted-foreground">Filters Applied</p>
                  <p className="text-sm font-medium">{execution.filtersApplied ?? 3} conditions</p>
                </div>
              </div>
              {execution.fieldsUsed && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {(execution.fieldsUsed || ['email', 'department', 'risk_score', 'last_login', 'status']).map((f) => (
                    <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Output Details */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Output Details</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md border px-3 py-2">
                  <p className="text-xs text-muted-foreground">Format</p>
                  <p className="text-sm font-medium uppercase">{execution.format || 'PDF'}</p>
                </div>
                <div className="rounded-md border px-3 py-2">
                  <p className="text-xs text-muted-foreground">File Size</p>
                  <p className="text-sm font-medium">{execution.fileSize || '245 KB'}</p>
                </div>
                <div className="rounded-md border px-3 py-2">
                  <p className="text-xs text-muted-foreground">Delivery Method</p>
                  <p className="text-sm font-medium capitalize">{execution.deliveryMethod || 'Email'}</p>
                </div>
                <div className="rounded-md border px-3 py-2">
                  <p className="text-xs text-muted-foreground">Recipients</p>
                  <p className="text-sm font-medium">{(execution.recipients || ['admin@company.com']).length} recipient(s)</p>
                </div>
              </div>
              {(execution.recipients || ['admin@company.com', 'security@company.com']).length > 0 && (
                <div className="mt-2 space-y-1">
                  {(execution.recipients || ['admin@company.com', 'security@company.com']).map((r) => (
                    <div key={r} className="text-xs text-muted-foreground px-3 py-1 rounded border bg-muted/30">{r}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Error Details (for failures) */}
            {isFailed && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <h4 className="text-sm font-semibold text-destructive">Error Details</h4>
                </div>
                <p className="text-sm text-foreground">{execution.errorMessage || 'Connection timeout: Data source "SAP ERP" did not respond within 30 seconds.'}</p>
                <div className="rounded bg-muted p-3">
                  <p className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">{execution.errorTrace || `Error: ETIMEDOUT\n  at DataSourceConnector.fetch (datasource.ts:142)\n  at ReportEngine.execute (engine.ts:89)\n  at SchedulerWorker.run (scheduler.ts:56)`}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">Retry Count: <span className="font-medium text-foreground">{execution.retryCount ?? 2}/3</span></span>
                  <span className="text-muted-foreground">Suggested Fix: <span className="font-medium text-foreground">Check data source connectivity</span></span>
                </div>
                <Button size="sm" variant="outline" onClick={() => toast({ title: "Retry Queued", description: "Execution will retry shortly" })}>
                  <Play className="h-3.5 w-3.5 mr-1" />Retry Now
                </Button>
              </div>
            )}

            {/* Data Preview (for generated reports) */}
            {preview && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Data Preview</h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {preview.columns.map(col => <TableHead key={col}>{col}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.rows.map((row, i) => (
                        <TableRow key={i}>
                          {row.map((cell, j) => <TableCell key={j} className="text-sm text-muted-foreground">{cell}</TableCell>)}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Showing 5 of {(execution.rowCount || 1248).toLocaleString()} rows</p>
              </div>
            )}

            {/* Audit Chain */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Audit Chain</h4>
              <div className="space-y-2">
                {auditChain.map((event, i) => (
                  <div key={i} className={cn(
                    "flex items-center gap-3 rounded-md border px-3 py-2",
                    event.status === 'current' ? "border-primary bg-primary/5" : ""
                  )}>
                    {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground -ml-1" />}
                    <Badge variant={event.status === 'current' ? 'default' : 'secondary'} className="text-xs">{event.action}</Badge>
                    <span className="text-xs text-muted-foreground flex-1">{event.timestamp}</span>
                    {event.status === 'current' && <Badge variant="outline" className="text-xs">Current</Badge>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-3 pt-4 border-t">
          {isGenerated && (
            <Button variant="outline" size="sm" onClick={() => toast({ title: "Downloading Report" })}>
              <Download className="h-3.5 w-3.5 mr-1" />Download
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
