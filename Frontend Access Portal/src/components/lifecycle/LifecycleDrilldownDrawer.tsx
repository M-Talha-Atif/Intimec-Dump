import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ChevronDown, ChevronRight, AlertTriangle, Clock, Shield, Users, Server, Bot, UserMinus, UserPlus, ArrowRightLeft, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  OrphanedAccount,
  PendingLifecycleAction,
  JmlMonthlyData,
  ProvisioningMetric,
  LifecycleSlaData,
  AccessAccumulationEntry,
  ComplianceAuditEntry,
} from "@/data/mock-lifecycle";

type DrawerMode = 'events' | 'accounts' | 'actions' | 'provisioning' | 'sla' | 'accumulation' | 'compliance';

interface LifecycleDrilldownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  segmentLabel?: string;
  segmentColor?: string;
  mode: DrawerMode;
  events?: JmlMonthlyData[];
  accounts?: OrphanedAccount[];
  actions?: PendingLifecycleAction[];
  provisioning?: ProvisioningMetric[];
  sla?: LifecycleSlaData[];
  accumulation?: AccessAccumulationEntry[];
  compliance?: ComplianceAuditEntry[];
}

const riskBadge = (level: string) => {
  const variants: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
    critical: 'destructive', high: 'destructive', medium: 'secondary', low: 'outline',
  };
  return <Badge variant={variants[level] || 'outline'} className="text-[10px]">{level}</Badge>;
};

const priorityBadge = (p: string) => {
  const colors: Record<string, string> = {
    critical: 'bg-destructive text-destructive-foreground',
    high: 'bg-amber-500 text-white',
    medium: 'bg-yellow-500 text-white',
    low: 'bg-muted text-muted-foreground',
  };
  return <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", colors[p] || colors.low)}>{p}</span>;
};

const actionIcon = (type: string) => {
  switch (type) {
    case 'onboarding': return <UserPlus className="h-3.5 w-3.5 text-emerald-500" />;
    case 'offboarding': return <UserMinus className="h-3.5 w-3.5 text-destructive" />;
    case 'role-change': return <ArrowRightLeft className="h-3.5 w-3.5 text-blue-500" />;
    case 'deprovision': return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    case 'recertification': return <RefreshCw className="h-3.5 w-3.5 text-amber-500" />;
    case 'access-review': return <Shield className="h-3.5 w-3.5 text-primary" />;
    default: return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
  }
};

