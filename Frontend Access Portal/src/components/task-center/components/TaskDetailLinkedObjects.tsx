
import React from 'react';
import { User, Server, Link as LinkIcon } from 'lucide-react';
import { Task } from '../types';

interface TaskDetailLinkedObjectsProps {
  linkedObjects?: Task['linkedObjects'];
}

export const TaskDetailLinkedObjects: React.FC<TaskDetailLinkedObjectsProps> = ({ linkedObjects }) => {
  if (!linkedObjects) {
    return <div className="text-gray-500">No linked objects</div>;
  }

  return (
    <div className="space-y-3">
      {linkedObjects.userId && (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="text-sm">User: {linkedObjects.userId}</span>
        </div>
      )}
      {linkedObjects.applicationId && (
        <div className="flex items-center space-x-2">
          <Server className="h-4 w-4 text-gray-500" />
          <span className="text-sm">Application: {linkedObjects.applicationId}</span>
        </div>
      )}
      {linkedObjects.entitlementId && (
        <div className="flex items-center space-x-2">
          <LinkIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm">Entitlement: {linkedObjects.entitlementId}</span>
        </div>
      )}
      {linkedObjects.requestId && (
        <div className="flex items-center space-x-2">
          <LinkIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm">Request: {linkedObjects.requestId}</span>
        </div>
      )}
      {linkedObjects.reviewId && (
        <div className="flex items-center space-x-2">
          <LinkIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm">Review: {linkedObjects.reviewId}</span>
        </div>
      )}
    </div>
  );
};
