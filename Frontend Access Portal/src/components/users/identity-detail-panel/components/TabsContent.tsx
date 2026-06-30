import React from "react";
import {
  Tabs,
  TabsContent as UITabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { type User } from "@/data/mock-users";
import { TAB_CONFIG } from "../constants";
import { useIdentityPanelContext } from "../context/IdentityPanelContext";

// Import refactored tab components
import {
  OverviewTab,
  AccountsTab,
  RiskTab,
  AccessTab,
  AccessExplorerTab,
  ActivityTab,
  PolicyTab,
  AIAnalysisTab,
} from "../../detail-tabs/tabs";
import IdentityRelationshipsTab from "../../detail-tabs/tabs/IdentityRelationshipsTab";

interface PanelTabsContentProps {
  user: User;
}

export function PanelTabsContent({ user }: PanelTabsContentProps) {
  const { activeTab, setActiveTab } = useIdentityPanelContext();

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-muted/30">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          {TAB_CONFIG.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <UITabsContent value="overview">
          <OverviewTab user={user} />
        </UITabsContent>
        <UITabsContent value="accounts">
          <AccountsTab user={user} />
        </UITabsContent>
        <UITabsContent value="access">
          <AccessTab user={user} />
        </UITabsContent>
        <UITabsContent value="relationships">
          <IdentityRelationshipsTab user={user} />
        </UITabsContent>
        <UITabsContent value="explorer">
          <AccessExplorerTab user={user} />
        </UITabsContent>
        <UITabsContent value="risk">
          <RiskTab user={user} />
        </UITabsContent>
        <UITabsContent value="activity">
          <ActivityTab user={user} />
        </UITabsContent>
        <UITabsContent value="policy">
          <PolicyTab user={user} />
        </UITabsContent>
        <UITabsContent value="ai-analysis">
          <AIAnalysisTab user={user} />
        </UITabsContent>
      </Tabs>
    </div>
  );
}
