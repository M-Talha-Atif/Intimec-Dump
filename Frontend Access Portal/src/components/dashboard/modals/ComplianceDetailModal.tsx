import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Shield, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { ComplianceMetrics } from '@/services/mockDashboardData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "next-intl";

interface ComplianceDetailModalProps {
  open: boolean;
  onClose: () => void;
  data: ComplianceMetrics;
}

export const ComplianceDetailModal: React.FC<ComplianceDetailModalProps> = ({
  open,
  onClose,
  data,
}) => {
  const totalViolations = Object.values(data.policyViolations).reduce(
    (a, b) => a + b,
    0
  );

  const t = useTranslations("dashboard.modals.complianceStatus");

  const handleExport = () => {
    const csv = [
      ['Policy', 'Violations', 'Severity', 'Last Occurrence'].join(','),
      ...data.details.map(item =>
        [
          item.policy,
          item.violations,
          item.severity,
          new Date(item.lastOccurrence).toLocaleDateString(),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${new Date()
      .toISOString()
      .split('T')[0]}.csv`;
    a.click();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-6xl flex flex-col p-0 h-full"
      >
        <div className="flex flex-col h-full min-w-0">

          {/* Fixed Header */}
          <div className="flex-shrink-0 flex items-center justify-between">
            <div>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-xl">
                  {t("title")}
                </SheetTitle>

                <SheetDescription className="mt-1">
                  {t("description")}
                </SheetDescription>
              </SheetHeader>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="shrink-0 mt-2 mr-4"
            >
              <Download className="h-4 w-4 mr-2" />
              {t("export")}
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">

              {/* Top Metrics */}
              <div className="grid grid-cols-4 gap-4 mb-6">

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">
                      {t("metrics.overallScore")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {data.overallScore}%
                    </div>

                    <div className="flex items-center gap-1 mt-1">
                      {data.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}

                      <span className="text-xs text-muted-foreground">
                        {t("metrics.vsLastPeriod")}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">
                      {t("metrics.totalViolations")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {totalViolations}
                    </div>

                    <div className="text-xs text-muted-foreground mt-1">
                      {t("metrics.acrossPolicies")}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">
                      {t("metrics.exceptions")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-600">
                      {data.exceptions}
                    </div>

                    <div className="text-xs text-muted-foreground mt-1">
                      {t("metrics.activeExceptions")}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">
                      {t("metrics.auditFindings")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">
                      {data.auditFindings}
                    </div>

                    <div className="text-xs text-muted-foreground mt-1">
                      {t("metrics.openFindings")}
                    </div>
                  </CardContent>
                </Card>

              </div>


              {/* Violations by Severity */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4">
                  {t("sections.violationsBySeverity")}
                </h3>

                <div className="grid grid-cols-4 gap-4">
                  {(["critical", "high", "medium", "low"] as const).map(
                    (level) => (
                      <Card key={level}>
                        <CardContent className="pt-6 text-center">

                          <div className="text-3xl font-bold">
                            {data.policyViolations[level]}
                          </div>

                          <div className="text-sm capitalize mt-1">
                            {t(`severity.${level}`)}
                          </div>

                          <Progress
                            value={
                              totalViolations
                                ? (data.policyViolations[level] /
                                  totalViolations) *
                                100
                                : 0
                            }
                            className="mt-2 h-2"
                          />

                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              </div>

   

              {/* Policy Violations Table */}
              <div>
                <h3 className="font-semibold mb-4">
                  {t("sections.policyViolations")}
                </h3>

                <div className="border rounded-md">
                  <Table>

                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("table.policyName")}</TableHead>
                        <TableHead>{t("table.violations")}</TableHead>
                        <TableHead>{t("table.severity")}</TableHead>
                        <TableHead>{t("table.lastOccurrence")}</TableHead>
                        <TableHead>{t("table.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {data.details.map((detail, index) => {

                        const severityColors: Record<string, string> = {
                          critical: "bg-red-100 text-red-800",
                          high: "bg-orange-100 text-orange-800",
                          medium: "bg-yellow-100 text-yellow-800",
                          low: "bg-blue-100 text-blue-800"
                        };

                        return (
                          <TableRow key={index}>

                            <TableCell className="font-medium">
                              {detail.policy}
                            </TableCell>

                            <TableCell>
                              <Badge variant="outline">
                                {detail.violations}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              <Badge className={severityColors[detail.severity]}>
                                {t(`severity.${detail.severity}`)}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              {new Date(
                                detail.lastOccurrence
                              ).toLocaleDateString()}
                            </TableCell>

                            <TableCell>
                              <Button variant="ghost" size="sm">
                                {t("actions.viewDetails")}
                              </Button>
                            </TableCell>

                          </TableRow>
                        );
                      })}
                    </TableBody>

                  </Table>
                </div>

              </div>

            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};