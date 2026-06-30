
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Task } from '../types';

interface TaskStatusBadgeProps {
  status: Task['status'];
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status }) => {

  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className: string }> = {
      pending: { variant: 'secondary', className: 'bg-blue-100 text-blue-800' },
      running: { variant: 'default', className: 'bg-orange-100 text-orange-800' },
      completed: { variant: 'default', className: 'bg-green-100 text-green-800' },
      failed: { variant: 'destructive', className: 'bg-red-100 text-red-800' },
      escalated: { variant: 'default', className: 'bg-purple-100 text-purple-800' }
  };

  const config = variants[status];
  
  if (!config) return null; // Handle undefined status safely or just let it crash if that was behavior?
                            // React usually ignores null.
  
  return (
    <Badge variant={config.variant} className={config.className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
