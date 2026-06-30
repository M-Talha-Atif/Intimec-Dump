


export interface ScheduledTask {
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

export const getSuccessRate = (task: ScheduledTask): string | number => {
  if (!task.successCount || task.runCount === 0) return 0;
  return ((task.successCount / task.runCount) * 100).toFixed(1);
};

export const formatNextRun = (nextRun?: string): string => {
  if (!nextRun) return 'Not scheduled';
  const date = new Date(nextRun);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  } else {
    return 'Soon';
  }
};

export const formatLastRun = (lastRun?: string): string => {
  if (!lastRun) return 'Never';
  const date = new Date(lastRun);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};
