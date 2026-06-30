import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, XCircle, ExternalLink } from 'lucide-react';
import { SLAMetrics } from '@/services/mockDashboardData';

interface SLAMonitorWidgetProps {
  data: SLAMetrics;
  onClick?: () => void;
}

export const SLAMonitorWidget: React.FC<SLAMonitorWidgetProps> = ({ data, onClick }) => {
  const total = data.onTime + data.nearBreach + data.breached;
  const onTimePercent = Math.round((data.onTime / total) * 100);

  return (
    <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          SLA Monitor
        </CardTitle>
        <Button variant="ghost" size="sm">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600">{onTimePercent}%</div>
            <div className="text-sm text-muted-foreground mt-1">On-Time Completion</div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  On Time
                </span>
                <span className="font-medium">{data.onTime}</span>
              </div>
              <Progress value={(data.onTime / total) * 100} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-yellow-600" />
                  Near Breach
                </span>
                <span className="font-medium">{data.nearBreach}</span>
              </div>
              <Progress value={(data.nearBreach / total) * 100} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-red-600" />
                  Breached
                </span>
                <span className="font-medium">{data.breached}</span>
              </div>
              <Progress value={(data.breached / total) * 100} className="h-2" />
            </div>
          </div>

          <div className="pt-3 border-t">
            <div className="text-sm text-muted-foreground">Avg Completion Time</div>
            <div className="text-2xl font-bold">{data.avgCompletionTime}h</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
