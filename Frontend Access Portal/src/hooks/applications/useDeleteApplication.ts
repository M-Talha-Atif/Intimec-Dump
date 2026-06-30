import useSWRMutation from "swr/mutation";
import { deleteFetcher } from "./fetcher";
import { mutate } from "swr";

export default function useDeleteApplication(appid: string) {
  const { trigger, isMutating } = useSWRMutation(
    `/api/applications/${appid}`,
    deleteFetcher("Failed to delete application"),
    {
      onSuccess: async () => {
        await mutate(
          (key) => typeof key === "string" && key.startsWith("/api/applications"),
          undefined,
          { revalidate: true }
        );
      },
    }
  );

  return {
    deleteApplication: trigger,
    isMutating,
  };
}
