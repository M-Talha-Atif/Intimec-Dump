import useSWRMutation from "swr/mutation";
import { getFetcher } from "../applications/fetcher";

export default function usePauseTask({ taskid }: { taskid?: string }) {
  const { trigger, isMutating } = useSWRMutation(
    `/api/tasks/${taskid}/pause`,
    getFetcher("Failed to pause task")
  );

  return { pauseTask: trigger, isMutating };
}
