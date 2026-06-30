"use client";
import React, { useEffect, useMemo } from "react";
import {
  SchemaManagementProvider,
  useSchemaManagement,
} from "@/contexts/schema-management-context";
import { EntitySidebar } from "./EntitySidebar";
import { SchemaDonutChart } from "./SchemaDonutChart";
import { Loader } from "../ui/Loader";
import { EntitySchemaView } from "./EntitySchemaView";

const SchemaManagementContentInner = React.memo(() => {
  const { state, loadTenantStatistics, getEntityStatistics } = useSchemaManagement();

  useEffect(() => {
    console.log("SchemaManagementContent mounted");
    // Load tenant statistics when component mounts
    loadTenantStatistics();
  }, [loadTenantStatistics]);

  // Load entity statistics when active entity changes
  useEffect(() => {
    if (state.activeEntity && !state.loadingStates.entityStatistics && !state.entityStatistics) {
      console.log("Loading entity statistics for:", state.activeEntity);
      getEntityStatistics(state.activeEntity);
    }
  }, [state.activeEntity, state.loadingStates.entityStatistics, state.entityStatistics, getEntityStatistics]);

  // Memoize the main content to prevent unnecessary re-renders
  const mainContent = useMemo(() => (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 lg:shrink-0">
          <EntitySidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 space-y-4 p-2">
          <div className="space-y-4">
            <SchemaDonutChart key={state.activeEntity} />
          </div>
          <EntitySchemaView />
        </main>
      </div>
    </div>
  ), [state.activeEntity]);

  if (state.loadingStates.entities) return <Loader />;

  return mainContent;
});

SchemaManagementContentInner.displayName = "SchemaManagementContentInner";

const SchemaManagementContent = React.memo(() => {
  return (
    <SchemaManagementProvider>
      <SchemaManagementContentInner />
    </SchemaManagementProvider>
  );
});

SchemaManagementContent.displayName = "SchemaManagementContent";

export default SchemaManagementContent;
