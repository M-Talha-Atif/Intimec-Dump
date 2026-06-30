import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Server, Download, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { ApplicationHealthMetrics } from '@/services/mockDashboardData';
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

interface ApplicationHealthModalProps {
  open: boolean;
  onClose: () => void;
  data: ApplicationHealthMetrics;
}

export const ApplicationHealthModal: React.FC<ApplicationHealthModalProps> = ({
  open,
  onClose,
  data,
}) => {
  const healthyPercent = Math.round((data.connected / data.totalApps) * 100);

  const t = useTranslations("dashboard.modals.applicationHealth");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      healthy: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const handleExport = () => {
    const csv = [
      ['Application', 'Status', 'Last Sync', 'Account Count', 'Error Message'].join(','),
      ...Object.entries(data.syncStatus).map(([app, status]) => [
        app,
        status.status,
        new Date(status.lastSync).toLocaleString(),
        status.accountCount,
        status.errorMessage || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `application-health-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-5xl flex flex-col p-0 h-full"
      >
        <div className="flex flex-col h-full">

          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4">
            <SheetHeader className="!p-0">
              <div className="flex items-center justify-between">
                <div>
                  <SheetTitle className="flex items-center gap-2 text-xl">
                    <Server className="h-5 w-5 text-blue-600" />
                    {t("title")}
                  </SheetTitle>

                  <p className="text-sm text-muted-foreground mt-2">
                    {t("description")}
                  </p>
                </div>

                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  {t("export")}
                </Button>
              </div>
            </SheetHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-hidden px-6 py-4">
            <ScrollArea className="h-full pr-4">

              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">
                      {t("stats.totalApps")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{data.totalApps}</div>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-green-600">
                      {t("stats.healthy")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-700">
                      {data.connected}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-red-600">
                      {t("stats.errors")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-700">
                      {data.errors}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-blue-600">
                      {t("stats.healthScore")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-700">
                      {healthyPercent}%
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("table.application")}</TableHead>
                    <TableHead>{t("table.status")}</TableHead>
                    <TableHead>{t("table.lastSync")}</TableHead>
                    <TableHead>{t("table.accounts")}</TableHead>
                    <TableHead>{t("table.details")}</TableHead>
                    <TableHead>{t("table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {Object.entries(data.syncStatus).map(([app, status]) => {

                    const timeSinceSync = Math.floor(
                      (new Date().getTime() -
                        new Date(status.lastSync).getTime()) /
                      (1000 * 60)
                    );

                    return (
                      <TableRow key={app}>

                        <TableCell className="font-medium">
                          {app}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(status.status)}

                            <Badge className={getStatusBadge(status.status)}>
                              {t(`status.${status.status}`)}
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell>
                          {timeSinceSync < 60
                            ? t("time.minutesAgo", { value: timeSinceSync })
                            : t("time.hoursAgo", {
                              value: Math.floor(timeSinceSync / 60)
                            })}
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline">
                            {status.accountCount.toLocaleString()}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {status.errorMessage ? (
                            <div className="text-sm text-red-600 max-w-xs truncate">
                              {status.errorMessage}
                            </div>
                          ) : (
                            <div className="text-sm text-green-600">
                              {t("messages.allOperational")}
                            </div>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex gap-1">

                            <Button variant="ghost" size="sm">
                              {t("actions.syncNow")}
                            </Button>

                            <Button variant="ghost" size="sm">
                              {t("actions.viewLogs")}
                            </Button>

                          </div>
                        </TableCell>

                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

            </ScrollArea>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
};