
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { parseCronExpression, formatNextRun } from '@/lib/utils/cron-utils';

interface NextRunPreviewProps {
  cronExpression: string;
  timezone: string;
}

export const NextRunPreview: React.FC<NextRunPreviewProps> = ({
  cronExpression,
  timezone
}) => {
  const parseResult = parseCronExpression(cronExpression);

  if (!cronExpression.trim()) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-sm">
          <Clock className="h-4 w-4" />
          <span>Next Run Preview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!parseResult.isValid ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Invalid CRON Expression:</strong> {parseResult.error}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Valid CRON Expression</span>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Next 5 Scheduled Runs:</h4>
              <div className="space-y-1">
                {parseResult.nextRuns?.map((date, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <span className="font-mono">{formatNextRun(date, timezone)}</span>
                    <Badge variant="outline" className="text-xs">
                      Run #{index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
