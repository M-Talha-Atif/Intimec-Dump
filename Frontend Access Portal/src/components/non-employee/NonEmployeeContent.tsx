import React, { useState } from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  UserCheck,
  Plus,
  Settings,
  Activity,
  BarChart3,
  Shield,
  ClipboardCheck,
  Database,
  BookOpen,
  LayoutDashboard
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StandardTabs from '@/components/shared/StandardTabs';
import IconTabs from '@/components/shared/IconTabs';
import { NonEmployeeDirectory } from './NonEmployeeDirectory';
import { LifecycleManagement } from './LifecycleManagement';
import { SponsorGovernance } from './SponsorGovernance';
import { AccessRiskManagement } from './AccessRiskManagement';
import { IdentityCenter } from './IdentityCenter';
import { OnboardingWizard } from './OnboardingWizard';
import { AccessReviews } from './AccessReviews';

export default function NonEmployeeContent() {
  const [primaryTab, setPrimaryTab] = useState('analytics');
  const [analyticsSubTab, setAnalyticsSubTab] = useState('identity-center');
  const [showOnboardingDialog, setShowOnboardingDialog] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Non-Employee Identities"
        description="Comprehensive lifecycle management for external identities"
        icon={<UserCheck className="h-5 w-5 text-primary" />}
        tooltip="Manage non-employee identities including contractors, vendors, and partners. Analytics provides identity health, lifecycle status, sponsor governance, access risk, and review intelligence. Directory lists all onboarded non-employees."
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Configure Types</span>
            </Button>
            <Button onClick={() => setShowOnboardingDialog(true)} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Non-Employee</span>
            </Button>
          </div>
        }
      />

      <Tabs value={primaryTab} onValueChange={setPrimaryTab} className="space-y-6">
        <StandardTabs
          tabs={[
            { value: "analytics", label: "Analytics", icon: <LayoutDashboard className="h-4 w-4" /> },
            { value: "directory", label: "Directory", icon: <BookOpen className="h-4 w-4" /> },
          ]}
          value={primaryTab}
          onValueChange={setPrimaryTab}
        />

        <TabsContent value="analytics" className="space-y-6">
          <Tabs value={analyticsSubTab} onValueChange={setAnalyticsSubTab} className="space-y-6">
            <IconTabs
              tabs={[
                { value: "identity-center", label: "Identity Center", icon: Activity },
                { value: "lifecycle", label: "Lifecycle", icon: BarChart3 },
                { value: "sponsors", label: "Sponsors", icon: UserCheck },
                { value: "access-risk", label: "Access & Risk", icon: Shield },
                { value: "reviews", label: "Reviews", icon: ClipboardCheck },
              ]}
              columns={5}
            />

            <TabsContent value="identity-center"><IdentityCenter /></TabsContent>
            <TabsContent value="lifecycle"><LifecycleManagement /></TabsContent>
            <TabsContent value="sponsors"><SponsorGovernance /></TabsContent>
            <TabsContent value="access-risk"><AccessRiskManagement /></TabsContent>
            <TabsContent value="reviews"><AccessReviews /></TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="directory">
          <NonEmployeeDirectory />
        </TabsContent>
      </Tabs>

      <Dialog open={showOnboardingDialog} onOpenChange={setShowOnboardingDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Add Non-Employee Identity
            </DialogTitle>
          </DialogHeader>
          <OnboardingWizard />
        </DialogContent>
      </Dialog>
    </div>
  );
}
