
'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Pause, Trash2, Edit, Clock, Calendar, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { CreateScheduledTaskModal } from './modals/CreateScheduledTaskModal';
import { ScheduledTaskDetailDrawer } from './modals/ScheduledTaskDetailDrawer';
import { useToast } from "@/hooks/use-toast";
import { usePagination, StandardPagination } from '@/components/shared/StandardPagination';

interface ScheduledTask {
  id: string;
  name: string;
  description?: string;
  type: string;
  frequency: string;
  time: string;
  timezone: string;
  enabled: boolean;
  nextRun?: string;
  lastRun?: string;
  status: string;
  runCount: number;
  successCount?: number;
  failureCount?: number;
  createdBy: string;
  createdAt: string;
}

const INITIAL_TASKS: ScheduledTask[] = [
  {
    id: 'SCHED-001', name: 'Daily AD User Sync', description: 'Incremental import of user accounts from Active Directory via LDAP connector',
    type: 'data-import', frequency: 'daily', time: '02:00', timezone: 'UTC', enabled: true,
    nextRun: new Date(Date.now() + 3600000 * 5).toISOString(), lastRun: new Date(Date.now() - 86400000).toISOString(),
    status: 'completed', runCount: 245, successCount: 240, failureCount: 5, createdBy: 'admin@company.com', createdAt: '2023-09-15T10:00:00Z'
  },
  {
    id: 'SCHED-002', name: 'Hourly Privileged Account Scan', description: 'Real-time scan of privileged accounts across PAM-integrated applications',
    type: 'ai-analysis', frequency: 'hourly', time: '00:00', timezone: 'UTC', enabled: true,
    nextRun: new Date(Date.now() + 1800000).toISOString(), lastRun: new Date(Date.now() - 3600000).toISOString(),
    status: 'completed', runCount: 1820, successCount: 1815, failureCount: 5, createdBy: 'security@company.com', createdAt: '2023-08-01T10:00:00Z'
  },
  {
    id: 'SCHED-003', name: 'Weekly SoD Policy Check', description: 'Evaluate all active identities against Separation of Duties rule matrix',
    type: 'review', frequency: 'weekly', time: '06:00', timezone: 'America/New_York', enabled: true,
    nextRun: new Date(Date.now() + 86400000 * 3).toISOString(), lastRun: new Date(Date.now() - 86400000 * 4).toISOString(),
    status: 'completed', runCount: 52, successCount: 51, failureCount: 1, createdBy: 'compliance@company.com', createdAt: '2023-10-01T10:00:00Z'
  },
  {
    id: 'SCHED-004', name: 'Monthly Certification Campaign Trigger', description: 'Auto-generate quarterly access certification campaigns for all business units',
    type: 'review', frequency: 'monthly', time: '08:00', timezone: 'Europe/London', enabled: true,
    nextRun: new Date(Date.now() + 86400000 * 12).toISOString(), lastRun: new Date(Date.now() - 86400000 * 18).toISOString(),
    status: 'completed', runCount: 12, successCount: 12, failureCount: 0, createdBy: 'governance@company.com', createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'SCHED-005', name: 'Bi-weekly Entitlement Reconciliation', description: 'Reconcile entitlement assignments between IGA and target applications',
    type: 'sync', frequency: 'bi-weekly', time: '03:00', timezone: 'UTC', enabled: true,
    nextRun: new Date(Date.now() + 86400000 * 6).toISOString(), lastRun: new Date(Date.now() - 86400000 * 8).toISOString(),
    status: 'completed', runCount: 26, successCount: 24, failureCount: 2, createdBy: 'ops@company.com', createdAt: '2023-11-15T10:00:00Z'
  },
  {
    id: 'SCHED-006', name: 'Daily Terminated Employee Deprovisioning', description: 'Auto-revoke access for employees marked as terminated in HR system',
    type: 'deprovisioning', frequency: 'daily', time: '01:00', timezone: 'UTC', enabled: true,
    nextRun: new Date(Date.now() + 3600000 * 8).toISOString(), lastRun: new Date(Date.now() - 86400000).toISOString(),
    status: 'completed', runCount: 180, successCount: 178, failureCount: 2, createdBy: 'hr-integration@company.com', createdAt: '2023-07-01T10:00:00Z'
  },
  {
    id: 'SCHED-007', name: 'Weekly Compliance Report Generation', description: 'Generate SOX, HIPAA and ISO 27001 compliance summary reports',
    type: 'data-import', frequency: 'weekly', time: '07:00', timezone: 'America/Chicago', enabled: true,
    nextRun: new Date(Date.now() + 86400000 * 2).toISOString(), lastRun: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'completed', runCount: 44, successCount: 44, failureCount: 0, createdBy: 'compliance@company.com', createdAt: '2023-12-01T10:00:00Z'
  },
  {
    id: 'SCHED-008', name: 'Nightly Orphan Account Detection', description: 'Scan target systems for accounts not linked to active identities',
    type: 'ai-analysis', frequency: 'daily', time: '04:00', timezone: 'UTC', enabled: false,
    lastRun: new Date(Date.now() - 86400000 * 15).toISOString(),
    status: 'failed', runCount: 90, successCount: 82, failureCount: 8, createdBy: 'ops@company.com', createdAt: '2023-10-20T10:00:00Z'
  },
  {
    id: 'SCHED-009', name: 'Real-time API Webhook Monitor', description: 'Monitor inbound webhook events from connected SaaS applications',
    type: 'sync', frequency: 'continuous', time: '—', timezone: 'UTC', enabled: true,
    nextRun: new Date(Date.now() + 60000).toISOString(), lastRun: new Date(Date.now() - 300000).toISOString(),
    status: 'completed', runCount: 15420, successCount: 15398, failureCount: 22, createdBy: 'platform@company.com', createdAt: '2023-06-01T10:00:00Z'
  },
  {
    id: 'SCHED-010', name: 'Quarterly Role Mining Analysis', description: 'AI-driven role mining to identify optimization opportunities and role consolidation',
    type: 'ai-analysis', frequency: 'quarterly', time: '09:00', timezone: 'UTC', enabled: true,
    nextRun: new Date(Date.now() + 86400000 * 45).toISOString(), lastRun: new Date(Date.now() - 86400000 * 45).toISOString(),
    status: 'completed', runCount: 4, successCount: 4, failureCount: 0, createdBy: 'governance@company.com', createdAt: '2024-01-15T10:00:00Z'
  }
];

