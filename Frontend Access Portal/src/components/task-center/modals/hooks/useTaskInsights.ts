import { useMemo } from 'react';

export interface Task {
  id: string;
  status: 'completed' | 'failed' | 'running' | 'pending' | string;
  slaCountdown: number;
  type: string;
  application: string;
}

export const useTaskInsights = (tasks: Task[]) => {
  const metrics = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const failedTasks = tasks.filter(t => t.status === 'failed').length;
    const runningTasks = tasks.filter(t => t.status === 'running').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    
    // Safety check for division by zero
    const successRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0';
    const failureRate = totalTasks > 0 ? ((failedTasks / totalTasks) * 100).toFixed(1) : '0';

    // SLA metrics
    const onTimeTasks = tasks.filter(t => t.status === 'completed' && t.slaCountdown >= 0).length;
    const breachedTasks = tasks.filter(t => t.slaCountdown < 0).length;
    const atRiskTasks = tasks.filter(t => t.slaCountdown > 0 && t.slaCountdown < 60).length;
    const slaComplianceRate = totalTasks > 0 ? ((onTimeTasks / totalTasks) * 100).toFixed(1) : '100';

    // Task type distribution
    const tasksByType = tasks.reduce((acc: Record<string, number>, task) => {
      acc[task.type] = (acc[task.type] || 0) + 1;
      return acc;
    }, {});

    // Application distribution
    const tasksByApp = tasks.reduce((acc: Record<string, number>, task) => {
      acc[task.application] = (acc[task.application] || 0) + 1;
      return acc;
    }, {});

    return {
      totalTasks,
      completedTasks,
      failedTasks,
      runningTasks,
      pendingTasks,
      successRate,
      failureRate,
      breachedTasks,
      atRiskTasks,
      slaComplianceRate,
      tasksByType,
      tasksByApp
    };
  }, [tasks]);

  return metrics;
};
