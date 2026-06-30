
import React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from 'lucide-react';
import { Task } from './TaskCenterContent';
import { getStatusBadgeClass, getSeverityBadgeClass } from '@/utils/getBadgeClass';
import { cn } from '@/lib/utils';

interface TaskCenterKpiDrilldownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  tasks: Task[];
}

export const TaskCenterKpiDrilldownModal: React.FC<TaskCenterKpiDrilldownModalProps> = ({
  open, onOpenChange, title, tasks
}) => {
  const getStatusBadge = (status: string) => {
    return <Badge className={cn(getStatusBadgeClass(status), "border text-xs")}>{status}</Badge>;
  };

  const getRiskBadge = (risk: string) => {
    if (!risk) return <Badge className={cn(getSeverityBadgeClass('low'), "border text-xs")}>low</Badge>;
    return <Badge className={cn(getSeverityBadgeClass(risk), "border text-xs")}>{risk}</Badge>;
  };

  const handleExport = () => {
    const csv = [
      ['Task ID', 'Name', 'Status', 'Type', 'Application', 'SLA', 'Risk', 'Created'].join(','),
      ...tasks.map(t =>
        [t.id, `"${t.name}"`, t.status, t.type, t.application, t.slaCountdown, (t as any).riskLevel || 'low', t.createdAt].join(',')
      )
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-center-${title.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{tasks.length} task{tasks.length !== 1 ? 's' : ''} found</DialogDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Application</TableHead>
              <TableHead>SLA</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map(task => (
              <TableRow key={task.id}>
                <TableCell className="font-mono text-xs">{task.id}</TableCell>
                <TableCell className="max-w-[200px] truncate text-sm">{task.name}</TableCell>
                <TableCell>{getStatusBadge(task.status)}</TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{task.type}</Badge></TableCell>
                <TableCell className="text-sm">{task.application}</TableCell>
                <TableCell>
                  <Badge variant={task.slaCountdown < 0 ? 'destructive' : task.slaCountdown < 60 ? 'warning' : 'secondary'} className="text-xs">
                    {task.slaCountdown < 0 ? 'Overdue' : `${Math.floor(task.slaCountdown / 60)}h ${task.slaCountdown % 60}m`}
                  </Badge>
                </TableCell>
                <TableCell>{getRiskBadge((task as any).riskLevel)}</TableCell>
                <TableCell className="text-xs">{new Date(task.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No tasks match this filter.</div>
        )}
      </DialogContent>
    </Dialog>
  );
};
