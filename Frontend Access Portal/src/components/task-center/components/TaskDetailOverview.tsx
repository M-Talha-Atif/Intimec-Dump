
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Task } from '../types';
import { formatTimestamp, getStatusColor } from '../utils/taskHelpers';

interface TaskDetailOverviewProps {
  task: Task;
}

export const TaskDetailOverview: React.FC<TaskDetailOverviewProps> = ({ task }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold">Task ID:</span>
        <span className="font-mono">{task.id}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-semibold">Name:</span>
        <span>{task.name}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-semibold">Status:</span>
        <Badge className={getStatusColor(task.status)}>
          {task.status.toUpperCase()}
        </Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-semibold">Type:</span>
        <Badge variant="outline">{task.type.replace('_', ' ').toUpperCase()}</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-semibold">Application:</span>
        <span>{task.application}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-semibold">Affected Identity:</span>
        <span className="font-mono text-sm">{task.affectedIdentity}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-semibold">Initiated By:</span>
        <span className="font-mono text-sm">{task.initiatedBy}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-semibold">Created:</span>
        <span className="text-sm">{formatTimestamp(task.createdAt)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-semibold">Updated:</span>
        <span className="text-sm">{formatTimestamp(task.updatedAt)}</span>
      </div>
      {task.retryCount !== undefined && task.retryCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="font-semibold">Retry Count:</span>
          <Badge variant="outline">{task.retryCount}</Badge>
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="font-semibold">SLA Status:</span>
        <span className={task.slaCountdown < 0 ? 'text-red-600' : task.slaCountdown < 60 ? 'text-orange-600' : 'text-green-600'}>
          {task.slaCountdown < 0 ? 'Overdue' : `${Math.floor(task.slaCountdown / 60)}h ${task.slaCountdown % 60}m remaining`}
        </span>
      </div>
    </div>
  );
};
