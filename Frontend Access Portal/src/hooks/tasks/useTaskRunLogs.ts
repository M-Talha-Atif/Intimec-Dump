import useSWR from "swr";
import { getFetcher } from "../applications/fetcher";
import { TaskLog } from "@/types/task";

type APIResponse = TaskLog[];

export default function useTaskRunLogs(taskId: string, executionId: string) {
  const { data, error, isLoading } = useSWR<APIResponse>(
    `/api/tasks/${taskId}/runs/${executionId}/logs`,
    getFetcher("Failed to fetch task run logs")
  );

  return { data, error, isLoading };
}
