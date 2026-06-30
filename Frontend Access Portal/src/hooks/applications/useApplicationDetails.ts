import { RecivedApplication } from "@/types/add-application";
import { getFetcher } from "./fetcher";
import useSWR from "swr";

/**
 * Client-side hook to fetch a single application's details.
 * Useful for components that need app metadata (e.g., isAuthoritative)
 * but live outside the AddApplicationContext.
 */
export default function useApplicationDetails(appid: string) {
  const { data, error, isLoading } = useSWR<RecivedApplication>(
    `/api/applications/${appid}`,
    getFetcher("Failed to load application details"),
    { revalidateOnFocus: false }
  );

  return {
    application: data ?? null,
    isAuthoritative: data?.details?.isAuthoritative ?? false,
    isLoading,
    error,
  };
}
