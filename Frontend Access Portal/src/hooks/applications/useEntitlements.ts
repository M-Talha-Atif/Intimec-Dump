import useSWR from "swr";
import { PaginationType } from "@/types/pagination";
import { EntitlementWithUsersMeta } from "@/components/applications/types";
import { useSearchParams } from "next/navigation";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to fetch Entitlements");
    }
    return res.json();
  });

export type UseEntitlementsResponse = {
  data: EntitlementWithUsersMeta[];
  pagination?: PaginationType;
  isLoading: boolean;
  error: unknown;
  refresh: () => void;
};

export default function useEntitlements(
  appId: string | number
): UseEntitlementsResponse {
  const searchParams = useSearchParams();

  const params = new URLSearchParams(searchParams.toString());
  if (!params.has("size")) params.set("size", "10");
  if (!params.has("page")) params.set("page", "0");

  const {
    data: response,
    isLoading,
    error,
    mutate,
  } = useSWR(
    `/api/applications/${appId}/entitlements?${params.toString()}`,
    fetcher,
    {
      keepPreviousData: true,
    }
  );

  const data = response?.data || [];
  const pagination = response?.pagination;
  return {
    data,
    pagination,
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}
