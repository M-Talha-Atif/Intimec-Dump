"use client";
import useSWR from "swr";
import { getFetcher } from "../fetcher";
import { Connector } from "@/types/add-application";
import { getConnectorZodSchema } from "@/components/applications/add-application/schemas/connectorSchema";

interface ApiResponse {
  data?: {
    connector: Connector;
  };
  message: string;
}

export default function useConnector(connectorId: string | null) {
  const {
    data: response,
    error,
    isLoading,
    mutate,
  } = useSWR<ApiResponse>(
    connectorId === null
      ? null
      : `/api/applications/add-application/connectors/${connectorId}/connector-properties`,
    getFetcher(`Failed to fetch connector properties for ID ${connectorId}`)
  );

  let schema = undefined;
  let defaultValues = undefined;
  if (response?.data?.connector) {
    ({ schema, defaultValues } = getConnectorZodSchema(
      response?.data?.connector
    ));
  }

  return {
    connectorProperties: response?.data?.connector,
    schema,
    defaultValues,
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}
