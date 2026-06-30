// /applications/add-application/owner-options
import useSWR from "swr";
import { getFetcher } from "../fetcher";
import { PaginationType } from "@/types/pagination";
import { MetaRole } from "@/types/roles";

interface ApiResponse {
  data: MetaRole[];
  pagination: PaginationType;
}

export default function useRoleOptions({
  roleType,
  page = 0,
  size = 10,
  search = "",
}: {
  page?: number;
  size?: number;
  search?: string;
  roleType?: "application" | "business";
}) {
  const queryParams = new URLSearchParams();
  if (page) queryParams.append("page", page.toString());
  if (size) queryParams.append("size", size.toString());
  if (search && search.trim() !== "") queryParams.append("search", search);
  const key = `/api/applications/add-application/${roleType}-roles?${queryParams.toString()}`;
  const {
    data: response,
    isLoading,
    error,
    mutate,
  } = useSWR<ApiResponse>(key, getFetcher("Failed to fetch owner options"), {
    keepPreviousData: true,
  });

  return {
    data: response?.data,
    pagination: response?.pagination,
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}
