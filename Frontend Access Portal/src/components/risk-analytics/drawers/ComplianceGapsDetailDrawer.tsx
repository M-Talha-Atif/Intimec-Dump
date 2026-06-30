
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileWarning, Download } from 'lucide-react';
import { complianceControls } from '@/data/mock-risk-analytics';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Props { isOpen: boolean; onClose: () => void; }

export const ComplianceGapsDetailDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const [frameworkFilter, setFrameworkFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const frameworks = [...new Set(complianceControls.map(c => c.framework))];

  const filtered = complianceControls.filter(c => {
    if (frameworkFilter !== 'all' && c.framework !== frameworkFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

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
            <FileWarning className="h-5 w-5 text-primary" />
            Compliance Gaps — {complianceControls.filter(c => c.status === 'Fail').length} Failed Controls
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Failed and missing controls across regulatory frameworks</p>
        </DialogHeader>

        <div className="flex-shrink-0 px-6 pb-3 flex items-center gap-2">
          <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
            <SelectTrigger className="w-[140px] h-8 text-sm"><SelectValue placeholder="Framework" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Frameworks</SelectItem>
              {frameworks.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px] h-8 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pass">Pass</SelectItem>
              <SelectItem value="Fail">Fail</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Export Started", description: "Compliance controls exported as CSV" })}>
            <Download className="h-3.5 w-3.5 mr-1" /> Export
          </Button>
        </div>

        <ScrollArea className="flex-1 px-6 pb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Control ID</TableHead>
                <TableHead className="text-xs">Description</TableHead>
                <TableHead className="text-xs">Framework</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Owner</TableHead>
                <TableHead className="text-xs text-center">Days Open</TableHead>
                <TableHead className="text-xs">Findings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="py-2 font-medium text-sm text-foreground">{c.controlId}</TableCell>
                  <TableCell className="py-2 text-xs text-foreground max-w-[200px]">{c.description}</TableCell>
                  <TableCell className="py-2"><Badge variant="outline" className="text-xs">{c.framework}</Badge></TableCell>
                  <TableCell className="py-2">{getStatusBadge(c.status)}</TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground">{c.remediationOwner || '—'}</TableCell>
                  <TableCell className="py-2 text-center">
                    <span className={cn("text-xs font-medium", c.daysOpen > 60 ? 'text-destructive' : c.daysOpen > 30 ? 'text-orange-600' : 'text-muted-foreground')}>{c.daysOpen > 0 ? `${c.daysOpen}d` : '—'}</span>
                  </TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground max-w-[200px] truncate">{c.findings || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-xs text-muted-foreground mt-3">{filtered.length} controls shown</p>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
