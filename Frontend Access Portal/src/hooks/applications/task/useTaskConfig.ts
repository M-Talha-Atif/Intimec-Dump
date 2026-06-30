import useSWRMutation from "swr/mutation";
import { getFetcher, putFetcher } from "../fetcher";
import useSWR from "swr";
import { Task } from "@/types/task";
import ms from "ms";
import { useMemo } from "react";

type PostApiResponse = Task;
type GetApiResponse = Task;

export function useTaskConfig(appid: string, taskid: string) {
  const { data, isLoading, error, mutate } = useSWR<GetApiResponse>(
    `/api/applications/${appid}/tasks/${taskid}`,
    getFetcher("Failed to fetch task configuration"),
    {
      refreshInterval: 3000,
    }
  );
  const { trigger, isMutating } = useSWRMutation<
    PostApiResponse,
    Error,
    string,
    Partial<Task>
  >(
    `/api/applications/${appid}/tasks/${taskid}`,
    putFetcher("Failed to post task configuration"),
    {
      throwOnError: false,
    }
  );
  const saveConfig = async (newConfig: Partial<Task>) => {
    await trigger(newConfig);
    await mutate(
      (currentData) => {
        if (!currentData) return currentData;
        return { ...currentData, ...newConfig };
      },
      { revalidate: true }, // still re-fetch to confirm latest server state
    );
  };

  const scheduleConfig = useMemo(
    () =>
      data
        ? {
            scheduleType: data.scheduleType,
            intervalSeconds: ms((data.intervalSeconds ?? 0) * 1000, {
              long: true,
            }),
            cronExpression: data.cronExpression,
            executionDateTime: data.nextExecution,
          }
        : undefined,
    [data],
  );
  const executionMetadata = useMemo(
    () =>
      data
        ? {
            lastExecution: data.lastExecution,
            nextExecution: data.nextExecution,
          }
        : undefined,
    [data],
  );
  return {
    isMutating,
    isLoading: isLoading && !data && !error,
    data: data?.taskConfig,
    mutate,
    scheduleConfig,
    executionMetadata,
    error,
    saveConfig,
  };
}
