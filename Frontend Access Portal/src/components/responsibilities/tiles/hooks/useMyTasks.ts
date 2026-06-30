import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchMyTasks } from "@/services/responsibilities";

export function useMyTasks(searchQuery: string, filter: string) {
  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["myTasks", filter],
    queryFn: () => fetchMyTasks(filter === "all" ? undefined : filter),
  });

  const filteredTasks = useMemo(() => {
    return tasks?.filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [tasks, searchQuery]);

  return {
    tasks,
    filteredTasks,
    isLoading,
    error,
  };
}
