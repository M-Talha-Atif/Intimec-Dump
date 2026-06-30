'use client';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, BarChart3, Settings, Shield, ClipboardCheck, FileText, Building } from "lucide-react";
import { CampaignList } from "@/components/access-review/CampaignList";
import { MyReviewsTab } from "@/components/access-review/MyReviewsTab";
import { AuditLogs } from "@/components/access-review/AuditLogs";
import { AccessReviewAnalyticsDashboard } from "@/components/access-review/AccessReviewAnalyticsDashboard";
import { AccessReviewReports } from "@/components/access-review/AccessReviewReports";
import { NewCampaignModal } from "@/components/access-review/modals/NewCampaignModal";
import { useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import StandardTabs from "@/components/shared/StandardTabs";
import IconTabs from "@/components/shared/IconTabs";

const AccessReviewPage = () => {
  useDocumentTitle('Access Review');
  const router = useRouter();
  const [primaryTab, setPrimaryTab] = useState("analytics");
  const [opsTab, setOpsTab] = useState("campaigns");
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const handleCampaignSelect = (campaignId: string) => {
    router.push(`/access-review/campaign/${campaignId}`);
  };

  const handleCampaignCreate = (campaign: any) => {
    setCampaigns(prev => [...prev, campaign]);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-background">
      <div>
        <PageHeader
          title="Access Review & Certification"
          description="Certification governance intelligence and operational management"
          icon={<Shield className="h-5 w-5 text-primary" />}
          tooltip="Centralized certification governance hub. Analytics provides intelligence and oversight. Operations enables campaign execution, review workflows, and audit evidence management."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <NewCampaignModal onCampaignCreate={handleCampaignCreate} />
            </div>
          }
        />


      </div>

      <div >
        <Tabs value={primaryTab} onValueChange={setPrimaryTab}>
          <StandardTabs
            tabs={[
              { value: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
              { value: "operations", label: "Operations", icon: <Settings className="h-4 w-4" /> },
            ]}
          />
        </Tabs>
      </div>

      <div className="flex-1 overflow-hidden">
        {primaryTab === "analytics" && (
          <div className="h-full overflow-auto">
            <AccessReviewAnalyticsDashboard />
          </div>
        )}

        {primaryTab === "operations" && (
          <div className="h-full flex flex-col">
            <div className=" bg-background">
              <Tabs value={opsTab} onValueChange={setOpsTab}>
                <IconTabs
                  tabs={[
                    { value: "campaigns", label: "Campaigns", icon: Shield },
                    { value: "my-reviews", label: "My Reviews", icon: ClipboardCheck },
                    { value: "reports", label: "Reports", icon: FileText },
                    { value: "audit", label: "Audit", icon: Building },
                  ]}
                  columns={4}
                />
              </Tabs>
            </div>
            <div className="flex-1 overflow-auto pt-4">
              {opsTab === "campaigns" && <CampaignList onCampaignSelect={handleCampaignSelect} />}
              {opsTab === "my-reviews" && <MyReviewsTab />}
              {opsTab === "reports" && <AccessReviewReports />}
              {opsTab === "audit" && <AuditLogs />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessReviewPage;