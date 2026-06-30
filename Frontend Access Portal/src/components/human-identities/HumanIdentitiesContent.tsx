
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StandardTabs from "@/components/shared/StandardTabs";
import { Button } from "@/components/ui/button";
import {
  Users,
  Plus,
  Settings,
  Shield,
  BarChart3,
  Activity,
  TreePine,
  ClipboardCheck,
  LayoutDashboard,
  BookOpen
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IdentityCenter } from './IdentityCenter';
import { Directory } from './Directory';
import { ManagerDashboard } from './ManagerDashboard';
import { LifecycleManagement } from './LifecycleManagement';
import { AccessRiskManagement } from './AccessRiskManagement';
import { ReviewsManagement } from './ReviewsManagement';
import { OnboardingWizard } from './OnboardingWizard';
import PageHeader from "@/components/shared/PageHeader";
import IconTabs from "@/components/shared/IconTabs";

const analyticsTabs = [
  { value: "identity-center", label: "Identity Center", icon: Activity },
  { value: "lifecycle", label: "Lifecycle", icon: BarChart3 },
  { value: "managers", label: "Managers", icon: TreePine },
  { value: "access-risk", label: "Access & Risk", icon: Shield },
  { value: "reviews", label: "Reviews", icon: ClipboardCheck },
];

export default function EmployeeIdentitiesContent() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [activeSubTab, setActiveSubTab] = useState('identity-center');
  const [showOnboarding, setShowOnboarding] = useState(false);

  return (
    <div className="space-y-6 bg-background">
      {/* Header */}
      <PageHeader
        title="Employee Identities"
        description="Comprehensive employee lifecycle and identity management with AI-powered insights"
        icon={<Users className="h-6 w-6 text-primary" />}
        actions={
          <>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configure Policies
            </Button>

            <Button onClick={() => setShowOnboarding(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          </>
        }
      />

      {/* 2-Tab Structure */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <StandardTabs
          value={activeTab}
          onValueChange={setActiveTab}
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

        <TabsContent value="analytics" className="space-y-4 mt-4">
          {/* Sub-tabs for analytics */}
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
            <IconTabs
              tabs={analyticsTabs}
              columns={5}
            />

            <TabsContent value="identity-center" className="space-y-6 mt-4">
              <IdentityCenter />
            </TabsContent>
            <TabsContent value="lifecycle" className="space-y-6 mt-4">
              <LifecycleManagement />
            </TabsContent>
            <TabsContent value="managers" className="space-y-6 mt-4">
              <ManagerDashboard />
            </TabsContent>
            <TabsContent value="access-risk" className="space-y-6 mt-4">
              <AccessRiskManagement />
            </TabsContent>
            <TabsContent value="reviews" className="space-y-6 mt-4">
              <ReviewsManagement />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="directory" className="space-y-6">
          <Directory />
        </TabsContent>
      </Tabs>

      {/* Onboarding Dialog */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Employee Onboarding</DialogTitle>
          </DialogHeader>
          <OnboardingWizard />
        </DialogContent>
      </Dialog>
    </div>
  );
}
