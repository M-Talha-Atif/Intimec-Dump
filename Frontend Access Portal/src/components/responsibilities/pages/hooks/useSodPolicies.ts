import { useQuery } from "@tanstack/react-query";
import { fetchMySoDPolicies } from "@/services/responsibilities";

export function useSodPolicies(globalSearch: string) {
  const { data: policies, isLoading } = useQuery({
    queryKey: ["ownedSoDPolicies"],
    queryFn: fetchMySoDPolicies,
  });

  const filteredPolicies = policies?.filter((policy) =>
    policy.name.toLowerCase().includes(globalSearch.toLowerCase()),
  );

  return {
    policies,
    filteredPolicies,
    isLoading,
  };
}
