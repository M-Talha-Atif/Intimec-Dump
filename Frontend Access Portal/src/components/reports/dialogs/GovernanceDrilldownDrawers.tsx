import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Download, ShieldCheck, ClipboardCheck, AlertTriangle, Clock, TrendingUp, TrendingDown, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRiskBadgeClass, getStatusBadgeClass } from '@/utils/getBadgeClass';
import { useToast } from "@/hooks/use-toast";

// ─── Compliance Score Drilldown ────────────────────────────────

const complianceBreakdown = [
  { framework: 'SOX', score: 87, target: 95, controls: 142, passing: 124, failing: 18, trend: +2.1 },
  { framework: 'GDPR', score: 92, target: 90, controls: 98, passing: 90, failing: 8, trend: +4.3 },
  { framework: 'HIPAA', score: 78, target: 85, controls: 115, passing: 90, failing: 25, trend: -1.2 },
  { framework: 'SOC2', score: 94, target: 90, controls: 76, passing: 71, failing: 5, trend: +3.0 },
  { framework: 'ISO 27001', score: 81, target: 85, controls: 114, passing: 92, failing: 22, trend: +1.8 },
  { framework: 'PCI-DSS', score: 89, target: 90, controls: 64, passing: 57, failing: 7, trend: +2.5 },
];

