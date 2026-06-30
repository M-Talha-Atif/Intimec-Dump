import { useMemo } from "react";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to fetch Access Matrix");
    }
    return res.json();
  });

interface UseAccessMatrixResponse {
  links?: { col: number; row: number }[];
  rowLabels?: string[];
  colLabels?: string[];
  isLoading: boolean;
  error: Error | undefined;
  refresh: () => void;
  numRows?: number;
  numCols?: number;
}

export default function useAccessMatrix(
  appId: string | number
): UseAccessMatrixResponse {
  const {
    data: response,
    isLoading,
    error,
    mutate,
  } = useSWR(`/api/applications/${appId}/access-matrix`, fetcher, {
    keepPreviousData: true,
  });

  const parsedLinks = useMemo(() => {
    if (!response || !response.links || !Array.isArray(response.links))
      return undefined;
    return response.links.map((link: string) => {
      const [col, row] = link.split(",").map(Number);
      return { col, row };
    });
  }, [response]);

  return {
    links: parsedLinks,
    colLabels: response?.entitlements,
    rowLabels: response?.accounts,
    isLoading,
    error,
    numRows: response?.accounts.length,
    numCols: response?.entitlements.length,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}
