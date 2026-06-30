
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { highRiskIdentities } from '@/data/mock-risk-analytics';
import { IdentityRiskSegment } from '@/types/riskAnalytics';
import { cn } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  segment: IdentityRiskSegment | null;
}

export const IdentitySegmentDrawer: React.FC<Props> = ({ isOpen, onClose, segment }) => {
  if (!segment) return null;

  const filtered = highRiskIdentities.filter(i => i.type === segment.type);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-destructive font-bold';
    if (score >= 60) return 'text-orange-600 font-semibold';
    return 'text-foreground';
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="flex flex-col p-0 h-full">
        <DialogHeader className="flex-shrink-0 px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {segment.type} Identities — Risk Breakdown
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {segment.count.toLocaleString()} total • {segment.highRiskCount} high-risk • Avg score: {segment.avgRiskScore}/100
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 pb-6">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-lg font-bold text-foreground">{segment.count.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-lg font-bold text-destructive">{segment.highRiskCount}</div>
              <div className="text-xs text-muted-foreground">High Risk</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-lg font-bold text-foreground">{segment.avgRiskScore}</div>
              <div className="text-xs text-muted-foreground">Avg Risk</div>
            </div>
          </div>

          {filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Identity</TableHead>
                  <TableHead className="text-xs">Department</TableHead>
                  <TableHead className="text-xs text-center">Risk Score</TableHead>
                  <TableHead className="text-xs text-center">Violations</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(i => (
                  <TableRow key={i.id}>
                    <TableCell className="py-2 font-medium text-sm text-foreground">{i.name}</TableCell>
                    <TableCell className="py-2 text-xs text-muted-foreground">{i.department}</TableCell>
                    <TableCell className="py-2 text-center"><span className={cn("text-sm", getScoreColor(i.riskScore))}>{i.riskScore}</span></TableCell>
                    <TableCell className="py-2 text-center text-xs font-medium text-foreground">{i.violations}</TableCell>
                    <TableCell className="py-2"><Badge variant={i.remediationStatus === 'Open' ? 'destructive' : 'outline'} className="text-xs">{i.remediationStatus}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No high-risk identities in the top 10 for this segment.</p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