const LifecycleDrilldownDrawer: React.FC<LifecycleDrilldownDrawerProps> = ({
  open, onOpenChange, title, description, segmentLabel, segmentColor, mode,
  events, accounts, actions, provisioning, sla, accumulation, compliance,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleExport = () => {
    let csv = '';
    if (mode === 'accounts' && accounts) {
      const h = ["Account", "Application", "Identity", "Days Orphaned", "Risk", "Last Activity", "Reason"];
      const r = accounts.map(a => [a.accountName, a.application, a.identityName, a.daysOrphaned, a.riskLevel, a.lastActivity, a.reason]);
      csv = [h.join(","), ...r.map(x => x.join(","))].join("\n");
    } else if (mode === 'actions' && actions) {
      const h = ["Identity", "Action", "Days Pending", "Priority", "Blocker", "Application", "SLA Breached"];
      const r = actions.map(a => [a.identityName, a.actionType, a.daysPending, a.priority, `"${a.blocker}"`, a.targetApplication, a.slaBreached]);
      csv = [h.join(","), ...r.map(x => x.join(","))].join("\n");
    } else if (mode === 'provisioning' && provisioning) {
      const h = ["Application", "Total", "Success", "Failed", "Pending", "Avg Hours", "SLA Target", "Breaches"];
      const r = provisioning.map(p => [p.application, p.totalActions, p.success, p.failed, p.pending, p.avgProvisionTimeHours, p.slaTargetHours, p.slaBreach]);
      csv = [h.join(","), ...r.map(x => x.join(","))].join("\n");
    }
    if (csv) {
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/\s+/g, "_").toLowerCase()}_export.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const totalCount = mode === 'accounts' ? (accounts?.length ?? 0)
    : mode === 'actions' ? (actions?.length ?? 0)
    : mode === 'provisioning' ? (provisioning?.length ?? 0)
    : mode === 'sla' ? (sla?.length ?? 0)
    : mode === 'accumulation' ? (accumulation?.length ?? 0)
    : mode === 'compliance' ? (compliance?.length ?? 0)
    : (events?.length ?? 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0 h-full gap-0 px-4" style={{ minWidth: "50vw" }}>
        <div className="flex-shrink-0">
          <SheetHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {segmentColor && <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: segmentColor }} />}
                <SheetTitle className="text-lg">{segmentLabel ? `${title} — ${segmentLabel}` : title}</SheetTitle>
              </div>
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>
            </div>
            <SheetDescription>{description}</SheetDescription>
            <Badge variant="secondary" className="text-xs w-fit">{totalCount} {mode === 'accounts' ? 'account' : mode === 'actions' ? 'action' : 'item'}{totalCount !== 1 ? 's' : ''}</Badge>
          </SheetHeader>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-6 py-4 space-y-2">
            {/* ── Orphaned Accounts ── */}
            {mode === 'accounts' && accounts?.map(acc => {
              const isExpanded = expandedId === acc.id;
              return (
                <div key={acc.id} className="rounded-lg border bg-card">
                  <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setExpandedId(isExpanded ? null : acc.id)}>
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{acc.accountName}</span>
                        {riskBadge(acc.riskLevel)}
                        <Badge variant="outline" className="text-[10px]">{acc.accountType}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{acc.application}</span>
                        <span>{acc.daysOrphaned}d orphaned</span>
                        <span>Identity: {acc.identityName}</span>
                      </div>
                    </div>
                    {acc.riskLevel === 'critical' && <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />}
                  </div>
                  {isExpanded && (
                    <div className="border-t px-4 py-3 space-y-3 bg-muted/30">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-md bg-background p-2 text-center">
                          <p className="text-lg font-bold text-foreground">{acc.daysOrphaned}</p>
                          <p className="text-[10px] text-muted-foreground">Days Orphaned</p>
                        </div>
                        <div className="rounded-md bg-background p-2 text-center">
                          <p className="text-lg font-bold text-foreground">{acc.privileges.length}</p>
                          <p className="text-[10px] text-muted-foreground">Privileges</p>
                        </div>
                        <div className="rounded-md bg-background p-2 text-center">
                          <p className="text-sm font-bold text-foreground">{acc.lastActivity}</p>
                          <p className="text-[10px] text-muted-foreground">Last Activity</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Reason</p>
                        <p className="text-xs text-foreground">{acc.reason}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Privileges</p>
                        <div className="flex flex-wrap gap-1">
                          {acc.privileges.map((p, i) => <Badge key={i} variant="outline" className="text-[10px]">{p}</Badge>)}
                        </div>
                      </div>
                      <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800 p-2">
                        <Shield className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-amber-800 dark:text-amber-300">
                          <span className="font-medium">Recommended: </span>{acc.recommendedAction}
                        </div>
                      </div>
                      <div className="text-[10px] text-muted-foreground">Detected: {acc.detectedDate}</div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* ── Pending Actions ── */}
            {mode === 'actions' && actions?.map(action => {
              const isExpanded = expandedId === action.id;
              return (
                <div key={action.id} className="rounded-lg border bg-card">
                  <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setExpandedId(isExpanded ? null : action.id)}>
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    {actionIcon(action.actionType)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{action.identityName}</span>
                        {priorityBadge(action.priority)}
                        <Badge variant="outline" className="text-[10px]">{action.actionType}</Badge>
                        {action.slaBreached && <Badge variant="destructive" className="text-[10px]">SLA Breached</Badge>}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{action.targetApplication}</span>
                        <span>{action.daysPending}d pending</span>
                        <span>{action.affectedEntitlements} entitlements</span>
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="border-t px-4 py-3 space-y-3 bg-muted/30">
                      <div className="grid grid-cols-4 gap-3">
                        <div className="rounded-md bg-background p-2 text-center">
                          <p className="text-lg font-bold text-foreground">{action.daysPending}</p>
                          <p className="text-[10px] text-muted-foreground">Days Pending</p>
                        </div>
                        <div className="rounded-md bg-background p-2 text-center">
                          <p className="text-lg font-bold text-foreground">{action.affectedEntitlements}</p>
                          <p className="text-[10px] text-muted-foreground">Entitlements</p>
                        </div>
                        <div className="rounded-md bg-background p-2 text-center">
                          <p className="text-sm font-bold text-foreground">{action.slaDeadline}</p>
                          <p className="text-[10px] text-muted-foreground">SLA Deadline</p>
                        </div>
                        <div className="rounded-md bg-background p-2 text-center">
                          <p className="text-sm font-bold text-foreground">{action.assignee}</p>
                          <p className="text-[10px] text-muted-foreground">Assignee</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Blocker</p>
                        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-foreground">{action.blocker}</p>
                        </div>
                      </div>
                      <div className="text-[10px] text-muted-foreground">Created: {action.createdDate} • ID: {action.identityId}</div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* ── Provisioning Metrics ── */}
            {mode === 'provisioning' && provisioning?.map((pm, idx) => {
              const isExpanded = expandedId === pm.application;
              const successRate = Math.round((pm.success / pm.totalActions) * 100);
              return (
                <div key={idx} className="rounded-lg border bg-card">
                  <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setExpandedId(isExpanded ? null : pm.application)}>
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    <Server className="h-3.5 w-3.5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{pm.application}</span>
                        {pm.failed > 5 && <Badge variant="destructive" className="text-[10px]">{pm.failed} failures</Badge>}
                        {pm.slaBreach > 3 && <Badge variant="secondary" className="text-[10px]">{pm.slaBreach} SLA breaches</Badge>}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{pm.totalActions} total</span>
                        <span>{successRate}% success</span>
                        <span>Avg: {pm.avgProvisionTimeHours}h</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {successRate >= 95 ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : successRate >= 85 ? <Clock className="h-4 w-4 text-amber-500" /> : <XCircle className="h-4 w-4 text-destructive" />}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="border-t px-4 py-3 space-y-3 bg-muted/30">
                      <div className="grid grid-cols-4 gap-3">
                        <div className="rounded-md bg-background p-2 text-center">
                          <p className="text-lg font-bold text-emerald-600">{pm.success}</p>
                          <p className="text-[10px] text-muted-foreground">Success</p>
                        </div>
                        <div className="rounded-md bg-background p-2 text-center">
                          <p className="text-lg font-bold text-destructive">{pm.failed}</p>
                          <p className="text-[10px] text-muted-foreground">Failed</p>
                        </div>
                        <div className="rounded-md bg-background p-2 text-center">
                          <p className="text-lg font-bold text-amber-600">{pm.pending}</p>
                          <p className="text-[10px] text-muted-foreground">Pending</p>
                        </div>
                        <div className="rounded-md bg-background p-2 text-center">
                          <p className="text-lg font-bold text-foreground">{pm.slaBreach}</p>
                          <p className="text-[10px] text-muted-foreground">SLA Breaches</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Avg Provision Time</p>
                          <p className="text-sm font-medium">{pm.avgProvisionTimeHours}h <span className="text-muted-foreground">(target: {pm.slaTargetHours}h)</span></p>
                        </div>
                        {pm.lastFailure && (
                          <div>
                            <p className="text-xs text-muted-foreground">Last Failure</p>
                            <p className="text-sm font-medium text-destructive">{pm.lastFailure}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* ── SLA Data ── */}
            {mode === 'sla' && sla?.map((s, idx) => (
              <div key={idx} className="rounded-lg border bg-card p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{s.category}</span>
                  <Badge variant={s.compliancePercent >= 90 ? 'default' : s.compliancePercent >= 80 ? 'secondary' : 'destructive'} className="text-[10px]">
                    {s.compliancePercent}% compliant
                  </Badge>
                </div>
                <div className="grid grid-cols-5 gap-3 mt-3">
                  <div className="text-center">
                    <p className="text-lg font-bold">{s.avgHours}h</p>
                    <p className="text-[10px] text-muted-foreground">Average</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{s.targetHours}h</p>
                    <p className="text-[10px] text-muted-foreground">Target</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{s.p95Hours}h</p>
                    <p className="text-[10px] text-muted-foreground">P95</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{s.totalEvents}</p>
                    <p className="text-[10px] text-muted-foreground">Events</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-destructive">{s.breaches}</p>
                    <p className="text-[10px] text-muted-foreground">Breaches</p>
                  </div>
                </div>
                <div className="mt-2 w-full bg-muted rounded-full h-2">
                  <div
                    className={cn("h-2 rounded-full", s.compliancePercent >= 90 ? "bg-emerald-500" : s.compliancePercent >= 80 ? "bg-amber-500" : "bg-destructive")}
                    style={{ width: `${s.compliancePercent}%` }}
                  />
                </div>
              </div>
            ))}

            {/* ── Access Accumulation ── */}
            {mode === 'accumulation' && accumulation?.map((a, idx) => (
              <div key={idx} className="rounded-lg border bg-card p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{a.department}</span>
                  <Badge variant={a.excessPercent > 100 ? 'destructive' : a.excessPercent > 50 ? 'secondary' : 'outline'} className="text-[10px]">
                    +{a.excessPercent}% excess
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-3 mt-3">
                  <div className="text-center">
                    <p className="text-lg font-bold">{a.avgAtJoin}</p>
                    <p className="text-[10px] text-muted-foreground">At Join</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{a.avgCurrent}</p>
                    <p className="text-[10px] text-muted-foreground">Current</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-amber-600">{a.identitiesAboveThreshold}</p>
                    <p className="text-[10px] text-muted-foreground">&gt;150% Growth</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{a.totalMovers}</p>
                    <p className="text-[10px] text-muted-foreground">Total Movers</p>
                  </div>
                </div>
                <div className="mt-2 flex gap-1">
                  <div className="h-3 bg-primary/60 rounded" style={{ width: `${(a.avgAtJoin / a.avgCurrent) * 100}%` }} />
                  <div className="h-3 bg-destructive/60 rounded flex-1" />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Baseline ({a.avgAtJoin})</span>
                  <span>Accumulated (+{a.avgCurrent - a.avgAtJoin})</span>
                </div>
              </div>
            ))}

            {/* ── Compliance Audit ── */}
            {mode === 'compliance' && compliance?.map((c, idx) => (
              <div key={idx} className="rounded-lg border bg-card p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{c.framework}</span>
                    <Badge variant={c.status === 'compliant' ? 'default' : c.status === 'at-risk' ? 'secondary' : 'destructive'} className="text-[10px]">{c.status}</Badge>
                  </div>
                  <span className="text-sm font-bold">{c.completeness}%</span>
                </div>
                <div className="grid grid-cols-4 gap-3 mt-3">
                  <div className="text-center">
                    <p className="text-lg font-bold">{c.totalEvents}</p>
                    <p className="text-[10px] text-muted-foreground">Total Events</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald-600">{c.auditedEvents}</p>
                    <p className="text-[10px] text-muted-foreground">Audited</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-destructive">{c.missingTrails}</p>
                    <p className="text-[10px] text-muted-foreground">Missing Trails</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold">{c.nextDeadline}</p>
                    <p className="text-[10px] text-muted-foreground">Next Deadline</p>
                  </div>
                </div>
                <div className="mt-2 w-full bg-muted rounded-full h-2">
                  <div
                    className={cn("h-2 rounded-full", c.completeness >= 90 ? "bg-emerald-500" : c.completeness >= 80 ? "bg-amber-500" : "bg-destructive")}
                    style={{ width: `${c.completeness}%` }}
                  />
                </div>
              </div>
            ))}

            {/* ── JML Events (monthly summary) ── */}
            {mode === 'events' && events?.map((ev, idx) => (
              <div key={idx} className="rounded-lg border bg-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">{ev.month}</span>
                  <span className="text-xs text-muted-foreground">{ev.joiners + ev.movers + ev.leavers} total events</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-md bg-emerald-500/10 p-2">
                    <p className="text-lg font-bold text-emerald-600">{ev.joiners}</p>
                    <p className="text-[10px] text-muted-foreground">Joiners</p>
                    <div className="text-[9px] text-muted-foreground mt-1 space-y-0.5">
                      <p>Employee: {ev.joinerEmployee}</p>
                      <p>Contractor: {ev.joinerContractor}</p>
                      <p>NHI: {ev.joinerNhi}</p>
                    </div>
                  </div>
                  <div className="rounded-md bg-blue-500/10 p-2">
                    <p className="text-lg font-bold text-blue-600">{ev.movers}</p>
                    <p className="text-[10px] text-muted-foreground">Movers</p>
                    <div className="text-[9px] text-muted-foreground mt-1 space-y-0.5">
                      <p>Dept: {ev.moverDepartment}</p>
                      <p>Promo: {ev.moverPromotion}</p>
                      <p>Transfer: {ev.moverTransfer}</p>
                    </div>
                  </div>
                  <div className="rounded-md bg-destructive/10 p-2">
                    <p className="text-lg font-bold text-destructive">{ev.leavers}</p>
                    <p className="text-[10px] text-muted-foreground">Leavers</p>
                    <div className="text-[9px] text-muted-foreground mt-1 space-y-0.5">
                      <p>Voluntary: {ev.leaverVoluntary}</p>
                      <p>Involuntary: {ev.leaverInvoluntary}</p>
                      <p>Contract: {ev.leaverContractEnd}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default LifecycleDrilldownDrawer;
