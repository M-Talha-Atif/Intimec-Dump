import useSWRMutation from "swr/mutation";
import { getFetcher } from "../applications/fetcher";

export default function useTerminateTask({ taskid }: { taskid?: string }) {
  const { trigger, isMutating } = useSWRMutation(
    `/api/tasks/${taskid}/terminate`,
    getFetcher("Failed to terminate task")
  );

  return { terminateTask: trigger, isMutating };
}
