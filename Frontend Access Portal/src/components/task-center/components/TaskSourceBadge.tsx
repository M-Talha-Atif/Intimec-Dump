
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Task } from '../types';

interface TaskSourceBadgeProps {
  source: Task['triggerSource'];
}

export const TaskSourceBadge: React.FC<TaskSourceBadgeProps> = ({ source }) => {
  const colors: Record<string, string> = {
    ui: 'bg-blue-100 text-blue-800',
    api: 'bg-purple-100 text-purple-800',
    scheduled: 'bg-green-100 text-green-800',
    workflow: 'bg-orange-100 text-orange-800'
  };
  
  return (
    <Badge variant="outline" className={colors[source]}>
      {source.toUpperCase()}
    </Badge>
  );
};
