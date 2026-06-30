import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchMyBusinessRoles } from "@/services/responsibilities";

export function useMyBusinessRoles(searchQuery: string) {
  const {
    data: roles,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["myBusinessRoles"],
    queryFn: fetchMyBusinessRoles,
  });

  const filteredRoles = useMemo(() => {
    return roles?.filter((role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [roles, searchQuery]);

  return {
    roles,
    filteredRoles,
    isLoading,
    error,
  };
}
