import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccessRequest } from '@/data/mock-access-portal';
import { Shield, TrendingUp, Calendar, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PersonalAccessInsightsProps {
  requests: AccessRequest[];
}

const PersonalAccessInsights: React.FC<PersonalAccessInsightsProps> = ({ requests }) => {
  const activeAccess = requests.filter(r => r.status === 'approved' || r.status === 'provisioned').length;
  const totalRequests = requests.length;
  const avgRiskScore = Math.round(requests.reduce((acc, r) => acc + r.riskScore, 0) / requests.length);

  const accessGrowthData = [
    { month: 'Jan', access: 5 },
    { month: 'Feb', access: 7 },
    { month: 'Mar', access: 8 },
    { month: 'Apr', access: 10 },
    { month: 'May', access: 12 },
    { month: 'Jun', access: activeAccess },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Personal Access Insights</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Active Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAccess}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {new Set(requests.flatMap(r => r.items.filter(i => i.accessItem).map(i => i.accessItem.type))).size} types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {requests.filter(r => r.status === 'approved').length} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-500" />
              Avg Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRiskScore}</div>
            <Badge variant={avgRiskScore > 70 ? 'destructive' : 'secondary'} className="mt-1">
              {avgRiskScore > 70 ? 'High' : avgRiskScore > 40 ? 'Medium' : 'Low'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground mt-1">
              No violations
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Access Growth Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={accessGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="access" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalAccessInsights;
