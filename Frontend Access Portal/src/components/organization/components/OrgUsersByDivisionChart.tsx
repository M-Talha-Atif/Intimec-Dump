import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { OrgAnalytics } from '../utils/orgAnalyticsUtils';

interface OrgUsersByDivisionChartProps {
  usersByDivision: OrgAnalytics['usersByDivision'];
}

export function OrgUsersByDivisionChart({ usersByDivision }: OrgUsersByDivisionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users by Division</CardTitle>
        <CardDescription>User count across major divisions</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={usersByDivision}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="users" fill="hsl(var(--primary))" name="Users" />
            <Bar dataKey="roles" fill="hsl(var(--secondary))" name="Roles" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
