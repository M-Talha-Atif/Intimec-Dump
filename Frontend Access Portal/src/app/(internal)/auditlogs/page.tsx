"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScrollText, BarChart3 } from "lucide-react";

import { AuditLogsProvider } from "@/contexts/audit-logs-context";
import { AuditLogsHeader } from "@/components/auditlogs/audit-logs-header";
import { AuditLogsFilters } from "@/components/auditlogs/audit-logs-filters";
import { AuditLogsFilterBadges } from "@/components/auditlogs/audit-logs-filter-badges";
import { AuditLogsTable } from "@/components/auditlogs/audit-logs-table";
import { ErrorDisplay } from "@/components/auditlogs/error-display";
import StandardTabs from "@/components/shared/StandardTabs";
import AuditAnalyticsDashboard from "@/components/auditlogs/AuditAnalyticsDashboard";

function AuditLogsContent() {
  const [primaryTab, setPrimaryTab] = useState("analytics");

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      <AuditLogsHeader />

      <Tabs value={primaryTab} onValueChange={setPrimaryTab}>
        <StandardTabs
          tabs={[
            {
              value: "analytics",
              label: "Analytics",
              icon: <BarChart3 className="h-4 w-4" />,
            },
            {
              value: "logs",
              label: "Logs",
              icon: <ScrollText className="h-4 w-4" />,
            },
          ]}
        />

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-4">
          <AuditAnalyticsDashboard />
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="mt-6 space-y-6">
          <ErrorDisplay />
          <AuditLogsFilters />
          <AuditLogsFilterBadges />
          <AuditLogsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AuditLogsPage() {
  const searchParams = useSearchParams();

  const eventsParam = searchParams.get("events");
  const objectTypesParam = searchParams.get("objectTypes");
  const riskLevelsParam = searchParams.get("riskLevels");
  const statusesParam = searchParams.get("statuses");

  const eventTypesArray = searchParams.getAll("eventTypes");
  const objectTypesArray = searchParams.getAll("objectTypes");
  const riskLevelsArray = searchParams.getAll("riskLevels");
  const statusesArray = searchParams.getAll("statuses");

  const initialEventTypes =
    eventTypesArray.length > 0
      ? eventTypesArray
      : eventsParam
      ? eventsParam.split(",").map((e) => e.trim())
      : [];

  const initialObjectTypes =
    objectTypesArray.length > 0
      ? objectTypesArray
      : objectTypesParam
      ? objectTypesParam.split(",").map((o) => o.trim())
      : [];

  const initialRiskLevels =
    riskLevelsArray.length > 0
      ? riskLevelsArray
      : riskLevelsParam
      ? riskLevelsParam.split(",").map((r) => r.trim())
      : [];

  const initialStatuses =
    statusesArray.length > 0
      ? statusesArray
      : statusesParam
      ? statusesParam.split(",").map((s) => s.trim())
      : [];

  return (
    <AuditLogsProvider
      initialEventTypes={initialEventTypes}
      initialObjectTypes={initialObjectTypes}
      initialRiskLevels={initialRiskLevels}
      initialStatuses={initialStatuses}
    >
      <AuditLogsContent />
    </AuditLogsProvider>
  );
}