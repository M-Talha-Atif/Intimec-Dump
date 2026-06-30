
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Bot,
  Plus,
  Settings,
  RefreshCw,
  Activity,
  BarChart3,
  UserCheck,
  Shield,
  ClipboardCheck,
  BookOpen,
  Database
} from 'lucide-react';
import { IdentityCenter } from './IdentityCenter';
import { Directory } from './Directory';
import { LifecycleManagement } from './LifecycleManagement';
import { OwnershipManagement } from './OwnershipManagement';
import { AccessRiskManagement } from './AccessRiskManagement';
import { ReviewsManagement } from './ReviewsManagement';
import { OnboardingWizard } from './OnboardingWizard';
import StandardTabs from "@/components/shared/StandardTabs";
import PageHeader from "@/components/shared/PageHeader";
import IconTabs from "@/components/shared/IconTabs";

const analyticsTabs = [
  { value: "identity-center", label: "Identity Center", icon: Activity },
  { value: "lifecycle", label: "Lifecycle", icon: BarChart3 },
  { value: "owners", label: "Owners", icon: UserCheck },
  { value: "access-risk", label: "Access & Risk", icon: Shield },
  { value: "reviews", label: "Reviews", icon: ClipboardCheck },
];

export default function NonHumanIdentitiesContent() {
  const [primaryTab, setPrimaryTab] = useState('analytics');
  const [analyticsSubTab, setAnalyticsSubTab] = useState('identity-center');
  const [showOnboardingDialog, setShowOnboardingDialog] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Non-Human Identities"
        description="Comprehensive lifecycle management for service accounts, API keys, and machine identities"
        icon={<Bot className="h-6 w-6 text-primary" />}
        actions={
          <>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configure Policies
            </Button>

            <Button variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Sync Providers
            </Button>

            <Button onClick={() => setShowOnboardingDialog(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add NHI
            </Button>
          </>
        }
      />

      {/* Primary Tabs: Analytics + Directory */}
      <Tabs value={primaryTab} onValueChange={setPrimaryTab} className="space-y-6">
        <StandardTabs
          value={primaryTab}
          onValueChange={setPrimaryTab}
          tabs={[
            {
              value: "analytics",
              label: "Analytics",
              icon: <BarChart3 className="h-4 w-4" />,
            },
            {
              value: "directory",
              label: "Directory",
              icon: <BookOpen className="h-4 w-4" />,
            },
          ]}
        />

        <TabsContent value="analytics" className="space-y-6">
          {/* Sub-tabs */}
          <Tabs value={analyticsSubTab} onValueChange={setAnalyticsSubTab} className="space-y-6">
            <IconTabs
              tabs={analyticsTabs}
              columns={5}
            />

            <TabsContent value="identity-center"><IdentityCenter /></TabsContent>
            <TabsContent value="lifecycle"><LifecycleManagement /></TabsContent>
            <TabsContent value="owners"><OwnershipManagement /></TabsContent>
            <TabsContent value="access-risk"><AccessRiskManagement /></TabsContent>
            <TabsContent value="reviews"><ReviewsManagement /></TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="directory">
          <Directory />
        </TabsContent>
      </Tabs>

      {/* Onboarding Dialog */}
      <Dialog open={showOnboardingDialog} onOpenChange={setShowOnboardingDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-orange-500" />
              Add Non-Human Identity
            </DialogTitle>
          </DialogHeader>
          <OnboardingWizard />
        </DialogContent>
      </Dialog>
    </div>
  );
}
