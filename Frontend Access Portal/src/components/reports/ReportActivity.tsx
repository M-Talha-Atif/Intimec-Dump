import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, History } from 'lucide-react';
import { ReportScheduler } from './ReportScheduler';
import { ReportAuditLog } from './ReportAuditLog';

export const ReportActivity = () => {
  const [activeTab, setActiveTab] = useState('schedules');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="schedules" className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            Schedules
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 text-sm">
            <History className="h-4 w-4" />
            Execution History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="mt-4">
          <ReportScheduler />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <ReportAuditLog />
        </TabsContent>
      </Tabs>
    </div>
  );
};
