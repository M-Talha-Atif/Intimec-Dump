import { useQuery } from "@tanstack/react-query";
import { fetchMyApplications } from "@/services/responsibilities";

export function useOwnedApps(
  globalSearch: string,
  envFilter: string,
  connectorFilter: string,
) {
  const { data: apps, isLoading } = useQuery({
    queryKey: ["ownedApplications"],
    queryFn: fetchMyApplications,
  });

  const filteredApps = apps?.filter((app) => {
    const matchesSearch = app.name
      .toLowerCase()
      .includes(globalSearch.toLowerCase());
    const matchesEnv = envFilter === "all" || app.environment === envFilter;
    const matchesConnector =
      connectorFilter === "all" || app.connectorType === connectorFilter;
    return matchesSearch && matchesEnv && matchesConnector;
  });

  return {
    apps,
    filteredApps,
    isLoading,
  };
}
