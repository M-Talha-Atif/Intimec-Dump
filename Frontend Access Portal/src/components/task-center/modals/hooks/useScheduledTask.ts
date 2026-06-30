import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { ScheduledTaskForm, initialScheduledTaskForm } from '../data/scheduledTaskData';

interface UseScheduledTaskProps {
  onOpenChange: (open: boolean) => void;
  onTaskCreated?: (task: any) => void;
}

export const useScheduledTask = ({ onOpenChange, onTaskCreated }: UseScheduledTaskProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ScheduledTaskForm>(initialScheduledTaskForm);

  const updateFormData = (updates: Partial<ScheduledTaskForm>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Task name is required",
        variant: "destructive"
      });
      return;
    }

    if (formData.frequency === 'one-time' && !formData.date) {
      toast({
        title: "Validation Error",
        description: "Date is required for one-time tasks",
        variant: "destructive"
      });
      return;
    }

    if (formData.frequency === 'custom' && !formData.cronExpression) {
      toast({
        title: "Validation Error",
        description: "Cron expression is required for custom frequency",
        variant: "destructive"
      });
      return;
    }

    const newTask = {
      id: `SCHED-${Date.now()}`,
      ...formData,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user@company.com',
      status: 'pending',
      runCount: 0
    };

    onTaskCreated?.(newTask);
    
    toast({
      title: "Scheduled Task Created",
      description: `"${formData.name}" has been scheduled successfully`
    });

    onOpenChange(false);
    
    // Reset form
    setFormData(initialScheduledTaskForm);
  };

  return {
    formData,
    updateFormData,
    handleSubmit
  };
};
