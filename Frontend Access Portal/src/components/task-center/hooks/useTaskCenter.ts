import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTaskScheduling } from "@/hooks/useTaskScheduling";
import {
  fetchMyTasks,
  approveTask,
  rejectTask,
  Task,
} from "@/services/responsibilities";
import { TaskFilters } from "../types";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/hooks/useConfirm";
import { useAudit } from "@/hooks/useAudit";
import { useRbac } from "@/hooks/useRbac";

// Helper to get userId from auth_token cookie
function getUserIdFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("auth_token="));
  if (!cookie) return null;
  try {
    const token = cookie.split("=")[1];
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId || payload.sub || null;
  } catch {
    return null;
  }
}

export const useTaskCenter = () => {
  const { scheduledTasks, taskExecutions } = useTaskScheduling();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { confirm, isOpen, options, handleConfirm, handleCancel } =
    useConfirm();
  const { logAction } = useAudit();
  const { can } = useRbac();

  // State
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState("overview");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // Main tab: 'all', 'pending', 'processed'
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "processed">(
    "pending",
  );
  // Sub-filter for processed tab
  const [processedFilter, setProcessedFilter] = useState("all");

  // Pagination state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // Get userId from cookie on mount
  useEffect(() => {
    setUserId(getUserIdFromCookie());
  }, []);

  // Fetch real tasks data
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", userId, activeTab, processedFilter],
    queryFn: () => fetchMyTasks(),
    enabled: !!userId,
  });

  // Filter tasks based on search term and filters
  const filteredTasks = tasks.filter((task) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        task.title?.toLowerCase().includes(searchLower) ||
        task.id?.toLowerCase().includes(searchLower) ||
        task.roleName?.toLowerCase().includes(searchLower) ||
        task.workflowName?.toLowerCase().includes(searchLower) ||
        task.requester?.name?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(task.status)) return false;
    }

    // Type filter
    if (filters.type && filters.type.length > 0) {
      if (!filters.type.includes(task.type)) return false;
    }

    return true;
  });

  // Pagination calculations
  const totalElements = filteredTasks.length;
  const totalPages = Math.ceil(totalElements / size);
  const paginatedTasks = filteredTasks.slice(page * size, (page + 1) * size);

  // Reset to first page when filters change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(0); // Reset to first page when size changes
  };

  // Calculate metrics from real data
  const calculateMetrics = (taskList: Task[]) => {
    const totalTasks = taskList.length;
    const pendingTasks = taskList.filter((t) => t.status === "pending").length;
    const approvedTasks = taskList.filter(
      (t) => t.status === "approved",
    ).length;
    const rejectedTasks = taskList.filter(
      (t) => t.status === "rejected",
    ).length;
    const completedTasks = taskList.filter(
      (t) => t.status === "completed",
    ).length;

    return {
      totalTasks,
      pendingTasks,
      approvedTasks,
      rejectedTasks,
      completedTasks,
      failedTasks: rejectedTasks,
      runningTasks: 0,
      overdueCount: 0,
      failureRate:
        totalTasks > 0
          ? ((rejectedTasks / totalTasks) * 100).toFixed(1)
          : "0.0",
    };
  };

  const metrics = calculateMetrics(tasks);

  // Mutations for approve/reject
  const approveMutation = useMutation({
    mutationFn: async ({
      taskId,
      reason,
    }: {
      taskId: string;
      reason: string;
    }) => {
      await approveTask(taskId, reason);
      return { taskId, status: "approved" };
    },
    onMutate: async ({ taskId }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", userId] });
      const previous = queryClient.getQueryData([
        "tasks",
        userId,
        activeTab,
        processedFilter,
      ]);

      queryClient.setQueryData(
        ["tasks", userId, activeTab, processedFilter],
        (old: Task[] | undefined) =>
          old?.map((task) =>
            task.id === taskId
              ? { ...task, status: "approved" as const }
              : task,
          ),
      );

      return { previous };
    },
    onSuccess: (data, variables) => {
      logAction({
        action: "task.approve",
        entity: "task",
        entityId: variables.taskId,
        reason: variables.reason,
      });
      toast({
        title: "Approved",
        description: "The request has been approved successfully.",
      });
      // Close panel if the approved task is currently open
      if (selectedTaskId === variables.taskId) {
        setSelectedTaskId(null);
      }
      // Invalidate task details to prevent stale data
      queryClient.invalidateQueries({
        queryKey: ["task", "details", variables.taskId],
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err, variables, context: any) => {
      queryClient.setQueryData(
        ["tasks", userId, activeTab, processedFilter],
        context.previous,
      );
      toast({
        title: "Approval Failed",
        description: "Failed to approve request. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({
      taskId,
      reason,
    }: {
      taskId: string;
      reason: string;
    }) => {
      await rejectTask(taskId, reason);
      return { taskId, status: "rejected" };
    },
    onSuccess: (data, variables) => {
      logAction({
        action: "task.reject",
        entity: "task",
        entityId: variables.taskId,
        reason: variables.reason,
      });
      toast({
        title: "Rejected",
        description: "The request has been rejected.",
      });
      // Close panel if the rejected task is currently open
      if (selectedTaskId === variables.taskId) {
        setSelectedTaskId(null);
      }
      // Invalidate task details to prevent stale data
      queryClient.invalidateQueries({
        queryKey: ["task", "details", variables.taskId],
      });
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
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
  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const handleSelectionChange = (newSelection: string[]) => {
    setSelectedTasks(newSelection);
  };

  const handleApprove = async (taskId: string) => {
    if (!can("approve", "task")) {
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
    if (!can("reject", "task")) {
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

  const handleBulkAction = (
    taskIds: string[],
    action: string,
    additionalData?: Record<string, unknown>,
  ) => {
    console.log(
      `Bulk action: ${action} on tasks ${taskIds.join(", ")}`,
      additionalData,
    );
    // Handle bulk actions here
  };

  const handleFilterChange = (newFilters: TaskFilters) => {
    console.log("Filters changed:", newFilters);
    setFilters(newFilters);
  };

  const handleSearchChange = (newSearchTerm: string) => {
    console.log("Search term changed:", newSearchTerm);
    setSearchTerm(newSearchTerm);
  };

  const clearSelection = () => setSelectedTasks([]);
  const closeDetailPanel = () => setSelectedTaskId(null);

  return {
    // Data
    scheduledTasks,
    taskExecutions,
    tasks,
    filteredTasks,
    paginatedTasks,
    metrics,
    isLoading,

    // Pagination
    page,
    size,
    totalElements,
    totalPages,
    handlePageChange,
    handleSizeChange,

    // UI State
    selectedTasks,
    selectedTaskId,
    showFilters,
    setShowFilters,
    activeView,
    setActiveView,
    activeTab,
    setActiveTab,
    processedFilter,
    setProcessedFilter,
    showSettingsModal,
    setShowSettingsModal,
    showInsightsModal,
    setShowInsightsModal,
    filters,
    searchTerm,

    // Confirm Dialog State
    confirmDialog: {
      isOpen,
      options,
      handleConfirm,
      handleCancel,
    },

    // Mutations
    approveMutation,
    rejectMutation,

    // Handlers
    handleTaskSelect,
    handleSelectionChange,
    handleApprove,
    handleReject,
    handleBulkAction,
    handleFilterChange,
    handleSearchChange,
    clearSelection,
    closeDetailPanel,
  };
};
