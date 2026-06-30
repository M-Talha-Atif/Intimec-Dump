'use client';

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Eye, BarChart3, FileText, Settings,
  Play, Pause, Users, Calendar, Shield
} from "lucide-react";
import { useParams } from "next/navigation";
import { ReviewInterface } from "@/components/access-review/ReviewInterface";
import { AuditLogs } from "@/components/access-review/AuditLogs";
import { CampaignAnalytics } from "@/components/access-review/reporting/CampaignAnalytics";
import PageHeader from "@/components/shared/PageHeader";
import IconTabs from "@/components/shared/IconTabs";
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
const mockCampaign = {
  id: "camp-001",
  name: "Q4 2024 User Access Certification",
  type: "user-based",
  status: "active",
  progress: 85,
  totalItems: 1250,
  completedItems: 1063,
  riskLevel: "medium",
  dueDate: "2024-12-31",
  reviewer: "Sarah Johnson",
  complianceFramework: ["SOX", "GDPR"],
  createdDate: "2024-11-01",
  description: "Quarterly user access review for all active employees"
};

const campaignTabs = [
  { value: 'overview', label: 'Overview', icon: Eye },
  { value: 'review', label: 'Review', icon: Users },
  { value: 'analytics', label: 'Analytics', icon: BarChart3 },
  { value: 'audit', label: 'Audit Trail', icon: FileText },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'paused': return 'bg-yellow-100 text-yellow-800';
    case 'completed': return 'bg-blue-100 text-blue-800';
    case 'draft': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getRiskBadgeVariant = (risk: string) => {
  switch (risk) {
    case 'critical': case 'high': return 'destructive' as const;
    case 'medium': return 'secondary' as const;
    case 'low': return 'default' as const;
    default: return 'outline' as const;
  }
};

const CampaignDetailPage = () => {
  useDocumentTitle('Campaign Detail');
  const params = useParams<{ campaignId: string }>();
  const campaignId = params?.campaignId;
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 sm:p-6 lg:p-8 space-y-4">
        <PageHeader
          title={mockCampaign.name}
          description={mockCampaign.description}
          icon={<Shield className="h-6 w-6 text-primary" />}
          actions={
            <>
              {mockCampaign.status === 'active' && (
                <Button variant="outline" size="sm">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Campaign
                </Button>
              )}
              {mockCampaign.status === 'paused' && (
                <Button size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Resume Campaign
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </>
          }
        />

        {/* Status Badges & Metadata */}
        <div className="flex items-center gap-3 flex-wrap">
          <Badge className={getStatusColor(mockCampaign.status)}>
            {mockCampaign.status.toUpperCase()}
          </Badge>
          <Badge variant={getRiskBadgeVariant(mockCampaign.riskLevel)}>
            {mockCampaign.riskLevel.toUpperCase()} RISK
          </Badge>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Reviewer:</span>
            <span className="font-medium">{mockCampaign.reviewer}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Due:</span>
            <span className="font-medium">{new Date(mockCampaign.dueDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Type:</span>
            <span className="font-medium capitalize">{mockCampaign.type.replace('-', ' ')}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Campaign Progress</span>
                <span>{mockCampaign.completedItems}/{mockCampaign.totalItems} items ({mockCampaign.progress}%)</span>
              </div>
              <Progress value={mockCampaign.progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="review" className="h-full flex flex-col">
          <div className="px-4 sm:px-6 lg:px-8">
            <IconTabs tabs={campaignTabs} columns={4} />
          </div>

          <div className="flex-1 overflow-auto">
            <TabsContent value="overview" className="h-full m-0 p-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Campaign Overview</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Campaign Type</p>
                        <p className="font-medium capitalize">{mockCampaign.type.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created Date</p>
                        <p className="font-medium">{new Date(mockCampaign.createdDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Items</p>
                        <p className="font-medium">{mockCampaign.totalItems}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Completed Items</p>
                        <p className="font-medium">{mockCampaign.completedItems}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Compliance Frameworks</p>
                      <div className="flex gap-2">
                        {mockCampaign.complianceFramework.map((framework) => (
                          <Badge key={framework} variant="outline">{framework}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Description</p>
                      <p>{mockCampaign.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="review" className="h-full m-0 p-6">
              <ReviewInterface campaignId={campaignId || null} />
            </TabsContent>

            <TabsContent value="analytics" className="h-full m-0 p-6">
              <CampaignAnalytics campaignId={campaignId || ''} />
            </TabsContent>

            <TabsContent value="audit" className="h-full m-0 p-6">
              <AuditLogs />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default CampaignDetailPage;

