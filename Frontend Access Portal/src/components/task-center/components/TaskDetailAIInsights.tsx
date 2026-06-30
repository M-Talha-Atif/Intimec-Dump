
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Brain, Zap } from 'lucide-react';
import { Task } from '../types';

interface TaskDetailAIInsightsProps {
  task: Task;
  aiInsights: {
    failureReason: string;
    resolutionTip: string;
    retryPreview: string;
  };
  onRetry: () => void;
}

export const TaskDetailAIInsights: React.FC<TaskDetailAIInsightsProps> = ({
  task,
  aiInsights,
  onRetry
}) => {
  if (task.status !== 'failed') {
    return (
      <div className="text-center text-gray-500">
        <Brain className="h-8 w-8 mx-auto mb-2" />
        <p>AI insights are available for failed tasks</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center">
            <Brain className="h-4 w-4 mr-2 text-orange-600" />
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-semibold text-orange-800">Why did this task fail?</Label>
              <p className="text-sm text-gray-700 mt-1">{aiInsights.failureReason}</p>
            </div>
            <div>
              <Label className="text-xs font-semibold text-orange-800">Resolution Tip</Label>
              <p className="text-sm text-gray-700 mt-1">{aiInsights.resolutionTip}</p>
            </div>
            <div>
              <Label className="text-xs font-semibold text-orange-800">Retry Preview</Label>
              <p className="text-sm text-gray-700 mt-1">{aiInsights.retryPreview}</p>
              <Button size="sm" className="mt-2" onClick={onRetry}>
                <Zap className="h-4 w-4 mr-1" />
                Retry Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
