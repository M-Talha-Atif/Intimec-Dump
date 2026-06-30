import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { analyticsService } from '@/services/accessReviewService';
import { useCssVariable } from '@/hooks/useCssVariable';
interface CampaignAnalyticsProps {
  campaignId: string;
}

export const CampaignAnalytics: React.FC<CampaignAnalyticsProps> = ({ campaignId }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const primaryColor = useCssVariable('--primary'); 

  useEffect(() => {
    loadAnalytics();
  }, [campaignId]);

  const loadAnalytics = async () => {
    try {
      const data = await analyticsService.getCampaignAnalytics(campaignId);
      setAnalytics(data);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return <Card><CardContent className="p-8 text-center">Loading analytics...</CardContent></Card>;
  }

  const riskData = [
    { name: 'Low', value: analytics.riskDistribution.low, color: '#10b981' },
    { name: 'Medium', value: analytics.riskDistribution.medium, color: '#f59e0b' },
    { name: 'High', value: analytics.riskDistribution.high, color: '#ef4444' },
    { name: 'Critical', value: analytics.riskDistribution.critical, color: '#7c3aed' }
  ];

  const decisionData = [
    { name: 'Approve', value: analytics.decisionBreakdown.approve },
    { name: 'Revoke', value: analytics.decisionBreakdown.revoke },
    { name: 'Modify', value: analytics.decisionBreakdown.modify },
    { name: 'Exception', value: analytics.decisionBreakdown.exception }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{analytics.completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Decision Time</p>
                <p className="text-2xl font-bold">{analytics.avgDecisionTime}m</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">AI Acceptance</p>
                <p className="text-2xl font-bold">{analytics.aiAcceptanceRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">SoD Resolved</p>
                <p className="text-2xl font-bold">{analytics.sodViolationsResolved}</p>
              </div>
              <XCircle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {riskData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Decision Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={decisionData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={primaryColor} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
