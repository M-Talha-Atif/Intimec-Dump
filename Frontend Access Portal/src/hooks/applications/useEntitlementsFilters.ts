import useSWR from "swr";
import { FilterOptionGroup } from "@/types/filters";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to fetch Filters");
    }
    return res.json();
  });

export type UseEntitlementsFiltersResponse = {
  filters: FilterOptionGroup[];
  isLoading: boolean;
  error: unknown;
};

export default function useEntitlementsFilters(
  appid: string | number
): UseEntitlementsFiltersResponse {
  const { data, isLoading, error } = useSWR(
    `/api/applications/${appid}/entitlements/filters`,
    fetcher,
    {
      keepPreviousData: true,
    }
  );

  return {
    filters: data?.filters || [],
    isLoading,
    error,
  };
}
