
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Shield, Download } from 'lucide-react';
import { ComplianceFramework } from '@/types/riskAnalytics';
import { complianceControls } from '@/data/mock-risk-analytics';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Props { isOpen: boolean; onClose: () => void; framework: ComplianceFramework | null; }

export const ComplianceFrameworkDrawer: React.FC<Props> = ({ isOpen, onClose, framework }) => {
  const { toast } = useToast();
  if (!framework) return null;

  const controls = complianceControls.filter(c => c.frameworkId === framework.id);
  const passCount = controls.filter(c => c.status === 'Pass').length;
  const failCount = controls.filter(c => c.status === 'Fail').length;

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Pass': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Fail': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Not Assessed': 'bg-muted text-muted-foreground',
    };
    return <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium", colors[status])}>{status}</span>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="flex flex-col p-0 h-full">
        <DialogHeader className="flex-shrink-0 px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {framework.icon} {framework.name} — Compliance Detail
          </DialogTitle>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium",
              framework.status === 'Compliant' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
              framework.status === 'At Risk' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            )}>{framework.status}</span>
            <span className="text-xs text-muted-foreground">Last audit: {framework.lastAudit}</span>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 pb-6">
          {/* Summary */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-lg font-bold text-foreground">{framework.controlCoverage}%</div>
              <Progress value={framework.controlCoverage} className="h-1.5 mt-1" />
              <div className="text-xs text-muted-foreground mt-1">Coverage</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-lg font-bold text-green-600">{passCount}</div>
              <div className="text-xs text-muted-foreground">Passed</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-lg font-bold text-destructive">{failCount}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-lg font-bold text-foreground">{framework.openFindings}</div>
              <div className="text-xs text-muted-foreground">Findings</div>
            </div>
          </div>

          {/* Controls Table */}
          <h3 className="text-sm font-semibold text-foreground mb-2">Controls ({controls.length})</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Control ID</TableHead>
                <TableHead className="text-xs">Description</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Owner</TableHead>
                <TableHead className="text-xs text-center">Days Open</TableHead>
                <TableHead className="text-xs">Findings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {controls.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="py-2 font-medium text-sm text-foreground">{c.controlId}</TableCell>
                  <TableCell className="py-2 text-xs text-foreground max-w-[180px]">{c.description}</TableCell>
                  <TableCell className="py-2">{getStatusBadge(c.status)}</TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground">{c.remediationOwner || '—'}</TableCell>
                  <TableCell className="py-2 text-center text-xs text-muted-foreground">{c.daysOpen > 0 ? `${c.daysOpen}d` : '—'}</TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground max-w-[180px] truncate">{c.findings || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm" onClick={() => toast({ title: "Export Started", description: `${framework.name} controls exported` })}>
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
