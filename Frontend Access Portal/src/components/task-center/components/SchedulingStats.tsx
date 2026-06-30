
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CheckCircle, Pause, Play } from 'lucide-react';
import { ScheduledTask } from '../utils/schedulingUtils';

interface SchedulingStatsProps {
  tasks: ScheduledTask[];
}

export const SchedulingStats: React.FC<SchedulingStatsProps> = ({ tasks }) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Schedules</p>
              <p className="text-2xl font-bold">{tasks.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">
                {tasks.filter(t => t.enabled).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Disabled</p>
              <p className="text-2xl font-bold">
                {tasks.filter(t => !t.enabled).length}
              </p>
            </div>
            <Pause className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Runs</p>
              <p className="text-2xl font-bold">
                {tasks.reduce((sum, t) => sum + t.runCount, 0)}
              </p>
            </div>
            <Play className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
