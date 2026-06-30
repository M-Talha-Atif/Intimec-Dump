import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { OrgAnalytics } from '../utils/orgAnalyticsUtils';

interface OrgComplianceChartProps {
  complianceDistribution: OrgAnalytics['complianceDistribution'];
}

export function OrgComplianceChart({ complianceDistribution }: OrgComplianceChartProps) {
  const complianceData = [
    { name: 'Compliant', value: complianceDistribution.compliant, fill: '#22c55e' },
    { name: 'Warning', value: complianceDistribution.warning, fill: '#f59e0b' },
    { name: 'Non-Compliant', value: complianceDistribution['non-compliant'], fill: '#ef4444' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Status</CardTitle>
        <CardDescription>Organization units by compliance</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={complianceData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={100}
              dataKey="value"
            >
              {complianceData.map((entry, index) => (
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
