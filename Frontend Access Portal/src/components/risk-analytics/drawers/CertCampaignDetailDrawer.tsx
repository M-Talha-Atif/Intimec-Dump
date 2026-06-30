
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Award, Download, AlertTriangle } from 'lucide-react';
import { CertificationCampaign } from '@/types/riskAnalytics';
import { overdueCertItems } from '@/data/mock-risk-analytics';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Props { isOpen: boolean; onClose: () => void; campaign: CertificationCampaign | null; }

export const CertCampaignDetailDrawer: React.FC<Props> = ({ isOpen, onClose, campaign }) => {
  const { toast } = useToast();
  if (!campaign) return null;

  const relatedOverdue = overdueCertItems.filter(i => i.campaignId === campaign.id);

  // Mock review items
  const reviewItems = [
    { reviewer: 'Jennifer Lee', identity: 'John Smith', decision: 'Approved', timeSpent: '1.2s', flagged: true },
    { reviewer: 'Jennifer Lee', identity: 'Maria Garcia', decision: 'Revoked', timeSpent: '45s', flagged: false },
    { reviewer: 'David Kim', identity: 'Robert Chen', decision: 'Approved', timeSpent: '0.8s', flagged: true },
    { reviewer: 'David Kim', identity: 'Lisa Thompson', decision: 'Approved', timeSpent: '32s', flagged: false },
    { reviewer: 'Michael Brown', identity: 'svc_payment_api', decision: 'Pending', timeSpent: '—', flagged: false },
    { reviewer: 'CISO Office', identity: 'James Wilson', decision: 'Approved', timeSpent: '2m 15s', flagged: false },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="flex flex-col p-0 h-full">
        <DialogHeader className="flex-shrink-0 px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            {campaign.name}
          </DialogTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={campaign.status === 'Overdue' ? 'destructive' : campaign.status === 'Active' ? 'secondary' : 'outline'} className="text-xs">{campaign.status}</Badge>
            <span className="text-xs text-muted-foreground">Due: {campaign.dueDate}</span>
            <span className="text-xs text-muted-foreground">• {campaign.totalItems} items</span>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 pb-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-lg font-bold text-foreground">{campaign.completion}%</div>
              <Progress value={campaign.completion} className="h-1.5 mt-1" />
              <div className="text-xs text-muted-foreground mt-1">Completion</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className={cn("text-lg font-bold", campaign.rubberStampRate >= 30 ? 'text-destructive' : 'text-foreground')}>
                {campaign.rubberStampRate}%
                {campaign.rubberStampRate >= 30 && <AlertTriangle className="inline h-3.5 w-3.5 ml-1" />}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Rubber-Stamp</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className={cn("text-lg font-bold", campaign.overdueCount > 0 ? 'text-destructive' : 'text-foreground')}>{campaign.overdueCount}</div>
              <div className="text-xs text-muted-foreground mt-1">Overdue Items</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-lg font-bold text-foreground">{campaign.riskAccepted}</div>
              <div className="text-xs text-muted-foreground mt-1">Risk Accepted</div>
            </div>
          </div>

          {/* Review Items Sample */}
          <h3 className="text-sm font-semibold text-foreground mb-2">Recent Review Decisions</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Reviewer</TableHead>
                <TableHead className="text-xs">Identity</TableHead>
                <TableHead className="text-xs">Decision</TableHead>
                <TableHead className="text-xs">Time Spent</TableHead>
                <TableHead className="text-xs">Flag</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviewItems.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="py-2 text-xs text-foreground">{r.reviewer}</TableCell>
                  <TableCell className="py-2 text-xs text-foreground">{r.identity}</TableCell>
                  <TableCell className="py-2">
                    <Badge variant={r.decision === 'Revoked' ? 'destructive' : r.decision === 'Pending' ? 'secondary' : 'outline'} className="text-xs">{r.decision}</Badge>
                  </TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground">{r.timeSpent}</TableCell>
                  <TableCell className="py-2">
                    {r.flagged && <Badge variant="destructive" className="text-xs">Rubber-stamp</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Overdue Items */}
          {relatedOverdue.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-foreground mt-6 mb-2">Overdue Items ({relatedOverdue.length})</h3>
              <div className="space-y-2">
                {relatedOverdue.map(o => (
                  <div key={o.id} className="p-3 rounded border border-border text-xs flex items-center justify-between">
                    <div>
                      <span className="font-medium text-foreground">{o.identity}</span>
                      <span className="text-muted-foreground ml-2">• {o.entitlement} • {o.application}</span>
                    </div>
                    <span className="text-destructive font-medium">{o.daysOverdue}d overdue</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm" onClick={() => toast({ title: "Export Started", description: "Campaign details exported" })}>
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
