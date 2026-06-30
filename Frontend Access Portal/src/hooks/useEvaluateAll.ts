import { useState, useCallback } from "react";

export interface EvaluateAllResult {
  ruleId: string;
  ruleName: string;
  identitiesMatched: number;
  assignmentsCreated: number;
  assignmentsRevoked: number;
  skippedNoShadow: number;
  success: boolean;
  errorMessage: string | null;
  durationMs: number;
}

export interface UseEvaluateAllReturn {
  evaluating: boolean;
  results: EvaluateAllResult[] | null;
  error: string | null;
  successMessage: string | null;
  evaluateAll: () => Promise<void>;
  clearResult: () => void;
}

/**
 * Hook for triggering evaluation of all enabled assignment rules.
 */
export function useEvaluateAll(): UseEvaluateAllReturn {
  const [evaluating, setEvaluating] = useState(false);
  const [results, setResults] = useState<EvaluateAllResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const evaluateAll = useCallback(async () => {
    setEvaluating(true);
    setError(null);
    setSuccessMessage(null);
    setResults(null);

    try {
      const res = await fetch(
        "/api/access-catalogue/entitlements/evaluate-all",
        { method: "POST" }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error ||
            `Failed to evaluate all rules (${res.status})`
        );
      }

      const data = (await res.json()) as EvaluateAllResult[];
      setResults(data);

      const total = data.length;
      const succeeded = data.filter((r) => r.success !== false).length;
      setSuccessMessage(
        `Evaluation complete: ${succeeded}/${total} rules succeeded.`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Evaluation failed"
      );
    } finally {
      setEvaluating(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
    setResults(null);
  }, []);

  return {
    evaluating,
    results,
    error,
    successMessage,
    evaluateAll,
    clearResult,
  };
}