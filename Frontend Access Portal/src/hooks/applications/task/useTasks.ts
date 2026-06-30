import { Task } from "@/types/task";
import { getFetcher } from "../fetcher";
import useSWR from "swr";
import { PaginationType } from "@/types/pagination";

type ApiResponse = {
  tasks: Task[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
};

export default function useTasks(appid: string) {
  const {
    data: response,
    error,
    isLoading,
    mutate,
  } = useSWR<ApiResponse>(
    `/api/applications/${appid}/tasks`,
    getFetcher("Failed to load tasks")
  );

  return {
    tasks: response?.tasks || [],
    pagination: {
      page: response?.pageNumber || 0,
      size: response?.pageSize || 0,
      totalPages: response?.totalPages || 0,
      totalElements: response?.totalElements || 0,
    } as PaginationType,
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}
