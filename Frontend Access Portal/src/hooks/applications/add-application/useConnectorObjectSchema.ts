import useSWR from "swr";
import { postFetcher } from "../fetcher";
import { ConnectorFormSchemaType } from "@/components/applications/add-application/schemas/connectorSchema";
import {
  ConnectorAttribute,
  ConnectorAttributeType,
} from "@/types/add-application";

export type FetchedConnectorObject = {
  attributes: (Pick<ConnectorAttribute, "name" | "flags"> & {
    type: ConnectorAttributeType;
  })[];
  capabilities: string[];
};

type ApiResponse = FetchedConnectorObject;

export default function useConnectorObjectSchema(
  connectorId: string | undefined,
  connector: ConnectorFormSchemaType | undefined,
  objectName: string | undefined
) {
  const {
    isLoading,
    data: response,
    error,
  } = useSWR<ApiResponse>(
    connectorId && connector && objectName
      ? [
          `/api/applications/add-application/connectors/${connectorId}/schema/${objectName}`,
          connector,
        ]
      : null,
    ([key, arg]: [string, ConnectorFormSchemaType]) =>
      postFetcher<ConnectorFormSchemaType>("Failed to fetch connector objects")(
        key,
        {
          arg,
        }
      )
  );

  return {
    object: response,
    isLoading,
    error,
  };
}
