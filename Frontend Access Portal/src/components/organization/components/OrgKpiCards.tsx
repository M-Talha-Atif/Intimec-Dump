import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrgAnalytics } from '../utils/orgAnalyticsUtils';
import { Users, AlertTriangle, Building2, CheckCircle } from 'lucide-react';

interface OrgKpiCardsProps {
  analytics: OrgAnalytics;
}

export function OrgKpiCards({ analytics }: OrgKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Units</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalUnits}</div>
          <p className="text-xs text-muted-foreground mt-1">Across all divisions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Avg {Math.round(analytics.avgUsersPerUnit)} per unit
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">High Risk Units</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{analytics.highRiskUnits}</div>
          <p className="text-xs text-muted-foreground mt-1">Require immediate attention</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round((analytics.complianceDistribution.compliant / analytics.totalUnits) * 100)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {analytics.complianceDistribution.compliant} of {analytics.totalUnits} compliant
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
