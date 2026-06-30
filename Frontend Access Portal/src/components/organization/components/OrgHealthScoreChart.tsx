import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { OrgAnalytics } from '../utils/orgAnalyticsUtils';

interface OrgHealthScoreChartProps {
  healthBuckets: OrgAnalytics['healthBuckets'];
}

export function OrgHealthScoreChart({ healthBuckets }: OrgHealthScoreChartProps) {
  const healthData = Object.entries(healthBuckets).map(([name, value]) => ({
    name,
    count: value,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Score Distribution</CardTitle>
        <CardDescription>Organization health across units</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={healthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
