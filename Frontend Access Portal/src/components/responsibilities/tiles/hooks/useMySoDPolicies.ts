import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchMySoDPolicies } from "@/services/responsibilities";

export function useMySoDPolicies(searchQuery: string) {
  const {
    data: policies,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["mySoDPolicies"],
    queryFn: fetchMySoDPolicies,
  });

  const filteredPolicies = useMemo(() => {
    return policies?.filter((policy) =>
      policy.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [policies, searchQuery]);

  const violationsCount = useMemo(() => {
    return filteredPolicies?.reduce((sum, p) => sum + p.violationCount, 0) || 0;
  }, [filteredPolicies]);

  return {
    policies,
    filteredPolicies,
    violationsCount,
    isLoading,
    error,
  };
}
