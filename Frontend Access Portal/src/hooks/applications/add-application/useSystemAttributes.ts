import { DetailsFormSchemaType } from "@/components/applications/add-application/schemas/detailsSchema";
import { getFetcher } from "@/hooks/applications/fetcher";
import { MetaSystemAttribute } from "@/types/add-application";
import { useMemo } from "react";
import useSWR from "swr";

type ApiResponse = {
  coreAttributes: MetaSystemAttribute[];
  extendedAttributes: MetaSystemAttribute[];
};

export default function useSystemAttributes(
  identityType: DetailsFormSchemaType["schemaId"] | undefined
) {
  const {
    isLoading,
    error,
    data: response,
    mutate,
  } = useSWR<ApiResponse>(
    identityType
      ? `/api/applications/add-application/system-attributes?identityType=${identityType}`
      : null,
    getFetcher("Failed to fetch System Attributes")
  );
  const attributes = useMemo(
    () =>
      [
        ...(response?.coreAttributes || []),
        ...(response?.extendedAttributes || []),
      ]
        .sort((a, b) =>
          a.displayName.localeCompare(b.displayName, "en-US", {
            sensitivity: "base",
          })
        )
        .map((attr) => ({
          ...attr,
          dataType: attr.dataType.toLowerCase(),
        })),
    [response]
  );
  return {
    isLoading,
    error,
    attributes,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}
