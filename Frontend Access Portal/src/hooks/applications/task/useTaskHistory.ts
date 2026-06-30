import useSWR from "swr";
import { getFetcher } from "../fetcher";
import { PaginationType } from "@/types/pagination";
import { useSearchParams } from "next/navigation";
import { TaskRun } from "@/types/task";

type ApiResponse = {
  data: TaskRun[];
  pagination: PaginationType;
};

export default function useTaskHistory(taskid: string) {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "0", 10);
  const size = parseInt(searchParams.get("size") || "10", 10);
  const currentParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  const {
    data: response,
    isLoading,
    error,
    mutate,
  } = useSWR<ApiResponse, Error>(
    `/api/tasks/${taskid}/runs?${currentParams.toString()}`,
    getFetcher("Failed to get import history")
  );

  return {
    data: response?.data,
    pagination: response?.pagination,
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: false }),
  };
}
