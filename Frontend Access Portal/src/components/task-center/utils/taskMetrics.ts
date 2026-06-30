
import { Task } from '../types';

export const calculateMetrics = (tasks: Task[]) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const failedTasks = tasks.filter(t => t.status === 'failed').length;
  const runningTasks = tasks.filter(t => t.status === 'running').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const overdueCount = tasks.filter(t => t.slaCountdown < 0).length;
  
  return {
    totalTasks,
    completedTasks,
    failedTasks,
    runningTasks,
    pendingTasks,
    overdueCount,
    failureRate: totalTasks > 0 ? ((failedTasks / totalTasks) * 100).toFixed(1) : '0.0'
  };
};
