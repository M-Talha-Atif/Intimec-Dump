import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Monitor, AlertTriangle, Settings, Bell, BarChart3, ListTodo, Timer } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StandardTabs from '@/components/shared/StandardTabs';
import IconTabs from '@/components/shared/IconTabs';
import { MonitoringAnalytics } from './MonitoringAnalytics';
import { SystemHealthTimeline } from './SystemHealthTimeline';
import { ConnectorHealth } from './ConnectorHealth';
import { AlertsManager } from './AlertsManager';
import { OperationalDashboard } from './OperationalDashboard';
import { JobQueueMonitor } from './JobQueueMonitor';
import { SLAMonitor } from './SLAMonitor';
import { AlertRuleEditor } from './AlertRuleEditor';
import { MonitoringTimeRangeSelector, type TimeRange } from './MonitoringTimeRangeSelector';
import { useSearchParams } from "next/navigation";

export const MonitoringContent = () => {
  const [primaryTab, setPrimaryTab] = useState('analytics');
  const [opsTab, setOpsTab] = useState('connectors');
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [alertEditorOpen, setAlertEditorOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab");
    const shouldFocus = searchParams.get("focus");
    if (tab && shouldFocus === 'true') {
      setPrimaryTab('operations');
      setOpsTab(tab);
      setTimeout(() => {
        const alertsSection = document.getElementById('smart-alerts-section');
        if (alertsSection) {
          alertsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, [searchParams]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="IGA Monitoring"
        description="Real-time visibility and intelligent insights across the IGA platform"
        icon={<Monitor className="h-5 w-5 text-primary" />}
        tooltip="Real-time platform monitoring and operational intelligence. Analytics provides system health overview and performance metrics. Operations enables connector health monitoring, job queue tracking, SLA monitoring, and alert management."
        actions={
          <div className="flex items-center gap-3">
            <MonitoringTimeRangeSelector value={timeRange} onChange={setTimeRange} />
            <Button variant="outline" size="sm" onClick={() => setAlertEditorOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Configure Alerts
            </Button>
            <Button size="sm" onClick={() => { setPrimaryTab('operations'); setOpsTab('alerts'); }}>
              <Bell className="h-4 w-4 mr-2" />
              Notification Settings
            </Button>
          </div>
        }
      />

      <Tabs value={primaryTab} onValueChange={setPrimaryTab}>
        <StandardTabs
          tabs={[
            { value: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
            { value: "operations", label: "Operations", icon: <Settings className="h-4 w-4" /> },
          ]}
        />

        <TabsContent value="analytics" className="mt-4 space-y-6">
          <SystemHealthTimeline />
          <MonitoringAnalytics />
          <OperationalDashboard timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="operations" className="mt-4 space-y-6">
          <Tabs value={opsTab} onValueChange={setOpsTab}>
            <IconTabs
              tabs={[
                { value: "connectors", label: "Connectors", icon: Monitor },
                { value: "jobs", label: "Job Queue", icon: ListTodo },
                { value: "sla", label: "SLA Monitor", icon: Timer },
                { value: "alerts", label: "Smart Alerts", icon: AlertTriangle },
              ]}
              columns={4}
            />

            <TabsContent value="connectors" className="mt-4 space-y-6"><ConnectorHealth /></TabsContent>
            <TabsContent value="jobs" className="mt-4 space-y-6"><JobQueueMonitor /></TabsContent>
            <TabsContent value="sla" className="mt-4 space-y-6"><SLAMonitor /></TabsContent>
            <TabsContent value="alerts" className="mt-4 space-y-6" id="smart-alerts-section"><AlertsManager /></TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      <AlertRuleEditor open={alertEditorOpen} onOpenChange={setAlertEditorOpen} />
    </div>
  );
};
