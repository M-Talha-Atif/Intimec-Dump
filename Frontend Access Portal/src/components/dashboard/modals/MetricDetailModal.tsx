import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Download, ExternalLink, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { IdentityRiskDetail } from '@/services/mockDashboardData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "next-intl";

interface MetricDetailModalProps {
  open: boolean;
  onClose: () => void;
  metricType: 'terminated' | 'inactive' | 'orphan' | 'risky';
  data: {
    count: number;
    trend: string;
    details: IdentityRiskDetail[];
  };
}

export const MetricDetailModal: React.FC<MetricDetailModalProps> = ({
  open,
  onClose,
  metricType,
  data,
}) => {
  const titles = {
    terminated: 'Terminated Accounts',
    inactive: 'Inactive Accounts',
    orphan: 'Orphan Accounts',
    risky: 'Risky Users',
  };

  const descriptions = {
    terminated: 'Active accounts belonging to terminated employees',
    inactive: 'Accounts with no activity for 90+ days',
    orphan: 'Accounts without an assigned owner',
    risky: 'Users with elevated risk scores',
  };

  const getRiskBadge = (level: string) => {
    const styles = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return styles[level as keyof typeof styles] || styles.low;
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Risk Score', 'Risk Level', 'Department', 'Last Activity', 'Issues'].join(','),
      ...data.details.map(item => [
        item.name,
        item.email,
        item.riskScore,
        item.riskLevel,
        item.department,
        item.lastActivity,
        item.issues.join('; ')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metricType}-accounts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };
  const t = useTranslations("dashboard.modals.metricDetail");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                {t(`titles.${metricType}`)}
              </DialogTitle>
              <DialogDescription className="mt-2">
                {t(`descriptions.${metricType}`)}
              </DialogDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              {t("export")}
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">{t("stats.totalCount")}</div>
            <div className="text-3xl font-bold mt-2">{data.count}</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">{t("stats.trendVsLastMonth")}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-3xl font-bold">{data.trend}</span>
              {data.trend.startsWith('+') ? (
                <TrendingUp className="h-6 w-6 text-red-500" />
              ) : (
                <TrendingDown className="h-6 w-6 text-green-500" />
              )}
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">{t("stats.avgRiskScore")}</div>
            <div className="text-3xl font-bold mt-2">
              {(data.details.reduce((sum, item) => sum + item.riskScore, 0) / data.details.length).toFixed(0)}
            </div>
          </div>
        </div>

        <Separator />

        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.name")}</TableHead>
                <TableHead>{t("table.email")}</TableHead>
                <TableHead>{t("table.department")}</TableHead>
                <TableHead>{t("table.riskScore")}</TableHead>
                <TableHead>{t("table.lastActivity")}</TableHead>
                <TableHead>{t("table.issues")}</TableHead>
                <TableHead>{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.details.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.department}</TableCell>
                  <TableCell>
                    <Badge className={getRiskBadge(item.riskLevel)}>
                      {item.riskScore}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.lastActivity}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {item.issues.slice(0, 2).map((issue, i) => (
                        <div key={i} className="text-xs text-muted-foreground">• {issue}</div>
                      ))}
                      {item.issues.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          {t("issues.more", { count: item.issues.length - 2 })}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};