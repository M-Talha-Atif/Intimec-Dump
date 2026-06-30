import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Eye, Edit, Trash, Play, Calendar, Filter, Plus, Share, RefreshCw, AlertCircle } from 'lucide-react';
import { ExecutionDetailDrawer } from './dialogs/ExecutionDetailDrawer';
import { cn } from '@/lib/utils';
import { getStatusBadgeClass } from '@/utils/getBadgeClass';
import { useToast } from "@/hooks/use-toast";
import { usePagination, StandardPagination } from '@/components/shared/StandardPagination';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  reportName: string;
  user: string;
  details: string;
  status: 'success' | 'failed' | 'in-progress';
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
  retryCount?: number;
}

const auditLogs: AuditLogEntry[] = [
  {
    id: '1', timestamp: '2024-01-15 14:30:25', action: 'Generated', reportName: 'High Risk Identities Report',
    user: 'admin@company.com', details: 'Scheduled daily report execution completed successfully',
    status: 'success', duration: '2.3s', format: 'PDF', rowCount: 1248, fileSize: '245 KB',
    dataSource: 'Identities', fieldsUsed: ['email', 'department', 'risk_score', 'last_login', 'status'],
    filtersApplied: 3, deliveryMethod: 'email', recipients: ['admin@company.com', 'security@company.com'],
  },
  {
    id: '2', timestamp: '2024-01-15 14:25:18', action: 'Downloaded', reportName: 'SOX Access Certification Status',
    user: 'compliance@company.com', details: 'Report exported in XLSX format',
    status: 'success', format: 'XLSX', rowCount: 342, fileSize: '89 KB', dataSource: 'Access Reviews',
  },
  {
    id: '3', timestamp: '2024-01-15 14:20:45', action: 'Modified', reportName: 'SoD Violations Summary',
    user: 'security@company.com', details: 'Report configuration updated — added severity filter and new columns',
    status: 'success',
  },
  {
    id: '4', timestamp: '2024-01-15 14:15:32', action: 'Shared', reportName: 'Privileged Access Audit',
    user: 'auditor@company.com', details: 'Report shared with 3 recipients via email with view-only access',
    status: 'success', recipients: ['ciso@company.com', 'cto@company.com', 'board@company.com'],
  },
  {
    id: '5', timestamp: '2024-01-15 14:10:15', action: 'Generated', reportName: 'Identity Lifecycle Metrics',
    user: 'system', details: 'Scheduled hourly report execution failed — data source timeout',
    status: 'failed', duration: '30.2s', dataSource: 'Provisioning Tasks',
    errorMessage: 'Connection timeout: SAP HCM connector did not respond within 30 seconds.',
    retryCount: 2,
  },
  {
    id: '6', timestamp: '2024-01-15 14:05:28', action: 'Scheduled', reportName: 'Compliance Posture Report',
    user: 'compliance@company.com', details: 'New quarterly schedule created — PDF delivery to board members',
    status: 'success', deliveryMethod: 'email', recipients: ['board@company.com', 'cio@company.com'],
  },
  {
    id: '7', timestamp: '2024-01-15 14:00:12', action: 'Generated', reportName: 'Orphan Account Detection',
    user: 'system', details: 'Weekly scheduled report completed — 23 orphan accounts found',
    status: 'success', duration: '5.1s', format: 'CSV', rowCount: 23, fileSize: '12 KB',
    dataSource: 'Identities', deliveryMethod: 'slack', recipients: ['#security-alerts'],
  },
  {
    id: '8', timestamp: '2024-01-15 13:55:45', action: 'Generated', reportName: 'Role Certification Digest',
    user: 'system', details: 'Monthly report generation in progress',
    status: 'in-progress', duration: '—', dataSource: 'Access Reviews',
  },
  {
    id: '9', timestamp: '2024-01-15 13:50:00', action: 'Retried', reportName: 'Identity Lifecycle Metrics',
    user: 'system', details: 'Automatic retry attempt 3/3 after previous failure',
    status: 'success', duration: '4.8s', format: 'JSON', rowCount: 2456, fileSize: '312 KB',
    dataSource: 'Provisioning Tasks',
  },
  {
    id: '10', timestamp: '2024-01-15 13:45:30', action: 'Downloaded', reportName: 'GDPR Data Access Report',
    user: 'dpo@company.com', details: 'Report downloaded for regulatory submission',
    status: 'success', format: 'PDF', fileSize: '1.2 MB', rowCount: 4521,
  },
  {
    id: '11', timestamp: '2024-01-15 13:40:15', action: 'Generated', reportName: 'Access Request Volume Analysis',
    user: 'admin@company.com', details: 'Ad-hoc report generated for weekly ops review',
    status: 'success', duration: '1.8s', format: 'XLSX', rowCount: 567, fileSize: '45 KB',
    dataSource: 'Access Requests', fieldsUsed: ['requester', 'application', 'status', 'request_date'],
  },
  {
    id: '12', timestamp: '2024-01-15 13:35:00', action: 'Modified', reportName: 'Privileged Access Audit',
    user: 'ciso@company.com', details: 'Added service account filter and changed delivery to include Slack',
    status: 'success',
  },
  {
    id: '13', timestamp: '2024-01-15 13:30:45', action: 'Generated', reportName: 'Entitlement Risk Heatmap',
    user: 'system', details: 'Scheduled report failed — insufficient permissions on target table',
    status: 'failed', duration: '0.3s', dataSource: 'Entitlements',
    errorMessage: 'Permission denied: SELECT on entitlements.risk_matrix requires elevated privileges.',
    retryCount: 0,
  },
  {
    id: '14', timestamp: '2024-01-15 13:25:10', action: 'Shared', reportName: 'SOX SoD Violations Report',
    user: 'compliance@company.com', details: 'Shared with external auditor via secure link (expires in 7 days)',
    status: 'success', recipients: ['auditor@externalfirm.com'],
  },
  {
    id: '15', timestamp: '2024-01-15 13:20:00', action: 'Generated', reportName: 'Weekly Department Summary',
    user: 'system', details: 'Weekly aggregate report for all department heads',
    status: 'success', duration: '8.4s', format: 'PDF', rowCount: 3200, fileSize: '890 KB',
    dataSource: 'Identities', deliveryMethod: 'email',
    recipients: ['hr-head@company.com', 'finance-head@company.com', 'it-head@company.com', 'eng-head@company.com'],
  },
  {
    id: '16', timestamp: '2024-01-15 13:15:30', action: 'Downloaded', reportName: 'Application Risk Assessment',
    user: 'security@company.com', details: 'Bulk download of last 3 report versions for comparison',
    status: 'success', format: 'CSV', fileSize: '156 KB',
  },
];

