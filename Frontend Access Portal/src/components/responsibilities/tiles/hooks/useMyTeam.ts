import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchMyTeam } from "@/services/responsibilities";

export function useMyTeam(searchQuery: string) {
  const {
    data: team,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["myTeam"],
    queryFn: fetchMyTeam,
  });

  const filteredTeam = useMemo(() => {
    return team?.filter((member) =>
      (member.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [team, searchQuery]);

  const activeCount = useMemo(() => {
    return filteredTeam?.filter((m) => m.status === "ACTIVE").length || 0;
  }, [filteredTeam]);

  const pendingCount = useMemo(() => {
    return filteredTeam?.filter((m) => m.status === "PENDING").length || 0;
  }, [filteredTeam]);

  return {
    team,
    filteredTeam,
    activeCount,
    pendingCount,
    isLoading,
    error,
  };
}