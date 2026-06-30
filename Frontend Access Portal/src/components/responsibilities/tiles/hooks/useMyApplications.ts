import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchMyApplications } from "@/services/responsibilities";

export function useMyApplications(searchQuery: string, envFilter: string) {
  const {
    data: applications,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["myApplications"],
    queryFn: fetchMyApplications,
  });

  const filteredApplications = useMemo(() => {
    return applications
      ?.filter((app) =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      ?.filter((app) => envFilter === "all" || app.environment === envFilter);
  }, [applications, searchQuery, envFilter]);

  return {
    applications,
    filteredApplications,
    isLoading,
    error,
  };
}
