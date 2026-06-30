
import React from 'react';

interface TaskDetailLogsProps {
  logs?: string[];
}

export const TaskDetailLogs: React.FC<TaskDetailLogsProps> = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return <div className="text-gray-500">No logs available</div>;
  }

  return (
    <div className="space-y-2">
      {logs.map((log, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
          <div className="text-sm">
            <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
          </div>
        </div>
      ))}
    </div>
  );
};
