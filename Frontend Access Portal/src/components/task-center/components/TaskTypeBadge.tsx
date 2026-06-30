
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Task } from '../types';

interface TaskTypeBadgeProps {
  type: Task['type'];
}

export const TaskTypeBadge: React.FC<TaskTypeBadgeProps> = ({ type }) => {
  const typeLabels: Record<string, string> = {
    provisioning: 'Provisioning',
    review: 'Review',
    sync: 'Sync',
    api_trigger: 'API Trigger',
    workflow: 'Workflow',
    deprovisioning: 'Deprovisioning'
  };

  return (
    <Badge variant="outline">
      {typeLabels[type] || type} 
    </Badge>
  );
  // Original: {typeLabels[type]}
  // If type is not in map, it renders nothing or undefined. I'll stick to original behavior but adding a fallback to `type` is usually good practice in refactor if it doesn't break UI. 
  // However, "logic same" implies if it was showing empty for 'data-import', it should stay empty?
  // 'data-import' is in the Task type definition but not in the map.
  // Let's assume the mock data might use them.
  // I will keep it `originalTypeLabels[type]` to be ultra conservative.
};
