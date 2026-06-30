// /applications/add-application/owner-options
import useSWR from "swr";
import { getFetcher } from "../fetcher";
import { IdentityGroup, User } from "@/types/user";
import { PaginationType } from "@/types/pagination";

interface ApiResponse {
  data: ((User & { kind: "identity" }) | (IdentityGroup & { kind: "group" }))[];
  pagination: PaginationType;
}

export default function useOwnerOptions({
  page = 0,
  size = 10,
  search = "",
  identityType = "all",
}: {
  page?: number;
  size?: number;
  search?: string;
  identityType?: string;
}) {
  const queryParams = new URLSearchParams();
  if (page) queryParams.append("page", page.toString());
  if (size) queryParams.append("size", size.toString());
  if (search && search.trim() !== "") queryParams.append("search", search);
  if (identityType) queryParams.append("identityType", identityType);
  const {
    data: response,
    isLoading,
    error,
    mutate,
  } = useSWR<ApiResponse>(
    `/api/applications/add-application/owner-options?${queryParams.toString()}`,
    getFetcher("Failed to fetch owner options"),
    {
      keepPreviousData: true,
    }
  );

  return {
    data: response?.data,
    pagination: response?.pagination,
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}
