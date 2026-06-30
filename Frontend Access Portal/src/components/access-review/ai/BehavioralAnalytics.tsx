import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, AlertCircle } from 'lucide-react';
import type { AccessAnalytics } from '@/types/accessReview';

interface BehavioralAnalyticsProps {
  analytics: AccessAnalytics;
}

export const BehavioralAnalytics: React.FC<BehavioralAnalyticsProps> = ({ analytics }) => {
  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'bg-green-100 text-green-700';
      case 'weekly': return 'bg-blue-100 text-blue-700';
      case 'monthly': return 'bg-amber-100 text-amber-700';
      case 'rarely': return 'bg-orange-100 text-orange-700';
      case 'never': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAnomalyLevel = (score: number) => {
    if (score < 20) return { label: 'Normal', color: 'text-green-600' };
    if (score < 50) return { label: 'Minor Anomalies', color: 'text-blue-600' };
    if (score < 80) return { label: 'Moderate Anomalies', color: 'text-amber-600' };
    return { label: 'High Anomalies', color: 'text-red-600' };
  };

  const anomalyLevel = getAnomalyLevel(analytics.anomalyScore);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Behavioral Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-muted/50">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Last Login</p>
              <p className="text-sm font-medium">{new Date(analytics.lastLogin).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Login Frequency</p>
              <Badge className={getFrequencyColor(analytics.loginFrequency)} variant="secondary">
                {analytics.loginFrequency}
              </Badge>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Avg Session</p>
              <p className="text-sm font-medium">{analytics.averageSessionDuration}h</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Total Sessions</p>
              <p className="text-sm font-medium">{analytics.totalSessions}</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Usage Pattern (Last 5 Days)</p>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={analytics.usagePattern}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="loginCount" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <Card className={analytics.anomalyScore > 50 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}>
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              {analytics.anomalyScore > 50 ? (
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              ) : (
                <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-medium ${anomalyLevel.color}`}>
                  Anomaly Score: {analytics.anomalyScore}/100 - {anomalyLevel.label}
                </p>
                <p className={`text-xs mt-1 ${analytics.anomalyScore > 50 ? 'text-amber-700' : 'text-green-700'}`}>
                  {analytics.anomalyScore > 50 
                    ? 'Unusual activity patterns detected. Review recommended.' 
                    : 'Behavior patterns are consistent with normal usage.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {analytics.unusedEntitlements.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Unused Entitlements</p>
            <div className="space-y-1">
              {analytics.unusedEntitlements.map((entitlement, index) => (
                <Card key={index} className="bg-red-50 border-red-200">
                  <CardContent className="p-2">
                    <p className="text-xs text-red-700">{entitlement} - No usage detected</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
