import useSWR, { SWRConfiguration } from "swr";
import { getFetcher } from "../applications/fetcher";
import { TaskRun } from "@/types/task";

type APIResponse = TaskRun;

export default function useTaskRun(
  taskId: string,
  executionId: string | null | undefined,
  config?: SWRConfiguration
) {
  const { data, error, isLoading, mutate } = useSWR<APIResponse>(
    executionId ? `/api/tasks/${taskId}/runs/${executionId}` : null,
    getFetcher("Failed to fetch run task"),
    config
  );

  return { data, error, isLoading, mutate };
}
