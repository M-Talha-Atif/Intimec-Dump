// auditing/analytics
import { useState, useEffect, useCallback } from "react";

// ---- Types matching backend response shapes ----

export interface AuditKpisData {
    totalEvents: number;
    highRiskCount: number;
    failedOperationsCount: number;
    failedOperationsPercentage: number;
}

export interface EventVolumeEntry {
    date: string;    // formatted label e.g. "Mar 18"
    isoDate: string; // actual ISO date string e.g. "2026-03-18" -- derived in hook, not from backend
    low: number;
    medium: number;
    high: number;
}

export interface EventDistributionEntry {
    eventName: string;
    count: number;
}

export interface TopActorEntry {
    name: string;
    type: string;
    events: number;
    failures: number;
    riskLevel: "low" | "medium" | "high";
}

export interface HeatmapEntry {
    objectType: string;
    eventName: string;
    count: number;
}

// Drilldown drawer -- maps to AuditLog entity from backend
export interface DrilldownAuditLog {
    id: string;
    actorId: string;
    actorType: string;
    actorName: string;
    tenantId: string;
    objectId: string;
    objectType: string;
    event: string;
    status: string;
    risk: string;
    timestamp: string;
    details: Record<string, unknown> | null;
    stateBefore: Record<string, unknown> | null;
    stateAfter: Record<string, unknown> | null;
}

export interface DrilldownFilters {
    event?: string;
    objectType?: string;
    risk?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: number;
    size?: number;
}

