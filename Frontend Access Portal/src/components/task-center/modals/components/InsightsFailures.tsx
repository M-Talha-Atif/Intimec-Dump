import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from 'lucide-react';
import { failurePatterns } from '../data/taskInsightsData';

export const InsightsFailures: React.FC = () => {
  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Common Failure Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {failurePatterns.map((pattern, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">{pattern.pattern}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-background rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${pattern.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{pattern.count}</span>
                  <Badge variant="outline">{pattern.percentage}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Failure Resolution Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-1">Connection Timeout</p>
              <p className="text-sm text-blue-700">
                Increase timeout threshold to 60 seconds or schedule tasks during off-peak hours
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-sm font-medium text-orange-900 mb-1">Authentication Failed</p>
              <p className="text-sm text-orange-700">
                Review and rotate API credentials for affected applications
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-purple-900 mb-1">Rate Limit Exceeded</p>
              <p className="text-sm text-purple-700">
                Implement exponential backoff and distribute task execution across time windows
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
