import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyTasks, Task } from "@/services/responsibilities";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/hooks/useConfirm";
import { useAudit } from "@/hooks/useAudit";
import { useRbac } from "@/hooks/useRbac";
import { useSodCheck } from "@/hooks/useSodCheck";

export function useTasks(
  globalSearch: string,
  statusFilter: string,
  typeFilter: string,
) {
  const [sodFindings, setSodFindings] = useState<any[]>([]);
  const [showSodWarning, setShowSodWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    taskId: string;
    action: string;
  } | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const { logAction } = useAudit();
  const { checkSod } = useSodCheck();
  const { can } = useRbac();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", "me", statusFilter],
    queryFn: () => fetchMyTasks(statusFilter),
  });

  const filteredTasks = tasks?.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(globalSearch.toLowerCase());
    const matchesType =
      typeFilter === "all" || task.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Mutations
  const approveMutation = useMutation({
    mutationFn: async ({ taskId }: { taskId: string; reason: string }) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { taskId, status: "completed" };
    },
    onMutate: async ({ taskId }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", "me"] });
      const previous = queryClient.getQueryData([
        "tasks",
        "me",
        statusFilter,
      ]);

      queryClient.setQueryData(
        ["tasks", "me", statusFilter],
        (old: Task[] | undefined) =>
          old?.map((task) =>
            task.id === taskId
              ? { ...task, status: "completed" as const }
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
        title: "Task Approved",
        description: "The task has been approved successfully.",
      });
    },
    onError: (err, variables, context: any) => {
      queryClient.setQueryData(
        ["tasks", "me", statusFilter],
        context.previous,
      );
      toast({
        title: "Approval Failed",
        description: "Failed to approve task. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "me"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ taskId }: { taskId: string; reason: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
        title: "Task Rejected",
        description: "The task has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["tasks", "me"] });
    },
    onError: () => {
      toast({
        title: "Rejection Failed",
        description: "Failed to reject task. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleApprove = async (taskId: string) => {
    if (!can("approve", "task")) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to approve tasks.",
        variant: "destructive",
      });
      return;
    }

    const sodResult = await checkSod({ action: "approve", roleIds: [taskId] });

    if (sodResult.hasFindings) {
      setSodFindings(sodResult.findings);
      setShowSodWarning(true);
      setPendingAction({ taskId, action: "approve" });
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

  const handleSodProceed = async () => {
    setShowSodWarning(false);
    if (!pendingAction) return;

    const result = await confirm({
      title: `${pendingAction.action === "approve" ? "Approve" : "Reject"} Task`,
      description: "Please provide a reason for this action.",
      requireReason: true,
      confirmText: pendingAction.action === "approve" ? "Approve" : "Reject",
    });

    if (result.confirmed && result.reason) {
      if (pendingAction.action === "approve") {
        approveMutation.mutate({
          taskId: pendingAction.taskId,
          reason: result.reason,
        });
      }
    }
    setPendingAction(null);
  };

  const handleSodCancel = () => {
    setShowSodWarning(false);
    setPendingAction(null);
  };

  return {
    tasks,
    filteredTasks,
    isLoading,
    actions: {
      handleApprove,
      handleReject,
      handleSodProceed,
      handleSodCancel,
    },
    mutationStates: {
      isApproving: approveMutation.isPending,
      isRejecting: rejectMutation.isPending,
    },
    sodState: {
      sodFindings,
      showSodWarning,
    },
  };
}
