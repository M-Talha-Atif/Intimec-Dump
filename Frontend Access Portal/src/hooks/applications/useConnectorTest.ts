import useSWRMutation from "swr/mutation";
import { postFetcher } from "./fetcher";

export const useConnectorTest = (config: { connectorId: string } | null) =>
  useSWRMutation(
    config
      ? `/api/applications/add-application/connectors/${config?.connectorId}/test`
      : null,
    postFetcher("Failed to test connector"),
    {
      throwOnError: false,
      revalidate: false,
      populateCache: false,
    },
  );
