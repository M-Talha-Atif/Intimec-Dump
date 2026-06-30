'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle, XCircle, Clock, AlertTriangle, User, Calendar,
  Download, History, ClipboardList, Ban, ArrowLeft, ChevronLeft, ChevronRight
} from 'lucide-react';
import { fetchMyTasks, approveTask, rejectTask, Task } from '@/services/responsibilities';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from '@/components/ui/pagination';

import { useConfirm } from '@/hooks/useConfirm';
import { useAudit } from '@/hooks/useAudit';
import { useRbac } from '@/hooks/useRbac';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TaskDetailPanel } from '@/components/tasks/task-detail-panel';
import { GroupedApprovalCard } from '@/components/responsibilities/components/GroupedApprovalCard';
import TaskDetailsModal from '@/components/tasks/TaskDetailsModal';
import IconTabs from '@/components/shared/IconTabs';
import PageHeader from '@/components/shared/PageHeader';
import { ClipboardCheck } from "lucide-react";
import { ListControlsCard } from '../../shared/ListControlsCard';

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

export const TasksIndex = () => {
  // Main tab: 'all', 'pending', 'processed'
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'processed'>('pending');
  // Sub-filter for processed tab: 'all', 'approved', 'rejected', 'timeout'
  const [processedFilter, setProcessedFilter] = useState('all');
  // Filters for role and workflow
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [workflowFilter, setWorkflowFilter] = useState<string>('all');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Panel state for resizable side panel
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(700);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPageState, setItemsPerPageState] = useState(5);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { confirm, isOpen, options, handleConfirm, handleCancel } = useConfirm();
  const { logAction } = useAudit();
  const { can } = useRbac();
  const router = useRouter();

  // Get userId from cookie on mount
  useEffect(() => {
    setUserId(getUserIdFromCookie());
  }, []);

  // Reset to page 1 when tab or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, processedFilter, roleFilter, workflowFilter]);

  // Open/close panel when task is selected
  useEffect(() => {
    if (selectedTaskId) {
      setIsPanelOpen(true);
    } else {
      setIsPanelOpen(false);
    }
  }, [selectedTaskId]);

  // Close panel handler
  const handleClosePanel = () => {
    setSelectedTaskId(null);
    setIsPanelOpen(false);
  };

  // Determine API params based on active tab
  const getQueryParams = () => {
    if (activeTab === 'pending') return { status: 'pending', decision: undefined };
    if (activeTab === 'processed') return { status: 'processed', decision: processedFilter };
    return { status: 'all', decision: undefined };
  };

  const { status, decision } = getQueryParams();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', userId, activeTab, processedFilter],
    queryFn: () => fetchMyTasks(status, decision),
    enabled: !!userId, // Only fetch when userId is available
  });


  const getStatusIcon = (taskStatus: string) => {
    switch (taskStatus?.toLowerCase()) {
      case 'approved':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'timeout':
        return <Ban className="h-4 w-4 text-gray-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
  };

  const getStatusBadge = (taskStatus: string) => {
    switch (taskStatus?.toLowerCase()) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'timeout':
        return <Badge variant="secondary">Timed Out</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-orange-300 text-orange-700">Pending</Badge>;
      default:
        return <Badge variant="outline">{taskStatus}</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  // Mutations
  const approveMutation = useMutation({
    mutationFn: async ({ taskId, reason }: { taskId: string; reason: string }) => {
      await approveTask(taskId, reason);
      return { taskId, status: 'approved' };
    },
    onMutate: async ({ taskId }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', userId] });
      const previous = queryClient.getQueryData(['tasks', userId, activeTab, processedFilter]);

      queryClient.setQueryData(['tasks', userId, activeTab, processedFilter], (old: Task[] | undefined) =>
        old?.map(task => task.id === taskId ? { ...task, status: 'approved' as const } : task)
      );

      return { previous };
    },
    onSuccess: (data, variables) => {
      logAction({
        action: 'task.approve',
        entity: 'task',
        entityId: variables.taskId,
        reason: variables.reason,
      });
      toast({
        title: "Approved",
        description: "The request has been approved successfully.",
      });
      // Close panel if the approved task is currently open
      if (selectedTaskId === variables.taskId) {
        handleClosePanel();
      }
      // Invalidate task details to prevent stale data
      queryClient.invalidateQueries({ queryKey: ['task', 'details', variables.taskId] });
    },
    onError: (err, variables, context: any) => {
      queryClient.setQueryData(['tasks', userId, activeTab, processedFilter], context.previous);
      toast({
        title: "Approval Failed",
        description: "Failed to approve request. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ taskId, reason }: { taskId: string; reason: string }) => {
      await rejectTask(taskId, reason);
      return { taskId, status: 'rejected' };
    },
    onSuccess: (data, variables) => {
      logAction({
        action: 'task.reject',
        entity: 'task',
        entityId: variables.taskId,
        reason: variables.reason,
      });
      toast({
        title: "Rejected",
        description: "The request has been rejected.",
      });
      // Close panel if the rejected task is currently open
      if (selectedTaskId === variables.taskId) {
        handleClosePanel();
      }
      // Invalidate task details to prevent stale data
      queryClient.invalidateQueries({ queryKey: ['task', 'details', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
    },
    onError: () => {
      toast({
        title: "Rejection Failed",
        description: "Failed to reject request. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleApprove = async (taskId: string) => {
    if (!can('approve', 'task')) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to approve tasks.",
        variant: "destructive",
      });
      return;
    }

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
    if (!can('reject', 'task')) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to reject tasks.",
        variant: "destructive",
      });
      return;
    }

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

  // Helper to check if a task is processable (pending)
  const isTaskPending = (taskStatus: string) => taskStatus?.toLowerCase() === 'pending';

  // Get count badges
  const pendingCount = tasks?.filter(t => isTaskPending(t.status)).length ?? 0;
  const processedCount = tasks?.filter(t => !isTaskPending(t.status)).length ?? 0;

  // Extract unique role names and workflow names for filters
  const uniqueRoleNames = Array.from(
    new Set(
      (tasks || [])
        .map(t => t?.roleName)
        .filter((name): name is string => Boolean(name))
    )
  ).sort();

  const uniqueWorkflowNames = Array.from(
    new Set(
      (tasks || [])
        .map(t => t?.workflowName)
        .filter((name): name is string => Boolean(name))
    )
  ).sort();

  // Apply role and workflow filters
  // const filteredTasks = tasks?.filter(task => {
  //   const matchesRole = roleFilter === 'all' || task.roleName === roleFilter;
  //   const matchesWorkflow = workflowFilter === 'all' || task.workflowName === workflowFilter;
  //   return matchesRole && matchesWorkflow;
  // });


  const filteredTasks = tasks?.filter(task => {
    const matchesRole = roleFilter === 'all' || task.roleName === roleFilter;
    const matchesWorkflow = workflowFilter === 'all' || task.workflowName === workflowFilter;
    const matchesSearch = !searchQuery ||
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.requester?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesWorkflow && matchesSearch;
  });

  // Group tasks by workflowInstanceId
  const groupTasksByWorkflowInstance = (tasks: Task[]) => {
    const grouped = new Map<string, Task[]>();
    const ungrouped: Task[] = [];

    tasks.forEach(task => {
      if (task.workflowInstanceId) {
        const existing = grouped.get(task.workflowInstanceId) || [];
        grouped.set(task.workflowInstanceId, [...existing, task]);
      } else {
        ungrouped.push(task);
      }
    });

    return { grouped, ungrouped };
  };

  const { grouped: groupedTasks, ungrouped: ungroupedTasks } = groupTasksByWorkflowInstance(filteredTasks || []);

  // Create array of renderable items (groups + individual tasks)
  const renderableItems = [
    ...Array.from(groupedTasks.entries()).map(([groupId, tasks]) => ({
      type: 'group' as const,
      id: groupId,
      tasks,
      // Sort order: use earliest task's created date
      sortDate: tasks.reduce((earliest, task) => {
        const taskDate = new Date(task.createdAt || task.dueDate);
        return taskDate < earliest ? taskDate : earliest;
      }, new Date(tasks[0]?.createdAt || tasks[0]?.dueDate || Date.now())),
    })),
    ...ungroupedTasks.map(task => ({
      type: 'single' as const,
      id: task.id,
      task,
      sortDate: new Date(task.createdAt || task.dueDate || Date.now()),
    })),
  ].sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime()); // Most recent first

  // Pagination calculations (apply to renderable items)
  const totalPages = Math.ceil(renderableItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = renderableItems.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 p-4 lg:p-8 md:p-6">
      {/* Header */}
      <PageHeader
        title="My Tasks"
        description="Quick actions for your most urgent tasks"
        icon={<ClipboardCheck className="h-6 w-6 text-primary" />}
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </>
        }
      />

      {/* Main Tabs */}
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <div className="flex items-center justify-between flex-wrap gap-4">

            <IconTabs
              columns={3}
              tabs={[
                { value: 'all', label: 'All', icon: ClipboardList },
                { value: 'pending', label: 'Pending', icon: Clock },
                { value: 'processed', label: 'Processed', icon: History },
              ]}
            />
            {/* Filters */}
          </div>
        </Tabs>

        {/* Stats Summary */}
        {activeTab === 'all' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold text-orange-700">{pendingCount}</p>
                    <p className="text-xs text-orange-600">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold text-green-700">
                      {tasks?.filter(t => t.status?.toLowerCase() === 'approved').length ?? 0}
                    </p>
                    <p className="text-xs text-green-600">Approved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold text-red-700">
                      {tasks?.filter(t => t.status?.toLowerCase() === 'rejected').length ?? 0}
                    </p>
                    <p className="text-xs text-red-600">Rejected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Ban className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-2xl font-bold text-gray-700">
                      {tasks?.filter(t => t.status?.toLowerCase() === 'timeout').length ?? 0}
                    </p>
                    <p className="text-xs text-gray-600">Timed Out</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* List Controls Card — same pattern as CategoryTiles */}
      <ListControlsCard
        title="Approval Tasks"
        totalItems={renderableItems.length}
        displayCount={Math.min(endIndex, renderableItems.length)}
        itemLabel="tasks"
        searchQuery={searchQuery}
        onSearchChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
        searchPlaceholder="Search by title or requester..."
        searchTooltip="Search by task title or requester name"
        filters={[
          ...(uniqueRoleNames.length > 0 ? [{
            key: 'role',
            placeholder: 'All Roles',
            tooltip: 'Filter by approver role',
            options: [
              { label: 'All Roles', value: 'all' },
              ...uniqueRoleNames.map(r => ({ label: r, value: r })),
            ],
          }] : []),
          ...(uniqueWorkflowNames.length > 0 ? [{
            key: 'workflow',
            placeholder: 'All Workflows',
            tooltip: 'Filter by workflow',
            options: [
              { label: 'All Workflows', value: 'all' },
              ...uniqueWorkflowNames.map(w => ({ label: w, value: w })),
            ],
          }] : []),
          ...(activeTab === 'processed' ? [{
            key: 'decision',
            placeholder: 'All Decisions',
            tooltip: 'Filter by decision outcome',
            options: [
              { label: 'All Decisions', value: 'all' },
              { label: 'Approved', value: 'approved' },
              { label: 'Rejected', value: 'rejected' },
              { label: 'Timed Out', value: 'timeout' },
            ],
          }] : []),
        ]}
        filterValues={{ role: roleFilter, workflow: workflowFilter, decision: processedFilter }}
        onFilterChange={(key, value) => {
          if (key === 'role') setRoleFilter(value);
          if (key === 'workflow') setWorkflowFilter(value);
          if (key === 'decision') setProcessedFilter(value);
        }}
        pageSize={itemsPerPage}
        pageSizeLabel='Tasks per page:'
        pageSizeOptions={[5, 10, 20, 30, 50]}
        onPageSizeChange={(size) => { /* wire to itemsPerPage if you make it state */ }}
      />

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
  
          {filteredTasks?.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                {activeTab === 'pending' ? (
                  <>
                    <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-semibold">All caught up!</h3>
                    <p className="text-sm text-muted-foreground">You have no pending approvals.</p>
                  </>
                ) : activeTab === 'processed' ? (
                  <>
                    <History className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No history yet</h3>
                    <p className="text-sm text-muted-foreground">
                      {processedFilter !== 'all'
                        ? `No ${processedFilter} approvals found.`
                        : 'Your processed approvals will appear here.'}
                    </p>
                  </>
                ) : roleFilter !== 'all' || workflowFilter !== 'all' ? (
                  <>
                    <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No matching tasks</h3>
                    <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
                  </>
                ) : (
                  <>
                    <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No approvals</h3>
                    <p className="text-sm text-muted-foreground">No approval tasks found.</p>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {paginatedItems?.map((item) => {
            if (item.type === 'group') {
              // Render grouped approval card
              return (
                <GroupedApprovalCard
                  key={item.id}
                  groupId={item.id}
                  tasks={item.tasks}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onViewDetails={setSelectedTaskId}
                  approveMutationPending={approveMutation.isPending}
                  rejectMutationPending={rejectMutation.isPending}
                />
              );
            } else {
              // Render individual task card
              const task = item.task;
              return (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(task.status)}
                          <h3 className="font-semibold text-lg">{task.title}</h3>
                          {getStatusBadge(task.status)}
                          {task.approverType && (
                            <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
                              {task.approverType === 'MANAGER' ? 'Manager Approval' :
                                task.approverType === 'ROLE_OWNER' ? 'Role Owner' :
                                  task.approverType === 'APP_OWNER' ? 'App Owner' :
                                    task.approverType.replace(/_/g, ' ')}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                          <Badge variant="outline" className="capitalize">
                            {task.type?.replace('_', ' ') || 'Approval'}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Requested by: {task.requester?.name || 'Unknown'}
                          </span>
                          {isTaskPending(task.status) ? (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'N/A'}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Processed {task.respondedAt ? format(new Date(task.respondedAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                            </span>
                          )}
                          {task.priority && (
                            <Badge variant={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedTaskId(task.id)}>
                          View Details
                        </Button>
                        {isTaskPending(task.status) && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(task.id)}
                              disabled={approveMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(task.id)}
                              disabled={rejectMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }
          })}

          {/* Pagination */}
          {renderableItems && renderableItems.length > itemsPerPage && (
            <div className="flex justify-center pt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                  </PaginationItem>

                  {/* First page */}
                  {currentPage > 2 && (
                    <>
                      <PaginationItem>
                        <Button
                          variant={currentPage === 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(1)}
                        >
                          1
                        </Button>
                      </PaginationItem>
                      {currentPage > 3 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                    </>
                  )}

                  {/* Current page and neighbors */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page =>
                      page === currentPage ||
                      page === currentPage - 1 ||
                      page === currentPage + 1
                    )
                    .map(page => (
                      <PaginationItem key={page}>
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      </PaginationItem>
                    ))}

                  {/* Last page */}
                  {currentPage < totalPages - 1 && (
                    <>
                      {currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <Button
                          variant={currentPage === totalPages ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                        >
                          {totalPages}
                        </Button>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={isOpen}
        options={options}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      {/* Resizable Side Panel */}
      {isPanelOpen && (
        <div
          className="fixed top-0 right-0 h-full z-50 shadow-xl bg-background border-l"
          style={{ width: `${panelWidth}px` }}
        >
          {/* Resize Handle */}
          <div
            className="absolute left-0 top-0 w-2 h-full bg-muted hover:bg-muted/80 cursor-col-resize z-10 transition-colors flex items-center justify-center group"
            onMouseDown={(e) => {
              e.preventDefault();

              const handleMouseMove = (e: MouseEvent) => {
                const newWidth = window.innerWidth - e.clientX;
                // Constrain between 400px and 1200px
                if (newWidth >= 400 && newWidth <= 1200) {
                  setPanelWidth(newWidth);
                }
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <div className="w-0.5 h-8 bg-muted-foreground/60 group-hover:bg-muted-foreground transition-colors"></div>
          </div>

          <TaskDetailsModal
            taskId={selectedTaskId ?? undefined}
            open={isPanelOpen}
            onOpenChange={(open) => { if (!open) handleClosePanel(); }}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      )}
    </div>
  );
};