export const SchedulingPanel: React.FC = () => {
  const { toast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ScheduledTask | null>(null);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>(INITIAL_TASKS);
  const { paginatedData: paginatedSchedules, paginationProps: schedulePaginationProps } = usePagination(scheduledTasks, 6);

  const handleTaskCreated = (newTask: ScheduledTask) => {
    setScheduledTasks([...scheduledTasks, newTask]);
  };

  const handleToggleTask = (taskId: string) => {
    setScheduledTasks(tasks => tasks.map(task =>
      task.id === taskId ? { ...task, enabled: !task.enabled } : task
    ));
    toast({ title: "Task Updated", description: "Scheduled task status has been changed" });
  };

  const handleDeleteTask = (taskId: string) => {
    setScheduledTasks(tasks => tasks.filter(task => task.id !== taskId));
    setSelectedTask(null);
    toast({ title: "Task Deleted", description: "Scheduled task has been removed" });
  };

  const handleRunNow = (taskId: string) => {
    toast({ title: "Task Executing", description: "Manual execution started for scheduled task" });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'pending': return <Clock className="h-4 w-4 text-primary" />;
      default: return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    }
  };

  const getSuccessRate = (task: ScheduledTask) => {
    if (!task.successCount || task.runCount === 0) return '0';
    return ((task.successCount / task.runCount) * 100).toFixed(1);
  };

  const formatNextRun = (nextRun?: string) => {
    if (!nextRun) return 'Not scheduled';
    const diffMs = new Date(nextRun).getTime() - Date.now();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `In ${diffDays}d`;
    if (diffHours > 0) return `In ${diffHours}h`;
    return 'Soon';
  };

  const formatLastRun = (lastRun?: string) => {
    if (!lastRun) return 'Never';
    const diffMs = Date.now() - new Date(lastRun).getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  // Deterministic execution bar colors per task
  const getExecBarColors = (task: ScheduledTask) => {
    const seed = task.id.charCodeAt(task.id.length - 1);
    return Array.from({ length: 10 }, (_, i) => {
      const hash = (seed * 31 + i * 17) % 100;
      const failRate = task.failureCount && task.runCount ? (task.failureCount / task.runCount) * 100 : 5;
      return hash < failRate * 3 ? 'bg-destructive' : 'bg-green-500';
    });
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scheduled Tasks</h2>
          <p className="text-muted-foreground mt-1">Automated IGA tasks running on schedule</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" /> Create Schedule
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Schedules', value: scheduledTasks.length, icon: Calendar, color: 'text-primary' },
          { label: 'Active', value: scheduledTasks.filter(t => t.enabled).length, icon: CheckCircle, color: 'text-green-600' },
          { label: 'Disabled', value: scheduledTasks.filter(t => !t.enabled).length, icon: Pause, color: 'text-orange-600' },
          { label: 'Total Runs', value: scheduledTasks.reduce((s, t) => s + t.runCount, 0).toLocaleString(), icon: Play, color: 'text-purple-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
                <Icon className={`h-8 w-8 ${color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Task Cards */}
      <div className="grid gap-4">
        {paginatedSchedules.map(task => {
          const barColors = getExecBarColors(task);
          return (
            <Card
              key={task.id}
              className={`cursor-pointer transition-colors hover:border-primary/30 ${!task.enabled ? 'opacity-60' : ''}`}
              onClick={() => setSelectedTask(task)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${task.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Calendar className={`h-5 w-5 ${task.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base truncate">{task.name}</CardTitle>
                        <Badge variant={task.enabled ? 'default' : 'secondary'}>{task.enabled ? 'Active' : 'Disabled'}</Badge>
                        <Badge variant="outline" className="capitalize text-xs">{task.type.replace('-', ' ')}</Badge>
                      </div>
                      {task.description && <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => handleRunNow(task.id)} title="Run Now"><Play className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleToggleTask(task.id)} title={task.enabled ? 'Pause' : 'Resume'}>
                      {task.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTask(task)} title="Edit"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Schedule</p>
                    <p className="font-medium capitalize">{task.frequency}</p>
                    <p className="text-xs text-muted-foreground">{task.time} {task.timezone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Next Run</p>
                    <p className="font-medium">{formatNextRun(task.nextRun)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Last Run</p>
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(task.status)}
                      <span className="font-medium">{formatLastRun(task.lastRun)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Stats</p>
                    <p className="font-medium">{task.runCount.toLocaleString()} runs</p>
                    <p className="text-xs text-muted-foreground">{getSuccessRate(task)}% success</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Owner</p>
                    <p className="font-medium text-xs truncate">{task.createdBy}</p>
                  </div>
                </div>

                {task.lastRun && (
                  <div className="mt-4 pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-1.5">Recent Executions</p>
                    <div className="flex gap-1">
                      {barColors.map((color, idx) => (
                        <div key={idx} className={`h-5 flex-1 rounded-sm ${color}`} />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <StandardPagination {...schedulePaginationProps} pageSizeOptions={[6, 10, 20]} />

      <CreateScheduledTaskModal open={showCreateModal} onOpenChange={setShowCreateModal} onTaskCreated={handleTaskCreated} />
      <ScheduledTaskDetailDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onRunNow={handleRunNow}
        onToggle={handleToggleTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
};