export interface DrilldownPage {
    content: DrilldownAuditLog[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

interface UseAnalyticsOptions {
    // When true fires all analytics fetches on mount automatically
    autoFetch?: boolean;
    // range=all skips the 30-day default window
    range?: "all" | null;
}

// ---- Individual fetchers ----

async function fetchKpis(range?: string): Promise<AuditKpisData> {
    const params = new URLSearchParams();
    if (range) params.append("range", range);
    const res = await fetch(
        `/api/audit-logs/analytics/kpis?${params.toString()}`
    );
    if (!res.ok) throw new Error("Failed to fetch KPIs");
    return res.json();
}

async function fetchEventVolume(range?: string): Promise<EventVolumeEntry[]> {
    const params = new URLSearchParams();
    if (range) params.append("range", range);
    const res = await fetch(
        `/api/audit-logs/analytics/event-volume?${params.toString()}`
    );
    if (!res.ok) throw new Error("Failed to fetch event volume");

    const raw: Array<{ date: string; low: number; medium: number; high: number }> =
        await res.json();

    // The backend formats dates as "MMM dd" e.g. "Mar 18".
    // We need the actual ISO date string for building accurate dateFrom/dateTo
    // bounds when the user clicks a data point. We cannot rely on JS date parsing
    // of "MMM dd" because it is locale-sensitive and timezone-dependent.
    // Instead we derive isoDate by finding this entry's index position relative
    // to today and counting backwards -- but the simplest reliable approach is
    // to parse once with a fixed locale using Date.parse with a full date string
    // and then format back to YYYY-MM-DD in UTC.
    const currentYear = new Date().getFullYear();

    return raw.map((entry) => {
        // Build a full date string the JS engine can parse unambiguously
        // "Mar 18 2026 UTC" forces UTC interpretation -- avoids local timezone drift
        const parsed = new Date(`${entry.date} ${currentYear} UTC`);
        const isoDate = isNaN(parsed.getTime())
            ? ""
            : parsed.toISOString().split("T")[0]; // "2026-03-18"

        return {
            ...entry,
            isoDate,
        };
    });
}
async function fetchEventDistribution(
    range?: string,
    limit?: number
): Promise<EventDistributionEntry[]> {
    const params = new URLSearchParams();
    if (range) params.append("range", range);
    if (limit !== undefined) params.append("limit", String(limit));
    const res = await fetch(
        `/api/audit-logs/analytics/event-distribution?${params.toString()}`
    );
    if (!res.ok) throw new Error("Failed to fetch event distribution");
    return res.json();
}

async function fetchTopActors(
    range?: string,
    limit?: number
): Promise<TopActorEntry[]> {
    const params = new URLSearchParams();
    if (range) params.append("range", range);
    if (limit !== undefined) params.append("limit", String(limit));
    const res = await fetch(
        `/api/audit-logs/analytics/top-actors?${params.toString()}`
    );
    if (!res.ok) throw new Error("Failed to fetch top actors");
    return res.json();
}

async function fetchHeatmap(
    range?: string,
    limit?: number
): Promise<HeatmapEntry[]> {
    const params = new URLSearchParams();
    if (range) params.append("range", range);
    if (limit !== undefined) params.append("limit", String(limit));
    const res = await fetch(
        `/api/audit-logs/analytics/heatmap?${params.toString()}`
    );
    if (!res.ok) throw new Error("Failed to fetch heatmap");
    return res.json();
}

export async function fetchDrilldown(
    filters: DrilldownFilters
): Promise<DrilldownPage> {
    const params = new URLSearchParams();
    if (filters.event) params.append("event", filters.event);
    if (filters.objectType) params.append("objectType", filters.objectType);
    if (filters.risk) params.append("risk", filters.risk);
    if (filters.status) params.append("status", filters.status);
    if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.append("dateTo", filters.dateTo);
    if (filters.search) params.append("search", filters.search);
    params.append("page", String(filters.page ?? 0));
    params.append("size", String(filters.size ?? 25));

    const res = await fetch(
        `/api/audit-logs/drilldown?${params.toString()}`
    );
    if (!res.ok) throw new Error("Failed to fetch drilldown logs");
    const data = await res.json();
    // Backend wraps audit logs in { logs: { content, totalElements, ... } }
    return data.logs as DrilldownPage;
}

// ---- Main hook ----

export function useAuditAnalytics(options: UseAnalyticsOptions = {}) {
    const { autoFetch = true, range } = options;

    const [kpis, setKpis] = useState<AuditKpisData | null>(null);
    const [eventVolume, setEventVolume] = useState<EventVolumeEntry[]>([]);
    const [eventDistribution, setEventDistribution] = useState<EventDistributionEntry[]>([]);
    const [topActors, setTopActors] = useState<TopActorEntry[]>([]);
    const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([]);

    const [kpisLoading, setKpisLoading] = useState(false);
    const [volumeLoading, setVolumeLoading] = useState(false);
    const [distributionLoading, setDistributionLoading] = useState(false);
    const [actorsLoading, setActorsLoading] = useState(false);
    const [heatmapLoading, setHeatmapLoading] = useState(false);

    const [kpisError, setKpisError] = useState<string | null>(null);
    const [volumeError, setVolumeError] = useState<string | null>(null);
    const [distributionError, setDistributionError] = useState<string | null>(null);
    const [actorsError, setActorsError] = useState<string | null>(null);
    const [heatmapError, setHeatmapError] = useState<string | null>(null);

    const rangeParam = range ?? undefined;

    const loadKpis = useCallback(async () => {
        setKpisLoading(true);
        setKpisError(null);
        try {
            const data = await fetchKpis(rangeParam);
            setKpis(data);
        } catch (e) {
            setKpisError("Failed to load KPIs");
        } finally {
            setKpisLoading(false);
        }
    }, [rangeParam]);

    const loadEventVolume = useCallback(async () => {
        setVolumeLoading(true);
        setVolumeError(null);
        try {
            const data = await fetchEventVolume(rangeParam);
            setEventVolume(data);
        } catch (e) {
            setVolumeError("Failed to load event volume");
        } finally {
            setVolumeLoading(false);
        }
    }, [rangeParam]);

    const loadEventDistribution = useCallback(async () => {
        setDistributionLoading(true);
        setDistributionError(null);
        try {
            // Default top 10 matches backend default
            const data = await fetchEventDistribution(rangeParam, 10);
            setEventDistribution(data);
        } catch (e) {
            setDistributionError("Failed to load event distribution");
        } finally {
            setDistributionLoading(false);
        }
    }, [rangeParam]);

    const loadTopActors = useCallback(async () => {
        setActorsLoading(true);
        setActorsError(null);
        try {
            const data = await fetchTopActors(rangeParam, 10);
            setTopActors(data);
        } catch (e) {
            setActorsError("Failed to load top actors");
        } finally {
            setActorsLoading(false);
        }
    }, [rangeParam]);

    const loadHeatmap = useCallback(async () => {
        setHeatmapLoading(true);
        setHeatmapError(null);
        try {
            // limit=0 returns all cells so the matrix is complete
            const data = await fetchHeatmap(rangeParam, 0);
            setHeatmap(data);
        } catch (e) {
            setHeatmapError("Failed to load heatmap");
        } finally {
            setHeatmapLoading(false);
        }
    }, [rangeParam]);

    const loadAll = useCallback(() => {
        loadKpis();
        loadEventVolume();
        loadEventDistribution();
        loadTopActors();
        loadHeatmap();
    }, [loadKpis, loadEventVolume, loadEventDistribution, loadTopActors, loadHeatmap]);

    useEffect(() => {
        if (autoFetch) loadAll();
    }, [autoFetch, loadAll]);

    return {
        // Data
        kpis,
        eventVolume,
        eventDistribution,
        topActors,
        heatmap,

        // Loading states per section
        kpisLoading,
        volumeLoading,
        distributionLoading,
        actorsLoading,
        heatmapLoading,

        // Error states per section
        kpisError,
        volumeError,
        distributionError,
        actorsError,
        heatmapError,

        // Manual reload triggers
        loadKpis,
        loadEventVolume,
        loadEventDistribution,
        loadTopActors,
        loadHeatmap,
        loadAll,
    };
}