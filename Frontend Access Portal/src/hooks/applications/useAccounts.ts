import useSWR from "swr";
import { PaginationType } from "@/types/pagination";
import { AccountWithUserAndEntitlements } from "@/components/applications/types";
import { useSearchParams } from "next/navigation";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to fetch Accounts");
    }
    return res.json();
  });

export type AccountStats = {
  totalCount: number;
  activeCount: number;
  disabledCount: number;
  orphanCount: number;
  privilegedCount: number;
};

export type UseAccountsResponse = {
  data: AccountWithUserAndEntitlements[];
  pagination?: PaginationType;
  stats?: AccountStats;
  isLoading: boolean;
  error: unknown;
  refresh: () => void;
};

export default function useAccounts(
  appid: string | number
): UseAccountsResponse {
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
    `/api/applications/${appid}/accounts?${params.toString()}`,
    fetcher,
    {
      keepPreviousData: true,
    }
  );

  const data = response?.data || [];
  const pagination = response?.pagination;
  const stats = response?.stats;
  return {
    data,
    pagination,
    stats,
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}
