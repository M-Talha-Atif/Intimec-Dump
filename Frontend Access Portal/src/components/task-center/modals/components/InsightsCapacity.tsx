import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Clock } from 'lucide-react';
import { peakHours } from '../data/taskInsightsData';

export const InsightsCapacity: React.FC = () => {
  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Peak Hours Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {peakHours.map((period, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">{period.hour}</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{period.taskCount} tasks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{period.avgDuration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Capacity Planning Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-900 mb-1">Current Capacity: Healthy</p>
            <p className="text-sm text-green-700">
              System is operating at 45% capacity. Can handle 2.2x current load.
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">Peak Load Projection</p>
            <p className="text-sm text-blue-700">
              Based on trends, expect peak of 120 concurrent tasks during month-end processing.
            </p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <p className="text-sm font-medium text-orange-900 mb-1">Recommendation</p>
            <p className="text-sm text-orange-700">
              Consider adding task prioritization for critical provisioning operations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
