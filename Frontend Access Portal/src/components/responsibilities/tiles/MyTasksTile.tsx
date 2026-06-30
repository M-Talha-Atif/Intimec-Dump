"use client"

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import IconTabs from "@/components/shared/IconTabs";
import { CheckSquare, ChevronRight, Clock, AlertCircle, CheckCircle, XCircle, History } from "lucide-react";
import { fetchMyTasks, approveTask, rejectTask, Task } from "@/services/responsibilities";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import TaskDetailsModal from "@/components/tasks/TaskDetailsModal";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/hooks/useConfirm";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { GroupedApprovalCard } from "@/components/responsibilities/components/GroupedApprovalCard";
import { useMyTasks } from "./hooks";
import {
  TileErrorCard,
  TileHeader,
  TileLoadingSkeleton,
  TileEmptyState,
  ViewAllButton,
} from "./components";
import { getPriorityColor, getTaskTypeLabel } from "./utils";

interface MyTasksTileProps {
  searchQuery: string;
}

// Helper to get userId from auth_token cookie
function getUserIdFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const cookie = document.cookie.split('; ').find(row => row.startsWith('auth_token='));
  if (!cookie) return null;
  try {
    const token = cookie.split('=')[1];
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.sub || null;
  } catch {
    return null;
  }
}

