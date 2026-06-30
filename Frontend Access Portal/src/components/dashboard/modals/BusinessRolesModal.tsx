import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, AreaChart, Area,
} from "recharts";
import { roleMetrics, governanceMetrics, mockRoles } from "@/services/mockRoleEntitlementMetrics";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const BU_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

const businessRoles = mockRoles.filter(r => r.type === 'Business Role');
const buData = [
  { name: "Finance", value: businessRoles.filter(r => r.businessUnit === 'Finance').length },
  { name: "HR", value: businessRoles.filter(r => r.businessUnit === 'Human Resources').length },
  { name: "Engineering", value: businessRoles.filter(r => r.businessUnit === 'Engineering').length },
  { name: "Marketing", value: businessRoles.filter(r => r.businessUnit === 'Marketing').length },
].filter(d => d.value > 0);

type Props = {
  open: boolean;
  onClose: () => void;
  defaultTab?: string;
};

export const BusinessRolesModal = ({ open, onClose, defaultTab = "distribution" }: Props) => {
  const rolesWithConflicts = mockRoles.filter(r => r.risk?.conflict);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Enabled':
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
      case 'Disabled':
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    }
  };

  const getRiskBadgeClass = (risk: string) => {
    switch (risk) {
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

  const t = useTranslations("dashboard.modals.businessRolesAnalytics");

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
          <SheetDescription>
            {t("description")}
          </SheetDescription>
        </SheetHeader>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
        <ScrollArea className="h-full pr-2">
          <Tabs defaultValue={defaultTab} className="w-full">

            <TabsList className="w-full">
              <TabsTrigger value="distribution" className="flex-1">
                {t("tabs.distribution")}
              </TabsTrigger>

              <TabsTrigger value="coverage" className="flex-1">
                {t("tabs.coverage")}
              </TabsTrigger>

              <TabsTrigger value="adoption" className="flex-1">
                {t("tabs.adoption")}
              </TabsTrigger>

              <TabsTrigger value="violations" className="flex-1">
                {t("tabs.violations")}
              </TabsTrigger>

              <TabsTrigger value="ai" className="flex-1">
                {t("tabs.aiInsights")}
              </TabsTrigger>
            </TabsList>

            {/* Distribution */}
            <TabsContent value="distribution" className="space-y-6 mt-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                    {t("distribution.byBusinessUnit")}
                  </h4>

                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={buData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {buData.map((_, i) => (
                          <Cell key={i} fill={BU_COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                    {t("distribution.businessRoles")}
                  </h4>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("table.role")}</TableHead>
                        <TableHead>{t("table.unit")}</TableHead>
                        <TableHead>{t("table.users")}</TableHead>
                        <TableHead>{t("table.status")}</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {businessRoles.map(r => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium text-xs">
                            {r.name}
                          </TableCell>

                          <TableCell className="text-xs">
                            {r.businessUnit}
                          </TableCell>

                          <TableCell className="text-xs">
                            {r.userCount}
                          </TableCell>

                          <TableCell>
                            <Badge
                              className={cn(
                                getStatusBadgeClass(r.status),
                                "border text-xs"
                              )}
                            >
                              {t(`status.${r.status}`)}
                            </Badge>
                          </TableCell>

                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

              </div>
            </TabsContent>

            {/* Coverage */}
            <TabsContent value="coverage" className="space-y-6 mt-4">

              <div className="flex items-center gap-6 mb-4">

                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {governanceMetrics.roleCoverageRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("coverage.overallCoverage")}
                  </p>
                </div>

                <div className="flex-1">
                  <Progress
                    value={governanceMetrics.roleCoverageRate}
                    className="h-3 [&>div]:bg-primary"
                  />
                </div>

              </div>

              <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                {t("coverage.byDepartment")}
              </h4>

              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={governanceMetrics.coverageByDept} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="dept" width={90} />
                  <Tooltip formatter={(value: number) => `${value}%`} />

                  <Bar
                    dataKey="covered"
                    fill="hsl(var(--chart-2))"
                    name={t("coverage.roleBased")}
                    stackId="a"
                  />

                  <Bar
                    dataKey="direct"
                    fill="hsl(var(--chart-4))"
                    name={t("coverage.direct")}
                    stackId="a"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>

              <p className="text-xs text-muted-foreground italic">
                {t("coverage.note")}
              </p>

            </TabsContent>

            {/* Adoption */}
            <TabsContent value="adoption" className="space-y-6 mt-4">

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>
                  {t("adoption.active")}:{" "}
                  <strong className="text-foreground">
                    {roleMetrics.activeBusinessRoles}
                  </strong>
                </span>

                <span>
                  {t("adoption.dormant")}:{" "}
                  <strong className="text-foreground">
                    {roleMetrics.dormantBusinessRoles}
                  </strong>
                </span>
              </div>

              <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                {t("adoption.trend")}
              </h4>

              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={governanceMetrics.adoptionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="active"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.15}
                    name={t("adoption.active")}
                    strokeWidth={2}
                  />

                  <Area
                    type="monotone"
                    dataKey="dormant"
                    stroke="hsl(var(--chart-4))"
                    fill="hsl(var(--chart-4))"
                    fillOpacity={0.15}
                    name={t("adoption.dormant")}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>

            </TabsContent>

            {/* Violations */}
            <TabsContent value="violations" className="mt-4">

              {rolesWithConflicts.length > 0 ? (
                <Table>

                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("table.role")}</TableHead>
                      <TableHead>{t("violations.conflictingRole")}</TableHead>
                      <TableHead>{t("violations.overlap")}</TableHead>
                      <TableHead>{t("violations.risk")}</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {rolesWithConflicts.map(r => (
                      <TableRow key={r.id}>

                        <TableCell className="font-medium text-xs">
                          {r.name}
                        </TableCell>

                        <TableCell className="text-xs">
                          {r.risk?.conflict?.roleName}
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={cn(
                              r.risk!.conflict!.overlap > 50
                                ? getRiskBadgeClass('High')
                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700",
                              "border text-xs"
                            )}
                          >
                            {r.risk?.conflict?.overlap}%
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={cn(
                              getRiskBadgeClass(r.risk?.score || 'Low'),
                              "border text-xs"
                            )}
                          >
                            {r.risk?.score}
                          </Badge>
                        </TableCell>

                      </TableRow>
                    ))}
                  </TableBody>

                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("violations.none")}
                </p>
              )}

            </TabsContent>

            {/* AI Insights */}
            <TabsContent value="ai" className="space-y-4 mt-4">

              <p className="text-sm text-muted-foreground mb-4">
                {t("ai.description")}
              </p>

              {governanceMetrics.aiSuggestions.map((suggestion, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-card p-4 space-y-2"
                >

                  <div className="flex items-center justify-between">

                    <h4 className="text-sm font-semibold text-foreground">
                      {suggestion.name}
                    </h4>

                    <Badge
                      className={cn(
                        "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
                        "border text-xs"
                      )}
                    >
                      {suggestion.confidence}% {t("ai.confidence")}
                    </Badge>

                  </div>

                  <p className="text-xs text-muted-foreground">
                    {suggestion.reason}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {t("ai.affectedUsers")}{" "}
                    <strong className="text-foreground">
                      {suggestion.affectedUsers}
                    </strong>
                  </p>

                </div>
              ))}

            </TabsContent>

          </Tabs>
        </ScrollArea>
      </div>
    </div>
  </SheetContent>
</Sheet>
  );
};