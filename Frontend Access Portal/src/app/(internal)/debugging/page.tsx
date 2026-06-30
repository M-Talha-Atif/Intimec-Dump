"use client";

import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { LogViewer } from "@/components/debugging/LogViewer";
import { HeaderStats } from "@/components/debugging/LiveLogHeader";
import { DebugSidebar } from "@/components/debugging/DebugSidebar";
import { PinnedItemsModal } from "@/components/debugging/PinnedItemsModal";
import { ResolvedItemsModal } from "@/components/debugging/ResolvedItemsModal";
import { PinLogModal } from "@/components/debugging/PinLogModal";
import { DebugFilters } from "@/components/debugging/DebugFilters";
import { AnalyzeLogsModal } from "@/components/debugging/AnalyzeLogsModal";
import {
  DebuggingProvider,
  useDebugging,
  type LogItem,
} from "@/contexts/debugging-context";

import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/PageHeader";
import StandardTabs from "@/components/shared/StandardTabs";
import IconTabs from "@/components/shared/IconTabs";
import DebugAnalyticsDashboard from "@/components/debugging/DebugAnalyticsDashboard";
import { DebugActions } from "@/components/debugging/DebugActions";

import {
  FileText,
  AppWindow,
  Workflow,
  KeyRound,
  Brain,
  Bug,
  BarChart3,
  Settings2,
} from "lucide-react";
import { LiveLogStream } from "@/components/debugging/LiveLogStream";

export interface PinnedItem {
  id: string;
  logId: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  source: string;
  originalLog: LogItem;
}

function DebuggingPageContent() {
  const { isLiveMode, activeTab, setIsLiveMode, setActiveTab } = useDebugging();

  const [primaryTab, setPrimaryTab] = useState("analytics");
  const [analyzeModalOpen, setAnalyzeModalOpen] = useState(false);

  return (
    <Tabs value={primaryTab} onValueChange={setPrimaryTab} className="h-full">
      <div className="flex h-full bg-background">

        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col min-w-0">

          <div className="p-6 sm:p-6 lg:p-8 space-y-6 flex-1 flex flex-col min-h-0">

            <PageHeader
              title="Live Debugging Console"
              description="Real-time troubleshooting for identity flows, provisioning, and system events"
              icon={<Bug className="h-5 w-5 text-primary" />}
              tooltip="The debugging console streams real-time identity events including provisioning actions, workflow executions, connector responses, and system logs to help diagnose issues quickly."
              actions={
                <div className="flex items-center gap-3 flex-shrink-0">

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAnalyzeModalOpen(true)}
                    className="cursor-pointer"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze Logs for patterns
                  </Button>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isLiveMode}
                      onCheckedChange={setIsLiveMode}
                      id="live-mode"
                      className="data-[state=checked]:bg-primary"
                    />
                    <label
                      htmlFor="live-mode"
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      Live Mode
                    </label>
                  </div>

                  <HeaderStats
                    className={`transition-opacity duration-300 ${isLiveMode ? "opacity-100" : "opacity-0"
                      }`}
                  />

                </div>
              }
            />

            {/* PRIMARY TABS */}
            <StandardTabs
              tabs={[
                {
                  value: "analytics",
                  label: "Analytics",
                  icon: <BarChart3 className="h-4 w-4" />,
                },
                {
                  value: "operations",
                  label: "Operations",
                  icon: <Settings2 className="h-4 w-4" />,
                },
              ]}
            />

            {/* ANALYTICS TAB */}
            <TabsContent value="analytics" className="mt-4">
              <DebugAnalyticsDashboard />
            </TabsContent>

            {/* OPERATIONS TAB */}
            <TabsContent
              value="operations"
              className="flex-1 flex flex-col min-h-0 space-y-6"
            >
              <DebugFilters />

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex-1 flex flex-col min-h-0"
              >
                <IconTabs
                  columns={4}
                  tabs={[
                    {
                      value: "all-logs",
                      label: "All Logs",
                      icon: FileText,
                    },
                    {
                      value: "connector-logs",
                      label: "Applications Logs",
                      icon: AppWindow,
                    },
                    {
                      value: "workflow-logs",
                      label: "Workflow Logs",
                      icon: Workflow,
                    },
                    {
                      value: "access-portal-logs",
                      label: "Access Portal Logs",
                      icon: KeyRound,
                    },
                  ]}
                />

                <div className="flex-1 overflow-visible rounded-lg min-h-[600px]">

                  <TabsContent
                    value="all-logs"
                    className="mt-0 h-full overflow-visible space-y-4"
                  >
                    <LiveLogStream>
                      <LogViewer logType="all" />
                    </LiveLogStream>
                  </TabsContent>

                  <TabsContent
                    value="connector-logs"
                    className="mt-0 h-full overflow-visible"
                  >
                    <LogViewer logType="connector" />
                  </TabsContent>

                  <TabsContent
                    value="workflow-logs"
                    className="mt-0 h-full overflow-visible"
                  >
                    <LogViewer logType="workflow" />
                  </TabsContent>

                  <TabsContent
                    value="access-portal-logs"
                    className="mt-0 h-full overflow-visible"
                  >
                    <LogViewer logType="access-portal" />
                  </TabsContent>

                </div>
              </Tabs>
                <DebugActions />
            </TabsContent>

          </div>
        </div>

        {/* SIDEBAR */}
        <div className="w-80 bg-muted/10 flex-shrink-0 h-full overflow-y-auto">
          <div className="p-4 h-full">
            <DebugSidebar />
          </div>
        </div>

        {/* MODALS */}
        <PinLogModal />
        <PinnedItemsModal />
        <ResolvedItemsModal />

        <AnalyzeLogsModal
          open={analyzeModalOpen}
          onOpenChange={setAnalyzeModalOpen}
        />

      </div>
    </Tabs>
  );
}

const DebuggingPage = () => {
  return (
    <DebuggingProvider>
      <DebuggingPageContent />
    </DebuggingProvider>
  );
};

export default DebuggingPage;