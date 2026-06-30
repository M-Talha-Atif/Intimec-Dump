
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, BarChart3, RefreshCw, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaskCenterHeaderProps {
  scheduledTasksCount: number;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  setShowInsightsModal: (show: boolean) => void;
  setShowSettingsModal: (show: boolean) => void;
}

export const TaskCenterHeader: React.FC<TaskCenterHeaderProps> = ({
  scheduledTasksCount,
  showFilters,
  setShowFilters,
  setShowInsightsModal,
  setShowSettingsModal
}) => {
  const { toast } = useToast();

  return (
    <div className="flex items-center justify-between pt-4">
      <div className="flex items-center space-x-4">
        <Badge variant="outline" className="text-sm">
          {scheduledTasksCount} scheduled task{scheduledTasksCount !== 1 ? 's' : ''}
        </Badge>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowInsightsModal(true)}>
            <BarChart3 className="h-4 w-4 mr-1" />
            Insights
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Refreshing tasks...", description: "Task list updated" })}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSettingsModal(true)}>
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
};
