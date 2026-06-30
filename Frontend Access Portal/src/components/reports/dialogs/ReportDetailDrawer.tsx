import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Play, Calendar, Share, FileText, Clock, User, Tag, ExternalLink, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStatusBadgeClass } from '@/utils/getBadgeClass';
import { useToast } from "@/hooks/use-toast";

interface ReportDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: {
    id: string;
    name: string;
    category: string;
    description: string;
    lastGenerated: string;
    frequency: string;
    status: string;
    createdBy: string;
    tags: string[];
  } | null;
  onRun?: () => void;
  onDownload?: () => void;
  onSchedule?: () => void;
  onShare?: () => void;
}

type PreviewColumn = { key: string; label: string };
type PreviewRow = Record<string, string | number>;

const getCategoryPreviewData = (category: string): { columns: PreviewColumn[]; rows: PreviewRow[] } => {
  switch (category) {
    case 'Compliance':
      return {
        columns: [
          { key: 'framework', label: 'Framework' },
          { key: 'controlId', label: 'Control ID' },
          { key: 'status', label: 'Status' },
          { key: 'score', label: 'Score' },
          { key: 'lastAssessed', label: 'Last Assessed' },
        ],
        rows: [
          { framework: 'SOX', controlId: 'SOX-AC-001', status: 'Compliant', score: 98, lastAssessed: '2024-01-14' },
          { framework: 'SOX', controlId: 'SOX-AC-002', status: 'Non-Compliant', score: 72, lastAssessed: '2024-01-14' },
          { framework: 'GDPR', controlId: 'GDPR-DP-003', status: 'Compliant', score: 95, lastAssessed: '2024-01-12' },
          { framework: 'HIPAA', controlId: 'HIPAA-AC-005', status: 'At Risk', score: 81, lastAssessed: '2024-01-10' },
          { framework: 'SOC2', controlId: 'SOC2-CC-001', status: 'Compliant', score: 100, lastAssessed: '2024-01-15' },
          { framework: 'ISO 27001', controlId: 'ISO-A9.2', status: 'Compliant', score: 94, lastAssessed: '2024-01-13' },
        ],
      };
    case 'Certification':
      return {
        columns: [
          { key: 'campaign', label: 'Campaign' },
          { key: 'reviewer', label: 'Reviewer' },
          { key: 'itemsReviewed', label: 'Items Reviewed' },
          { key: 'approvedPct', label: 'Approved %' },
          { key: 'revokedPct', label: 'Revoked %' },
          { key: 'dueDate', label: 'Due Date' },
        ],
        rows: [
          { campaign: 'Q1 SOX Review', reviewer: 'alice.manager@corp.com', itemsReviewed: 45, approvedPct: 89, revokedPct: 11, dueDate: '2024-02-15' },
          { campaign: 'Q1 SOX Review', reviewer: 'bob.director@corp.com', itemsReviewed: 32, approvedPct: 94, revokedPct: 6, dueDate: '2024-02-15' },
          { campaign: 'HIPAA Annual', reviewer: 'carol.admin@corp.com', itemsReviewed: 67, approvedPct: 82, revokedPct: 18, dueDate: '2024-03-01' },
          { campaign: 'Privileged Access', reviewer: 'dave.ciso@corp.com', itemsReviewed: 28, approvedPct: 75, revokedPct: 25, dueDate: '2024-02-28' },
          { campaign: 'Contractor Review', reviewer: 'eve.hr@corp.com', itemsReviewed: 19, approvedPct: 68, revokedPct: 32, dueDate: '2024-01-31' },
        ],
      };
    case 'Identity Lifecycle':
      return {
        columns: [
          { key: 'identity', label: 'Identity' },
          { key: 'eventType', label: 'Event Type' },
          { key: 'date', label: 'Date' },
          { key: 'sourceSystem', label: 'Source System' },
          { key: 'status', label: 'Status' },
        ],
        rows: [
          { identity: 'john.smith@corp.com', eventType: 'Joiner', date: '2024-01-15', sourceSystem: 'Workday', status: 'Completed' },
          { identity: 'sarah.jones@corp.com', eventType: 'Mover', date: '2024-01-14', sourceSystem: 'Workday', status: 'Pending Approval' },
          { identity: 'mike.chen@corp.com', eventType: 'Leaver', date: '2024-01-13', sourceSystem: 'SAP HCM', status: 'In Progress' },
          { identity: 'lisa.park@corp.com', eventType: 'Joiner', date: '2024-01-12', sourceSystem: 'Workday', status: 'Completed' },
          { identity: 'contractor_42', eventType: 'Leaver', date: '2024-01-11', sourceSystem: 'ServiceNow', status: 'Failed' },
          { identity: 'anna.white@corp.com', eventType: 'Mover', date: '2024-01-10', sourceSystem: 'Workday', status: 'Completed' },
        ],
      };
    case 'Role Governance':
      return {
        columns: [
          { key: 'roleName', label: 'Role Name' },
          { key: 'members', label: 'Members' },
          { key: 'entitlements', label: 'Entitlements' },
          { key: 'riskScore', label: 'Risk Score' },
          { key: 'lastCertified', label: 'Last Certified' },
        ],
        rows: [
          { roleName: 'Finance Admin', members: 12, entitlements: 34, riskScore: 92, lastCertified: '2024-01-10' },
          { roleName: 'IT Operations', members: 28, entitlements: 56, riskScore: 78, lastCertified: '2024-01-08' },
          { roleName: 'HR Manager', members: 8, entitlements: 22, riskScore: 65, lastCertified: '2024-01-12' },
          { roleName: 'Security Analyst', members: 5, entitlements: 41, riskScore: 88, lastCertified: '2024-01-05' },
          { roleName: 'Sales Rep', members: 45, entitlements: 15, riskScore: 35, lastCertified: '2024-01-14' },
        ],
      };
    case 'Risk':
      return {
        columns: [
          { key: 'identity', label: 'Identity' },
          { key: 'application', label: 'Application' },
          { key: 'riskScore', label: 'Risk Score' },
          { key: 'riskFactors', label: 'Risk Factors' },
          { key: 'lastReview', label: 'Last Review' },
        ],
        rows: [
          { identity: 'john.smith@corp.com', application: 'SAP ERP', riskScore: 95, riskFactors: 'SoD Conflict, Excessive Access', lastReview: '2024-01-10' },
          { identity: 'contractor_42', application: 'AWS Console', riskScore: 91, riskFactors: 'Expired Review, High Privilege', lastReview: '2023-12-20' },
          { identity: 'sarah.jones@corp.com', application: 'Salesforce', riskScore: 87, riskFactors: 'Dormant Account, SoD', lastReview: '2024-01-12' },
          { identity: 'mike.chen@corp.com', application: 'Azure AD', riskScore: 82, riskFactors: 'Orphan Account', lastReview: '2024-01-08' },
          { identity: 'admin_svc_01', application: 'Oracle DB', riskScore: 96, riskFactors: 'Service Account, No Owner', lastReview: '2023-11-15' },
        ],
      };
    case 'Operational':
      return {
        columns: [
          { key: 'workflow', label: 'Workflow' },
          { key: 'trigger', label: 'Trigger' },
          { key: 'duration', label: 'Duration' },
          { key: 'status', label: 'Status' },
          { key: 'completedAt', label: 'Completed At' },
        ],
        rows: [
          { workflow: 'Access Request Approval', trigger: 'User Request', duration: '2h 15m', status: 'Completed', completedAt: '2024-01-15 14:30' },
          { workflow: 'Role Mining Analysis', trigger: 'Scheduled', duration: '45m', status: 'Completed', completedAt: '2024-01-15 10:00' },
          { workflow: 'Provisioning: AD Group', trigger: 'Approval', duration: '3m', status: 'Completed', completedAt: '2024-01-15 09:45' },
          { workflow: 'Deprovisioning: SAP', trigger: 'Lifecycle Event', duration: '8m', status: 'Failed', completedAt: '2024-01-14 16:20' },
          { workflow: 'Certification Reminder', trigger: 'Scheduled', duration: '1m', status: 'Completed', completedAt: '2024-01-14 08:00' },
          { workflow: 'SoD Check', trigger: 'Access Request', duration: '12s', status: 'Completed', completedAt: '2024-01-15 14:28' },
        ],
      };
    default:
      return {
        columns: [
          { key: 'identity', label: 'Identity' },
          { key: 'department', label: 'Department' },
          { key: 'riskScore', label: 'Risk Score' },
          { key: 'lastReview', label: 'Last Review' },
          { key: 'status', label: 'Status' },
        ],
        rows: [
          { identity: 'john.smith@corp.com', department: 'Finance', riskScore: 95, lastReview: '2024-01-10', status: 'Active' },
          { identity: 'sarah.jones@corp.com', department: 'IT', riskScore: 87, lastReview: '2024-01-12', status: 'Active' },
          { identity: 'mike.chen@corp.com', department: 'Engineering', riskScore: 82, lastReview: '2024-01-08', status: 'Active' },
          { identity: 'lisa.park@corp.com', department: 'HR', riskScore: 76, lastReview: '2024-01-14', status: 'Active' },
          { identity: 'contractor_42', department: 'External', riskScore: 91, lastReview: '2023-12-20', status: 'Expiring' },
        ],
      };
  }
};

