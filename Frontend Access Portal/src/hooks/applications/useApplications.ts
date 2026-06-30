import useSWR from "swr";
import { Application } from "@/types/application";
import { PaginatedSpringData, PaginationType } from "@/types/pagination";
import { useSearchParams } from "next/navigation";
import { getFetcher } from "./fetcher";

export type UseApplicationsResponse = {
  data: Application[];
  isLoading: boolean;
  error: unknown;
  pagination?: PaginationType;
  refresh: () => void;
};

export default function useApplications() {
  const searchParams = useSearchParams();
  const currentParams = new URLSearchParams();
  const page = parseInt(searchParams.get("page") || "0", 10);
  const size = parseInt(searchParams.get("size") || "10", 10);
  searchParams.entries().forEach(([key, value]) => {
    if (key.startsWith("filter_")) {
      currentParams.set(key, value);
    }
  });
  currentParams.set("page", page.toString());
  currentParams.set("size", size.toString());
  const {
    data: response,
    error,
    isLoading,
    mutate,
  } = useSWR<PaginatedSpringData<Application>>(
    `/api/applications?${currentParams.toString()}`,
    getFetcher("Failed to fetch applications"),
    {
      keepPreviousData: true,
    },
  );

  const data = response?.content || [];
  const pagination = {
    totalElements: response?.totalElements || 0,
    totalPages: response?.totalPages || 0,
    page: response?.number || page,
    size: response?.size || size,
  };

  console.log("useApplications data:", data);
  return {
    data,
    pagination,
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}
