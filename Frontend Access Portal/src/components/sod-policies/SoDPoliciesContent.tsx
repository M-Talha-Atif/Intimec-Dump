import { useState } from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { BarChart3, Settings, ShieldAlert } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StandardTabs from '@/components/shared/StandardTabs';
import IconTabs from '@/components/shared/IconTabs';
import { SimulateAccessModal } from './modals/SimulateAccessModal';
import { SoDOverviewDashboard } from './enhanced/SoDOverviewDashboard';
import { PolicyManagementHub } from './enhanced/PolicyManagementHub';
import { ViolationCenter } from './enhanced/ViolationCenter';
import { ConflictMatrix } from './ConflictMatrix';
import type { SoDPolicy } from '@/types/sodPolicies';

export const SoDPoliciesContent = () => {
  const [primaryTab, setPrimaryTab] = useState('analytics');
  const [opsTab, setOpsTab] = useState('policies');
  const [selectedPolicy, setSelectedPolicy] = useState<SoDPolicy | null>(null);

  return (
    <div className="p-4 lg:p-8 sm:p-6 space-y-6">
      <PageHeader
        title="Segregation of Duties"
        description="Enterprise-grade SoD policy management and violation detection"
        icon={<ShieldAlert className="h-5 w-5 text-primary" />}
        tooltip="Enterprise SoD policy management and violation detection. Analytics provides risk intelligence and violation trends. Operations enables policy configuration, violation investigation, and conflict matrix analysis."
        actions={<SimulateAccessModal onSimulationRun={() => {}} />}
      />

      <Tabs value={primaryTab} onValueChange={setPrimaryTab}>
        <StandardTabs
          tabs={[
            { value: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
            { value: "operations", label: "Operations", icon: <Settings className="h-4 w-4" /> },
          ]}
        />

        <TabsContent value="analytics" className="mt-4">
          <SoDOverviewDashboard />
        </TabsContent>

        <TabsContent value="operations" className="mt-4">
          <Tabs value={opsTab} onValueChange={setOpsTab}>
            <IconTabs
              tabs={[
                { value: "policies", label: "Policies", icon: ShieldAlert },
                { value: "violations", label: "Violations", icon: ShieldAlert },
                { value: "matrix", label: "Conflict Matrix", icon: BarChart3 },
              ]}
              columns={3}
            />

            <TabsContent value="policies" className="mt-4">
              <PolicyManagementHub
                onCreatePolicy={() => {}}
                onEditPolicy={(policy) => setSelectedPolicy(policy)}
                onViewPolicy={(policy) => setSelectedPolicy(policy)}
              />
            </TabsContent>

            <TabsContent value="violations" className="mt-4">
              <ViolationCenter />
            </TabsContent>

            <TabsContent value="matrix" className="mt-4">
              <ConflictMatrix />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};