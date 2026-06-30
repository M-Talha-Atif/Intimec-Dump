import { useMemo } from 'react';
import { OrgNodeData } from '@/types/organization';
import { computeAnalytics } from './utils/orgAnalyticsUtils';
import { OrgKpiCards } from './components/OrgKpiCards';
import { OrgRiskDistributionChart } from './components/OrgRiskDistributionChart';
import { OrgComplianceChart } from './components/OrgComplianceChart';
import { OrgUsersByDivisionChart } from './components/OrgUsersByDivisionChart';
import { OrgHealthScoreChart } from './components/OrgHealthScoreChart';

interface OrgAnalyticsDashboardProps {
  data: OrgNodeData;
}

export function OrgAnalyticsDashboard({ data }: OrgAnalyticsDashboardProps) {
  const analytics = useMemo(() => computeAnalytics(data), [data]);

  return (
    <div className="space-y-6">
      <OrgKpiCards analytics={analytics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrgRiskDistributionChart riskDistribution={analytics.riskDistribution} />
        <OrgComplianceChart complianceDistribution={analytics.complianceDistribution} />
        <OrgUsersByDivisionChart usersByDivision={analytics.usersByDivision} />
        <OrgHealthScoreChart healthBuckets={analytics.healthBuckets} />
      </div>
    </div>
  );
}
