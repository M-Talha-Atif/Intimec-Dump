"use client"

import React, { useState } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Users, Shield, KeyRound, RefreshCw, BarChart3, Settings } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StandardTabs from '@/components/shared/StandardTabs';
import IconTabs from '@/components/shared/IconTabs';
import IdentitiesLifecycle from '@/components/lifecycle/IdentitiesLifecycle';
import RolesLifecycle from '@/components/lifecycle/RolesLifecycle';
import EntitlementsLifecycle from '@/components/lifecycle/EntitlementsLifecycle';
import LifecycleAnalytics from '@/components/lifecycle/LifecycleAnalytics';

const LifecyclePage: React.FC = () => {
  useDocumentTitle('Lifecycle');
  const [primaryTab, setPrimaryTab] = useState('analytics');
  const [mgmtTab, setMgmtTab] = useState('identities');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Lifecycle Management"
        description="Centralized control center for managing the full lifecycle of Identities, Roles, and Entitlements"
        icon={<RefreshCw className="h-5 w-5 text-primary" />}
        tooltip="Centralized control center for managing the full lifecycle of Identities, Roles, and Entitlements. Analytics provides lifecycle health intelligence. Management enables direct lifecycle operations."
      />

      <Tabs value={primaryTab} onValueChange={setPrimaryTab} className="w-full">
        <StandardTabs
          tabs={[
            { value: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
            { value: "management", label: "Management", icon: <Settings className="h-4 w-4" /> },
          ]}
        />

        <TabsContent value="analytics" className="mt-6">
          <LifecycleAnalytics />
        </TabsContent>

        <TabsContent value="management" className="mt-6">
          <Tabs value={mgmtTab} onValueChange={setMgmtTab}>
            <IconTabs
              tabs={[
                { value: "identities", label: "Identities Lifecycle", icon: Users },
                { value: "roles", label: "Roles Lifecycle", icon: Shield },
                { value: "entitlements", label: "Entitlements Lifecycle", icon: KeyRound },
              ]}
              columns={3}
            />

            <TabsContent value="identities" className="mt-6"><IdentitiesLifecycle /></TabsContent>
            <TabsContent value="roles" className="mt-6"><RolesLifecycle /></TabsContent>
            <TabsContent value="entitlements" className="mt-6"><EntitlementsLifecycle /></TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LifecyclePage;