import useSWR, { SWRConfiguration } from "swr";
import { getFetcher } from "../applications/fetcher";
import { TaskRun } from "@/types/task";

type APIResponse = {
  data: TaskRun[];
  pagination: { page: number; size: number; total: number; totalPages: number };
};

/**
 * Polls the runs list for a task and returns the single most-recent run.
 * Used by TaskActionBar to derive running/suspended state reliably from
 * the TaskRun record (which is always up-to-date) rather than the Task
 * entity executionStatus field (which can lag due to JPA/Quartz threading).
 */
export default function useLatestTaskRun(
  taskid: string,
  config?: SWRConfiguration
) {
  const { data, error, isLoading, mutate } = useSWR<APIResponse>(
    `/api/tasks/${taskid}/runs?page=0&size=1`,
    getFetcher("Failed to fetch latest task run"),
    config
  );

  const latestRun = data?.data?.[0] ?? null;

  return { latestRun, error, isLoading, mutate };
}
