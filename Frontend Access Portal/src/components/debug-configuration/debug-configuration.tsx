"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebugConfiguration } from "@/contexts/use-debug-configuration";
import { GlobalDebugControl } from "./global-debug-control";
import { PresetFilters } from "./preset-filters";
import { ComponentDebugTable } from "./component-debug-table";
import { PerformanceWarning } from "./performance-warning";
import { SaveSettingsDialog } from "./save-settings-dialog";
import { AdvancedControls } from "./advanced-controls";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { hasTraceLogging } from "@/utils/debug";
import { Loader } from "../ui/Loader";

export const DebugConfiguration = () => {
  const { isGlobalDebuggingEnabled, components, isLoading } =
    useDebugConfiguration();

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">

        {/* Move debugging status to the right */}
        <div className="flex items-center space-x-2">
          {isGlobalDebuggingEnabled ? (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Debugging Active</span>
              {hasTraceLogging(components) && (
                <div className="flex items-center space-x-1 text-amber-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span
                    className="text-xs"
                    title="Trace logging enabled – may impact performance"
                  >
                    TRACE
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Debugging Paused</span>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="debug-config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="debug-config">Debug Configuration</TabsTrigger>
          <TabsTrigger value="advanced-controls">Advanced Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="debug-config" className="space-y-6">
          <GlobalDebugControl />

          <PresetFilters />

          <PerformanceWarning />

          <ComponentDebugTable />

          <div className="flex justify-end">
            <SaveSettingsDialog />
          </div>
        </TabsContent>

        <TabsContent value="advanced-controls" className="space-y-6">
          <AdvancedControls />

          <div className="flex justify-end">
            <SaveSettingsDialog isAdvanced />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DebugConfiguration;