const getActionIcon = (action: string) => {
  switch (action.toLowerCase()) {
    case 'generated': return <Play className="h-4 w-4" />;
    case 'viewed': return <Eye className="h-4 w-4" />;
    case 'modified': return <Edit className="h-4 w-4" />;
    case 'downloaded': return <Download className="h-4 w-4" />;
    case 'deleted': return <Trash className="h-4 w-4" />;
    case 'created': case 'scheduled': return <Calendar className="h-4 w-4" />;
    case 'shared': return <Share className="h-4 w-4" />;
    case 'retried': return <RefreshCw className="h-4 w-4" />;
    default: return <Calendar className="h-4 w-4" />;
  }
};

export const ReportAuditLog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const { toast } = useToast();

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.reportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = selectedAction === 'all' || log.action.toLowerCase() === selectedAction;
    const matchesStatus = selectedStatus === 'all' || log.status === selectedStatus;
    return matchesSearch && matchesAction && matchesStatus;
  });

  const { paginatedData: paginatedLogs, paginationProps } = usePagination(filteredLogs, 10);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search execution history..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={selectedAction} onValueChange={setSelectedAction}>
          <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="generated">Generated</SelectItem>
            <SelectItem value="downloaded">Downloaded</SelectItem>
            <SelectItem value="shared">Shared</SelectItem>
            <SelectItem value="modified">Modified</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="retried">Retried</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => toast({ title: "Exporting Logs" })}>
          <Download className="h-4 w-4 mr-2" />Export
        </Button>
      </div>

      {/* Audit Log Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Execution History</span>
            <Badge variant="secondary">{filteredLogs.length} entries</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paginatedLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => { setSelectedEntry(log); setDetailDrawerOpen(true); }}
              >
                <div className="flex-shrink-0 mt-1">
                  <div className={cn(
                    "p-2 rounded-lg",
                    log.status === 'failed' ? "bg-destructive/10" : "bg-primary/10"
                  )}>
                    {log.status === 'failed' ? <AlertCircle className="h-4 w-4 text-destructive" /> : getActionIcon(log.action)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{log.action}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-foreground">{log.reportName}</span>
                    <Badge className={cn(getStatusBadgeClass(
                      log.status === 'success' ? 'active' : log.status === 'failed' ? 'inactive' : 'pending'
                    ), "border text-xs")}>{log.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{log.details}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>👤 {log.user}</span>
                    <span>📅 {log.timestamp}</span>
                    {log.duration && <span>⏱️ {log.duration}</span>}
                    {log.rowCount && <span>📊 {log.rowCount.toLocaleString()} rows</span>}
                    {log.format && <span>📄 {log.format}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No entries found matching your criteria</p>
            </div>
          )}
          <StandardPagination {...paginationProps} />
        </CardContent>
      </Card>

      <ExecutionDetailDrawer
        open={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        execution={selectedEntry}
      />
    </div>
  );
};
