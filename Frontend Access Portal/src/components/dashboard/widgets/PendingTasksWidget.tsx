import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { TaskMetrics } from '@/services/mockDashboardData';

interface PendingTasksWidgetProps {
  data: TaskMetrics;
  onViewDetails: () => void;
}

export const PendingTasksWidget: React.FC<PendingTasksWidgetProps> = ({ data, onViewDetails }) => {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Tasks
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onViewDetails}>
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-3xl font-bold text-yellow-700">{data.pending}</div>
            <div className="text-sm text-yellow-600 mt-1">Pending</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-3xl font-bold text-red-700">{data.overdue}</div>
            <div className="text-sm text-red-600 mt-1">Overdue</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Running</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">{data.running}</Badge>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Completed</span>
            <Badge variant="outline" className="bg-green-50 text-green-700">{data.completed}</Badge>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Failed</span>
            <Badge variant="outline" className="bg-red-50 text-red-700">{data.failed}</Badge>
          </div>
        </div>

        {data.bySLA.warning > 0 && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-700">
              {data.bySLA.warning} tasks near SLA breach
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
