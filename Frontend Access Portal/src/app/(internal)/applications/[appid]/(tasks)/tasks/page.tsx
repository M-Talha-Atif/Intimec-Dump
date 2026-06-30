"use client";
import AddNewTask from "@/components/applications/tasks/AddNewTask";
import ConfirmActionDialog from "@/components/common/ConfirmActionDialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  StickyTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useDeleteTask from "@/hooks/applications/task/useDeleteTask";
import useTasks from "@/hooks/applications/task/useTasks";
import { ExecutionStatus, executionStatusColors, Task } from "@/types/task";
import { formatTimestamp } from "@/utils/dateFormat";
import { History, Loader2, Trash, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import CustomBadge from "@/components/applications/common/CustomBadge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useSWR from "swr";
import { getFetcher } from "@/hooks/applications/fetcher";
import { TaskRun } from "@/types/task";

export default function Page() {
  const { appid } = useParams();
  const { tasks, isLoading, error } = useTasks(appid as string);

  const t = useTranslations("ApplicationsPage.Import.tasks-list");

  const runningTasks = tasks?.filter(
    (t) =>
      t.executionStatus === ExecutionStatus.RUNNING ||
      t.executionStatus === ExecutionStatus.WAITING
  );

  return (
    <div className="mx-8 space-y-4 w-full">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <AddNewTask appid={appid as string} />
      </header>

      {(runningTasks?.length ?? 0) > 0 && (
        <Alert className="border-blue-300 bg-blue-50 dark:bg-blue-950/20">
          <Play className="h-4 w-4 text-blue-600 animate-pulse" />
          <AlertDescription className="text-blue-700">
            {runningTasks!.length === 1
              ? `"${runningTasks![0].name}" is currently running.`
              : `${runningTasks!.length} tasks are currently running.`}{" "}
            Click a running task to monitor it.
          </AlertDescription>
        </Alert>
      )}

      <ScrollArea className="w-full max-h-full border rounded-lg">
        <StickyTable>
          <TableHeader className="sticky top-0 z-10">
            <TableRow>
              <TableHead>{t("table.headers.name")}</TableHead>
              <TableHead>{t("table.headers.status")}</TableHead>
              <TableHead>{t("table.headers.schedule")}</TableHead>
              <TableHead>{t("table.headers.type")}</TableHead>
              <TableHead>{t("table.headers.initiatedBy")}</TableHead>
              {/* <TableHead>{t("table.headers.object")}</TableHead> */}
              <TableHead>{t("table.headers.createdAt")}</TableHead>
              <TableHead className="text-right">
                {t("table.headers.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  <Loader2 className="animate-spin mx-auto size-12 text-muted-foreground m-4" />
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              (tasks?.length === 0 || (error && error?.status === 404)) && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    {t("no-tasks")}
                  </TableCell>
                </TableRow>
              )}

            {!isLoading && error && error.status != 404 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Error loading import configurations.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              tasks?.map((task) => (
                <TaskRow task={task} key={task.id} appid={appid as string} />
              ))}
          </TableBody>
        </StickyTable>
      </ScrollArea>
    </div>
  );
}

function TaskRow({ task, appid }: { task: Task; appid: string }) {
  const router = useRouter();
  const t = useTranslations("ApplicationsPage.Import.tasks-list");
  const { deleteTask } = useDeleteTask(appid, task.id);
  const isRunning = task.executionStatus === ExecutionStatus.RUNNING;

  // When the task is running, fetch the most recent run so we can pass
  // its executionId to the running page — this ensures that navigating
  // back to a running task always reconnects to the correct SSE stream
  // and polls the right metrics, even after leaving and returning.
  // Only fetch page=0&size=1 to keep it cheap; only fires when RUNNING.
  const { data: runsPage } = useSWR<{ data: TaskRun[] }>(
    isRunning ? `/api/tasks/${task.id}/runs?page=0&size=1` : null,
    getFetcher("Failed to fetch latest run")
  );
  const latestExecutionId = runsPage?.data?.[0]?.executionId;

  return (
    <TableRow
      key={task.id}
      onClick={() => {
        if (isRunning) {
          const execParam = latestExecutionId ? `?executionId=${latestExecutionId}` : "";
          router.push(`/applications/${appid}/tasks/${task.id}/running${execParam}`);
        } else {
          router.push(`/applications/${appid}/tasks/${task.id}/configuration`);
        }
      }}
      className={`cursor-pointer${isRunning ? " bg-blue-50 dark:bg-blue-950/10 hover:bg-blue-100 dark:hover:bg-blue-950/20" : ""}`}
    >
      <TableCell>
        <p className="flex items-center gap-2">
          {task.name}
          {isRunning && (
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          )}
        </p>
        <p className="text-muted-foreground">{task.description}</p>
      </TableCell>
      <TableCell>
        <CustomBadge
          label={task.executionStatus}
          color={executionStatusColors[task.executionStatus] ?? "default"}
        />
      </TableCell>
      <TableCell>{t(`table.schedule-type.${task.scheduleType}`)}</TableCell>
      <TableCell>{t(`add-task-modal.form.category.options.${task.category}`)}</TableCell>
      <TableCell>{task.owner.name}</TableCell>
      {/* <TableCell>{task.targetObject?.join(", ")}</TableCell> */}
      <TableCell>{formatTimestamp(task.createdAt)}</TableCell>
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <ConfirmActionDialog
          title={t("delete-modal.title")}
          description={t("delete-modal.description")}
          confirmText={t("delete-modal.confirm-text")}
          cancelText={t("delete-modal.cancel-text")}
          confirmAction={async () => {
            await deleteTask();
          }}
          destructive={true}
        >
          <Button variant="ghost" size="icon" disabled={isRunning}>
            <Trash className="text-destructive" />
          </Button>
        </ConfirmActionDialog>
        <Link href={`/applications/${appid}/tasks/${task.id}/history`}>
          <Button variant="ghost" size="icon">
            <History className="text-muted-foreground" />
          </Button>
        </Link>
      </TableCell>
    </TableRow>
  );
}
