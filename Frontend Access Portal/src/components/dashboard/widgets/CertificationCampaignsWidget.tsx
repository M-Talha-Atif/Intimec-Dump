import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Clock, ExternalLink } from 'lucide-react';
import { CertificationMetrics } from '@/services/mockDashboardData';

interface CertificationCampaignsWidgetProps {
  data: CertificationMetrics;
  onClick?: () => void;
}

export const CertificationCampaignsWidget: React.FC<CertificationCampaignsWidgetProps> = ({ 
  data, 
  onClick 
}) => {
  return (
    <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Certification Campaigns
        </CardTitle>
        <Button variant="ghost" size="sm">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{data.activeCampaigns}</div>
              <div className="text-xs text-blue-600 mt-1">Active</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">{data.completionRate}%</div>
              <div className="text-xs text-green-600 mt-1">Completed</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{data.completionRate}%</span>
            </div>
            <Progress value={data.completionRate} className="h-3" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm p-2 bg-yellow-50 border border-yellow-200 rounded">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                Items Pending
              </span>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                {data.itemsPending}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-sm p-2 bg-red-50 border border-red-200 rounded">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-600" />
                Overdue Reviews
              </span>
              <Badge variant="outline" className="bg-red-100 text-red-700">
                {data.overdueReviews}
              </Badge>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground">Recent Campaigns</div>
            <div className="mt-2 space-y-1">
              {data.campaigns.slice(0, 2).map((campaign) => (
                <div key={campaign.id} className="text-xs flex justify-between items-center">
                  <span className="truncate">{campaign.name}</span>
                  <Badge variant="outline" className="text-xs">{campaign.progress}%</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
