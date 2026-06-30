
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, XCircle, AlertTriangle, RefreshCw, Filter } from 'lucide-react';

interface TaskMetricsGridProps {
  metrics: {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    runningTasks: number;
    pendingTasks: number;
    overdueCount: number;
    failureRate: string;
  };
}

export const TaskMetricsGrid: React.FC<TaskMetricsGridProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tasks Today</p>
              <p className="text-2xl font-bold">{metrics.totalTasks}</p>
              <p className="text-xs text-muted-foreground">0 this week</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Duration</p>
              <p className="text-2xl font-bold">0m</p>
              <p className="text-xs text-muted-foreground">0 completed tasks</p>
            </div>
            <Clock className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Failure Rate</p>
              <p className="text-2xl font-bold">{metrics.failureRate}%</p>
              <p className="text-xs text-muted-foreground">{metrics.failedTasks} failed tasks</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">SLA Breaches</p>
              <p className="text-2xl font-bold">{metrics.overdueCount}</p>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Retry Count</p>
              <p className="text-2xl font-bold">0.7</p>
              <p className="text-xs text-muted-foreground">Per task execution</p>
            </div>
            <RefreshCw className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div>
              <p className="text-sm text-muted-foreground">Quick Remediation</p>
              <div className="space-y-1 mt-2">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  Failed Tasks (24h)
                </Button>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Bulk Retry SLA
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
