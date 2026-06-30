import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  ShieldCheck,
  Link,
  AlertTriangle,
  Users,
  History,
  Code,
} from "lucide-react";
import EntitlementOverviewViewer from "../EntitlementOverviewViewer";
import EntitlementAttributesViewer from "../EntitlementAttributesViewer";
import EntitlementRelationshipsViewer from "../EntitlementRelationshipsViewer";
import EntitlementScriptingViewer from "../EntitlementScriptingViewer";
import EntitlementRiskViewer from "../EntitlementRiskViewer";
import EntitlementHistoryViewer from "../EntitlementHistoryViewer";
import EntitlementMembersViewer from "../EntitlementMembersViewer";
import type { EntitlementTabsProps } from "../types";

export const EntitlementTabs = ({
  entitlement,
  allEntitlements,
  onSelectEntitlement,
}: EntitlementTabsProps) => {
  return (
    <Tabs defaultValue="overview" className="flex flex-col flex-1">
      <div className="border-b px-6 flex-shrink-0">
        <TabsList className="grid w-full grid-cols-7 bg-transparent h-12">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="attributes"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Attributes
          </TabsTrigger>
          <TabsTrigger
            value="relationships"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
          >
            <Link className="mr-2 h-4 w-4" />
            Relationships
          </TabsTrigger>
          <TabsTrigger
            value="members"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
          >
            <Users className="mr-2 h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger
            value="scripting"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
          >
            <Code className="mr-2 h-4 w-4" />
            Scripting
          </TabsTrigger>
          <TabsTrigger
            value="risk"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Risk Analysis
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
          >
            <History className="mr-2 h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="p-6 flex-1 overflow-y-auto max-h-[calc(100vh-400px)]">
        <TabsContent value="overview" className="mt-0">
          <EntitlementOverviewViewer entitlement={entitlement} />
        </TabsContent>

        <TabsContent value="attributes" className="mt-0">
          <EntitlementAttributesViewer entitlement={entitlement} />
        </TabsContent>

        <TabsContent value="relationships" className="mt-0">
          <EntitlementRelationshipsViewer
            entitlement={entitlement}
            allEntitlements={allEntitlements}
            onSelectEntitlement={onSelectEntitlement}
          />
        </TabsContent>

        <TabsContent value="members" className="mt-0">
          <EntitlementMembersViewer />
        </TabsContent>

        <TabsContent value="scripting" className="mt-0">
          <EntitlementScriptingViewer />
        </TabsContent>

        <TabsContent value="risk" className="mt-0">
          <EntitlementRiskViewer entitlement={entitlement} />
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <EntitlementHistoryViewer />
        </TabsContent>
      </div>
    </Tabs>
  );
};
