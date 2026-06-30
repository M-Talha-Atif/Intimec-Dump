import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Server, CheckCircle, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';
import { ApplicationHealthMetrics } from '@/services/mockDashboardData';

interface ApplicationHealthWidgetProps {
  data: ApplicationHealthMetrics;
  onClick?: () => void;
}

export const ApplicationHealthWidget: React.FC<ApplicationHealthWidgetProps> = ({ data, onClick }) => {
  const healthyPercent = Math.round((data.connected / data.totalApps) * 100);

  return (
    <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Application Health
        </CardTitle>
        <Button variant="ghost" size="sm">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-2xl font-bold">{data.totalApps}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{data.connected}</div>
              <div className="text-xs text-green-600">Healthy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{data.errors}</div>
              <div className="text-xs text-red-600">Errors</div>
            </div>
          </div>

          <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
            <div className="text-3xl font-bold text-green-700">{healthyPercent}%</div>
            <div className="text-sm text-green-600 mt-1">Health Score</div>
          </div>

          <div className="space-y-2">
            {Object.entries(data.syncStatus).slice(0, 3).map(([app, status]) => (
              <div key={app} className="flex items-center justify-between text-sm p-2 border rounded">
                <span className="font-medium truncate">{app}</span>
                {status.status === 'healthy' ? (
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                ) : status.status === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          {data.errors > 0 && (
            <Badge variant="destructive" className="w-full justify-center">
              {data.errors} apps need attention
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
