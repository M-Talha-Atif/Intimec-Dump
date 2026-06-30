import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { ComplianceMetrics } from '@/services/mockDashboardData';

interface ComplianceStatusWidgetProps {
  data: ComplianceMetrics;
  onClick?: () => void;
}

export const ComplianceStatusWidget: React.FC<ComplianceStatusWidgetProps> = ({ data, onClick }) => {
  const getTrendIcon = () => {
    return data.trend === 'up' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : data.trend === 'down' ? (
      <TrendingDown className="h-4 w-4 text-red-600" />
    ) : null;
  };

  return (
    <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Compliance Status
        </CardTitle>
        <Button variant="ghost" size="sm">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600">{data.overallScore}%</div>
            <div className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
              Overall Score {getTrendIcon()}
            </div>
          </div>

          <Progress value={data.overallScore} className="h-3" />

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-center">
              <div className="text-2xl font-bold text-red-700">{data.policyViolations.critical}</div>
              <div className="text-xs text-red-600 mt-1">Critical</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 text-center">
              <div className="text-2xl font-bold text-orange-700">{data.policyViolations.high}</div>
              <div className="text-xs text-orange-600 mt-1">High</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
              <div className="text-2xl font-bold text-yellow-700">{data.policyViolations.medium}</div>
              <div className="text-xs text-yellow-600 mt-1">Medium</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
              <div className="text-2xl font-bold text-blue-700">{data.policyViolations.low}</div>
              <div className="text-xs text-blue-600 mt-1">Low</div>
            </div>
          </div>

          <div className="flex justify-between text-sm pt-2 border-t">
            <span className="text-muted-foreground">Exceptions</span>
            <Badge variant="outline">{data.exceptions}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
