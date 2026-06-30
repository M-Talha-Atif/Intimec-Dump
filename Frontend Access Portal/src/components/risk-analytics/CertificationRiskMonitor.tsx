
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, AlertTriangle } from 'lucide-react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { certificationCampaigns } from '@/data/mock-risk-analytics';
import { CertificationCampaign } from '@/types/riskAnalytics';
import { cn } from '@/lib/utils';

interface Props {
  onCampaignClick?: (campaign: CertificationCampaign) => void;
}

export const CertificationRiskMonitor: React.FC<Props> = ({ onCampaignClick }) => {
  const getStatusBadge = (status: string) => {
    const map: Record<string, 'destructive' | 'secondary' | 'outline'> = {
      'Overdue': 'destructive',
      'Active': 'secondary',
      'Completed': 'outline',
    };
    return <Badge variant={map[status] || 'outline'} className="text-xs">{status}</Badge>;
  };

  const getRubberStampColor = (rate: number) => {
    if (rate >= 30) return 'text-destructive font-bold';
    if (rate >= 15) return 'text-orange-600 font-semibold';
    return 'text-muted-foreground';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="h-4 w-4 text-primary" />
          Certification Risk Monitor
          <InfoTooltip text="Tracks access certification campaigns for quality and compliance. Rubber-stamp rate measures reviewers approving all items in under 2 seconds — a sign of ineffective review." />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Campaign</TableHead>
                <TableHead className="text-xs">Completion</TableHead>
                <TableHead className="text-xs text-center">
                  <span className="flex items-center gap-1 justify-center">
                    Rubber-Stamp %
                    <InfoTooltip text="Percentage of items approved in under 2 seconds without meaningful review" />
                  </span>
                </TableHead>
                <TableHead className="text-xs text-center">Overdue</TableHead>
                <TableHead className="text-xs text-center">Auto-Approve %</TableHead>
                <TableHead className="text-xs text-center">Risk Accepted</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificationCampaigns.map((campaign) => (
                <TableRow key={campaign.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onCampaignClick?.(campaign)}>
                  <TableCell className="py-2">
                    <div className="font-medium text-sm text-foreground">{campaign.name}</div>
                    <div className="text-xs text-muted-foreground">Due: {campaign.dueDate} • {campaign.totalItems} items</div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <Progress value={campaign.completion} className="h-1.5 w-16" />
                      <span className="text-xs font-medium text-foreground">{campaign.completion}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 text-center">
                    <span className={cn("text-xs", getRubberStampColor(campaign.rubberStampRate))}>
                      {campaign.rubberStampRate}%
                      {campaign.rubberStampRate >= 30 && <AlertTriangle className="inline h-3 w-3 ml-1" />}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 text-center">
                    <span className={cn("text-xs", campaign.overdueCount > 0 ? 'text-destructive font-medium' : 'text-muted-foreground')}>
                      {campaign.overdueCount}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 text-center text-xs text-muted-foreground">{campaign.autoApproveRate}%</TableCell>
                  <TableCell className="py-2 text-center text-xs text-muted-foreground">{campaign.riskAccepted}</TableCell>
                  <TableCell className="py-2">{getStatusBadge(campaign.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
