import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock, Mail, Download, Play, Pause, Plus, Webhook, MessageSquare, AlertCircle } from 'lucide-react';
import { ScheduleReportDialog } from './dialogs/ScheduleReportDialog';
import { ScheduleDetailDrawer } from './dialogs/ScheduleDetailDrawer';
import { cn } from '@/lib/utils';
import { getStatusBadgeClass } from '@/utils/getBadgeClass';
import { useToast } from "@/hooks/use-toast";
import { usePagination, StandardPagination } from '@/components/shared/StandardPagination';

interface ScheduledReport {
  id: string;
  name: string;
  frequency: string;
  nextRun: string;
  status: 'active' | 'paused' | 'error';
  deliveryMethod: string;
  recipients: string[];
  format: string;
  lastRun: string;
  timezone?: string;
  time?: string;
  errorMessage?: string;
}

const INITIAL_SCHEDULES: ScheduledReport[] = [
  {
    id: '1', name: 'High Risk Identities Report', frequency: 'Daily at 8:00 AM', nextRun: '2024-01-16T08:00:00',
    status: 'active', deliveryMethod: 'email', recipients: ['admin@company.com', 'security@company.com'],
    format: 'PDF', lastRun: '2024-01-15T08:00:00', timezone: 'America/New_York', time: '08:00',
  },
  {
    id: '2', name: 'Access Review Status', frequency: 'Weekly on Monday', nextRun: '2024-01-22T09:00:00',
    status: 'active', deliveryMethod: 'email', recipients: ['compliance@company.com'],
    format: 'CSV', lastRun: '2024-01-15T09:00:00', timezone: 'America/New_York', time: '09:00',
  },
  {
    id: '3', name: 'SoD Violations Summary', frequency: 'Monthly on 1st', nextRun: '2024-02-01T10:00:00',
    status: 'paused', deliveryMethod: 'download', recipients: [],
    format: 'PDF', lastRun: '2024-01-01T10:00:00', timezone: 'America/New_York', time: '10:00',
  },
  {
    id: '4', name: 'Privileged Access Audit', frequency: 'Daily at 6:00 AM', nextRun: '2024-01-16T06:00:00',
    status: 'active', deliveryMethod: 'email', recipients: ['ciso@company.com', 'audit@company.com'],
    format: 'XLSX', lastRun: '2024-01-15T06:00:00', timezone: 'UTC', time: '06:00',
  },
  {
    id: '5', name: 'Identity Lifecycle Metrics', frequency: 'Hourly', nextRun: '2024-01-15T16:00:00',
    status: 'error', deliveryMethod: 'webhook', recipients: [],
    format: 'JSON', lastRun: '2024-01-15T14:00:00', timezone: 'UTC', time: '',
    errorMessage: 'Webhook endpoint returned HTTP 503. Last 3 attempts failed.',
  },
  {
    id: '6', name: 'Compliance Posture Report', frequency: 'Quarterly', nextRun: '2024-04-01T07:00:00',
    status: 'active', deliveryMethod: 'email', recipients: ['board@company.com', 'cio@company.com', 'compliance@company.com'],
    format: 'PDF', lastRun: '2024-01-01T07:00:00', timezone: 'America/New_York', time: '07:00',
  },
  {
    id: '7', name: 'Orphan Account Detection', frequency: 'Weekly on Friday', nextRun: '2024-01-19T18:00:00',
    status: 'active', deliveryMethod: 'slack', recipients: ['#security-alerts'],
    format: 'CSV', lastRun: '2024-01-12T18:00:00', timezone: 'America/Los_Angeles', time: '18:00',
  },
  {
    id: '8', name: 'Role Certification Digest', frequency: 'Monthly on 15th', nextRun: '2024-02-15T09:00:00',
    status: 'paused', deliveryMethod: 'email', recipients: ['governance@company.com'],
    format: 'PDF', lastRun: '2024-01-15T09:00:00', timezone: 'Europe/London', time: '09:00',
  },
];

const deliveryIcon = (method: string) => {
  switch (method) {
    case 'email': return <Mail className="h-4 w-4" />;
    case 'webhook': return <Webhook className="h-4 w-4" />;
    case 'slack': return <MessageSquare className="h-4 w-4" />;
    default: return <Download className="h-4 w-4" />;
  }
};

export const ReportScheduler = () => {
  const [schedules, setSchedules] = useState<ScheduledReport[]>(INITIAL_SCHEDULES);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduledReport | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const { toast } = useToast();

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, status: newStatus as 'active' | 'paused' | 'error' } : s));
    toast({ title: "Schedule Updated", description: `Schedule ${newStatus === 'active' ? 'activated' : 'paused'}` });
  };

  const activeCount = schedules.filter(s => s.status === 'active').length;
  const errorCount = schedules.filter(s => s.status === 'error').length;
  const { paginatedData: paginatedSchedules, paginationProps } = usePagination(schedules, 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Scheduled Reports</h3>
          <p className="text-sm text-muted-foreground">
            {activeCount} active · {errorCount > 0 ? `${errorCount} with errors · ` : ''}{schedules.length} total
          </p>
        </div>
        <Button onClick={() => setScheduleDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />Schedule Report
        </Button>
      </div>

      {/* Schedule Cards */}
      <div className="space-y-3">
        {paginatedSchedules.map((schedule) => (
          <Card
            key={schedule.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => { setSelectedSchedule(schedule); setDetailDrawerOpen(true); }}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-sm truncate">{schedule.name}</h4>
                    <Badge className={cn(
                      getStatusBadgeClass(schedule.status === 'active' ? 'active' : schedule.status === 'error' ? 'inactive' : 'pending'),
                      "border text-xs"
                    )}>
                      {schedule.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {schedule.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{schedule.frequency}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Next: {new Date(schedule.nextRun).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {deliveryIcon(schedule.deliveryMethod)}
                      <span className="capitalize">{schedule.deliveryMethod}</span>
                    </div>
                    <div><span>Format: {schedule.format}</span></div>
                  </div>
                  {schedule.recipients.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Recipients: {schedule.recipients.join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm" onClick={() => {
                    toast({ title: "Report Running", description: `Generating ${schedule.name}...` });
                  }}>
                    <Play className="h-3.5 w-3.5 mr-1" />Run
                  </Button>
                  <Switch
                    checked={schedule.status === 'active'}
                    onCheckedChange={() => handleToggleStatus(schedule.id, schedule.status)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <StandardPagination {...paginationProps} pageSizeOptions={[6, 10, 20]} />

      <ScheduleReportDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        onSchedule={() => toast({ title: "Schedule Created" })}
      />

      <ScheduleDetailDrawer
        open={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        schedule={selectedSchedule}
        onRunNow={() => toast({ title: "Running Now" })}
        onToggle={() => selectedSchedule && handleToggleStatus(selectedSchedule.id, selectedSchedule.status)}
        onDelete={() => {
          if (selectedSchedule) {
            setSchedules(prev => prev.filter(s => s.id !== selectedSchedule.id));
            setDetailDrawerOpen(false);
          }
        }}
      />
    </div>
  );
};
