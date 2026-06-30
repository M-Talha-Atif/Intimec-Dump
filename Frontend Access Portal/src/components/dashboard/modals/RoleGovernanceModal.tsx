import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, AreaChart, Area,
} from "recharts";
import { roleMetrics, mockRoles } from "@/services/mockRoleEntitlementMetrics";
import { cn } from "@/lib/utils";
import { getRiskBadgeClass } from '@/utils/getRiskColor';
import { useTranslations } from "next-intl";

const TYPE_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

const typeData = [
  { name: "Functional", value: roleMetrics.byType.functional },
  { name: "Business", value: roleMetrics.byType.business },
  { name: "Technical", value: roleMetrics.byType.technical },
  { name: "Application", value: roleMetrics.byType.application },
];

const classificationData = [
  { name: "Admin", value: roleMetrics.byClassification.admin },
  { name: "Privileged", value: roleMetrics.byClassification.privileged },
  { name: "Sensitive", value: roleMetrics.byClassification.sensitive },
  { name: "Standard", value: roleMetrics.byClassification.standard },
];

const buData = [
  { name: "Finance", value: roleMetrics.byBusinessUnit.finance },
  { name: "HR", value: roleMetrics.byBusinessUnit.hr },
  { name: "Engineering", value: roleMetrics.byBusinessUnit.engineering },
  { name: "Marketing", value: roleMetrics.byBusinessUnit.marketing },
];

const enabledRoles = mockRoles.filter(r => r.status === 'Enabled');

type Props = {
  open: boolean;
  onClose: () => void;
  defaultTab?: string;
};

export const RoleGovernanceModal = ({ open, onClose, defaultTab = "distribution" }: Props) => {
  const qualityIssues = enabledRoles
    .map(r => {
      const issues: string[] = [];
      if (r.userCount === 0) issues.push("No users");
      if ((r.inactiveUserCount ?? 0) > 0) issues.push(`${r.inactiveUserCount} inactive`);
      if (r.risk?.conflict && r.risk.conflict.overlap > 50) issues.push(`${r.risk.conflict.overlap}% overlap`);
      const monthsSinceReview = (Date.now() - new Date(r.lastReviewed).getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsSinceReview > 6) issues.push("Stale review");
      return { role: r, issues };
    })
    .filter(r => r.issues.length > 0);

  const overlapRoles = mockRoles.filter(r => r.risk?.conflict);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'High':
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
      case 'Medium':
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      case 'Low':
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    }
  };

  const t = useTranslations("dashboard.modals.roleGovernanceAnalytics");

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-5xl flex flex-col p-0 h-full"
      >
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
                <TabsList className="w-full">
                  <TabsTrigger value="distribution" className="flex-1">{t("tabs.distribution")}</TabsTrigger>
                  <TabsTrigger value="quality" className="flex-1">{t("tabs.quality")}</TabsTrigger>
                  <TabsTrigger value="overlap" className="flex-1">{t("tabs.overlap")}</TabsTrigger>
                  <TabsTrigger value="trends" className="flex-1">{t("tabs.trends")}</TabsTrigger>
                </TabsList>

                {/* Distribution Tab */}
                <TabsContent value="distribution" className="space-y-6 mt-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-muted-foreground">{t("distribution.byType")}</h4>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={typeData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                            {typeData.map((_, i) => <Cell key={i} fill={TYPE_COLORS[i]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* By Classification - Updated Bar Chart */}
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-muted-foreground">{t("distribution.byClassification")}</h4>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={classificationData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" allowDecimals={false} />
                          <YAxis type="category" dataKey="name" width={80} />
                          <Tooltip />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {classificationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index + 1}))`} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>


                  </div>

                  {/* By Business Unit - Updated Bar Chart */}
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">{t("distribution.byBusinessUnit")}</h4>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={buData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {buData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index + 1}))`} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                {/* Quality Tab */}
                <TabsContent value="quality" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{t("quality.avgEntitlements")}: <strong className="text-foreground">{roleMetrics.avgEntitlementsPerRole}</strong></span>
                      <span>{t("quality.totalUsers")}: <strong className="text-foreground">{roleMetrics.totalUsers}</strong></span>
                      <span>{t("quality.deprecated")}: <strong className="text-foreground">{roleMetrics.deprecated}</strong></span>
                    </div>
                    {qualityIssues.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("table.role")}</TableHead>
                            <TableHead>{t("table.type")}</TableHead>
                            <TableHead>{t("table.classification")}</TableHead>
                            <TableHead>{t("table.users")}</TableHead>
                            <TableHead>{t("table.issues")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {qualityIssues.map(({ role, issues }) => (
                            <TableRow key={role.id}>
                              <TableCell className="font-medium">{role.name}</TableCell>
                              <TableCell>{role.type}</TableCell>
                              <TableCell>{role.classification}</TableCell>
                              <TableCell>{role.userCount}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {issues.map(issue => (
                                    <Badge
                                      key={issue}
                                      className={cn(
                                        issue.includes("overlap") || issue === "Stale review"
                                          ? getRiskBadgeClass('high')
                                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700",
                                        "border text-xs"
                                      )}
                                    >
                                      {issue}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t("quality.healthy")}</p>
                    )}
                  </div>
                </TabsContent>

                {/* Overlap Tab */}
                {/* Overlap Tab */}
                <TabsContent value="overlap" className="mt-4">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{t("overlap.description")}</p>
                    {overlapRoles.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("table.role")}</TableHead>
                            <TableHead>{t("table.overlapsWith")}</TableHead>
                            <TableHead>{t("table.overlapPct")}</TableHead>
                            <TableHead>{t("table.risk")}</TableHead>
                            <TableHead>{t("table.recommendation")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {overlapRoles.map(r => (
                            <TableRow key={r.id}>
                              <TableCell className="font-medium text-xs">{r.name}</TableCell>
                              <TableCell className="text-xs">{r.risk?.conflict?.roleName}</TableCell>
                              <TableCell>
                                <Badge
                                  className={cn(
                                    r.risk!.conflict!.overlap > 50
                                      ? getRiskBadgeClass('high')
                                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700",
                                    "border text-xs"
                                  )}
                                >
                                  {r.risk?.conflict?.overlap}%
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={cn(getStatusBadgeClass(r.risk?.score || 'Low'), "border text-xs")}>
                                  {r.risk?.score}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {r.risk!.conflict!.overlap > 70 ? t("overlap.merge") : t("overlap.review")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t("overlap.none")}</p>
                    )}
                  </div>
                </TabsContent>


                {/* Trends Tab */}
                <TabsContent value="trends" className="mt-4">
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">{t("trends.totalRolesOverTime")}</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={roleMetrics.roleTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="count" style={{ fillOpacity: 0.15 }} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
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