import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { OrgAnalytics } from '../utils/orgAnalyticsUtils';

interface OrgRiskDistributionChartProps {
  riskDistribution: OrgAnalytics['riskDistribution'];
}

export function OrgRiskDistributionChart({ riskDistribution }: OrgRiskDistributionChartProps) {
  const riskData = [
    { name: 'Low', value: riskDistribution.Low, fill: '#22c55e' },
    { name: 'Medium', value: riskDistribution.Medium, fill: '#f59e0b' },
    { name: 'High', value: riskDistribution.High, fill: '#ef4444' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Distribution</CardTitle>
        <CardDescription>Organization units by risk level</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={riskData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={100}
              dataKey="value"
            >
              {riskData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
