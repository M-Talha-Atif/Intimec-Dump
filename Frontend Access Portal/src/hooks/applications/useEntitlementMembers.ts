import useSWR from "swr";
import { PaginationType } from "@/types/pagination";

export type EntitlementMember = {
  assignmentId: string;
  shadowId: string;
  accountName: string;
  identityId: string | null;
  identityName: string | null;
  source: string;
  assignedAt: number | null;
  updatedAt: number | null;
  department: string | null;
  riskLevel: string | null;
  status: string;
};

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch entitlement members");
    return res.json();
  });

export default function useEntitlementMembers(
  appId: string,
  entitlementId: string | null,
  page = 0,
  size = 20
) {
  const { data: response, isLoading, error } = useSWR(
    entitlementId
      ? `/api/applications/${appId}/entitlements/${entitlementId}/members?page=${page}&size=${size}`
      : null,
    fetcher,
    { keepPreviousData: true }
  );

  return {
    members: (response?.data || []) as EntitlementMember[],
    pagination: response?.pagination as PaginationType | undefined,
    isLoading,
    error,
  };
}
