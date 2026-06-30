import useSWRMutation from "swr/mutation";
import { deleteFetcher } from "../fetcher";
import { mutate } from "swr";

export default function useDeleteTask(appid: string, taskid: string) {
  const { trigger, isMutating } = useSWRMutation(
    `/api/applications/${appid}/tasks/${taskid}`,
    deleteFetcher("Failed to delete task"),
    {
      onSuccess: async () => {
        await mutate(`/api/applications/${appid}/tasks`);
      },
    }
  );

  return {
    deleteTask: trigger,
    isMutating,
  };
}
