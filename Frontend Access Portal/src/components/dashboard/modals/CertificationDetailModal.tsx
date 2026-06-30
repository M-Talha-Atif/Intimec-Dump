import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckSquare, Download, Clock, AlertCircle } from 'lucide-react';
import { CertificationMetrics } from '@/services/mockDashboardData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from "@/lib/utils";
import { getRiskBadgeClass, getRiskIconColor } from '@/utils/getRiskColor';
import { useTranslations } from "next-intl";

interface CertificationDetailModalProps {
  open: boolean;
  onClose: () => void;
  data: CertificationMetrics;
}

export const CertificationDetailModal: React.FC<CertificationDetailModalProps> = ({
  open,
  onClose,
  data,
}) => {

  const handleExport = () => {
    const csv = [
      ['Campaign', 'Status', 'Progress', 'Due Date', 'Total Items', 'Completed'].join(','),
      ...data.campaigns.map(c => [
        c.name,
        c.status,
        c.progress,
        c.dueDate,
        c.itemsTotal,
        c.itemsCompleted
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certification-campaigns-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const t = useTranslations("dashboard.modals.certificationCampaigns");

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
      case 'in-progress':
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case 'pending':
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-5xl flex flex-col p-0 h-full"
      >
        <div className="flex flex-col h-full min-w-0">

          {/* Fixed Header */}
          <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between">
            <div className="min-w-0">
              <SheetTitle className="flex items-center gap-2 text-xl">
                {t("title")}
              </SheetTitle>

              <p className="text-sm text-muted-foreground mt-1">
                {t("description")}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="mr-2 mb-4 shrink-0"
            >
              <Download className="h-4 w-4 mr-2" />
              {t("export")}
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">

              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">

                <Card className="bg-card border border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">
                      {t("stats.totalCampaigns")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">
                      {data.totalCampaigns}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">
                      {t("stats.active")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {data.activeCampaigns}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">
                      {t("stats.completionRate")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-500">
                      {data.completionRate}%
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">
                      {t("stats.overdue")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-destructive">
                      {data.overdueReviews}
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Overall Progress */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("progress.label")}
                  </span>

                  <span className="font-medium text-foreground">
                    {data.completionRate}%
                  </span>
                </div>

                <Progress
                  value={data.completionRate}
                  className="h-3 [&>div]:bg-primary"
                />
              </div>

              {/* Campaign List */}
              <div className="space-y-4">
                {data.campaigns.map((campaign) => {

                  const isOverdue =
                    new Date(campaign.dueDate) < new Date() &&
                    campaign.status !== "completed";

                  const getRiskLevel = () => {
                    if (campaign.status === "completed") return "low";
                    const daysUntilDue = Math.ceil(
                      (new Date(campaign.dueDate).getTime() -
                        new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                    );

                    if (daysUntilDue < 0) return "high";
                    if (daysUntilDue < 7) return "high";
                    if (daysUntilDue < 14) return "medium";
                    return "low";
                  };

                  const riskLevel = getRiskLevel();

                  return (
                    <Card
                      key={campaign.id}
                      className={cn(
                        "bg-card border border-border"
                      )}
                    >
                      <CardHeader>

                        <div className="flex items-center justify-between min-w-0">

                          <CardTitle className="text-base text-foreground truncate">
                            {campaign.name}
                          </CardTitle>

                          <div className="flex items-center gap-2 shrink-0">

                            {isOverdue && (
                              <Badge
                                className={cn(
                                  getRiskBadgeClass("high"),
                                  "flex items-center gap-1 border-0"
                                )}
                              >
                                <AlertCircle className="h-3 w-3" />
                                {t("badges.overdue")}
                              </Badge>
                            )}

                            <Badge
                              className={cn(
                                getStatusBadgeClass(campaign.status),
                                "border"
                              )}
                            >
                            {t(`status.${campaign.status}` as const)}
                            </Badge>

                          </div>

                        </div>

                      </CardHeader>

                      <CardContent>

                        <div className="space-y-3">

                          <div className="grid grid-cols-3 gap-4 text-sm">

                            <div>
                              <div className="text-muted-foreground">
                                {t("fields.dueDate")}
                              </div>

                              <div className="font-medium text-foreground flex items-center gap-1">
                                <Clock
                                  className={cn(
                                    "h-3 w-3",
                                    getRiskIconColor(riskLevel)
                                  )}
                                />

                                {new Date(campaign.dueDate).toLocaleDateString()}
                              </div>
                            </div>

                            <div>
                              <div className="text-muted-foreground">
                                {t("fields.items")}
                              </div>

                              <div className="font-medium text-foreground">
                                {campaign.itemsCompleted} / {campaign.itemsTotal}
                              </div>
                            </div>

                            <div>
                              <div className="text-muted-foreground">
                                {t("fields.progress")}
                              </div>

                              <div className="font-medium text-foreground">
                                {campaign.progress}%
                              </div>
                            </div>

                          </div>

                          <Progress
                            value={campaign.progress}
                            className={cn(
                              "h-2",
                              campaign.progress < 30
                                ? "[&>div]:bg-red-500"
                                : campaign.progress < 70
                                  ? "[&>div]:bg-yellow-500"
                                  : "[&>div]:bg-green-500"
                            )}
                          />

                          <div className="flex justify-end gap-2">

                            <Button variant="outline" size="sm">
                              {t("actions.viewDetails")}
                            </Button>

                            {campaign.status === "in-progress" && (
                              <Button size="sm">
                                {t("actions.continueReview")}
                              </Button>
                            )}

                          </div>

                        </div>

                      </CardContent>
                    </Card>
                  );
                })}
              </div>

            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};