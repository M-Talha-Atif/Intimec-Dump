import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart } from 'lucide-react';
import { useTaskInsights } from './hooks/useTaskInsights';
import { InsightsOverview } from './components/InsightsOverview';
import { InsightsSLA } from './components/InsightsSLA';
import { InsightsFailures } from './components/InsightsFailures';
import { InsightsCapacity } from './components/InsightsCapacity';
import { InsightsTrends } from './components/InsightsTrends';

interface TaskInsightsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: any[];
}

export const TaskInsightsModal: React.FC<TaskInsightsModalProps> = ({
  open,
  onOpenChange,
  tasks
}) => {
  const metrics = useTaskInsights(tasks);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto sm:max-w-6xl" >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {/* <BarChart className="h-5 w-5" /> */}
            Task Center Analytics & Insights
          </SheetTitle>
          <SheetDescription>
            Comprehensive analytics on task performance, SLA compliance, and operational patterns
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="overview" className="px-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sla">SLA Analysis</TabsTrigger>
            <TabsTrigger value="failures">Failures</TabsTrigger>
            <TabsTrigger value="capacity">Capacity</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <InsightsOverview metrics={metrics} />
          </TabsContent>

          <TabsContent value="sla">
            <InsightsSLA metrics={metrics} />
          </TabsContent>

          <TabsContent value="failures">
            <InsightsFailures />
          </TabsContent>

          <TabsContent value="capacity">
            <InsightsCapacity />
          </TabsContent>

          <TabsContent value="trends">
            <InsightsTrends />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
