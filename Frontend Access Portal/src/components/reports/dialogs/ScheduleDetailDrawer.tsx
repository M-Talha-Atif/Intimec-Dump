import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Mail, Download, Play, Pause, Edit, Trash2, AlertCircle, User, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStatusBadgeClass } from '@/utils/getBadgeClass';
import { useToast } from "@/hooks/use-toast";

interface ScheduleDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: {
    id: string;
    name: string;
    frequency: string;
    nextRun: string;
    lastRun: string;
    status: string;
    deliveryMethod: string;
    recipients: string[];
    format: string;
    timezone?: string;
    time?: string;
    errorMessage?: string;
  } | null;
  onEdit?: () => void;
  onRunNow?: () => void;
  onToggle?: () => void;
  onDelete?: () => void;
}

const getMockExecutionHistory = (scheduleId: string) => [
  { id: 'EX-001', date: '2024-01-15 08:00', status: 'success', rows: 1248, duration: '3.2s', delivery: 'Sent', size: '245 KB' },
  { id: 'EX-002', date: '2024-01-14 08:00', status: 'success', rows: 1235, duration: '2.9s', delivery: 'Sent', size: '241 KB' },
  { id: 'EX-003', date: '2024-01-13 08:00', status: 'failed', rows: 0, duration: '15.2s', delivery: 'Failed', size: '0 KB' },
  { id: 'EX-004', date: '2024-01-12 08:00', status: 'success', rows: 1221, duration: '3.5s', delivery: 'Sent', size: '238 KB' },
  { id: 'EX-005', date: '2024-01-11 08:00', status: 'success', rows: 1198, duration: '2.8s', delivery: 'Sent', size: '234 KB' },
  { id: 'EX-006', date: '2024-01-10 08:00', status: 'success', rows: 1210, duration: '3.1s', delivery: 'Sent', size: '236 KB' },
  { id: 'EX-007', date: '2024-01-09 08:00', status: 'success', rows: 1185, duration: '2.7s', delivery: 'Sent', size: '231 KB' },
  { id: 'EX-008', date: '2024-01-08 08:00', status: 'success', rows: 1190, duration: '3.0s', delivery: 'Sent', size: '232 KB' },
  { id: 'EX-009', date: '2024-01-07 08:00', status: 'success', rows: 1175, duration: '2.6s', delivery: 'Sent', size: '229 KB' },
  { id: 'EX-010', date: '2024-01-06 08:00', status: 'success', rows: 1168, duration: '3.3s', delivery: 'Sent', size: '228 KB' },
];

const getUpcomingRuns = (frequency: string, nextRun: string) => {
  const base = new Date(nextRun || Date.now());
  const intervals: Record<string, number> = {
    'Daily': 1, 'Hourly': 1/24, 'Weekly': 7, 'Monthly': 30, 'Quarterly': 90,
  };
  const freqKey = Object.keys(intervals).find(k => frequency.toLowerCase().includes(k.toLowerCase())) || 'Daily';
  const days = intervals[freqKey] || 1;
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(base.getTime() + (i * days * 86400000));
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  });
};

export const ScheduleDetailDrawer = ({ open, onOpenChange, schedule, onEdit, onRunNow, onToggle, onDelete }: ScheduleDetailDrawerProps) => {
  const { toast } = useToast();
  if (!schedule) return null;

  const execHistory = getMockExecutionHistory(schedule.id);
  const upcomingRuns = getUpcomingRuns(schedule.frequency, schedule.nextRun);
  const successRate = Math.round((execHistory.filter(e => e.status === 'success').length / execHistory.length) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {schedule.name}
          </DialogTitle>
          <DialogDescription>Schedule configuration and execution history</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-6 pr-4">
            {/* Status & Quick Actions */}
            <div className="flex items-center justify-between">
              <Badge className={cn(getStatusBadgeClass(schedule.status === 'active' ? 'active' : schedule.status === 'error' ? 'inactive' : 'pending'), "border text-xs")}>{schedule.status}</Badge>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { onEdit?.(); toast({ title: "Editing Schedule" }); }}>
                  <Edit className="h-3.5 w-3.5 mr-1" />Edit
                </Button>
                <Button size="sm" onClick={() => { onRunNow?.(); toast({ title: "Running Now", description: "Report generation started" }); }}>
                  <Play className="h-3.5 w-3.5 mr-1" />Run Now
                </Button>
                <Button size="sm" variant="outline" onClick={() => { onToggle?.(); }}>
                  <Pause className="h-3.5 w-3.5 mr-1" />{schedule.status === 'active' ? 'Pause' : 'Resume'}
                </Button>
              </div>
            </div>

            {/* Configuration */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Configuration</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Frequency', value: schedule.frequency, icon: Clock },
                  { label: 'Next Run', value: new Date(schedule.nextRun).toLocaleString(), icon: Calendar },
                  { label: 'Last Run', value: schedule.lastRun ? new Date(schedule.lastRun).toLocaleString() : 'Never', icon: Clock },
                  { label: 'Delivery', value: schedule.deliveryMethod, icon: Mail },
                  { label: 'Format', value: schedule.format, icon: FileText },
                  { label: 'Timezone', value: schedule.timezone || 'America/New_York', icon: Clock },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 rounded-md border px-3 py-2">
                    <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-medium capitalize">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recipients */}
            {schedule.recipients.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />Recipients
                </h4>
                <div className="space-y-2">
                  {schedule.recipients.map((r) => (
                    <div key={r} className="flex items-center gap-2 rounded-md border px-3 py-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{r}</span>
                      <Badge variant="secondary" className="text-xs ml-auto">Active</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Details */}
            {schedule.status === 'error' && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <h4 className="text-sm font-semibold text-destructive">Error Details</h4>
                </div>
                <p className="text-sm text-muted-foreground">{schedule.errorMessage || 'Data source connection timeout after 30s. Last successful run was 2 days ago.'}</p>
                <Button size="sm" variant="outline" className="mt-2" onClick={() => toast({ title: "Retry Queued" })}>Retry Now</Button>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-primary">{successRate}%</p><p className="text-xs text-muted-foreground">Success Rate</p></CardContent></Card>
              <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-foreground">{execHistory.length}</p><p className="text-xs text-muted-foreground">Total Runs</p></CardContent></Card>
              <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-foreground">3.0s</p><p className="text-xs text-muted-foreground">Avg Duration</p></CardContent></Card>
            </div>

            {/* Upcoming Runs */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Upcoming Runs</h4>
              <div className="space-y-2">
                {upcomingRuns.map((run, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{run}</span>
                    {i === 0 && <Badge variant="secondary" className="text-xs ml-auto">Next</Badge>}
                  </div>
                ))}
              </div>
            </div>

            {/* Execution History */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Execution History</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Rows</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {execHistory.map((exec) => (
                    <TableRow key={exec.id}>
                      <TableCell className="text-sm text-muted-foreground">{exec.date}</TableCell>
                      <TableCell>
                        <Badge className={cn(getStatusBadgeClass(exec.status === 'success' ? 'active' : 'inactive'), "border text-xs")}>{exec.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">{exec.rows.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{exec.duration}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{exec.delivery}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{exec.size}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-between pt-4 border-t">
          <Button variant="destructive" size="sm" onClick={() => { onDelete?.(); toast({ title: "Schedule Deleted" }); }}>
            <Trash2 className="h-3.5 w-3.5 mr-1" />Delete
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => toast({ title: "Exporting History" })}>
              <Download className="h-3.5 w-3.5 mr-1" />Export
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
