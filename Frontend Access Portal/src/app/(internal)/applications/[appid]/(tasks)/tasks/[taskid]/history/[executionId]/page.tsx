"use client";
import TaskRender from "@/components/applications/tasks/task-render/TaskRender";
import PreviewDetailsView from "@/components/applications/tasks/task-render/PreviewDetailsView";
import type { PreviewDetails } from "@/components/applications/tasks/task-render/PreviewDetailsView";
import useTaskRun from "@/hooks/tasks/useTaskRun";
import { TaskLog, taskLogLevel } from "@/types/task";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import useLiveTask from "@/hooks/applications/task/useLiveTask";
import { useDebounce } from "@/hooks/useDebounce";

const resume = () => {};
const pause = () => {};

export default function Page() {
  const { taskid, executionId } = useParams();
  const { data: report } = useTaskRun(taskid as string, executionId as string);
  const [logLevels, setLogLevels] = useState<TaskLog["level"][]>([
    ...taskLogLevel,
  ]);
  const [linesNum, setLinesNum] = useState(500);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const { logs, logsUnavailable } = useLiveTask(
    taskid as string,
    logLevels,
    linesNum,
    debouncedSearch,
    executionId as string,
  );

  // Parse execution/preview details for any run that has them
  const executionDetails = useMemo<PreviewDetails | null>(() => {
    if (!report?.previewDetails) return null;
    try {
      return JSON.parse(report.previewDetails) as PreviewDetails;
    } catch {
      return null;
    }
  }, [report?.previewDetails]);

  const isPreview = !!report?.preview;
  const detailsContent = executionDetails ? (
    <PreviewDetailsView details={executionDetails} />
  ) : null;

  return (
    <TaskRender
      report={report || null}
      logs={isPreview ? [] : logs}
      paused={false}
      resume={resume}
      pause={pause}
      linesNum={linesNum}
      setLinesNum={setLinesNum}
      logLevels={logLevels}
      setLogLevels={setLogLevels}
      search={search}
      setSearch={setSearch}
      id={executionId as string}
      isPreview={isPreview}
      previewContent={detailsContent}
      isComplete={true}
      logsUnavailable={logsUnavailable}
    />
  );
}
