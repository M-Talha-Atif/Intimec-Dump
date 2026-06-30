"use client";

import { TaskLog, taskLogLevel } from "@/types/task";
import useLiveTask from "@/hooks/applications/task/useLiveTask";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import TaskRender from "./task-render/TaskRender";
import PreviewDetailsView from "./task-render/PreviewDetailsView";
import type { PreviewDetails } from "./task-render/PreviewDetailsView";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, History, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import useTaskRun from "@/hooks/tasks/useTaskRun";
import useLatestTaskRun from "@/hooks/tasks/useLatestTaskRun";
import { ExecutionStatus } from "@/types/task";

export default function TaskLivePreview({
  appid,
  taskid,
  executionId,
}: {
  appid: string;
  taskid: string;
  executionId?: string;
}) {
  const router = useRouter();
  const [logLevels, setLogLevels] = useState<TaskLog["level"][]>([
    ...taskLogLevel,
  ]);
  const [linesNum, setLinesNum] = useState(500);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [isLogPaused, setIsLogPaused] = useState(false);

  const { logs, isComplete, hasError, errorMessage, logsUnavailable } = useLiveTask(
    taskid,
    logLevels,
    linesNum,
    debouncedSearch,
    executionId,
  );

  // Poll the run endpoint every 3 s. Only active when we have an executionId
  // (useTaskRun returns null key otherwise so no fetch is made).
  // Keep polling until the backend marks the run terminal — this ensures final
  // KPI stats are captured even when SSE closes a moment before the DB write.
  const { data: liveRun, mutate: refreshRun } = useTaskRun(
    taskid,
    executionId ?? null,
    {
      refreshInterval: executionId ? 3000 : 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  // When the Running tab is opened without an executionId (e.g. user navigated
  // away and came back via the sidebar), fetch the latest run and redirect to it
  // if it is still active (RUNNING or SUSPENDED). This restores the live view
  // instead of showing "No active execution".
  const { latestRun: fallbackRun } = useLatestTaskRun(
    taskid,
    { refreshInterval: executionId ? 0 : 3000 }, // only poll when no executionId
  );
  useEffect(() => {
    if (!executionId && fallbackRun?.executionId) {
      const isActive =
        fallbackRun.status === ExecutionStatus.RUNNING ||
        fallbackRun.status === ExecutionStatus.SUSPENDED;
      if (isActive) {
        router.replace(
          `/applications/${appid}/tasks/${taskid}/running?executionId=${fallbackRun.executionId}`,
        );
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executionId, fallbackRun?.executionId, fallbackRun?.status]);

  const runIsTerminal =
    liveRun?.status === ExecutionStatus.COMPLETED ||
    liveRun?.status === ExecutionStatus.SKIPPED ||
    liveRun?.status === ExecutionStatus.FAILED ||
    liveRun?.status === ExecutionStatus.CANCELLED;
  // SUSPENDED is intentionally excluded: task is paused, not finished — keep polling.

  // Snapshot the elapsed duration the moment the run transitions to SUSPENDED so the
  // duration KPI counter freezes rather than growing while the task is paused.
  const [pausedDurationMs, setPausedDurationMs] = useState<number | null>(null);
  useEffect(() => {
    if (liveRun?.status === ExecutionStatus.SUSPENDED) {
      if (pausedDurationMs === null && liveRun.startTime != null && liveRun.durationMs == null) {
        setPausedDurationMs(Date.now() - liveRun.startTime);
      }
    } else if (pausedDurationMs !== null) {
      setPausedDurationMs(null); // Reset when resumed or terminal
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveRun?.status, liveRun?.startTime, liveRun?.durationMs]);

  // When paused, inject the frozen duration so TaskRender shows a stable value.
  const reportForRender =
    liveRun?.status === ExecutionStatus.SUSPENDED && pausedDurationMs != null
      ? { ...liveRun, durationMs: pausedDurationMs }
      : liveRun ?? null;

  // Once backend confirms terminal, freeze the cache — no more polling.
  useEffect(() => {
    if (runIsTerminal) {
      refreshRun(undefined, { revalidate: false });
    }
  }, [runIsTerminal, refreshRun]);

  // When SSE fires "complete", do one immediate refresh to capture final stats
  // without waiting for the next 3-second tick.
  useEffect(() => {
    if (isComplete) {
      refreshRun();
    }
  }, [isComplete, refreshRun]);

  // Page-leave guard: only active while execution is truly in-flight.
  useEffect(() => {
    if (!executionId || isComplete || hasError || runIsTerminal) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [executionId, isComplete, hasError, runIsTerminal]);

  useEffect(() => {
    if (isComplete) {
      toast.success("Task completed", {
        description: "The task finished successfully.",
      });
    }
  }, [isComplete]);

  useEffect(() => {
    if (hasError && !runIsTerminal) {
      toast.error("Stream interrupted", {
        description:
          errorMessage ?? "Check the History tab for the final status.",
      });
    }
  }, [hasError, errorMessage, runIsTerminal]);

  // ── Derived state ─────────────────────────────────────────────────────────
  const isDone = isComplete || runIsTerminal;
  const isFailed = liveRun?.status === ExecutionStatus.FAILED;
  const isStreamLost = hasError && !runIsTerminal;

  // Parse execution/preview details when the run is done and has them
  const executionDetails = useMemo<PreviewDetails | null>(() => {
    if (!isDone || !liveRun?.previewDetails) return null;
    try {
      return JSON.parse(liveRun.previewDetails) as PreviewDetails;
    } catch {
      return null;
    }
  }, [isDone, liveRun?.previewDetails]);

  // ── No execution — show a clean empty state ───────────────────────────────
  if (!executionId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 p-8 text-center">
        <div className="rounded-full bg-muted p-6">
          <Play className="size-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">No active execution</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            This task is not currently running. Use the{" "}
            <strong>Run Task</strong> button to start a new execution and
            watch the live log stream here.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/applications/${appid}/tasks/${taskid}/history`)
            }
          >
            <History className="size-4 mr-1.5" />
            View History
          </Button>
        </div>
      </div>
    );
  }

  const detailsContent = executionDetails ? (
    <PreviewDetailsView details={executionDetails} />
  ) : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="px-4">
      {/* ── Completion banner ── */}
      {isDone && !isFailed && (
        <div className="mt-2 flex items-center gap-2 rounded-md border border-green-300 bg-green-50 dark:bg-green-950/20 px-3 py-2 text-sm text-green-700 dark:text-green-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Execution complete — no further updates will arrive.</span>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto h-7 text-green-700 hover:bg-green-100 text-xs"
            onClick={() =>
              router.push(
                `/applications/${appid}/tasks/${taskid}/history/${executionId}`,
              )
            }
          >
            <History className="size-3 mr-1" />
            View in History
          </Button>
        </div>
      )}

      {/* ── Failure banner ── */}
      {isFailed && (
        <div className="mt-2 flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{liveRun?.errorMessage ?? "The task encountered an error and was stopped."}</span>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto h-7 text-destructive text-xs"
            onClick={() =>
              router.push(
                `/applications/${appid}/tasks/${taskid}/history/${executionId}`,
              )
            }
          >
            <History className="size-3 mr-1" />
            View in History
          </Button>
        </div>
      )}

      {/* ── Stream lost ── */}
      {isStreamLost && (
        <div className="mt-2 flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage ?? "Live stream disconnected. The task may still be running."}</span>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto h-7 text-destructive text-xs"
            onClick={() =>
              router.push(
                `/applications/${appid}/tasks/${taskid}/history`,
              )
            }
          >
            <History className="size-3 mr-1" />
            Check History
          </Button>
        </div>
      )}

      {/* ── In-progress banner ── */}
      {!isDone && !isFailed && !isStreamLost && liveRun?.status !== ExecutionStatus.SUSPENDED && (
        <div className="mt-2 flex items-center gap-2 rounded-md border border-blue-300 bg-blue-50 dark:bg-blue-950/20 px-3 py-2 text-sm text-blue-700 dark:text-blue-300">
          <AlertCircle className="h-4 w-4 shrink-0 animate-pulse" />
          <span>Live log stream is active. Navigating away will not stop the task.</span>
        </div>
      )}

      {/* ── Paused banner ── */}
      {liveRun?.status === ExecutionStatus.SUSPENDED && (
        <div className="mt-2 flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20 px-3 py-2 text-sm text-yellow-700 dark:text-yellow-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Task paused. Use <strong>Resume Task</strong> to continue or <strong>Stop Task</strong> to cancel.</span>
        </div>
      )}
      </div>

      <TaskRender
        report={reportForRender}
        logs={logs}
        paused={isLogPaused}
        resume={() => setIsLogPaused(false)}
        pause={() => setIsLogPaused(true)}
        linesNum={linesNum}
        setLinesNum={setLinesNum}
        logLevels={logLevels}
        setLogLevels={setLogLevels}
        search={search}
        setSearch={setSearch}
        id={taskid}
        isPreview={liveRun?.preview}
        previewContent={detailsContent}
        isComplete={isDone}
        logsUnavailable={logsUnavailable}
      />
    </div>
  );
}
