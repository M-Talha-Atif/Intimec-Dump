
import { useState, useEffect } from 'react';
import { ScheduledTask, TaskSchedule, TaskContext, TaskExecution } from '@/types/scheduling';

export const useTaskScheduling = () => {
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [taskExecutions, setTaskExecutions] = useState<TaskExecution[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demo purposes
  useEffect(() => {
    const mockTasks: ScheduledTask[] = [
      {
        id: 'task-001',
        name: 'Daily AD Account Import',
        type: 'data-import',
        status: 'pending',
        schedule: {
          frequency: 'daily',
          time: '02:00',
          timezone: 'UTC'
        },
        context: {
          applicationId: 'active-directory',
          identityType: 'employee',
          aggregationMode: 'incremental'
        },
        createdAt: '2024-01-15T10:00:00Z',
        nextRun: '2024-01-16T02:00:00Z',
        runCount: 5,
        createdBy: 'admin@company.com'
      }
    ];
    
    setScheduledTasks(mockTasks);
  }, []);

  const createScheduledTask = async (
    name: string,
    type: 'data-import' | 'ai-analysis',
    schedule: TaskSchedule,
    context: TaskContext
  ): Promise<ScheduledTask> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTask: ScheduledTask = {
        id: `task-${Date.now()}`,
        name,
        type,
        status: 'pending',
        schedule,
        context,
        createdAt: new Date().toISOString(),
        runCount: 0,
        createdBy: 'current-user@company.com'
      };
      
      setScheduledTasks(prev => [...prev, newTask]);
      
      // If run immediately is requested
      if (schedule.runImmediately) {
        await executeTask(newTask.id);
      }
      
      console.log('Task scheduled successfully:', newTask);
      return newTask;
    } finally {
      setIsLoading(false);
    }
  };

  const executeTask = async (taskId: string): Promise<TaskExecution> => {
    const task = scheduledTasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const execution: TaskExecution = {
      id: `exec-${Date.now()}`,
      taskId,
      startTime: new Date().toISOString(),
      status: 'running',
      logs: [`Starting ${task.type} task: ${task.name}`]
    };

    setTaskExecutions(prev => [...prev, execution]);
    
    // Update task status
    setScheduledTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'running' } : t
    ));

    try {
      // Simulate task execution
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const completedExecution = {
        ...execution,
        endTime: new Date().toISOString(),
        status: 'completed' as const,
        result: { processedItems: 150, errors: 0 },
        logs: [
          ...execution.logs,
          'Processing data...',
          'Validation completed',
          'Task completed successfully'
        ]
      };

      setTaskExecutions(prev => prev.map(e => 
        e.id === execution.id ? completedExecution : e
      ));

      // Update task status and run count
      setScheduledTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { 
              ...t, 
              status: 'completed',
              lastRun: new Date().toISOString(),
              runCount: t.runCount + 1
            } 
          : t
      ));

      return completedExecution;
    } catch (error) {
      const failedExecution = {
        ...execution,
        endTime: new Date().toISOString(),
        status: 'failed' as const,
        errorMessage: 'Task execution failed',
        logs: [...execution.logs, 'Error occurred during execution']
      };

      setTaskExecutions(prev => prev.map(e => 
        e.id === execution.id ? failedExecution : e
      ));

      setScheduledTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'failed' } : t
      ));

      throw error;
    }
  };

  const cancelTask = async (taskId: string): Promise<void> => {
    setScheduledTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'cancelled' } : t
    ));
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    setScheduledTasks(prev => prev.filter(t => t.id !== taskId));
    setTaskExecutions(prev => prev.filter(e => e.taskId !== taskId));
  };

  const getTaskExecutions = (taskId: string): TaskExecution[] => {
    return taskExecutions.filter(e => e.taskId === taskId);
  };

  return {
    scheduledTasks,
    taskExecutions,
    isLoading,
    createScheduledTask,
    executeTask,
    cancelTask,
    deleteTask,
    getTaskExecutions
  };
};
