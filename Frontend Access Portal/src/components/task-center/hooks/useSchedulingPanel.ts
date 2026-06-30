
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { ScheduledTask } from '../utils/schedulingUtils';

export const useSchedulingPanel = () => {
  const { toast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([
    {
      id: 'SCHED-001',
      name: 'Daily AD User Import',
      description: 'Import user accounts from Active Directory',
      type: 'data-import',
      frequency: 'daily',
      time: '02:00',
      timezone: 'UTC',
      enabled: true,
      nextRun: new Date(Date.now() + 3600000 * 5).toISOString(),
      lastRun: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed',
      runCount: 145,
      successCount: 142,
      failureCount: 3,
      createdBy: 'admin@company.com',
      createdAt: '2024-01-01T10:00:00Z'
    },
    {
      id: 'SCHED-002',
      name: 'Weekly Access Review',
      description: 'Generate weekly access review reports',
      type: 'review',
      frequency: 'weekly',
      time: '08:00',
      timezone: 'America/New_York',
      enabled: true,
      nextRun: new Date(Date.now() + 86400000 * 3).toISOString(),
      lastRun: new Date(Date.now() - 86400000 * 4).toISOString(),
      status: 'completed',
      runCount: 24,
      successCount: 24,
      failureCount: 0,
      createdBy: 'security@company.com',
      createdAt: '2024-01-01T10:00:00Z'
    },
    {
      id: 'SCHED-003',
      name: 'Nightly Certification Reminders',
      description: 'Send certification reminder emails',
      type: 'certification',
      frequency: 'daily',
      time: '18:00',
      timezone: 'UTC',
      enabled: true,
      nextRun: new Date(Date.now() + 3600000 * 3).toISOString(),
      status: 'pending',
      runCount: 89,
      successCount: 87,
      failureCount: 2,
      createdBy: 'compliance@company.com',
      createdAt: '2024-01-10T10:00:00Z'
    },
    {
      id: 'SCHED-004',
      name: 'Monthly Orphan Account Cleanup',
      description: 'Identify and flag orphan accounts',
      type: 'deprovisioning',
      frequency: 'monthly',
      time: '03:00',
      timezone: 'UTC',
      enabled: false,
      lastRun: new Date(Date.now() - 86400000 * 15).toISOString(),
      status: 'failed',
      runCount: 3,
      successCount: 2,
      failureCount: 1,
      createdBy: 'ops@company.com',
      createdAt: '2024-02-01T10:00:00Z'
    }
  ]);

  const handleTaskCreated = (newTask: ScheduledTask) => {
    setScheduledTasks([...scheduledTasks, newTask]);
  };

  const handleToggleTask = (taskId: string) => {
    setScheduledTasks(tasks => tasks.map(task => 
      task.id === taskId ? { ...task, enabled: !task.enabled } : task
    ));
    toast({
      title: "Task Updated",
      description: "Scheduled task status has been changed"
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setScheduledTasks(tasks => tasks.filter(task => task.id !== taskId));
    toast({
      title: "Task Deleted",
      description: "Scheduled task has been removed"
    });
  };

  const handleRunNow = (taskId: string) => {
    console.log('Running task:', taskId); // Use it to avoid lint error while mocking action
    toast({
      title: "Task Executing",
      description: "Manual execution started for scheduled task"
    });
  };

  return {
    showCreateModal,
    setShowCreateModal,
    scheduledTasks,
    handleTaskCreated,
    handleToggleTask,
    handleDeleteTask,
    handleRunNow
  };
};
