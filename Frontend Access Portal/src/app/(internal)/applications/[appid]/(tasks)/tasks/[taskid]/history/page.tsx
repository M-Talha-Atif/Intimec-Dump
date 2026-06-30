"use client";
import CustomBadge from "@/components/applications/common/CustomBadge";
import CustomPagination from "@/components/applications/common/CustomPagination";
import SearchBarWithParams from "@/components/common/SearchBarWithParams";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { TaskRun, executionStatusColors } from "@/types/task";
import {
  formatDuration,
  formatTimestampToLocal,
} from "@/utils/timestamp-utils";
import {
  Calendar,
  ChartColumn,
  CircleMinus,
  CirclePlus,
  Clock,
  Eye,
  KeyRound,
  Link2,
  Loader2,
  TriangleAlert,
  UserPen,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import LoadErrorCard from "@/components/applications/add-application/common/LoadErrorCard";
import useTaskHistory from "@/hooks/applications/task/useTaskHistory";
import { Badge } from "@/components/ui/badge";

export default function Page() {
  const {
    appid,
    taskid,
  }: {
    appid: string;
    taskid: string;
  } = useParams();
  const { data, pagination, isLoading, error, refresh } = useTaskHistory(
    taskid ?? ""
  );
  return (
    <div className="flex flex-col h-full gap-4">
      <header>
        <h1 className="text-xl font-semibold px-4">Task History</h1>
      </header>
      <div className="px-4 flex items-center gap-2 justify-between">
        <SearchBarWithParams
          searchPlaceholder="Search task runs..."
          className="w-56 shrink-0"
        />
        <Button variant="outline">Filters</Button>
      </div>
      <main className="flex-1 overflow-auto">
        {data?.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">
              No task runs found for this application.
            </p>
          </div>
        )}
        {(data?.length ?? 0) > 0 &&
          data?.map((taskRun) => (
            <TaskCard
              key={taskRun.executionId}
              id={taskRun.executionId}
              report={taskRun}
              appid={appid ?? ""}
            />
          ))}
        {isLoading &&
          Array.from({ length: 3 }).map((_, idx) => (
            <TaskCardSkeleton key={idx} />
          ))}
        {error && (
          <div className="h-full w-full flex items-center justify-center p-4">
            <LoadErrorCard
              errorTitle="Failed to load task history"
              errorMessage={error.message}
              refresh={refresh}
            />
          </div>
        )}
      </main>
      <footer>
        <CustomPagination
          totalElements={pagination?.totalElements}
          totalPages={pagination?.totalPages}
        />
      </footer>
    </div>
  );
}

function TaskCard({
  id,
  report,
  appid,
}: {
  id: string;
  report: TaskRun;
  appid: string;
}) {
  return (
    <Card key={id} className="m-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {report.preview ? (
            <Badge className="bg-amber-500 text-white border-transparent">
              <Eye className="size-3 mr-1" />
              Preview
            </Badge>
          ) : (
            <>Run</>
          )}
          <Badge variant="outline">{id}</Badge>
          <CustomBadge color={executionStatusColors[report.status]}>
            {report.status}
          </CustomBadge>
        </CardTitle>
        <div className="text-sm text-muted-foreground grid grid-cols-3 gap-4 w-120">
          {/* <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="size-4" /> Tested User
          </div> */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-4" />{" "}
            {formatTimestampToLocal(report.startTime, {
              dateStyle: "short",
              timeStyle: "short",
              includeSeconds: true,
            })}
          </div>

          {report.endTime && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4" />
                {formatTimestampToLocal(report.endTime, {
                  dateStyle: "short",
                  timeStyle: "short",
                  includeSeconds: true,
                })}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4" />
                {formatDuration(report.endTime - report.startTime)}
              </div>
            </>
          )}
          {report.status === "RUNNING" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              In Progress
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(8rem,1fr))]">
          <StatItem icon={<ChartColumn className="size-4" />} label="Processed" value={report.processedCount} />
          <StatItem icon={<CirclePlus className="size-4 text-green-500" />} label={report.preview ? "Would Create" : "Created"} value={report.createdCount} />
          <StatItem icon={<UserPen className="size-4 text-blue-500" />} label={report.preview ? "Would Update" : "Updated"} value={report.updatedCount} />
          <StatItem icon={<CircleMinus className="size-4 text-destructive" />} label={report.preview ? "Would Delete" : "Deleted"} value={report.deletedCount} />
          <StatItem icon={<Link2 className="size-4 text-indigo-500" />} label={report.preview ? "Would Link" : "Linked"} value={report.linkedCount} />
          <StatItem icon={<TriangleAlert className="size-4 text-yellow-500" />} label="Disputed" value={report.skippedCount} />
          {(report.entitlementsImported ?? 0) > 0 && (
            <StatItem icon={<KeyRound className="size-4 text-teal-500" />} label="Entitlements" value={report.entitlementsImported} />
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <CardAction>
          <Link
            href={`/applications/${appid}/tasks/${report.taskId}/history/${report.executionId}`}
          >
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>
        </CardAction>
      </CardFooter>
    </Card>
  );
}

function TaskCardSkeleton() {
  return (
    <Card className="m-4 animate-pulse">
      <CardHeader>
        <CardTitle className="h-6 w-1/3 bg-muted rounded"></CardTitle>
        <div className="text-sm text-muted-foreground grid grid-cols-3 gap-4 w-120 mt-2">
          <Skeleton className="h-4 w-1/2 rounded"></Skeleton>
          <Skeleton className="h-4 w-1/2 rounded"></Skeleton>
          <Skeleton className="h-4 w-1/2 rounded"></Skeleton>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-4">
          {/* {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 border-1 rounded-md py-2 px-4 bg-secondary/10"
            >
              <Skeleton className="h-6 w-6 rounded"></Skeleton>
              <div>
                <Skeleton className="h-4 w-16 rounded mb-1"></Skeleton>
                <Skeleton className="h-5 w-10 rounded"></Skeleton>
              </div>
            </div>
          ))} */}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <CardAction>
          <div className="h-8 w-24 bg-muted rounded"></div>
        </CardAction>
      </CardFooter>
    </Card>
  );
}

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
}) {
  return (
    <div className="flex items-center gap-2 border rounded-md py-2 px-3 bg-secondary/10">
      {icon}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-bold">{value?.toLocaleString() ?? "—"}</p>
      </div>
    </div>
  );
}