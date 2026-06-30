import useSWR from "swr";
import { IdentityDTO } from "@/types/identity";
import { PaginatedSpringData, PaginationType } from "@/types/pagination";
import { getFetcher } from "@/hooks/applications/fetcher";
import { IdentityEntityType } from "@/constants/identity";

export type UseIdentitiesOptions = {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  status?: string;
  department?: string;
};

export type UseIdentitiesResponse = {
  data: IdentityDTO[];
  isLoading: boolean;
  error: unknown;
  pagination: PaginationType;
  refresh: () => void;
};

/**
 * Fetches a paginated list of identities filtered by entity type.
 * Accepts page/size/sort/search/status/department as options for
 * full server-side pagination and filtering.
 */
export default function useIdentities(
  entityType: IdentityEntityType,
  options: UseIdentitiesOptions = {}
): UseIdentitiesResponse {
  const {
    page = 0,
    size = 20,
    sort = "createdAt,desc",
    search = "",
    status = "",
    department = "",
  } = options;

  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("size", size.toString());
  params.set("sort", sort);
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  if (department) params.set("department", department);

  const {
    data: response,
    error,
    isLoading,
    mutate,
  } = useSWR<PaginatedSpringData<IdentityDTO>>(
    `/api/identity/${entityType}?${params.toString()}`,
    getFetcher("Failed to fetch identities"),
    {
      keepPreviousData: true,
    }
  );

  const data = response?.content || [];
  const pagination: PaginationType = {
    totalElements: response?.totalElements || 0,
    totalPages: response?.totalPages || 0,
    page: response?.number ?? page,
    size: response?.size ?? size,
  };

  return {
    data,
    pagination,
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}
