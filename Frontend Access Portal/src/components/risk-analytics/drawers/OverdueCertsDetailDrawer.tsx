
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Download } from 'lucide-react';
import { overdueCertItems } from '@/data/mock-risk-analytics';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Props { isOpen: boolean; onClose: () => void; }

export const OverdueCertsDetailDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const { toast } = useToast();

  const getEscalationBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Not Escalated': 'bg-muted text-muted-foreground',
      'L1 Escalated': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'L2 Escalated': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Auto-Revoked': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    };
    return <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium", colors[status])}>{status}</span>;
  };

  const getPriorityBadge = (p: string) => {
    const map: Record<string, 'destructive' | 'secondary' | 'outline'> = { Critical: 'destructive', High: 'secondary', Medium: 'outline' };
    return <Badge variant={map[p] || 'outline'} className="text-xs">{p}</Badge>;
  };

  const grouped = overdueCertItems.reduce((acc, item) => {
    if (!acc[item.campaignName]) acc[item.campaignName] = [];
    acc[item.campaignName].push(item);
    return acc;
  }, {} as Record<string, typeof overdueCertItems>);

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="flex flex-col p-0 h-full">
        <DialogHeader className="flex-shrink-0 px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Overdue Certifications — {overdueCertItems.length} Items
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Certification items past due date, grouped by campaign</p>
        </DialogHeader>

        <div className="flex-shrink-0 px-6 pb-3 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Export Started", description: "Overdue certifications exported as CSV" })}>
            <Download className="h-3.5 w-3.5 mr-1" /> Export
          </Button>
        </div>

        <ScrollArea className="flex-1 px-6 pb-6">
          {Object.entries(grouped).map(([campaign, items]) => (
            <div key={campaign} className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">{campaign} <Badge variant="outline" className="ml-2 text-xs">{items.length} overdue</Badge></h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Identity</TableHead>
                    <TableHead className="text-xs">Entitlement</TableHead>
                    <TableHead className="text-xs">Application</TableHead>
                    <TableHead className="text-xs">Reviewer</TableHead>
                    <TableHead className="text-xs text-center">Days Overdue</TableHead>
                    <TableHead className="text-xs">Priority</TableHead>
                    <TableHead className="text-xs">Escalation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="py-2 text-sm font-medium text-foreground">{item.identity}</TableCell>
                      <TableCell className="py-2"><Badge variant="outline" className="text-xs">{item.entitlement}</Badge></TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground">{item.application}</TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground">{item.reviewer}</TableCell>
                      <TableCell className="py-2 text-center">
                        <span className={cn("text-xs font-medium", item.daysOverdue > 20 ? 'text-destructive' : item.daysOverdue > 10 ? 'text-orange-600' : 'text-foreground')}>{item.daysOverdue}d</span>
                      </TableCell>
                      <TableCell className="py-2">{getPriorityBadge(item.priority)}</TableCell>
                      <TableCell className="py-2">{getEscalationBadge(item.escalationStatus)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
