import useSWRMutation from "swr/mutation";
import { getFetcher } from "../applications/fetcher";

export default function useResumeTask({ taskid }: { taskid?: string }) {
  const { trigger, isMutating } = useSWRMutation(
    `/api/tasks/${taskid}/resume`,
    getFetcher("Failed to resume task")
  );

  return { resumeTask: trigger, isMutating };
}
