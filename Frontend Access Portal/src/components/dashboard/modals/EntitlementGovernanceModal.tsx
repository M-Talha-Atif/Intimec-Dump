"use client"
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid,
} from "recharts";
import { entitlementMetrics, mockEntitlements } from "@/services/mockRoleEntitlementMetrics";
import { cn } from "@/lib/utils";
import { useCssVariable } from '@/hooks/useCssVariable';
import { useTranslations } from "next-intl";

// ---------------------------------------------------------------------------
// Derived data helpers
// ---------------------------------------------------------------------------

const riskByApplication = () => {
  const riskMap = new Map();

  mockEntitlements.forEach(ent => {
    if (!riskMap.has(ent.application)) {
      riskMap.set(ent.application, { application: ent.application, low: 0, medium: 0, high: 0 });
    }
    const appData = riskMap.get(ent.application);
    switch (ent.risk) {
      case 'Low':    appData.low++;    break;
      case 'Medium': appData.medium++; break;
      case 'High':   appData.high++;   break;
    }
  });

  return Array.from(riskMap.values());
};

const highRiskEntitlements = mockEntitlements.filter(ent => ent.risk === 'High');

const TYPE_COLORS      = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
const LIFECYCLE_COLORS = ["hsl(var(--chart-2))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const typeData = Object.entries(entitlementMetrics.byType).map(([name, value]) => ({ name, value }));

const appData = Object.entries(entitlementMetrics.byApplication)
  .map(([app, count]) => ({ application: app, count }))
  .sort((a, b) => b.count - a.count);

const lifecycleData = [
  { name: "Active",     value: entitlementMetrics.byLifecycle.active },
  { name: "Deprecated", value: entitlementMetrics.byLifecycle.deprecated },
  { name: "Orphaned",   value: entitlementMetrics.byLifecycle.orphaned },
  { name: "Inactive",   value: entitlementMetrics.byLifecycle.inactive },
].filter(d => d.value > 0);

const utilizationData = [
  { name: "Assigned",   value: entitlementMetrics.assignedEntitlements },
  { name: "Unassigned", value: entitlementMetrics.unassignedEntitlements },
];

const certifiedEntitlements = mockEntitlements.filter(e => e.reviewHistory?.length > 0);
const uncertifiedList        = mockEntitlements.filter(e => !e.reviewHistory || e.reviewHistory.length === 0);

// ---------------------------------------------------------------------------
// Badge helpers
// ---------------------------------------------------------------------------

const getRiskBadgeClass = (risk: string) => {
  switch (risk?.toLowerCase()) {
    case 'high':   return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
    case 'medium': return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
    case 'low':    return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
    default:       return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700";
  }
};

const getLifecycleBadgeClass = (lifecycle: string) => {
  switch (lifecycle?.toLowerCase()) {
    case 'orphaned':   return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
    case 'deprecated': return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
    case 'inactive':   return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    case 'active':     return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
    default:           return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700";
  }
};

const getPrivilegeBadgeClass = (privilege: string) => {
  switch (privilege?.toLowerCase()) {
    case 'admin': return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
    case 'write': return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
    case 'read':  return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    default:      return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700";
  }
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  defaultTab?: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const EntitlementGovernanceModal = ({ open, onClose, defaultTab = "distribution" }: Props) => {
  const t             = useTranslations("dashboard.modals.entitlementGovernanceAnalytics");
  const primaryColor  = useCssVariable('--primary');
  const mutedForeground = useCssVariable('--muted-foreground');

  const certificationPct = Math.round((certifiedEntitlements.length / mockEntitlements.length) * 100);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-5xl flex flex-col p-0 h-full">
        <div className="flex flex-col h-full min-w-0">

          {/* Fixed Header */}
          <div className="flex-shrink-0 px-6 py-4">
            <SheetHeader className="p-0">
              <SheetTitle>{t("title")}</SheetTitle>
              <SheetDescription>{t("description")}</SheetDescription>
            </SheetHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <Tabs defaultValue={defaultTab} className="w-full">

                {/* Tab triggers */}
                <TabsList className="w-full">
                  <TabsTrigger value="distribution" className="flex-1">{t("tabs.distribution")}</TabsTrigger>
                  <TabsTrigger value="risk"         className="flex-1">{t("tabs.risk")}</TabsTrigger>
                  <TabsTrigger value="utilization"  className="flex-1">{t("tabs.utilization")}</TabsTrigger>
                  <TabsTrigger value="certification" className="flex-1">{t("tabs.certification")}</TabsTrigger>
                  <TabsTrigger value="compliance"   className="flex-1">{t("tabs.compliance")}</TabsTrigger>
                </TabsList>

                {/* ── Distribution ── */}
                <TabsContent value="distribution" className="space-y-6 mt-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-muted-foreground">{t("distribution.byApplication")}</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={appData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" allowDecimals={false} />
                          <YAxis type="category" dataKey="application" width={110} tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="count" fill={primaryColor} radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-muted-foreground">{t("distribution.byType")}</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={typeData}
                            cx="50%" cy="50%"
                            innerRadius={45} outerRadius={80}
                            paddingAngle={3} dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {typeData.map((_, i) => <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">{t("distribution.privilegeByApplication")}</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={entitlementMetrics.privilegeByApplication.filter(a => a.read + a.write + a.admin > 1)}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="application" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="read"  stackId="a" fill="hsl(var(--chart-1))" name="Read" />
                        <Bar dataKey="write" stackId="a" fill="hsl(var(--chart-2))" name="Write" />
                        <Bar dataKey="admin" stackId="a" fill="hsl(var(--chart-3))" name="Admin" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                {/* ── Risk ── */}
                <TabsContent value="risk" className="space-y-6 mt-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-muted-foreground">{t("risk.byApplication")}</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("table.application")}</TableHead>
                            <TableHead className="text-center">{t("risk.low")}</TableHead>
                            <TableHead className="text-center">{t("risk.medium")}</TableHead>
                            <TableHead className="text-center">{t("risk.high")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {riskByApplication().slice(0, 8).map(app => (
                            <TableRow key={app.application}>
                              <TableCell className="text-xs font-medium">{app.application}</TableCell>
                              <TableCell className="text-center">
                                {app.low > 0 && (
                                  <Badge className={cn(getRiskBadgeClass('low'), "text-xs border")}>{app.low}</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {app.medium > 0 && (
                                  <Badge className={cn(getRiskBadgeClass('medium'), "text-xs border")}>{app.medium}</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {app.high > 0 && (
                                  <Badge className={cn(getRiskBadgeClass('high'), "text-xs border")}>{app.high}</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-muted-foreground">{t("risk.lifecycle")}</h4>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={lifecycleData}
                            cx="50%" cy="50%"
                            innerRadius={45} outerRadius={75}
                            paddingAngle={4} dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {lifecycleData.map((_, i) => <Cell key={i} fill={LIFECYCLE_COLORS[i]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">{t("risk.highRiskEntitlements")}</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("table.entitlement")}</TableHead>
                          <TableHead>{t("table.application")}</TableHead>
                          <TableHead>{t("table.privilege")}</TableHead>
                          <TableHead>{t("table.lifecycle")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {highRiskEntitlements.slice(0, 10).map(ent => (
                          <TableRow key={ent.id}>
                            <TableCell className="font-medium text-xs">{ent.displayName}</TableCell>
                            <TableCell className="text-xs">{ent.application}</TableCell>
                            <TableCell>
                              <Badge className={cn(getPrivilegeBadgeClass(ent.privilegeLevel), "text-xs border")}>
                                {ent.privilegeLevel || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn(getLifecycleBadgeClass(ent.lifecycle), "text-xs border")}>
                                {ent.lifecycle || 'Active'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* ── Utilization ── */}
                <TabsContent value="utilization" className="space-y-6 mt-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-muted-foreground">{t("utilization.assigned")}</h4>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={utilizationData}
                            cx="50%" cy="50%"
                            innerRadius={45} outerRadius={75}
                            paddingAngle={4} dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            <Cell fill="hsl(var(--chart-2))" />
                            <Cell fill={mutedForeground} />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-muted-foreground">{t("utilization.accessType")}</h4>
                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t("utilization.roleBased")}</span>
                            <span className="font-semibold text-foreground">{entitlementMetrics.roleBasedPercent}%</span>
                          </div>
                          <Progress value={entitlementMetrics.roleBasedPercent} className="h-3 [&>div]:bg-primary" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t("utilization.direct")}</span>
                            <span className="font-semibold text-foreground">{entitlementMetrics.directAccessPercent}%</span>
                          </div>
                          <Progress value={entitlementMetrics.directAccessPercent} className="h-3 [&>div]:bg-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground italic">{t("utilization.note")}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* ── Certification ── */}
                <TabsContent value="certification" className="space-y-6 mt-4">
                  <div className="flex items-center gap-6 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground">{certificationPct}%</div>
                      <p className="text-xs text-muted-foreground">{t("certification.coverage")}</p>
                    </div>
                    <div className="flex-1">
                      <Progress
                        value={(certifiedEntitlements.length / mockEntitlements.length) * 100}
                        className="h-3 [&>div]:bg-primary"
                      />
                    </div>
                  </div>

                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                    {t("certification.uncertified")} ({uncertifiedList.length})
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("table.entitlement")}</TableHead>
                        <TableHead>{t("table.application")}</TableHead>
                        <TableHead>{t("table.risk")}</TableHead>
                        <TableHead>{t("table.owner")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uncertifiedList.slice(0, 10).map(ent => (
                        <TableRow key={ent.id}>
                          <TableCell className="font-medium text-xs">{ent.displayName}</TableCell>
                          <TableCell className="text-xs">{ent.application}</TableCell>
                          <TableCell>
                            <Badge className={cn(getRiskBadgeClass(ent.risk), "border text-xs")}>
                              {ent.riskLevel}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {ent.owner || <span className="text-destructive">Unowned</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                {/* ── Compliance ── */}
                <TabsContent value="compliance" className="space-y-6 mt-4">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                      { label: t("compliance.soxFlagged"),  value: entitlementMetrics.complianceFlags.sox },
                      { label: t("compliance.gdprFlagged"), value: entitlementMetrics.complianceFlags.gdpr },
                      { label: t("compliance.piiAccess"),   value: entitlementMetrics.complianceFlags.pii },
                      { label: t("compliance.highRisk"),    value: entitlementMetrics.complianceFlags.highRisk },
                    ].map(flag => (
                      <div key={flag.label} className="rounded-lg border border-border bg-card p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">{flag.value}</p>
                        <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700 mt-1 text-xs">
                          {flag.label}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">{t("compliance.adminPrivileges")}</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("table.entitlement")}</TableHead>
                          <TableHead>{t("table.application")}</TableHead>
                          <TableHead>{t("table.owner")}</TableHead>
                          <TableHead>{t("table.risk")}</TableHead>
                          <TableHead>{t("table.classifications")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entitlementMetrics.adminPrivileges.map(ent => (
                          <TableRow key={ent.id}>
                            <TableCell className="font-medium text-xs">{ent.displayName}</TableCell>
                            <TableCell className="text-xs">{ent.application}</TableCell>
                            <TableCell className="text-xs">
                              {ent.owner || <span className="text-destructive">Unowned</span>}
                            </TableCell>
                            <TableCell>
                              <Badge className={cn(getRiskBadgeClass(ent.riskLevel || 'High'), "border text-xs")}>
                                {ent.riskLevel}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {ent.classification.map(c => (
                                  <Badge key={c} variant="outline" className="text-xs border-border">{c}</Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

              </Tabs>
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};