const getCategoryExecutionHistory = (category: string) => {
  const baseHistory = [
    { id: 'E-001', date: '2024-01-15 14:30', status: 'success', rows: 1248, duration: '3.2s', triggeredBy: 'Schedule' },
    { id: 'E-002', date: '2024-01-14 09:15', status: 'success', rows: 1235, duration: '2.8s', triggeredBy: 'Manual' },
    { id: 'E-003', date: '2024-01-13 14:30', status: 'failed', rows: 0, duration: '12.1s', triggeredBy: 'Schedule' },
    { id: 'E-004', date: '2024-01-12 14:30', status: 'success', rows: 1221, duration: '3.5s', triggeredBy: 'Schedule' },
    { id: 'E-005', date: '2024-01-11 10:00', status: 'success', rows: 1198, duration: '2.9s', triggeredBy: 'Manual' },
  ];
  const rowMultiplier: Record<string, number> = {
    'Compliance': 0.5, 'Certification': 0.3, 'Identity Lifecycle': 2.0,
    'Role Governance': 0.2, 'Risk': 0.8, 'Operational': 3.0,
  };
  const mult = rowMultiplier[category] || 1;
  return baseHistory.map(h => ({ ...h, rows: Math.round(h.rows * mult) }));
};

const getReportParameters = (category: string): { label: string; value: string }[] => {
  switch (category) {
    case 'Compliance': return [
      { label: 'Framework', value: 'SOX, GDPR, HIPAA' },
      { label: 'Date Range', value: 'Last 30 days' },
      { label: 'Include Remediated', value: 'No' },
    ];
    case 'Certification': return [
      { label: 'Campaign Status', value: 'Active, Completed' },
      { label: 'Reviewer Type', value: 'All' },
      { label: 'Overdue Only', value: 'No' },
    ];
    case 'Identity Lifecycle': return [
      { label: 'Event Types', value: 'Joiner, Mover, Leaver' },
      { label: 'Source System', value: 'All' },
      { label: 'Date Range', value: 'Last 90 days' },
    ];
    case 'Role Governance': return [
      { label: 'Risk Threshold', value: '≥ 50' },
      { label: 'Include Empty Roles', value: 'No' },
      { label: 'Certification Status', value: 'All' },
    ];
    case 'Risk': return [
      { label: 'Risk Score Minimum', value: '70' },
      { label: 'Include Service Accounts', value: 'Yes' },
      { label: 'Risk Factor', value: 'All' },
    ];
    case 'Operational': return [
      { label: 'Workflow Type', value: 'All' },
      { label: 'Status', value: 'Completed, Failed' },
      { label: 'Date Range', value: 'Last 7 days' },
    ];
    default: return [
      { label: 'Date Range', value: 'Last 30 days' },
      { label: 'Status Filter', value: 'All' },
    ];
  }
};

