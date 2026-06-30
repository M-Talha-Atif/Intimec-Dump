import React, { useState } from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Settings, BarChart3, Lightbulb, Library, Wrench, Clock, Calendar, History } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StandardTabs from '@/components/shared/StandardTabs';
import IconTabs from '@/components/shared/IconTabs';
import { GovernanceDashboard } from './GovernanceDashboard';
import { ReportCatalog } from './ReportCatalog';
import { ReportBuilder } from './ReportBuilder';
import { ReportScheduler } from './ReportScheduler';
import { ReportAuditLog } from './ReportAuditLog';
import { ReportRecommendations } from './ReportRecommendations';
import { ScheduleReportDialog, ReportTemplateLibraryModal } from './dialogs';
import { useToast } from "@/hooks/use-toast";
import { reportTemplateService } from '@/services/reportTemplateService';

const analyticsTabs = [
  { value: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
  { value: 'operations', label: 'Operations', icon: <Settings className="h-4 w-4" /> },
];

const operationSubTabs = [
  { value: 'library', label: 'Report Library', icon: Library },
  { value: 'builder', label: 'Report Builder', icon: Wrench },
  { value: 'schedules', label: 'Schedules', icon: Calendar },
  { value: 'history', label: 'Execution History', icon: History },
];

export const ReportsContent = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [operationsTab, setOperationsTab] = useState('library');
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false); // by default recommendations are false
  const [templateLibraryOpen, setTemplateLibraryOpen] = useState(false);
  const { toast } = useToast();

  const handleNewReport = () => { setTemplateLibraryOpen(true); };
  const handleApplyTemplate = (templateId: string) => {
    reportTemplateService.createFromTemplate(templateId);
    setActiveTab('operations');
    setOperationsTab('builder');
    toast({ title: "Template Applied", description: "Customize and save your report" });
  };
  const handleSchedule = (config: any) => {
    toast({ title: "Report Scheduled", description: `Report will be generated ${config.frequency} and sent to specified recipients.` });
  };

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Reports Center"
        description="Enterprise reporting hub for governance, compliance, and operational insights"
        icon={<FileText className="h-5 w-5 text-primary" />}
        tooltip="Unified IGA reporting center. Analytics shows compliance posture and risk trends. Operations provides report library, builder, scheduling, and execution history."
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={() => setShowRecommendations(!showRecommendations)}>
              <Lightbulb className="h-4 w-4 mr-2" />{showRecommendations ? 'Hide' : 'Show'} Recommendations
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />Report Settings
            </Button>
            <Button size="sm" onClick={handleNewReport}>
              <Plus className="h-4 w-4 mr-2" />New Report
            </Button>
          </div>
        }
      />

      {showRecommendations && <ReportRecommendations />}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <StandardTabs tabs={analyticsTabs} />

        <TabsContent value="analytics" className="mt-4">
          <GovernanceDashboard />
        </TabsContent>

        <TabsContent value="operations" className="mt-4">
          <Tabs value={operationsTab} onValueChange={setOperationsTab}>
            <IconTabs tabs={operationSubTabs} columns={4} />

            <TabsContent value="library" className="mt-4">
              <ReportCatalog />
            </TabsContent>
            <TabsContent value="builder" className="mt-4">
              <ReportBuilder />
            </TabsContent>
            <TabsContent value="schedules" className="mt-4">
              <ReportScheduler />
            </TabsContent>
            <TabsContent value="history" className="mt-4">
              <ReportAuditLog />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      <ScheduleReportDialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen} onSchedule={handleSchedule} />
      <ReportTemplateLibraryModal open={templateLibraryOpen} onOpenChange={setTemplateLibraryOpen} onApply={handleApplyTemplate} />
    </div>
  );
};
