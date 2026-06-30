"use client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { TaskLog, TaskRun } from "@/types/task";
import {
  formatTimestampToLocal,
  formatDuration,
} from "@/utils/timestamp-utils";
import {
  Archive,
  ChartColumn,
  CircleMinus,
  CirclePlus,
  Clock,
  Eye,
  KeyRound,
  Link2,
  Pause,
  Play,
  TriangleAlert,
  UserPen,
} from "lucide-react";
import LogViewer from "./LogViewer";
import LogLevelFilter from "./LogLevelFilter";
import LinesNumFilter from "./LinesNumFilter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SearchInput } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const taskKPIs = [
  {
    titleKey: "processed" as const,
    render: (data?: TaskRun) =>
      data?.processedCount?.toLocaleString() ?? "—",
    icon: <ChartColumn />,
  },
  {
    titleKey: "additions" as const,
    render: (data?: TaskRun) =>
      data?.createdCount?.toLocaleString() ?? "—",
    icon: <CirclePlus className="text-green-500" />,
  },
  {
    titleKey: "modifications" as const,
    render: (data?: TaskRun) =>
      data?.updatedCount?.toLocaleString() ?? "—",
    icon: <UserPen className="text-blue-500" />,
  },
  {
    titleKey: "deletions" as const,
    render: (data?: TaskRun) =>
      data?.deletedCount?.toLocaleString() ?? "—",
    icon: <CircleMinus className="text-destructive" />,
  },
  {
    titleKey: "linked" as const,
    render: (data?: TaskRun) =>
      data?.linkedCount?.toLocaleString() ?? "—",
    icon: <Link2 className="text-indigo-500" />,
  },
  {
    titleKey: "quarantined" as const,
    render: (data?: TaskRun) =>
      data?.failedCount?.toLocaleString() ?? "—",
    icon: <TriangleAlert className="text-yellow-500" />,
  },
  {
    titleKey: "entitlements" as const,
    render: (data?: TaskRun) =>
      data?.entitlementsImported?.toLocaleString() ?? "—",
    icon: <KeyRound className="text-teal-500" />,
  },
  {
    titleKey: "duration" as const,
    render: (data?: TaskRun) =>
      // durationMs can legitimately be 0 (skipped runs), so check for null/undefined
      // not truthiness — otherwise JS treats 0 as falsy and shows a live growing timer.
      data?.durationMs != null
        ? formatDuration(data.durationMs)
        : data?.startTime != null
          ? formatDuration(Date.now() - data.startTime)
          : "—",
    icon: <Clock />,
  },
];

