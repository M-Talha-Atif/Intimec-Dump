import useSWR from "swr";
import { postFetcher } from "../fetcher";
import { ConnectorFormSchemaType } from "@/components/applications/add-application/schemas/connectorSchema";
type ApiResponse = string[];

export default function useConnectorObjects(
  connectorId: string | undefined,
  connector: ConnectorFormSchemaType | undefined
) {
  const {
    isLoading,
    data: response,
    error,
    mutate,
  } = useSWR<ApiResponse>(
    connectorId && connector
      ? [
          `/api/applications/add-application/connectors/${connectorId}/objects`,
          connector,
        ]
      : null,
    ([key, connector]: [string, ConnectorFormSchemaType]) =>
      postFetcher<ConnectorFormSchemaType>("Failed to fetch connector objects")(
        key,
        { arg: connector }
      )
  );

  return {
    objects: response,
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}
