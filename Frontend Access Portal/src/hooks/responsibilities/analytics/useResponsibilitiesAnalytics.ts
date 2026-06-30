import { useState, useCallback, useEffect } from "react";

export interface ResponsibilitiesKpisData {
  totalResponsibilities: number;
  pendingTasks: number;
  ownedRoles: number;
  ownedRolesTotalMembers: number;
}

async function fetchResponsibilitiesKpis(): Promise<ResponsibilitiesKpisData> {
  const res = await fetch("/api/responsibilities/analytics/kpis");
  if (!res.ok) throw new Error("Failed to fetch responsibilities KPIs");
  return res.json();
}

interface UseResponsibilitiesAnalyticsOptions {
  autoFetch?: boolean;
}

export function useResponsibilitiesAnalytics(
  options: UseResponsibilitiesAnalyticsOptions = {}
) {
  const { autoFetch = true } = options;

  const [kpis,        setKpis]        = useState<ResponsibilitiesKpisData | null>(null);
  const [kpisLoading, setKpisLoading] = useState(false);
  const [kpisError,   setKpisError]   = useState<string | null>(null);

  const loadKpis = useCallback(async () => {
    setKpisLoading(true);
    setKpisError(null);
    try {
      setKpis(await fetchResponsibilitiesKpis());
    } catch {
      setKpisError("Failed to load responsibilities KPIs");
    } finally {
      setKpisLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) loadKpis();
  }, [autoFetch, loadKpis]);

  return {
    kpis,
    kpisLoading,
    kpisError,
    loadKpis,
  };
}