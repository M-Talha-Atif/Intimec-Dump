import { useState, useCallback, useEffect } from "react";

export interface GlobalScheduleConfig {
  scheduleType: string;
  cronExpression: string;
  scheduleTimezone: string;
}

export interface GlobalScheduleResponse {
  scheduleType: string | null;
  cronExpression: string | null;
  scheduleTimezone: string | null;
  updatedAt: number | null;
}

export interface UseGlobalScheduleReturn {
  /** The current schedule config fetched from the backend */
  currentConfig: GlobalScheduleResponse | null;
  /** Whether the current config is being loaded */
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: boolean;
  updateSchedule: (config: GlobalScheduleConfig) => Promise<void>;
  clearState: () => void;
}

/**
 * Hook for fetching and updating the global schedule configuration
 * for all assignment rules.
 */
export function useGlobalSchedule(): UseGlobalScheduleReturn {
  const [currentConfig, setCurrentConfig] =
    useState<GlobalScheduleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "/api/access-catalogue/entitlements/global-schedule"
      );

      if (!res.ok) {
        // 404 means no schedule configured yet — not an error
        if (res.status === 404) {
          setCurrentConfig(null);
          return;
        }
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error ||
            `Failed to fetch schedule (${res.status})`
        );
      }

      const data = (await res.json()) as GlobalScheduleResponse;
      setCurrentConfig(data);
    } catch (err) {
      console.error("[useGlobalSchedule] Failed to fetch config:", err);
      // Don't set error state for fetch — it's non-blocking
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateSchedule = useCallback(
    async (config: GlobalScheduleConfig) => {
      setSaving(true);
      setError(null);
      setSuccess(false);

      try {
        const res = await fetch(
          "/api/access-catalogue/entitlements/global-schedule",
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(config),
          }
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            (body as { error?: string }).error ||
              `Failed to update schedule (${res.status})`
          );
        }

        setSuccess(true);
        // Refresh the stored config after successful update
        await fetchConfig();
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to update schedule";
        setError(msg);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [fetchConfig]
  );

  const clearState = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    currentConfig,
    loading,
    saving,
    error,
    success,
    updateSchedule,
    clearState,
  };
}