import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, BarChart3, ClipboardList, ShieldCheck } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { MyTasksTile } from './tiles/MyTasksTile';
import { MyBusinessRolesTile } from './tiles/MyBusinessRolesTile';
import { MyInternalRolesTile } from './tiles/MyInternalRolesTile';
import { MyTeamTile } from './tiles/MyTeamTile';
import { MySoDPoliciesTile } from './tiles/MySoDPoliciesTile';
import { MyApplicationsTile } from './tiles/MyApplicationsTile';
import { ResponsibilitiesAnalyticsDashboard } from './ResponsibilitiesAnalyticsDashboard';
import StandardTabs from '@/components/shared/StandardTabs';

export const ResponsibilitiesDashboard = () => {
  const [primaryTab, setPrimaryTab] = useState('analytics');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Responsibility Governance Center"
        description="Monitor ownership accountability, governance risks, and manage all responsibility objects"
        icon={<ShieldCheck className="h-5 w-5 text-primary" />}
        tooltip="Central hub for governance accountability — monitor ownership obligations, pending actions, risk exposure, and operational workload across all responsibility objects including tasks, roles, teams, policies, and applications."
      />

      {/* Primary 2-Tab Toggle */}
      <div className="mt-4">
        <Tabs value={primaryTab} onValueChange={setPrimaryTab}>
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
                value: "my-responsibilities",
                label: "My Responsibilities",
                icon: <ClipboardList className="h-4 w-4" />,
              },
            ]}
          />

          {/* <TabsList className="max-w-md grid grid-cols-2 h-12">
            <TabsTrigger value="analytics" className="flex items-center gap-2 text-sm font-medium">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="my-responsibilities" className="flex items-center gap-2 text-sm font-medium">
              <ClipboardList className="h-4 w-4" />
              My Responsibilities
            </TabsTrigger>
          </TabsList> */}

          <TabsContent value="analytics" className="mt-4">
            <ResponsibilitiesAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="my-responsibilities" className="mt-4">
            {/* Global Search */}
            <div className="mb-6 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search across all responsibilities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tiles Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MyTasksTile searchQuery={searchQuery} />
              <MyBusinessRolesTile searchQuery={searchQuery} />
              <MyInternalRolesTile searchQuery={searchQuery} />
              <MyTeamTile searchQuery={searchQuery} />
              <MySoDPoliciesTile searchQuery={searchQuery} />
              <MyApplicationsTile searchQuery={searchQuery} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
