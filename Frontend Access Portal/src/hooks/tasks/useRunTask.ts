import useSWRMutation from "swr/mutation";
import { getFetcher } from "../applications/fetcher";
import { mutate } from "swr";

export interface TaskExecutionResponse {
  taskId: string;
  executionId: string;
  message: string;
  triggeredAt: string;
}

export default function useRunTask(taskid: string) {
  const { trigger, isMutating } = useSWRMutation<TaskExecutionResponse>(
    `/api/tasks/${taskid}/execute`,
    getFetcher("Failed to run task")
  );

  const runTask = async (): Promise<TaskExecutionResponse | undefined> => {
    const result = await trigger();
    // Invalidate the run history so the new execution appears immediately
    await mutate(
      (key: unknown) =>
        key &&
        typeof key === "string" &&
        key.startsWith(`/api/tasks/${taskid}/runs`)
    );
    return result;
  };

  return { runTask, isMutating };
}
