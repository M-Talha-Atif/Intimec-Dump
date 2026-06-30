import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from 'lucide-react';
import { weeklyVolumeData } from '../data/taskInsightsData';

export const InsightsTrends: React.FC = () => {
  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">7-Day Task Volume Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {weeklyVolumeData.map((height, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-primary rounded-t" style={{ height: `${height}%` }} />
                <span className="text-xs text-muted-foreground">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Success Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>This Week</span>
                <span className="font-medium">94.2%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Last Week</span>
                <span className="font-medium text-muted-foreground">91.8%</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">+2.4% improvement</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Avg Completion Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>This Week</span>
                <span className="font-medium">2.4m</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Last Week</span>
                <span className="font-medium text-muted-foreground">2.8m</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <TrendingDown className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">14% faster</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
