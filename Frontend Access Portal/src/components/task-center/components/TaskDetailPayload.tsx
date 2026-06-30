
import React from 'react';

interface TaskDetailPayloadProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
}

export const TaskDetailPayload: React.FC<TaskDetailPayloadProps> = ({ payload }) => {
  if (!payload) return <div className="text-gray-500">No payload data available</div>;
  
  return (
    <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto max-h-96">
      {JSON.stringify(payload, null, 2)}
    </pre>
  );
};