export const MyTasksTile = ({ searchQuery }: MyTasksTileProps) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { confirm, isOpen, options, handleConfirm, handleCancel } = useConfirm();
  const [approvalTab, setApprovalTab] = useState<'pending' | 'processed'>('pending');

  // Get userId from cookie on mount
  useEffect(() => {
    setUserId(getUserIdFromCookie());
  }, []);

  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["myTasks", userId, approvalTab],
    queryFn: () => fetchMyTasks(approvalTab),
    enabled: !!userId,
    refetchOnMount: true,
    staleTime: 0,
  });

  console.log('[MyTasksTile] Raw tasks data:', tasks);
  console.log('[MyTasksTile] Tasks type:', typeof tasks, Array.isArray(tasks));

  // Mutations for approve/reject
  const approveMutation = useMutation({
    mutationFn: async ({ taskId, reason }: { taskId: string; reason: string }) => {
      await approveTask(taskId, reason);
      return { taskId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTasks", userId] });
      toast({
        title: "Approved",
        description: "The request has been approved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Approval Failed",
        description: "Failed to approve request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ taskId, reason }: { taskId: string; reason: string }) => {
      await rejectTask(taskId, reason);
      return { taskId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTasks", userId] });
      toast({
        title: "Rejected",
        description: "The request has been rejected.",
      });
    },
    onError: () => {
      toast({
        title: "Rejection Failed",
        description: "Failed to reject request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = async (taskId: string) => {
    const result = await confirm({
      title: "Approve Task",
      description: "Are you sure you want to approve this task?",
      requireReason: true,
      confirmText: "Approve",
    });

    if (result.confirmed && result.reason) {
      approveMutation.mutate({ taskId, reason: result.reason });
    }
  };

  const handleReject = async (taskId: string) => {
    const result = await confirm({
      title: "Reject Task",
      description: "Please provide a reason for rejecting this task.",
      requireReason: true,
      confirmText: "Reject",
      variant: "destructive",
    });

    if (result.confirmed && result.reason) {
      rejectMutation.mutate({ taskId, reason: result.reason });
    }
  };

  // Safe filtering with comprehensive null checks
  const filteredTasks = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return [];

    return tasks.filter((task): task is Task => {
      // First check if task exists and has required properties
      if (!task) return false;
      if (typeof task.id !== 'string' || !task.id) return false;
      if (typeof task.title !== 'string' || !task.title) return false;

      // Then apply search filter
      if (!searchQuery || searchQuery.trim() === '') return true;

      try {
        return task.title.toLowerCase().includes(searchQuery.toLowerCase());
      } catch {
        return false;
      }
    });
  }, [tasks, searchQuery]);

  // Group tasks by workflowInstanceId
  const groupTasksByWorkflowInstanceId = (tasks: Task[]) => {
    const grouped = new Map<string, Task[]>();
    const ungrouped: Task[] = [];

    tasks.forEach(task => {
      if (task.workflowInstanceId) {
        const existing = grouped.get(task.workflowInstanceId);
        if (existing) {
          existing.push(task);
        } else {
          grouped.set(task.workflowInstanceId, [task]);
        }
      } else {
        ungrouped.push(task);
      }
    });

    return { grouped, ungrouped };
  };

  // Create renderable items (groups + individual tasks)
  const renderableItems = useMemo(() => {
    const { grouped, ungrouped } = groupTasksByWorkflowInstanceId(filteredTasks);

    const items: Array<{
      type: 'group' | 'single';
      id: string;
      data: Task | Task[];
      sortDate: Date;
    }> = [];

    // Add grouped items (all tasks with workflowInstanceId are grouped, even single ones)
    grouped.forEach((tasks, groupId) => {
      items.push({
        type: 'group',
        id: groupId,
        data: tasks,
        sortDate: new Date(tasks[0].createdAt || 0)
      });
    });

    // Add ungrouped items
    ungrouped.forEach(task => {
      items.push({
        type: 'single',
        id: task.id,
        data: task,
        sortDate: new Date(task.createdAt || 0)
      });
    });

    // Sort by most recent first
    items.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

    return items;
  }, [filteredTasks]);

  // Show only first 4 items (groups or individual tasks)
  const displayItems = useMemo(() => renderableItems.slice(0, 4), [renderableItems]);

  return (
    <>
      <Card className="flex flex-col h-full">
        <CardHeader>
          <TileHeader
            icon={<CheckSquare className="h-5 w-5 text-primary" />}
            title="My tasks"
            description="Quick actions for your most urgent tasks"
            count={filteredTasks?.length}
            isLoading={isLoading}
            infoTooltipText="Tasks assigned to you that require action, such as approvals, reviews, or certifications. Keeping these up to date helps maintain access accuracy and security compliance."
          />
        </CardHeader>

        <div className="px-6 pb-2">
          <Tabs value={approvalTab} onValueChange={(v) => setApprovalTab(v as typeof approvalTab)}>
            <IconTabs
              columns={2}
              tabs={[
                { value: 'pending', label: 'Pending', icon: Clock },
                { value: 'processed', label: 'Processed', icon: History },
              ]}
            />
          </Tabs>
        </div>

        <CardContent className="flex-1 overflow-hidden flex flex-col pt-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center py-8 text-destructive">
              <AlertCircle className="h-6 w-6 mb-2" />
              <p className="text-sm">Failed to load approvals</p>
            </div>
          )}
          {!isLoading && !error && (() => {
            // Filter displayItems by the active approval tab
            const tabFilteredItems = displayItems.filter((item) => {
              const status = item.type === 'group'
                ? (item.data as Task[])[0]?.status?.toLowerCase()
                : (item.data as Task).status?.toLowerCase();
              if (approvalTab === 'pending') return status === 'pending';
              return true;
            });

            if (tabFilteredItems.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  {approvalTab === 'pending' && <Clock className="h-6 w-6 mb-2" />}
                  <p className="text-sm">No {approvalTab} approvals</p>
                </div>
              );
            }

            return (
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {tabFilteredItems.map((item) => {
                  if (item.type === 'group') {
                    const groupTasks = item.data as Task[];
                    return (
                      <GroupedApprovalCard
                        key={item.id}
                        groupId={item.id}
                        tasks={groupTasks}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onViewDetails={(taskId) => setSelectedTaskId(taskId)}
                        approveMutationPending={approveMutation.isPending}
                        rejectMutationPending={rejectMutation.isPending}
                      />
                    );
                  }

                  const task = item.data as Task;
                  const isPending = task.status?.toLowerCase() === 'pending';


                  // border color based on approval status
                  const borderClass = approvalTab === 'processed' ? 'border-l-blue-500' : 'border-l-orange-500';

                  return (
                    <Card key={task.id} className={`p-3 transition-colors border-l-4 ${borderClass}`}>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
                            <div className="flex items-center gap-3 mt-1.5">
                              {task.approverType && (
                                <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 bg-blue-50">
                                  {task.approverType === 'MANAGER' ? 'Manager Approval' :
                                    task.approverType === 'ROLE_OWNER' ? 'Role Owner' :
                                      task.approverType === 'APP_OWNER' ? 'App Owner' :
                                        task.approverType.replace(/_/g, ' ')}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.createdAt && format(new Date(task.createdAt), "MMM dd, HH:mm")}
                              </span>
                              {task.priority && (
                                <Badge
                                  variant={
                                    task.priority === 'critical' || task.priority === 'high'
                                      ? 'destructive'
                                      : task.priority === 'medium' ? 'default' : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {task.priority}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setSelectedTaskId(task.id)}
                          >
                            Details
                          </Button>
                          {isPending && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                className="flex-1"
                                onClick={(e) => { e.stopPropagation(); handleApprove(task.id); }}
                                disabled={approveMutation.isPending || rejectMutation.isPending}
                              >
                                {approveMutation.isPending
                                  ? <Clock className="h-4 w-4 animate-spin" />
                                  : <><CheckCircle className="h-4 w-4 mr-1" />Approve</>}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="flex-1"
                                onClick={(e) => { e.stopPropagation(); handleReject(task.id); }}
                                disabled={approveMutation.isPending || rejectMutation.isPending}
                              >
                                {rejectMutation.isPending
                                  ? <Clock className="h-4 w-4 animate-spin" />
                                  : <><XCircle className="h-4 w-4 mr-1" />Reject</>}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            );
          })()}
        </CardContent>

        <div className="px-6 py-3">
          <Button
            variant="ghost"
            className="w-full justify-center hover:bg-accent"
            onClick={() => router.push("/responsibilities/tasks")}
          >
            View All Tasks
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </Card>

      {selectedTaskId && (
        <TaskDetailsModal
          taskId={selectedTaskId}
          open={!!selectedTaskId}
          onOpenChange={(open) => !open && setSelectedTaskId(null)}
        />
      )}

      <ConfirmDialog
        isOpen={isOpen}
        options={options}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};
