
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Task } from '../types';
import { formatTimestamp } from '../utils/taskHelpers';

interface TaskDetailHistoryProps {
  history?: Task['history'];
}

export const TaskDetailHistory: React.FC<TaskDetailHistoryProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return <div className="text-gray-500">No history available</div>;
  }

  return (
    <div className="space-y-4">
      {history.map((entry, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{entry.status.toUpperCase()}</Badge>
              <span className="text-sm text-gray-500">{formatTimestamp(entry.timestamp)}</span>
            </div>
            {entry.notes && (
              <p className="text-sm text-gray-700 mt-1">{entry.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