const getRelatedReports = (category: string): { name: string; category: string }[] => {
  const related: Record<string, { name: string; category: string }[]> = {
    'Compliance': [
      { name: 'SOX SoD Violations Report', category: 'Compliance' },
      { name: 'GDPR Data Access Report', category: 'Compliance' },
      { name: 'Compliance Trend Analysis', category: 'Compliance' },
    ],
    'Certification': [
      { name: 'Overdue Certifications Report', category: 'Certification' },
      { name: 'Reviewer Performance Summary', category: 'Certification' },
    ],
    'Identity Lifecycle': [
      { name: 'Orphan Account Detection', category: 'Identity Lifecycle' },
      { name: 'JML Processing Time Report', category: 'Identity Lifecycle' },
    ],
    'Role Governance': [
      { name: 'Role Mining Opportunities', category: 'Role Governance' },
      { name: 'Entitlement Sprawl Analysis', category: 'Role Governance' },
    ],
    'Risk': [
      { name: 'High Risk Identity Trends', category: 'Risk' },
      { name: 'Application Risk Heatmap', category: 'Risk' },
    ],
    'Operational': [
      { name: 'SLA Compliance Report', category: 'Operational' },
      { name: 'Provisioning Failure Analysis', category: 'Operational' },
    ],
  };
  return related[category] || [{ name: 'Custom Report Template', category: 'Custom' }];
};

