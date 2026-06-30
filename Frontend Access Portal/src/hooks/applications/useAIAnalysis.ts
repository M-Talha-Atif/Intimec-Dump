import { AIRiskCard } from "@/types/ai-analysis";
import { PaginationType } from "@/types/pagination";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to fetch AI Analysis Results");
    }
    return res.json();
  });

type ResultMetadataType = {
  lowRiskCount: number;
  mediumRiskCount: number;
  highRiskCount: number;
  lastScan: number;
};

export type UserAIAnalysisResponse = {
  data?: AIRiskCard[];
  metadata?: ResultMetadataType;
  pagination?: PaginationType;
  error?: string;
  isLoading: boolean;
  refresh: () => void;
};

export default function useAIAnalysis(appid: string): UserAIAnalysisResponse {
  const searchParams = useSearchParams();
  const query = new URLSearchParams();
  query.set("page", searchParams.get("page") || "0");
  query.set("size", searchParams.get("size") || "10");
  const queryUrl = `/api/applications/${appid}/ai-analysis?${query.toString()}`;

  const {
    data: response,
    error,
    isLoading,
    mutate,
  } = useSWR(queryUrl, fetcher);

  return {
    isLoading,
    error,
    data: response?.data?.results || undefined,
    pagination: response?.pagination || {},
    metadata: response?.data?.metadata || undefined,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}