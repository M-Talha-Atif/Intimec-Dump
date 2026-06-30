import useSWRMutation from "swr/mutation";
import { getFetcher } from "../applications/fetcher";
import { mutate } from "swr";
import { TaskExecutionResponse } from "./useRunTask";

export default function useRunPreview(taskid: string) {
  const { trigger, data, error, isMutating } = useSWRMutation<TaskExecutionResponse>(
    `/api/tasks/${taskid}/preview`,
    getFetcher("Failed to run preview")
  );

  const runPreview = async (): Promise<TaskExecutionResponse | undefined> => {
    const result = await trigger();
    // Invalidate the run history so the new preview execution appears immediately
    await mutate(
      (key: unknown) =>
        key &&
        typeof key === "string" &&
        key.startsWith(`/api/tasks/${taskid}/runs`)
    );
    return result;
  };

  return { runPreview, previewData: data, previewError: error, isRunningPreview: isMutating };
}
