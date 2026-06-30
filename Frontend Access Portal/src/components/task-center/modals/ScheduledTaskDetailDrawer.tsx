import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import {
  Calendar, Clock, Play, Pause, Trash2, Copy, CheckCircle, XCircle,
  AlertTriangle, User, Globe, FileText, Bell, Settings, RotateCcw
} from 'lucide-react';

interface ScheduledTaskForDrawer {
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

interface ScheduledTaskDetailDrawerProps {
  task: ScheduledTaskForDrawer | null;
  onClose: () => void;
  onRunNow: (id: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function getExecutionHistory(task: ScheduledTaskForDrawer) {
  const runs = [];
  const now = Date.now();
  const freqMs = task.frequency === 'daily' ? 86400000 : task.frequency === 'weekly' ? 604800000 : task.frequency === 'hourly' ? 3600000 : 2592000000;

  for (let i = 0; i < Math.min(task.runCount, 10); i++) {
    const startTime = new Date(now - freqMs * (i + 1));
    const duration = 15 + Math.floor(Math.random() * 120);
    const isSuccess = Math.random() > 0.12;
    runs.push({
      id: `EXEC-${task.id}-${String(i + 1).padStart(3, '0')}`,
      startTime: startTime.toISOString(),
      endTime: new Date(startTime.getTime() + duration * 1000).toISOString(),
      duration,
      status: isSuccess ? 'completed' : 'failed',
      recordsProcessed: isSuccess ? 50 + Math.floor(Math.random() * 1200) : 0,
      errors: isSuccess ? 0 : 1 + Math.floor(Math.random() * 3),
      errorMessage: isSuccess ? undefined : ['Connection timeout to target API', 'Rate limit exceeded', 'Authentication token expired', 'Schema validation failed'][Math.floor(Math.random() * 4)]
    });
  }
  return runs;
}

function getUpcomingRuns(task: ScheduledTaskForDrawer) {
  if (!task.enabled || !task.nextRun) return [];
  const freqMs = task.frequency === 'daily' ? 86400000 : task.frequency === 'weekly' ? 604800000 : task.frequency === 'hourly' ? 3600000 : 2592000000;
  const base = new Date(task.nextRun).getTime();
  return Array.from({ length: 5 }, (_, i) => ({
    date: new Date(base + freqMs * i).toISOString(),
    estimated: true
  }));
}

function getNotificationConfig(task: ScheduledTaskForDrawer) {
  return {
    onFailure: ['ops@company.com', task.createdBy],
    onSuccess: task.frequency === 'monthly' ? [task.createdBy] : [],
    onSlaBreach: ['security@company.com'],
    slackChannel: '#iga-alerts'
  };
}

export const ScheduledTaskDetailDrawer: React.FC<ScheduledTaskDetailDrawerProps> = ({
  task, onClose, onRunNow, onToggle, onDelete
}) => {
  if (!task) return null;

  const history = getExecutionHistory(task);
  const upcoming = getUpcomingRuns(task);
  const notifications = getNotificationConfig(task);
  const successRate = task.runCount > 0 && task.successCount !== undefined
    ? ((task.successCount / task.runCount) * 100).toFixed(1) : '—';
  const avgDuration = history.length > 0
    ? Math.round(history.reduce((s, h) => s + h.duration, 0) / history.length) : 0;

  return (
    <Dialog open={!!task} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${task.enabled ? 'bg-primary/10 border-primary/20' : 'bg-muted border-border'}`}>
              <Calendar className={`h-5 w-5 ${task.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg truncate">{task.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <span className="font-mono text-xs">{task.id}</span>
                <Badge variant={task.enabled ? 'default' : 'secondary'}>{task.enabled ? 'Active' : 'Disabled'}</Badge>
                <Badge variant="outline" className="capitalize text-xs">{task.type.replace('-', ' ')}</Badge>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-2">
          <Button size="sm" onClick={() => onRunNow(task.id)}><Play className="h-3.5 w-3.5 mr-1" /> Run Now</Button>
          <Button size="sm" variant="outline" onClick={() => onToggle(task.id)}>
            {task.enabled ? <><Pause className="h-3.5 w-3.5 mr-1" /> Pause</> : <><Play className="h-3.5 w-3.5 mr-1" /> Resume</>}
          </Button>
          <Button size="sm" variant="outline"><Copy className="h-3.5 w-3.5 mr-1" /> Clone</Button>
          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => onDelete(task.id)}>
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
          </Button>
        </div>

        <Separator className="my-2" />

        {/* Schedule Configuration */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Settings className="h-4 w-4" /> Schedule Configuration</h4>
          {task.description && <p className="text-sm text-muted-foreground mb-3">{task.description}</p>}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ['Frequency', task.frequency.charAt(0).toUpperCase() + task.frequency.slice(1)],
              ['Time', `${task.time} ${task.timezone}`],
              ['Created By', task.createdBy],
              ['Created', new Date(task.createdAt).toLocaleDateString()],
              ['Total Runs', String(task.runCount)],
              ['Success Rate', `${successRate}%`],
              ['Avg Duration', `${avgDuration}s`],
              ['Retention', '90 days'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-muted-foreground text-xs mb-0.5">{label}</p>
                <p className="font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-2" />

        {/* Notifications */}
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Bell className="h-4 w-4" /> Notifications</h4>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-xs">On Failure</Badge>
              <span className="text-muted-foreground">{notifications.onFailure.join(', ')}</span>
            </div>
            {notifications.onSuccess.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/10 text-green-700 text-xs">On Success</Badge>
                <span className="text-muted-foreground">{notifications.onSuccess.join(', ')}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">Slack</Badge>
              <span className="text-muted-foreground">{notifications.slackChannel}</span>
            </div>
          </div>
        </div>

        <Separator className="my-2" />

        {/* Upcoming Runs */}
        {upcoming.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Clock className="h-4 w-4" /> Next 5 Runs</h4>
            <div className="space-y-1.5">
              {upcoming.map((run, i) => (
                <div key={i} className="flex items-center gap-2 text-sm p-1.5 rounded hover:bg-muted/50">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{new Date(run.date).toLocaleString()}</span>
                  {i === 0 && <Badge variant="outline" className="text-xs ml-auto">Next</Badge>}
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-2" />

        {/* Execution History */}
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><FileText className="h-4 w-4" /> Recent Executions</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((exec) => (
              <div key={exec.id} className={`p-3 rounded-lg border text-sm ${
                exec.status === 'completed' ? 'border-green-200 bg-green-500/5' : 'border-destructive/20 bg-destructive/5'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {exec.status === 'completed'
                    ? <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                    : <XCircle className="h-3.5 w-3.5 text-destructive" />}
                  <span className="font-medium capitalize">{exec.status}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{new Date(exec.startTime).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Duration: {exec.duration}s</span>
                  {exec.recordsProcessed > 0 && <span>Records: {exec.recordsProcessed.toLocaleString()}</span>}
                  {exec.errors > 0 && <span className="text-destructive">Errors: {exec.errors}</span>}
                </div>
                {exec.errorMessage && (
                  <p className="text-xs text-destructive mt-1.5">{exec.errorMessage}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
