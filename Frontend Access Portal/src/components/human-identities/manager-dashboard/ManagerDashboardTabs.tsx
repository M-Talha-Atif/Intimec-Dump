
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TreePine, Users, Target } from 'lucide-react';
import { OrganizationalVisibilityPanel } from '../OrganizationalVisibilityPanel';
import { DelegationCoveragePanel } from '../DelegationCoveragePanel';
import { AccessReviewContextPanel } from '../AccessReviewContextPanel';

export function ManagerDashboardTabs() {
  return (
    <Tabs defaultValue="structure" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="structure">
          <TreePine className="h-4 w-4 mr-1" />
          Team Structure
        </TabsTrigger>
        <TabsTrigger value="delegation">
          <Users className="h-4 w-4 mr-1" />
          Delegation
        </TabsTrigger>
        <TabsTrigger value="reviews">
          <Target className="h-4 w-4 mr-1" />
          Access Reviews
        </TabsTrigger>
      </TabsList>

      <TabsContent value="structure">
        <OrganizationalVisibilityPanel />
      </TabsContent>

      <TabsContent value="delegation">
        <DelegationCoveragePanel />
      </TabsContent>

      <TabsContent value="reviews">
        <AccessReviewContextPanel />
      </TabsContent>
    </Tabs>
  );
}
