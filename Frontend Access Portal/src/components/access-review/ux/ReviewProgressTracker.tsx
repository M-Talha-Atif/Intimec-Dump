import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, TrendingUp } from 'lucide-react';

interface ReviewProgressTrackerProps {
  totalItems: number;
  completedItems: number;
  sessionStart?: Date;
}

export const ReviewProgressTracker: React.FC<ReviewProgressTrackerProps> = ({
  totalItems,
  completedItems,
  sessionStart = new Date()
}) => {
  const remaining = totalItems - completedItems;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  
  const sessionDuration = Math.floor((Date.now() - sessionStart.getTime()) / 1000 / 60);
  const avgTimePerItem = completedItems > 0 ? sessionDuration / completedItems : 0;
  const estimatedTimeRemaining = Math.ceil(remaining * avgTimePerItem);

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Review Progress</p>
                <p className="text-xs text-muted-foreground">
                  {completedItems} of {totalItems} completed • {remaining} remaining
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</p>
            </div>
          </div>

          <Progress value={progress} className="h-3" />

          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-white/50">
              <CardContent className="p-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Session Time</p>
                    <p className="text-sm font-medium">{sessionDuration}m</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/50">
              <CardContent className="p-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Est. Remaining</p>
                    <p className="text-sm font-medium">{estimatedTimeRemaining}m</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {avgTimePerItem > 0 && (
            <p className="text-xs text-center text-muted-foreground">
              Average: {avgTimePerItem.toFixed(1)} min per review
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
