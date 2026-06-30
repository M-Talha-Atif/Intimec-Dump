import { TaskLog } from "@/types/task";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_LINES_NUM = 500;

/**
 * Streams task logs via Server-Sent Events.
 *
 * Two modes:
 *  - Live monitoring (no executionId): uses the task-level stream
 *    `/api/tasks/{taskId}/logs/stream` - suitable for watching an active run.
 *  - Historical replay (with executionId): uses the execution-scoped stream
 *    `/api/tasks/{taskId}/runs/{executionId}/logs/stream` - replays logs for
 *    a specific completed (or in-progress) execution.
 *
 * Backend SSE contract (TaskManagementConstants):
 *   - "connected" : handshake confirmation - no action needed
 *   - "log"       : a TaskLogStreamResponse payload
 *   - "complete"  : stream finished (task ended or stream timed out)
 *
 * There is NO server-side pause for in-flight executions.
 * pause/resume via TaskController only affect the Quartz scheduler trigger
 * (future scheduled fires), not the currently running thread.
 */
export default function useLiveTask(
  taskid: string,
  logLevels: TaskLog["level"][],
  linesNum?: number,
  search?: string,
  executionid?: string,
) {
  // When there is no executionId there is nothing to stream.
  // Return a stable idle state immediately — do not open an SSE connection.
  const hasExecution = Boolean(executionid);

  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logsUnavailable, setLogsUnavailable] = useState(false);

  // retryKey is incremented to re-trigger the connect useEffect without a
  // self-referential callback (avoids "connect is not defined" bundler errors).
  const [retryKey, setRetryKey] = useState(0);

  // Ref so the onerror closure always reads the latest completed state
  // without stale-closure bugs.
  const isCompleteRef = useRef(false);
  const evtSourceRef = useRef<EventSource | null>(null);
  // How many automatic retries have been attempted since last successful connect.
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;

  const url = useMemo(() => {
    const params = new URLSearchParams();
    logLevels.forEach((level) => params.append("log_level", level));
    if (linesNum) params.append("lines_limit", linesNum.toString());
    if (search) params.append("search", search);
    const base = executionid
      ? `/api/tasks/${taskid}/runs/${executionid}/logs/stream`
      : `/api/tasks/${taskid}/logs/stream`;
    return `${base}?${params.toString()}`;
  }, [taskid, executionid, logLevels, linesNum, search]);

  // Reset all state whenever the target stream changes.
  useEffect(() => {
    setLogs([]);
    setIsComplete(false);
    isCompleteRef.current = false;
    setHasError(false);
    setErrorMessage(null);
    setLogsUnavailable(false);
    retryCountRef.current = 0;
  }, [taskid, executionid, logLevels, search]);

  const connect = useCallback(() => {
    evtSourceRef.current?.close();

    const es = new EventSource(url);
    evtSourceRef.current = es;

    es.addEventListener("log", (event) => {
      try {
        const entry = JSON.parse((event as MessageEvent).data) as TaskLog;
        setLogs((prev) =>
          [...prev, entry].slice(-(linesNum ?? DEFAULT_LINES_NUM)),
        );
      } catch {
        // Ignore malformed payloads - do not crash the stream.
      }
    });

    es.addEventListener("complete", (event) => {
      isCompleteRef.current = true;
      const data = (event as MessageEvent).data as string | undefined;
      const msg =
        data && data !== "Stream completed" ? data : "Task completed.";
      const entry: TaskLog = {
        timestamp: Date.now(),
        level: "INFO",
        message: msg,
        isLastMessage: true,
      };
      setLogs((prev) =>
        [...prev, entry].slice(-(linesNum ?? DEFAULT_LINES_NUM)),
      );
      setIsComplete(true);
      es.close();
    });

    // logs_unavailable: the execution is complete but its OpenSearch index has expired.
    // Do NOT inject a fake log entry — instead surface the structured summary via
    // logsUnavailable state so the UI can render a proper fallback card.
    es.addEventListener("logs_unavailable", () => {
      isCompleteRef.current = true;
      setLogsUnavailable(true);
      setIsComplete(true);
      es.close();
    });

    // stream_timeout is sent when the SSE poller gives up after 5 minutes of
    // silence because the task is HUNG (no new logs) but still RUNNING in the
    // backend. This must NOT set isComplete — the task has not finished.
    es.addEventListener("stream_timeout", (event) => {
      const data = (event as MessageEvent).data as string | undefined;
      const entry: TaskLog = {
        timestamp: Date.now(),
        level: "WARN",
        message: data ?? "Stream timed out — task may still be running. Check History for the final status.",
        isLastMessage: false,
      };
      setLogs((prev) =>
        [...prev, entry].slice(-(linesNum ?? DEFAULT_LINES_NUM)),
      );
      // Signal as a stream error so the UI shows the "Stream interrupted" banner
      // instead of the green "Execution complete" banner.
      setHasError(true);
      setErrorMessage(
        "Log stream timed out — no new output for 5 minutes. The task may still be running in the background.",
      );
      es.close();
    });

    es.addEventListener("connected", () => {});

    es.onerror = () => {
      if (isCompleteRef.current) {
        es.close();
        return;
      }
      es.close();
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        const delayMs = retryCountRef.current * 2000;
        setTimeout(() => setRetryKey((k) => k + 1), delayMs);
        return;
      }
      setHasError(true);
      setErrorMessage(
        "Lost connection to the task stream. The task may still be running - check the History tab.",
      );
      const entry: TaskLog = {
        timestamp: Date.now(),
        level: "WARN",
        message:
          "Stream connection lost. The task may still be running - view History for the final status.",
        isLastMessage: true,
      };
      setLogs((prev) =>
        [...prev, entry].slice(-(linesNum ?? DEFAULT_LINES_NUM)),
      );
    };
  }, [url, linesNum]);

  useEffect(() => {
    if (!hasExecution) return; // no-op: nothing to connect to
    connect();
    return () => {
      evtSourceRef.current?.close();
    };
    // retryKey is intentionally included so the retry backoff re-runs this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connect, retryKey, hasExecution]);

  return { logs, isComplete, hasError, errorMessage, logsUnavailable };
}