export default function TaskRender({
  report,
  logs,
  paused,
  resume,
  pause,
  linesNum,
  setLinesNum,
  logLevels,
  setLogLevels,
  search,
  setSearch,
  id,
  isPreview,
  previewContent,
  isComplete,
  logsUnavailable,
}: {
  report: TaskRun | null;
  logs?: TaskLog[];
  paused: boolean;
  resume: () => void;
  pause: () => void;
  linesNum: number;
  setLinesNum: React.Dispatch<React.SetStateAction<number>>;
  logLevels: TaskLog["level"][];
  setLogLevels: React.Dispatch<React.SetStateAction<TaskLog["level"][]>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  id: string;
  isPreview?: boolean;
  previewContent?: React.ReactNode;
  isComplete?: boolean;
  logsUnavailable?: boolean;
}) {
  const t = useTranslations("ApplicationsPage.Import.ImportRender");
  return (
    <main className="p-4">
      <header className="mb-6 gap-4">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          {isPreview && (
            <Badge className="bg-amber-500 text-white border-transparent">
              <Eye className="size-3 mr-1" />
              Preview
            </Badge>
          )}
          {t("header.title")} {id}
          {report && <Badge>{t(`statusLabels.${report.status}`)}</Badge>}
        </h1>
        {report?.status === "SKIPPED" && report.errorMessage && (
          <div className="mt-2 flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
            <TriangleAlert className="size-4 shrink-0" />
            {report.errorMessage}
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          {isPreview
            ? "This was a read-only simulation. No data was modified."
            : report?.endTime && isComplete
              ? `Completed ${formatTimestampToLocal(report.endTime)}`
              : report?.startTime
                ? formatTimestampToLocal(report.startTime)
                : isComplete
                  ? "Execution complete"
                  : "Starting…"}
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>{t("overview.title")}</CardTitle>
          <CardDescription>{t("overview.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(10rem,1fr))] w-full">
            {taskKPIs.map((section, index) => (
              <div
                key={index}
                className="p-4 border rounded-md flex items-center gap-4 flex-1"
              >
                <section>{section.icon}</section>
                <section>
                  <p className="text-sm text-muted-foreground">
                    {t(`overview.sections.${section.titleKey}`)}
                  </p>
                  <p className="text-2xl font-bold">
                    {section.render(report ?? undefined)}
                  </p>
                </section>
              </div>
            ))}
          </div>
          <div className="w-full space-y-2">
            <div>
              <p className="text-sm mb-1">
                {t("overview.progress")}:
                <span className="text-muted-foreground font-medium">
                  {report?.estimatedTotalCount && report.estimatedTotalCount > 0 && report.processedCount != null
                    ? ` ${Math.min((report.processedCount / report.estimatedTotalCount) * 100, 100).toFixed(1)}% (${report.processedCount.toLocaleString()}/${report.estimatedTotalCount.toLocaleString()})`
                    : report?.processedCount != null
                      ? ` ${report.processedCount.toLocaleString()} processed`
                      : ""}
                </span>
              </p>
            </div>
            <Progress
              value={
                isComplete ? 100
                  : report?.estimatedTotalCount && report.estimatedTotalCount > 0 && report.processedCount != null
                    ? Math.min((report.processedCount / report.estimatedTotalCount) * 100, 100)
                    : 0
              }
              indeterminate={
                !isComplete &&
                !(report?.estimatedTotalCount && report.estimatedTotalCount > 0 && report.processedCount != null) &&
                report?.status !== "COMPLETED" && report?.status !== "FAILED" && report?.status !== "CANCELLED"
              }
              className="h-4"
            />
          </div>
        </CardContent>
      </Card>
      {isPreview && previewContent ? (
        <div className="mt-4">{previewContent}</div>
      ) : (
        <Tabs defaultValue={previewContent ? "results" : "logs"} className="mt-4">
          <TabsList>
            <TabsTrigger value="logs">{t("details.title")}</TabsTrigger>
            {previewContent && (
              <TabsTrigger value="results">Execution Results</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardDescription>
                  {isComplete
                    ? report?.endTime
                      ? `Execution finished at ${new Intl.DateTimeFormat(undefined, {
                          dateStyle: "medium",
                          timeStyle: "medium",
                        }).format(new Date(report.endTime))} — final log record, no further updates.`
                      : "Execution finished — final log record, no further updates."
                    : t("details.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2 gap-2">
                  <SearchInput
                    placeholder={t("details.searchPlaceholder")}
                    className="max-w-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    <LinesNumFilter lines={linesNum} onChange={setLinesNum} />
                    <LogLevelFilter logLevels={logLevels} onChange={setLogLevels} />
                  </div>
                </div>
                {logsUnavailable ? (
                  <div className="flex flex-col gap-3">
                    {/* Header notice */}
                    <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-medium">
                      <Archive className="size-4 shrink-0" />
                      Detailed execution logs are no longer available for this run. Log retention has elapsed.
                    </div>

                    {/* Error message — shown only when the run failed */}
                    {report?.errorMessage && (
                      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-destructive font-medium text-sm">
                          <TriangleAlert className="size-4 shrink-0" />
                          Execution error
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words font-mono">
                          {report.errorMessage}
                        </p>
                        {report.stackTrace && (
                          <details className="mt-1">
                            <summary className="text-xs text-muted-foreground cursor-pointer select-none hover:text-foreground">
                              Show stack trace
                            </summary>
                            <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap break-all overflow-auto max-h-48 rounded bg-muted p-2">
                              {report.stackTrace}
                            </pre>
                          </details>
                        )}
                      </div>
                    )}

                    {/* Run timing */}
                    {(report?.startTime || report?.endTime) && (
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {report.startTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5" />
                            Started: <span className="font-medium text-foreground ml-1">{formatTimestampToLocal(report.startTime)}</span>
                          </span>
                        )}
                        {report.endTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5" />
                            Ended: <span className="font-medium text-foreground ml-1">{formatTimestampToLocal(report.endTime)}</span>
                          </span>
                        )}
                        {report.durationMs != null && (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5" />
                            Duration: <span className="font-medium text-foreground ml-1">{formatDuration(report.durationMs)}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Summary statistics */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-mono">
                      <span>
                        <span className="font-bold">
                          {(report?.processedCount ?? 0).toLocaleString()}
                        </span>{" "}
                        processed
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span>
                        <span className="font-bold text-green-600">
                          {(report?.createdCount ?? 0).toLocaleString()}
                        </span>{" "}
                        created
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span>
                        <span className="font-bold text-blue-600">
                          {(report?.updatedCount ?? 0).toLocaleString()}
                        </span>{" "}
                        updated
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span>
                        <span className="font-bold text-indigo-600">
                          {(report?.linkedCount ?? 0).toLocaleString()}
                        </span>{" "}
                        linked
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span>
                        <span className="font-bold text-yellow-600">
                          {(report?.failedCount ?? 0).toLocaleString()}
                        </span>{" "}
                        quarantined
                      </span>
                    </div>
                  </div>
                ) : (
                  <LogViewer logs={logs || []} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {previewContent && (
            <TabsContent value="results">
              {previewContent}
            </TabsContent>
          )}
        </Tabs>
      )}
    </main>
  );
}
