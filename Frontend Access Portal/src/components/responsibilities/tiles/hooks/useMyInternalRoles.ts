import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchMyInternalRoles } from "@/services/responsibilities";

export function useMyInternalRoles(searchQuery: string) {
  const {
    data: roles,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["myInternalRoles"],
    queryFn: fetchMyInternalRoles,
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
