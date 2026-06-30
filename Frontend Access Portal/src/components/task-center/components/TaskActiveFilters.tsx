
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { TaskFiltersState } from '../utils/taskHelpers';

interface TaskActiveFiltersProps {
  filters: TaskFiltersState;
  searchTerm: string;
  activeCount: number;
  totalTasks: number;
  filteredCount: number;
}

export const TaskActiveFilters: React.FC<TaskActiveFiltersProps> = ({
  filters,
  searchTerm,
  activeCount,
  totalTasks,
  filteredCount
}) => {
  return (
    <div className="flex items-center justify-between pt-2 border-t">
      <div className="text-sm text-gray-600">
        Showing {filteredCount} of {totalTasks} tasks
      </div>
      {activeCount > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          <div className="flex flex-wrap gap-1">
            {searchTerm && (
              <Badge variant="secondary" className="text-xs">
                Search: {searchTerm}
              </Badge>
            )}
            {filters.status?.map(status => (
              <Badge key={status} variant="secondary" className="text-xs">
                Status: {status}
              </Badge>
            ))}
            {filters.type?.map(type => (
              <Badge key={type} variant="secondary" className="text-xs">
                Type: {type}
              </Badge>
            ))}
            {filters.applications?.map(app => (
              <Badge key={app} variant="secondary" className="text-xs">
                App: {app}
              </Badge>
            ))}
            {filters.slaStatus && (
              <Badge variant="secondary" className="text-xs">
                SLA: {filters.slaStatus}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