export const ReportDetailDrawer = ({ open, onOpenChange, report, onRun, onDownload, onSchedule, onShare }: ReportDetailDrawerProps) => {
  const { toast } = useToast();
  if (!report) return null;

  const { columns, rows } = getCategoryPreviewData(report.category);
  const executionHistory = getCategoryExecutionHistory(report.category);
  const parameters = getReportParameters(report.category);
  const relatedReports = getRelatedReports(report.category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {report.name}
          </DialogTitle>
          <DialogDescription>{report.description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-6 pr-4">
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium text-foreground">{report.category}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Frequency:</span>
                  <span className="font-medium text-foreground">{report.frequency}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Created by:</span>
                  <span className="font-medium text-foreground">{report.createdBy}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Last run:</span>
                  <span className="font-medium text-foreground">{report.lastGenerated}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={cn(getStatusBadgeClass(report.status), "border text-xs")}>{report.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {report.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { onRun?.(); toast({ title: "Report Running", description: "Generating latest data..." }); }}>
                <Play className="h-3.5 w-3.5 mr-1" />Run Now
              </Button>
              <Button variant="outline" size="sm" onClick={() => { onDownload?.(); toast({ title: "Downloading", description: "Preparing export..." }); }}>
                <Download className="h-3.5 w-3.5 mr-1" />Download
              </Button>
              <Button variant="outline" size="sm" onClick={() => { onSchedule?.(); }}>
                <Calendar className="h-3.5 w-3.5 mr-1" />Schedule
              </Button>
              <Button variant="outline" size="sm" onClick={() => { onShare?.(); toast({ title: "Share", description: "Opening share options..." }); }}>
                <Share className="h-3.5 w-3.5 mr-1" />Share
              </Button>
            </div>

            {/* Report Parameters */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Filter className="h-3.5 w-3.5" />Report Parameters
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {parameters.map((param) => (
                  <div key={param.label} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-xs text-muted-foreground">{param.label}</span>
                    <span className="text-xs font-medium text-foreground">{param.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Execution History */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Recent Executions</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Rows</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
                    <TableHead>Trigger</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executionHistory.map((exec) => (
                    <TableRow key={exec.id}>
                      <TableCell className="text-sm text-muted-foreground">{exec.date}</TableCell>
                      <TableCell>
                        <Badge className={cn(getStatusBadgeClass(exec.status === 'success' ? 'active' : 'inactive'), "border text-xs")}>{exec.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">{exec.rows.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{exec.duration}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{exec.triggeredBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Data Preview */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Data Preview (Last Run)</h4>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((col) => (
                        <TableHead key={col.key}>{col.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, idx) => (
                      <TableRow key={idx}>
                        {columns.map((col) => (
                          <TableCell key={col.key} className="text-sm">
                            {col.key === 'riskScore' || col.key === 'score' ? (
                              <span className={cn("font-semibold", Number(row[col.key]) >= 90 ? "text-destructive" : Number(row[col.key]) >= 80 ? "text-orange-600 dark:text-orange-400" : "text-foreground")}>
                                {row[col.key]}
                              </span>
                            ) : col.key === 'status' ? (
                              <Badge className={cn(getStatusBadgeClass(
                                String(row[col.key]).toLowerCase().includes('compli') || String(row[col.key]).toLowerCase() === 'completed' || String(row[col.key]).toLowerCase() === 'active' ? 'active' : 
                                String(row[col.key]).toLowerCase().includes('fail') || String(row[col.key]).toLowerCase().includes('non') ? 'inactive' : 'pending'
                              ), "border text-xs")}>{String(row[col.key])}</Badge>
                            ) : (
                              <span className="text-muted-foreground">{String(row[col.key])}</span>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Showing {rows.length} of {executionHistory[0]?.rows.toLocaleString() || '0'} rows</p>
            </div>

            {/* Related Reports */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <ExternalLink className="h-3.5 w-3.5" />Related Reports
              </h4>
              <div className="space-y-2">
                {relatedReports.map((rel) => (
                  <div key={rel.name} className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm text-foreground">{rel.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{rel.category}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={() => { toast({ title: "Exporting", description: "Preparing CSV export..." }); }}>
            <Download className="h-3.5 w-3.5 mr-1" />Export
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
