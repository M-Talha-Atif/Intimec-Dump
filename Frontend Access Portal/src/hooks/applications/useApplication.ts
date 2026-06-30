import useSWR from "swr";
import { getFetcher } from "./fetcher";
import { FinalFormDataOutput } from "@/types/add-application";

const useApplication = (applicationId: string | null) =>
  useSWR<FinalFormDataOutput>(
    applicationId !== null ? `/api/applications/${applicationId}` : null,
    getFetcher("Failed to fetch application details"),
  );

export default useApplication;
