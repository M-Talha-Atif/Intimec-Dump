import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, TrendingDown } from 'lucide-react';
import { analyticsService } from '@/services/accessReviewService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import InfoTooltip from '@/components/dashboard/InfoTooltip';

const campaignEffectivenessData = [
  { name: "Q4 User Access", riskBefore: 78, riskAfter: 42, reduction: 46 },
  { name: "SOX Critical", riskBefore: 92, riskAfter: 35, reduction: 62 },
  { name: "Privileged Audit", riskBefore: 85, riskAfter: 55, reduction: 35 },
  { name: "SoD Resolution", riskBefore: 70, riskAfter: 38, reduction: 46 },
];

const reviewerPerformanceData = [
  { name: "S. Johnson", completed: 245, avgTime: 4.2, accuracy: 94 },
  { name: "M. Chen", completed: 189, avgTime: 5.8, accuracy: 91 },
  { name: "L. Rodriguez", completed: 167, avgTime: 3.5, accuracy: 97 },
  { name: "D. Kim", completed: 134, avgTime: 6.1, accuracy: 88 },
];

export const ExecutiveDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    analyticsService.getExecutiveMetrics().then(setMetrics);
  }, []);

  if (!metrics) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading executive metrics...</div>;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Total Campaigns
              <InfoTooltip text="Total number of certification campaigns created since platform inception." />
            </p>
            <p className="text-3xl font-bold">{metrics.totalCampaigns}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Risk Reduction
              <InfoTooltip text="Overall percentage decrease in organizational access risk achieved through certification campaigns." />
            </p>
            <p className="text-3xl font-bold text-green-600">{metrics.riskReduction}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Compliance Score
              <InfoTooltip text="Weighted compliance score across all active regulatory frameworks (SOX, GDPR, HIPAA, ISO 27001)." />
            </p>
            <p className="text-3xl font-bold text-primary">{metrics.complianceScore}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Total Reviews
              <InfoTooltip text="Cumulative number of individual access entitlements reviewed across all campaigns." />
            </p>
            <p className="text-3xl font-bold">{metrics.totalReviews}</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-1.5">
            Risk Trends
            <InfoTooltip text="Historical trend of total organizational access risk score. Downward trend indicates effective governance." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.riskTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="totalRisk" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Campaign Effectiveness + Reviewer Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-1.5">
              <TrendingDown className="h-4 w-4" />
              Campaign Effectiveness
              <InfoTooltip text="Risk score before and after each campaign. Larger gaps indicate more effective remediation outcomes." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={campaignEffectivenessData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="riskBefore" fill="hsl(var(--destructive))" name="Risk Before" radius={[4, 4, 0, 0]} />
                <Bar dataKey="riskAfter" fill="hsl(var(--primary))" name="Risk After" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Award className="h-4 w-4" />
              Reviewer Performance
              <InfoTooltip text="Comparative performance metrics for reviewers including throughput, speed, and decision accuracy." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reviewerPerformanceData.map((reviewer) => (
                <div key={reviewer.name} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{reviewer.name}</p>
                    <p className="text-xs text-muted-foreground">{reviewer.completed} reviews • {reviewer.avgTime}m avg</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <Badge variant={reviewer.accuracy >= 95 ? "default" : reviewer.accuracy >= 90 ? "secondary" : "outline"}>
                      {reviewer.accuracy}% accuracy
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Reviewers from API */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-1.5">
            <Award className="h-4 w-4" />
            Top Reviewers
            <InfoTooltip text="Reviewers ranked by overall contribution including volume, speed, and accuracy of decisions." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.topReviewers.map((reviewer: any) => (
              <div key={reviewer.reviewerId} className="flex justify-between items-center p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">{reviewer.reviewerName}</p>
                  <p className="text-xs text-muted-foreground">{reviewer.reviewsCompleted} reviews • {reviewer.avgDecisionTime}m avg</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{reviewer.accuracyScore}%</p>
                  <p className="text-xs text-muted-foreground">accuracy</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
