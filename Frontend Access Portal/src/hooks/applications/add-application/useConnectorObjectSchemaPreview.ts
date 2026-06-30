import { ConnectorFormSchemaType } from "@/components/applications/add-application/schemas/connectorSchema";
import { postFetcher } from "@/hooks/applications/fetcher";
import { SortingState } from "@/types/shared";
import { useMemo } from "react";
import useSWR from "swr";

type ApiResponse = {
  content: Record<string, string[]>[];
  page: number;
  size: number;
  hasNextPage: boolean;
};

type Args = {
  attributesToInclude: string[];
  configuration: ConnectorFormSchemaType;
};

export default function useConnectorObjectPreview({
  connectorId,
  objectName,
  pagination,
  search,
  dataArgs,
  options,
  sort,
}: {
  connectorId: string | undefined;
  objectName: string | undefined;
  pagination: {
    page: number;
    size: number;
  };
  search: string;
  dataArgs: Args;
  options?: {
    onSuccess?: (data: Record<string, string[]>[]) => void;
    onError?: (error: Error) => void;
  };
  sort?: SortingState | null;
}) {
  const searchParams = new URLSearchParams();
  searchParams.append("page", pagination.page.toString());
  searchParams.append("size", pagination.size.toString());
  if (search) {
    searchParams.append("search", search);
  }
  if (sort?.sortBy) {
    searchParams.append("sortBy", sort.sortBy);
    searchParams.append("direction", sort.direction);
  }
  const key =
    connectorId && objectName
      ? [
          `/api/applications/add-application/connectors/${connectorId}/schema/${objectName}/preview?${searchParams.toString()}`,
          dataArgs,
        ]
      : null;
  const {
    isLoading,
    data: response,
    error,
    mutate,
  } = useSWR<ApiResponse>(
    key,
    ([url, arg]) =>
      postFetcher<Args>("Failed to fetch object preview")(url, { arg }),
    {
      ...options,
      onSuccess: (data) => {
        options?.onSuccess?.(data.content);
      },
      keepPreviousData: true,
    }
  );

  const finalResponse = useMemo(() => {
    if (!response?.content) return [];
    const data = [...response.content];
    if (sort?.sortBy) {
      data.sort((a, b) => {
        const aValue = a[sort.sortBy];
        const bValue = b[sort.sortBy];
        if (aValue < bValue) return sort.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sort.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [response, sort]);

  return {
    data: finalResponse,
    isLoading,
    error,
    pagination: {
      totalElements: undefined,
      totalPages: undefined,
      hasNextPage: response?.hasNextPage ?? false,
    },
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}
