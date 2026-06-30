"use client";
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Settings, Play, BarChart3 } from "lucide-react";

import PageHeader from "@/components/shared/PageHeader";
import StandardTabs from "@/components/shared/StandardTabs";

import { useTaskCenter } from "./hooks/useTaskCenter";
import { TaskTable } from "./TaskTable";
import TaskDetailsModal from "@/components/tasks/TaskDetailsModal";
import { TaskFilters } from "./TaskFilters";
import { TaskBulkActions } from "./TaskBulkActions";
import { TaskInsightsPanel } from "./TaskInsightsPanel";
import { TaskSettingsModal } from "./modals/TaskSettingsModal";
import { TaskInsightsModal } from "./modals/TaskInsightsModal";
import { TaskCenterHeader } from "./components/TaskCenterHeader";
import { TaskMetricsGrid } from "./components/TaskMetricsGrid";
import { ScheduledTasksTab } from "./components/ScheduledTasksTab";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { SchedulingPanel } from './SchedulingPanel';
import { Skeleton } from "@/components/ui/skeleton";
import { TaskCenterAnalyticsDashboard } from "./TaskCenterAnalyticsDashboard";
import { useToast } from "@/hooks/use-toast";

export type { Task } from "@/services/responsibilities";

export function TaskCenterContent() {
  const {
    scheduledTasks,
    taskExecutions,
    tasks,
    paginatedTasks,
    metrics,
    isLoading,

    page,
    size,
    totalElements,
    totalPages,
    handlePageChange,
    handleSizeChange,

    selectedTasks,
    selectedTaskId,
    showFilters,
    setShowFilters,
    activeView,
    setActiveView,
    showSettingsModal,
    setShowSettingsModal,
    showInsightsModal,
    setShowInsightsModal,

    confirmDialog,

    approveMutation,
    rejectMutation,

    handleTaskSelect,
    handleSelectionChange,
    handleApprove,
    handleReject,
    handleBulkAction,
    handleFilterChange,
    handleSearchChange,
    clearSelection,
    closeDetailPanel,
  } = useTaskCenter();

  const [primaryTab, setPrimaryTab] = React.useState("analytics");

  const { toast } = useToast();

  return (
    <div className="p-8 min-h-full bg-background">
      <div className="space-y-6">

        {/* NEW HEADER (from loveable version) */}
        <PageHeader
          title="Task Center"
          description="Operational governance intelligence and task execution management"
          icon={<Play className="h-5 w-5 text-primary" />}
          tooltip="Centralized operational governance hub for monitoring and managing identity lifecycle tasks."
          actions={
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {scheduledTasks.length} scheduled
              </Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast({
                    title: "Refreshing tasks...",
                    description: "Task list updated",
                  })
                }
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettingsModal(true)}
              >
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
            </div>
          }
        />

        {/* PRIMARY TABS */}
        <Tabs value={primaryTab} onValueChange={setPrimaryTab}>
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
                icon: <Play className="h-4 w-4" />,
              },
            ]}
          />

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            <TaskCenterAnalyticsDashboard tasks={tasks} />
          </TabsContent>

          {/* OPERATIONS TAB (YOUR ORIGINAL UI) */}
          <TabsContent value="operations" className="space-y-6 mt-6">

            {/* Existing Header */}

            {/* Metrics */}
            {/* <TaskMetricsGrid metrics={metrics} /> */}

            {/* EXISTING TABS */}
            <Tabs value={activeView} onValueChange={setActiveView}>
              <StandardTabs
                tabs={[
                  { value: "overview", label: "Task Overview" },
                  { value: "scheduled", label: "Scheduled Tasks" },
                  // { value: "insights", label: "Insights & Analytics" },
                ]}
              />

              <TabsContent value="overview" className="space-y-6">

                <TaskCenterHeader
                  scheduledTasksCount={scheduledTasks.length}
                  showFilters={showFilters}
                  setShowFilters={setShowFilters}
                  setShowInsightsModal={setShowInsightsModal}
                  setShowSettingsModal={setShowSettingsModal}
                />


                {showFilters && (
                  <TaskFilters
                    tasks={tasks}
                    onFilterChange={handleFilterChange}
                    onSearchChange={handleSearchChange}
                  />
                )}

                {selectedTasks.length > 0 && (
                  <TaskBulkActions
                    selectedTasks={selectedTasks}
                    onBulkAction={handleBulkAction}
                    onClearSelection={clearSelection}
                  />
                )}

                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <TaskTable
                    tasks={paginatedTasks}
                    selectedTasks={selectedTasks}
                    onTaskSelect={handleTaskSelect}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onSelectionChange={handleSelectionChange}
                    selectedTaskId={selectedTaskId ?? undefined}
                    approveMutationPending={approveMutation.isPending}
                    rejectMutationPending={rejectMutation.isPending}
                    totalElements={totalElements}
                    totalPages={totalPages}
                    page={page}
                    size={size}
                    onPageChange={handlePageChange}
                    onSizeChange={handleSizeChange}
                  />
                )}
              </TabsContent>

              <TabsContent value="scheduled" className="space-y-6">
                    <SchedulingPanel />
                {/* <ScheduledTasksTab
                  scheduledTasks={scheduledTasks}
                  taskExecutions={taskExecutions}
                /> */}
              </TabsContent>

              {/* <TabsContent value="insights">
                <TaskInsightsPanel tasks={tasks} />
              </TabsContent> */}
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* MODALS */}
        <TaskDetailsModal
          taskId={selectedTaskId ?? undefined}
          open={!!selectedTaskId}
          onOpenChange={(open) => {
            if (!open) closeDetailPanel();
          }}
          onApprove={handleApprove}
          onReject={handleReject}
        />

        <TaskSettingsModal
          open={showSettingsModal}
          onOpenChange={setShowSettingsModal}
        />

        <TaskInsightsModal
          open={showInsightsModal}
          onOpenChange={setShowInsightsModal}
          tasks={tasks}
        />

        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          options={confirmDialog.options}
          onConfirm={confirmDialog.handleConfirm}
          onCancel={confirmDialog.handleCancel}
        />
      </div>
    </div>
  );
}