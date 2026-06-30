"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import useRunTask from "@/hooks/tasks/useRunTask";
import useRunPreview from "@/hooks/tasks/useRunPreview";
import useTerminateTask from "@/hooks/tasks/useTerminateTask";
import usePauseTask from "@/hooks/tasks/usePauseTask";
import useResumeTask from "@/hooks/tasks/useResumeTask";
import useLatestTaskRun from "@/hooks/tasks/useLatestTaskRun";
import { Play, Eye, Square, Loader2, Trash, Pause } from "lucide-react";
import useDeleteTask from "@/hooks/applications/task/useDeleteTask";
import { useRouter } from "next/navigation";
import ConfirmActionDialog from "@/components/common/ConfirmActionDialog";
import { useTaskConfig } from "@/hooks/applications/task/useTaskConfig";
import { ExecutionStatus } from "@/types/task";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function TaskActionBar({
  taskid,
  appid,
}: {
  taskid: string;
  appid: string;
}) {
  const { runTask, isMutating: isStarting } = useRunTask(taskid);
  const { runPreview, isRunningPreview } = useRunPreview(taskid);
  const { terminateTask, isMutating: isTerminating } = useTerminateTask({ taskid });
  const { pauseTask, isMutating: isPausing } = usePauseTask({ taskid });
  const { resumeTask, isMutating: isResuming } = useResumeTask({ taskid });
  const { deleteTask } = useDeleteTask(appid, taskid);
  const { data: task, mutate: mutateTask } = useTaskConfig(appid, taskid);
  const { latestRun, mutate: mutateLatestRun } = useLatestTaskRun(taskid, {
    refreshInterval: 3000,
    revalidateOnFocus: false,
  });
  const router = useRouter();

  // Derive running/suspended state from the latest TaskRun (authoritative) and
  // the task entity (fast fallback).
  //
  // CRITICAL: If latestRun reports a terminal status (FAILED, COMPLETED, etc.),
  // that MUST win over a stale RUNNING on the task entity.
  // Without this, a task that fails while taskEntityStatus is still RUNNING
  // (due to JPA/Quartz threading) keeps showing Pause/Stop buttons forever.
  const taskEntityStatus = task?.executionStatus;
  const latestRunStatus = latestRun?.status;

  const TERMINAL_STATUSES = new Set([
    ExecutionStatus.COMPLETED,
    ExecutionStatus.FAILED,
    ExecutionStatus.SKIPPED,
    ExecutionStatus.CANCELLED,
  ]);
  const latestRunIsTerminal =
    latestRunStatus != null && TERMINAL_STATUSES.has(latestRunStatus);

  const isTaskRunning =
    !latestRunIsTerminal &&
    (latestRunStatus === ExecutionStatus.RUNNING ||
      taskEntityStatus === ExecutionStatus.RUNNING);
  const isTaskSuspended =
    !latestRunIsTerminal &&
    (latestRunStatus === ExecutionStatus.SUSPENDED ||
      taskEntityStatus === ExecutionStatus.SUSPENDED);

  // Page-leave guard while a task is actively running or paused.
  useEffect(() => {
    if (!isTaskRunning && !isTaskSuspended) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isTaskRunning]);

  const handleRunTask = async () => {
    try {
      const result = await runTask();
      // Pass the executionId so the running page can connect to the run-specific
      // SSE stream and poll for live stats — without it the generic task-level
      // stream has no correlation to the newly-started execution.
      const execParam = result?.executionId
        ? `?executionId=${result.executionId}`
        : "";
      toast.success("Task started", {
        description: "Connecting to live log stream…",
      });
      router.push(`/applications/${appid}/tasks/${taskid}/running${execParam}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to start task";
      toast.error("Failed to start task", { description: msg });
    }
  };

  const handleRunPreview = async () => {
    try {
      toast.info("Starting preview…", {
        description: "Generating a dry-run simulation. No data will be modified.",
      });
      const result = await runPreview();
      if (result?.executionId) {
        toast.success("Preview started", {
          description: "Connecting to live log stream…",
        });
        router.push(
          `/applications/${appid}/tasks/${taskid}/running?executionId=${result.executionId}`,
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to start preview";
      toast.error("Preview failed", { description: msg });
    }
  };

  const handleStop = async () => {
    try {
      await terminateTask();
      await mutateTask();
      await mutateLatestRun();
      toast.success("Task cancelled", {
        description:
          "A cancellation signal was sent. The task will stop at the next batch boundary.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to terminate task";
      toast.error("Failed to stop task", { description: msg });
    }
  };

  const handlePause = async () => {
    try {
      await pauseTask();
      await mutateTask();
      await mutateLatestRun();
      toast.info("Task paused", {
        description: "The task will pause at the next batch boundary.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to pause task";
      toast.error("Failed to pause task", { description: msg });
    }
  };

  const handleResume = async () => {
    try {
      await resumeTask();
      await mutateTask();
      await mutateLatestRun();
      toast.success("Task resumed", {
        description: "The task will continue processing from where it paused.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resume task";
      toast.error("Failed to resume task", { description: msg });
    }
  };

  return (
    <TooltipProvider>
      <>
        {(isTaskRunning || isTaskSuspended) ? (
          <>
            {/* Pause button — only shown while actively running */}
            {isTaskRunning && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={handlePause}
                    disabled={isPausing}
                  >
                    {isPausing ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Pause />
                    )}
                    {isPausing ? "Pausing…" : "Pause Task"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs text-xs">
                  Pauses the task at the next batch boundary. No data will be
                  partially committed — the current batch completes first.
                </TooltipContent>
              </Tooltip>
            )}

            {/* Resume button — only shown while suspended */}
            {isTaskSuspended && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    onClick={handleResume}
                    disabled={isResuming}
                  >
                    {isResuming ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Play />
                    )}
                    {isResuming ? "Resuming…" : "Resume Task"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs text-xs">
                  Resumes processing from the last completed batch.
                </TooltipContent>
              </Tooltip>
            )}

            {/* Stop button — always shown when task is in-flight or paused */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <ConfirmActionDialog
                    title="Cancel Task"
                    description="A cancellation signal will be sent. The task will stop at the next batch boundary — any batches already committed are permanent. This also removes the task from the scheduler."
                    confirmText="Cancel Task"
                    cancelText="Keep Running"
                    confirmAction={handleStop}
                    destructive={true}
                  >
                    <Button variant="destructive" disabled={isTerminating}>
                      {isTerminating ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Square className="fill-current" />
                      )}
                      {isTerminating ? "Stopping…" : "Stop Task"}
                    </Button>
                  </ConfirmActionDialog>
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs text-xs">
                Signals the task to stop at the next batch boundary and removes
                it from the scheduler.
              </TooltipContent>
            </Tooltip>
          </>
        ) : (
          <ConfirmActionDialog
            title="Run Task"
            description="Are you sure you want to run this task manually?"
            confirmAction={handleRunTask}
          >
            <Button disabled={isStarting || isRunningPreview}>
              {isStarting ? <Loader2 className="animate-spin" /> : <Play />}
              {isStarting ? "Starting…" : "Run Task"}
            </Button>
          </ConfirmActionDialog>
        )}

        <Button
          variant="outline"
          onClick={handleRunPreview}
          disabled={isRunningPreview || isStarting || isTaskRunning || isTaskSuspended}
        >
          {isRunningPreview ? <Loader2 className="animate-spin" /> : <Eye />}
          {isRunningPreview ? "Running Preview…" : "Run Preview"}
        </Button>

        <ConfirmActionDialog
          title="Delete Task"
          description="Are you sure you want to delete this task? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          confirmAction={async () => {
            await deleteTask();
            router.push(`/applications/${appid}/tasks`);
          }}
          destructive={true}
        >
          <Button variant="destructive" disabled={isTaskRunning || isTaskSuspended}>
            <Trash />
            Delete Task
          </Button>
        </ConfirmActionDialog>
      </>
    </TooltipProvider>
  );
}
