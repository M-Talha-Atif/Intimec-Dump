
export interface ScheduledTask {
  id: string;
  name: string;
  type: 'data-import' | 'ai-analysis';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  schedule: TaskSchedule;
  context: TaskContext;
  createdAt: string;
  lastRun?: string;
  nextRun?: string;
  runCount: number;
  createdBy: string;
}

export interface TaskSchedule {
  frequency: 'one-time' | 'daily' | 'weekly' | 'monthly' | 'custom';
  date?: string;
  time: string;
  timezone: string;
  cronExpression?: string;
  runImmediately?: boolean;
  dates?: string[]; // For multiple one-time runs
}

export interface TaskContext {
  // For data import tasks
  applicationId?: string;
  identityType?: string;
  aggregationMode?: string;
  
  // For AI analysis tasks
  logSource?: 'audit' | 'debug';
  filters?: any;
  analysisType?: string;
}

export interface TaskExecution {
  id: string;
  taskId: string;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed';
  result?: any;
  errorMessage?: string;
  logs: string[];
}

export const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'GMT (London)' },
  { value: 'Europe/Paris', label: 'CET (Paris)' },
  { value: 'Asia/Tokyo', label: 'JST (Tokyo)' },
  { value: 'Asia/Shanghai', label: 'CST (Shanghai)' },
];

export const getNextRunTime = (schedule: TaskSchedule): Date | null => {
  const now = new Date();
  const [hours, minutes] = schedule.time.split(':').map(Number);
  
  if (schedule.frequency === 'one-time') {
    if (schedule.date) {
      const scheduledDate = new Date(schedule.date);
      scheduledDate.setHours(hours, minutes, 0, 0);
      return scheduledDate > now ? scheduledDate : null;
    }
    return null;
  }
  
  if (schedule.frequency === 'daily') {
    const nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    return nextRun;
  }
  
  if (schedule.frequency === 'weekly') {
    const nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);
    const daysUntilNext = (7 - nextRun.getDay()) % 7 || 7;
    nextRun.setDate(nextRun.getDate() + daysUntilNext);
    return nextRun;
  }
  
  return null;
};

export const formatNextRun = (schedule: TaskSchedule): string => {
  const nextRun = getNextRunTime(schedule);
  if (!nextRun) return 'Not scheduled';
  
  const now = new Date();
  const diffMs = nextRun.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `In ${diffDays} day${diffDays > 1 ? 's' : ''} (${nextRun.toLocaleDateString()} ${nextRun.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
  } else if (diffHours > 0) {
    return `In ${diffHours} hour${diffHours > 1 ? 's' : ''} (${nextRun.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
  } else {
    return `Soon (${nextRun.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
  }
};