export const ComplianceScoreDrawer = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { toast } = useToast();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Compliance Score Breakdown
          </DialogTitle>
          <DialogDescription>Detailed compliance posture by regulatory framework</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-4 pr-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-xs text-muted-foreground">Weighted Average</p>
                <p className="text-2xl font-bold text-foreground">87</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-xs text-muted-foreground">Frameworks On-Target</p>
                <p className="text-2xl font-bold text-foreground">3 / 6</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-xs text-muted-foreground">Total Failing Controls</p>
                <p className="text-2xl font-bold text-destructive">85</p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Framework</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Target</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Controls</TableHead>
                  <TableHead className="text-right">Failing</TableHead>
                  <TableHead className="text-right">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complianceBreakdown.map((fw) => (
                  <TableRow key={fw.framework}>
                    <TableCell className="font-medium">{fw.framework}</TableCell>
                    <TableCell className="text-right font-semibold">{fw.score}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fw.target}</TableCell>
                    <TableCell><Progress value={fw.score} className="h-2 w-24" /></TableCell>
                    <TableCell className="text-right">{fw.controls}</TableCell>
                    <TableCell className="text-right text-destructive">{fw.failing}</TableCell>
                    <TableCell className="text-right">
                      <span className={cn("text-xs font-medium flex items-center justify-end gap-0.5", fw.trend >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive")}>
                        {fw.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {fw.trend > 0 ? '+' : ''}{fw.trend}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => toast({ title: "Exported", description: "Compliance breakdown exported to CSV" })}>
            <Download className="h-4 w-4 mr-2" />Export
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Certification Rate Drilldown ──────────────────────────────

const certificationCampaigns = [
  { name: 'Q4 SOX Certification', total: 480, completed: 461, onTime: 442, overdue: 19, status: 'active' },
  { name: 'Annual GDPR Review', total: 320, completed: 282, onTime: 253, overdue: 38, status: 'active' },
  { name: 'Privileged Access Review', total: 150, completed: 150, onTime: 143, overdue: 0, status: 'completed' },
  { name: 'Q1 Entitlement Review', total: 600, completed: 432, onTime: 408, overdue: 168, status: 'active' },
  { name: 'Contractor Access Audit', total: 200, completed: 182, onTime: 170, overdue: 18, status: 'active' },
  { name: 'Cloud App Recertification', total: 250, completed: 88, onTime: 80, overdue: 162, status: 'active' },
];

export const CertificationRateDrawer = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { toast } = useToast();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            Certification Completion Details
          </DialogTitle>
          <DialogDescription>All active and recent certification campaigns</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-4 pr-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-xs text-muted-foreground">Overall Rate</p>
                <p className="text-2xl font-bold text-foreground">91.4%</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-xs text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold text-foreground">5</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-xs text-muted-foreground">Total Overdue</p>
                <p className="text-2xl font-bold text-destructive">405</p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Completed</TableHead>
                  <TableHead className="text-right">On-Time</TableHead>
                  <TableHead className="text-right">Overdue</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificationCampaigns.map((c) => (
                  <TableRow key={c.name}>
                    <TableCell className="font-medium text-sm">{c.name}</TableCell>
                    <TableCell className="text-right">{c.total}</TableCell>
                    <TableCell className="text-right">{c.completed}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{c.onTime}</TableCell>
                    <TableCell className="text-right">
                      <span className={c.overdue > 0 ? "text-destructive font-medium" : "text-muted-foreground"}>{c.overdue}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(getStatusBadgeClass(c.status), "border text-xs")}>{c.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => toast({ title: "Exported", description: "Certification data exported" })}>
            <Download className="h-4 w-4 mr-2" />Export
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Open Violations Drilldown ─────────────────────────────────

const violationsData = [
  { id: 'V-001', identity: 'john.smith@corp.com', policy: 'SoD: Finance AP/AR', severity: 'critical', detected: '2024-01-10', status: 'open', application: 'SAP ERP' },
  { id: 'V-002', identity: 'sarah.jones@corp.com', policy: 'Privileged Access Policy', severity: 'critical', detected: '2024-01-08', status: 'under_review', application: 'AWS Console' },
  { id: 'V-003', identity: 'mike.chen@corp.com', policy: 'SoD: Procurement', severity: 'high', detected: '2024-01-12', status: 'open', application: 'Oracle Cloud' },
  { id: 'V-004', identity: 'admin_svc_01', policy: 'NHI Rotation Policy', severity: 'high', detected: '2024-01-05', status: 'open', application: 'Azure AD' },
  { id: 'V-005', identity: 'lisa.park@corp.com', policy: 'Minimum Necessary Access', severity: 'critical', detected: '2024-01-14', status: 'open', application: 'Workday' },
  { id: 'V-006', identity: 'contractor_42', policy: 'Contractor Access Expiry', severity: 'high', detected: '2024-01-11', status: 'under_review', application: 'ServiceNow' },
  { id: 'V-007', identity: 'dev_pipeline_03', policy: 'CI/CD Secret Rotation', severity: 'medium', detected: '2024-01-13', status: 'open', application: 'GitHub' },
  { id: 'V-008', identity: 'amy.wu@corp.com', policy: 'SoD: IT Admin + Security', severity: 'critical', detected: '2024-01-09', status: 'open', application: 'CrowdStrike' },
];

export const OpenViolationsDrawer = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { toast } = useToast();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Open Policy Violations
          </DialogTitle>
          <DialogDescription>All active violations requiring remediation</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-4 pr-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="p-3 rounded-lg border bg-card text-center">
                <p className="text-xs text-muted-foreground">Critical</p>
                <p className="text-xl font-bold text-destructive">4</p>
              </div>
              <div className="p-3 rounded-lg border bg-card text-center">
                <p className="text-xs text-muted-foreground">High</p>
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">14</p>
              </div>
              <div className="p-3 rounded-lg border bg-card text-center">
                <p className="text-xs text-muted-foreground">Medium</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">31</p>
              </div>
              <div className="p-3 rounded-lg border bg-card text-center">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold text-foreground">49</p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Identity</TableHead>
                  <TableHead>Policy</TableHead>
                  <TableHead>App</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Detected</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {violationsData.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono text-xs">{v.id}</TableCell>
                    <TableCell className="text-sm">{v.identity}</TableCell>
                    <TableCell className="text-sm max-w-[180px] truncate">{v.policy}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{v.application}</TableCell>
                    <TableCell>
                      <Badge className={cn(getRiskBadgeClass(v.severity), "border text-xs")}>{v.severity}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{v.detected}</TableCell>
                    <TableCell>
                      <Badge className={cn(getStatusBadgeClass(v.status === 'under_review' ? 'pending' : v.status === 'open' ? 'inactive' : 'active'), "border text-xs")}>
                        {v.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => toast({ title: "Exported", description: "Violations exported to CSV" })}>
            <Download className="h-4 w-4 mr-2" />Export
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Remediation Time Drilldown ────────────────────────────────

const remediationData = [
  { range: '0-3 days', count: 12, pct: 24.5 },
  { range: '4-7 days', count: 15, pct: 30.6 },
  { range: '8-14 days', count: 11, pct: 22.4 },
  { range: '15-30 days', count: 8, pct: 16.3 },
  { range: '30+ days', count: 3, pct: 6.1 },
];

const slowestCases = [
  { identity: 'legacy_batch_svc', policy: 'Service Account Rotation', days: 47, status: 'open' },
  { identity: 'vendor_api_key_02', policy: 'External API Key Expiry', days: 38, status: 'in_progress' },
  { identity: 'robert.kim@corp.com', policy: 'SoD: Treasury Controls', days: 32, status: 'in_progress' },
  { identity: 'shared_admin_dev', policy: 'Shared Account Elimination', days: 29, status: 'open' },
];

export const RemediationTimeDrawer = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { toast } = useToast();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Remediation Time Analysis
          </DialogTitle>
          <DialogDescription>Distribution of remediation durations and SLA compliance</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-6 pr-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-xs text-muted-foreground">Avg Time</p>
                <p className="text-2xl font-bold text-foreground">11.3 days</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-xs text-muted-foreground">SLA Compliance</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">77.6%</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-xs text-muted-foreground">SLA Target</p>
                <p className="text-2xl font-bold text-foreground">14 days</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3 text-foreground">Distribution</h4>
              <div className="space-y-2">
                {remediationData.map((r) => (
                  <div key={r.range} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-20">{r.range}</span>
                    <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                      <div className="h-full bg-primary/70 rounded-full flex items-center justify-end pr-2" style={{ width: `${r.pct}%` }}>
                        <span className="text-[10px] font-medium text-primary-foreground">{r.count}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">{r.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3 text-foreground">Slowest Open Cases</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Identity</TableHead>
                    <TableHead>Policy</TableHead>
                    <TableHead className="text-right">Days Open</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slowestCases.map((c) => (
                    <TableRow key={c.identity}>
                      <TableCell className="text-sm font-medium">{c.identity}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.policy}</TableCell>
                      <TableCell className="text-right text-destructive font-semibold">{c.days}</TableCell>
                      <TableCell>
                        <Badge className={cn(getStatusBadgeClass(c.status === 'in_progress' ? 'pending' : 'inactive'), "border text-xs")}>{c.status.replace('_', ' ')}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => toast({ title: "Exported", description: "Remediation data exported" })}>
            <Download className="h-4 w-4 mr-2" />Export
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Framework Detail Drawer ───────────────────────────────────

const frameworkDetails: Record<string, { controls: { name: string; status: string; lastTested: string; owner: string }[] }> = {
  'SOX': {
    controls: [
      { name: 'Access Request Approval Workflow', status: 'passing', lastTested: '2024-01-12', owner: 'IT Controls' },
      { name: 'Segregation of Duties Matrix', status: 'failing', lastTested: '2024-01-10', owner: 'Compliance' },
      { name: 'Privileged Access Review', status: 'passing', lastTested: '2024-01-14', owner: 'Security' },
      { name: 'User Access Recertification', status: 'passing', lastTested: '2024-01-11', owner: 'IAM Team' },
      { name: 'Terminated User Deprovisioning', status: 'failing', lastTested: '2024-01-09', owner: 'HR/IT' },
    ],
  },
  'GDPR': {
    controls: [
      { name: 'Data Subject Access Requests', status: 'passing', lastTested: '2024-01-13', owner: 'Privacy' },
      { name: 'Consent Management', status: 'passing', lastTested: '2024-01-12', owner: 'Privacy' },
      { name: 'Data Retention Policies', status: 'failing', lastTested: '2024-01-08', owner: 'Data Governance' },
      { name: 'Cross-Border Transfer Controls', status: 'passing', lastTested: '2024-01-10', owner: 'Legal' },
    ],
  },
};

export const FrameworkDetailDrawer = ({ open, onOpenChange, framework }: { open: boolean; onOpenChange: (open: boolean) => void; framework: string }) => {
  const { toast } = useToast();
  const details = frameworkDetails[framework] || frameworkDetails['SOX'];
  const fw = complianceBreakdown.find(f => f.framework === framework) || complianceBreakdown[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {framework} Framework Details
          </DialogTitle>
          <DialogDescription>Controls, findings, and remediation status</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-4 pr-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-2xl font-bold text-foreground">{fw.score}/100</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-xs text-muted-foreground">Target</p>
                <p className="text-2xl font-bold text-foreground">{fw.target}</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-xs text-muted-foreground">Gap</p>
                <p className={cn("text-2xl font-bold", fw.score >= fw.target ? "text-green-600 dark:text-green-400" : "text-destructive")}>
                  {fw.score >= fw.target ? 'On Target' : `${fw.target - fw.score} pts`}
                </p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Control</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Last Tested</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details.controls.map((ctrl) => (
                  <TableRow key={ctrl.name}>
                    <TableCell className="text-sm font-medium">{ctrl.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{ctrl.owner}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{ctrl.lastTested}</TableCell>
                    <TableCell>
                      <Badge className={cn(getStatusBadgeClass(ctrl.status === 'passing' ? 'active' : 'inactive'), "border text-xs")}>{ctrl.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => toast({ title: "Exported", description: `${framework} controls exported` })}>
            <Download className="h-4 w-4 mr-2" />Export
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Risk Trend Detail Drawer ──────────────────────────────────

const monthlyViolations: Record<string, { id: string; identity: string; policy: string; severity: string; date: string }[]> = {
  'Jan': [
    { id: 'V-101', identity: 'john.smith@corp.com', policy: 'SoD Violation', severity: 'critical', date: '2024-01-03' },
    { id: 'V-102', identity: 'api_svc_prod', policy: 'Key Rotation', severity: 'high', date: '2024-01-07' },
    { id: 'V-103', identity: 'lisa.park@corp.com', policy: 'Minimum Necessary', severity: 'medium', date: '2024-01-12' },
    { id: 'V-104', identity: 'contractor_88', policy: 'Access Expiry', severity: 'high', date: '2024-01-15' },
  ],
  'Dec': [
    { id: 'V-091', identity: 'sarah.jones@corp.com', policy: 'Privileged Access', severity: 'critical', date: '2023-12-05' },
    { id: 'V-092', identity: 'dev_bot_02', policy: 'NHI Policy', severity: 'high', date: '2023-12-11' },
    { id: 'V-093', identity: 'mike.chen@corp.com', policy: 'SoD: Procurement', severity: 'critical', date: '2023-12-19' },
  ],
};

export const RiskTrendDetailDrawer = ({ open, onOpenChange, month }: { open: boolean; onOpenChange: (open: boolean) => void; month: string }) => {
  const { toast } = useToast();
  const violations = monthlyViolations[month] || monthlyViolations['Jan'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Violations — {month}
          </DialogTitle>
          <DialogDescription>All policy violations detected in {month}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-180px)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Identity</TableHead>
                <TableHead>Policy</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {violations.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono text-xs">{v.id}</TableCell>
                  <TableCell className="text-sm">{v.identity}</TableCell>
                  <TableCell className="text-sm">{v.policy}</TableCell>
                  <TableCell><Badge className={cn(getRiskBadgeClass(v.severity), "border text-xs")}>{v.severity}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{v.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => toast({ title: "Exported", description: `${month} violations exported` })}>
            <Download className="h-4 w-4 mr-2" />Export
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Campaign Detail Drawer ────────────────────────────────────

const campaignReviewers = [
  { name: 'Alice Johnson', assigned: 48, completed: 46, approved: 38, revoked: 8, avgTime: '1.2 days' },
  { name: 'Bob Williams', assigned: 52, completed: 50, approved: 44, revoked: 6, avgTime: '0.8 days' },
  { name: 'Carol Martinez', assigned: 35, completed: 32, approved: 28, revoked: 4, avgTime: '2.1 days' },
  { name: 'David Lee', assigned: 44, completed: 44, approved: 40, revoked: 4, avgTime: '0.5 days' },
];

export const CampaignDetailDrawer = ({ open, onOpenChange, campaignName }: { open: boolean; onOpenChange: (open: boolean) => void; campaignName: string }) => {
  const { toast } = useToast();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            {campaignName}
          </DialogTitle>
          <DialogDescription>Reviewer breakdown and decision distribution</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-4 pr-4">
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border bg-card text-center">
                <p className="text-xs text-muted-foreground">Total Items</p>
                <p className="text-xl font-bold text-foreground">480</p>
              </div>
              <div className="p-3 rounded-lg border bg-card text-center">
                <p className="text-xs text-muted-foreground">Approved</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">410</p>
              </div>
              <div className="p-3 rounded-lg border bg-card text-center">
                <p className="text-xs text-muted-foreground">Revoked</p>
                <p className="text-xl font-bold text-destructive">39</p>
              </div>
              <div className="p-3 rounded-lg border bg-card text-center">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">31</p>
              </div>
            </div>

            <h4 className="text-sm font-semibold text-foreground">Reviewer Performance</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reviewer</TableHead>
                  <TableHead className="text-right">Assigned</TableHead>
                  <TableHead className="text-right">Done</TableHead>
                  <TableHead className="text-right">Approved</TableHead>
                  <TableHead className="text-right">Revoked</TableHead>
                  <TableHead className="text-right">Avg Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaignReviewers.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell className="font-medium text-sm">{r.name}</TableCell>
                    <TableCell className="text-right">{r.assigned}</TableCell>
                    <TableCell className="text-right">{r.completed}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{r.approved}</TableCell>
                    <TableCell className="text-right text-destructive">{r.revoked}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{r.avgTime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => toast({ title: "Exported", description: "Campaign details exported" })}>
            <Download className="h-4 w-4 mr-2" />Export
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Governance Gap Detail Drawer ──────────────────────────────

const gapIdentities = [
  { name: 'admin_legacy_01', type: 'Service Account', application: 'SAP ERP', lastActivity: '2024-01-14', risk: 'critical' },
  { name: 'john.smith@corp.com', type: 'Employee', application: 'SAP ERP', lastActivity: '2024-01-15', risk: 'high' },
  { name: 'finance_batch_02', type: 'Service Account', application: 'Oracle', lastActivity: '2023-11-20', risk: 'critical' },
  { name: 'sarah.jones@corp.com', type: 'Employee', application: 'Workday', lastActivity: '2024-01-13', risk: 'medium' },
  { name: 'shared_admin_prod', type: 'Shared Account', application: 'AWS', lastActivity: '2024-01-10', risk: 'critical' },
];

export const GovernanceGapDrawer = ({ open, onOpenChange, gap }: { open: boolean; onOpenChange: (open: boolean) => void; gap: { gap: string; affected: number; risk: string; action: string } }) => {
  const { toast } = useToast();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Governance Gap Details
          </DialogTitle>
          <DialogDescription>{gap.gap}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-4 pr-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-xs text-muted-foreground">Affected Identities</p>
                <p className="text-2xl font-bold text-foreground">{gap.affected}</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-xs text-muted-foreground">Risk Level</p>
                <Badge className={cn(getRiskBadgeClass(gap.risk), "border text-sm")}>{gap.risk}</Badge>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-xs text-muted-foreground">Recommended Action</p>
                <p className="text-xs text-foreground mt-1">{gap.action}</p>
              </div>
            </div>

            <h4 className="text-sm font-semibold text-foreground">Sample Affected Identities</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Identity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Application</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gapIdentities.map((id) => (
                  <TableRow key={id.name}>
                    <TableCell className="font-medium text-sm">{id.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{id.type}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{id.application}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{id.lastActivity}</TableCell>
                    <TableCell><Badge className={cn(getRiskBadgeClass(id.risk), "border text-xs")}>{id.risk}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="p-4 rounded-lg border bg-muted/50">
              <h4 className="text-sm font-semibold text-foreground mb-2">Remediation Steps</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Identify all affected identities and validate current access</li>
                <li>Notify identity owners and managers for remediation</li>
                <li>{gap.action}</li>
                <li>Verify remediation completion and update compliance status</li>
                <li>Schedule follow-up review in 30 days</li>
              </ol>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button onClick={() => toast({ title: "Action Initiated", description: gap.action })}>
            Take Action
          </Button>
          <Button variant="outline" onClick={() => toast({ title: "Exported", description: "Gap details exported" })}>
            <Download className="h-4 w-4 mr-2" />Export
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
