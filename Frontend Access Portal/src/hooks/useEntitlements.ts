import { useState, useCallback, useEffect } from "react";
import type {
  EntitlementResponseDto,
  EntitlementsPage,
} from "@/types/entitlements";
import type {
  EntitlementApplicationCountResponse,
  EntitlementClassificationKpiResponse,
  EntitlementIntelligenceKpiResponse,
  EntitlementRiskDistributionResponse,
  EntitlementRiskKpiResponse,
  EntitlementSprawlKpiResponse,
} from "@/types/entitlementAnalytics";

export async function fetchEntitlementById(
  id: string
): Promise<EntitlementResponseDto> {
  const res = await fetch(`/api/access-catalogue/entitlements/${id}`);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Failed to fetch entitlement ${id} (${res.status})`
    );
  }

  return res.json() as Promise<EntitlementResponseDto>;
}

export interface UseEntitlementDetailResult {
  entitlement: EntitlementResponseDto | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useEntitlementDetail(
  id: string | null | undefined
): UseEntitlementDetailResult {
  const [entitlement, setEntitlement] =
    useState<EntitlementResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (entitlementId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchEntitlementById(entitlementId);
      console.log("Entitlement: Result:", JSON.stringify(result, null, 2));
      setEntitlement(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to load entitlement ${entitlementId}`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      load(id);
    } else {
      setEntitlement(null);
      setError(null);
    }
  }, [id, load]);

  const refresh = useCallback(() => {
    if (id) load(id);
  }, [id, load]);

  return { entitlement, loading, error, refresh };
}

export interface EntitlementMember {
  assignmentId: string;
  shadowId: string;
  accountName: string;
  identityId: string;
  identityName: string | null;
  source: string;
  assignedAt: number;
  updatedAt: number;
}

export interface EntitlementMembersPage {
  content: EntitlementMember[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  first: boolean;
  empty: boolean;
}

export interface FetchEntitlementMembersParams {
  page?: number;
  size?: number;
  sort?: string;
}

export async function fetchEntitlementMembers(
  entitlementId: string,
  params: FetchEntitlementMembersParams = {}
): Promise<EntitlementMembersPage> {
  const { page = 0, size = 20, sort } = params;

  const query = new URLSearchParams();
  query.append("page", String(page));
  query.append("size", String(size));
  if (sort) query.append("sort", sort);

  const res = await fetch(
    `/api/access-catalogue/entitlements/${entitlementId}/members?${query.toString()}`
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Failed to fetch entitlement members (${res.status})`
    );
  }

  return res.json() as Promise<EntitlementMembersPage>;
}

export interface UseEntitlementMembersOptions {
  autoFetch?: boolean;
  initialPage?: number;
  initialSize?: number;
  initialSort?: string;
}

export interface UseEntitlementMembersResult {
  members: EntitlementMember[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  isFirst: boolean;
  isLast: boolean;
  loading: boolean;
  error: string | null;
  goToPage: (page: number) => void;
  changePageSize: (size: number) => void;
  changeSort: (sort: string) => void;
  refresh: () => void;
}

export function useEntitlementMembers(
  entitlementId: string | null | undefined,
  options: UseEntitlementMembersOptions = {}
): UseEntitlementMembersResult {
  const {
    autoFetch = true,
    initialPage = 0,
    initialSize = 20,
    initialSort,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [sort, setSort] = useState<string | undefined>(initialSort);

  const [data, setData] = useState<EntitlementMembersPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: number, s: number, so?: string) => {
    if (!entitlementId) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await fetchEntitlementMembers(entitlementId, {
        page: p,
        size: s,
        sort: so,
      });
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load entitlement members"
      );
    } finally {
      setLoading(false);
    }
  }, [entitlementId]);

  useEffect(() => {
    if (autoFetch && entitlementId) {
      load(page, size, sort);
    } else if (!entitlementId) {
      setData(null);
      setError(null);
    }
  }, [autoFetch, load, page, size, sort, entitlementId]);

  const goToPage = useCallback((newPage: number) => setPage(newPage), []);

  const changePageSize = useCallback((newSize: number) => {
    setSize(newSize);
    setPage(0);
  }, []);

  const changeSort = useCallback((newSort: string) => {
    setSort(newSort);
    setPage(0);
  }, []);

  const refresh = useCallback(() => {
    load(page, size, sort);
  }, [load, page, size, sort]);

  return {
    members: data?.content ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    currentPage: data?.number ?? page,
    pageSize: data?.size ?? size,
    isFirst: data?.first ?? true,
    isLast: data?.last ?? false,
    loading,
    error,
    goToPage,
    changePageSize,
    changeSort,
    refresh,
  };
}

export interface FetchEntitlementsParams {
  page?: number;
  size?: number;
  sort?: string;
  resourceId?: string;
  search?: string;
  riskLevel?: string;
  lifecycle?: string;
  kind?: string;
  classified?: boolean;
  requestable?: boolean;
  hasOwner?: boolean;
  ownerId?: string;
  assignmentSource?: string;
  minAssignedUsers?: number;
  maxAssignedUsers?: number;
}

export async function fetchEntitlements(
  params: FetchEntitlementsParams = {}
): Promise<EntitlementsPage> {
  const {
    page = 0,
    size = 10,
    sort,
    resourceId,
    search,
    riskLevel,
    lifecycle,
    kind,
    classified,
    requestable,
    hasOwner,
    ownerId,
    assignmentSource,
    minAssignedUsers,
    maxAssignedUsers,
  } = params;

  const query = new URLSearchParams();
  query.append("page", String(page));
  query.append("size", String(size));

  if (sort) query.append("sort", sort);
  if (resourceId) query.append("resourceId", resourceId);
  if (search) query.append("search", search);
  if (riskLevel) query.append("riskLevel", riskLevel);
  if (lifecycle) query.append("lifecycle", lifecycle);
  if (kind) query.append("kind", kind);
  if (classified !== undefined) query.append("classified", String(classified));
  if (requestable !== undefined) query.append("requestable", String(requestable));
  if (hasOwner !== undefined) query.append("hasOwner", String(hasOwner));
  if (ownerId) query.append("ownerId", ownerId);
  if (assignmentSource) query.append("assignmentSource", assignmentSource);
  if (minAssignedUsers !== undefined) query.append("minAssignedUsers", String(minAssignedUsers));
  if (maxAssignedUsers !== undefined) query.append("maxAssignedUsers", String(maxAssignedUsers));

  const res = await fetch(
    `/api/access-catalogue/entitlements?${query.toString()}`
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Failed to fetch entitlements (${res.status})`
    );
  }

  return res.json() as Promise<EntitlementsPage>;
}

export async function fetchEntitlementIntelligenceKpis(): Promise<EntitlementIntelligenceKpiResponse> {
  const res = await fetch("/api/access-catalogue/entitlements/analytics/intelligence-kpi");

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Failed to fetch intelligence KPIs (${res.status})`
    );
  }

  return res.json() as Promise<EntitlementIntelligenceKpiResponse>;
}

export async function fetchEntitlementApplicationCounts(): Promise<EntitlementApplicationCountResponse> {
  const res = await fetch("/api/access-catalogue/entitlements/analytics/application-count");

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Failed to fetch application counts (${res.status})`
    );
  }

  return res.json() as Promise<EntitlementApplicationCountResponse>;
}

export async function fetchEntitlementClassificationKpis(): Promise<EntitlementClassificationKpiResponse> {
  const res = await fetch("/api/access-catalogue/entitlements/analytics/classification-kpi");

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Failed to fetch classification KPIs (${res.status})`
    );
  }

  return res.json() as Promise<EntitlementClassificationKpiResponse>;
}

export async function fetchEntitlementRiskKpis(): Promise<EntitlementRiskKpiResponse> {
  const res = await fetch("/api/access-catalogue/entitlements/analytics/risk-kpi");

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Failed to fetch risk KPIs (${res.status})`
    );
  }

  return res.json() as Promise<EntitlementRiskKpiResponse>;
}

export async function fetchEntitlementSprawlKpis(): Promise<EntitlementSprawlKpiResponse> {
  const res = await fetch("/api/access-catalogue/entitlements/analytics/sprawl-kpi");

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Failed to fetch sprawl KPIs (${res.status})`
    );
  }

  return res.json() as Promise<EntitlementSprawlKpiResponse>;
}

export async function fetchEntitlementRiskDistribution(): Promise<EntitlementRiskDistributionResponse> {
  const res = await fetch("/api/access-catalogue/entitlements/analytics/risk-distribution");

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Failed to fetch risk distribution (${res.status})`
    );
  }

  return res.json() as Promise<EntitlementRiskDistributionResponse>;
}

export interface UseEntitlementIntelligenceKpisResult {
  data: EntitlementIntelligenceKpiResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useEntitlementIntelligenceKpis(): UseEntitlementIntelligenceKpisResult {
  const [data, setData] = useState<EntitlementIntelligenceKpiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchEntitlementIntelligenceKpis();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load intelligence KPIs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}

export interface UseEntitlementApplicationCountsResult {
  data: EntitlementApplicationCountResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useEntitlementApplicationCounts(): UseEntitlementApplicationCountsResult {
  const [data, setData] = useState<EntitlementApplicationCountResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchEntitlementApplicationCounts();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load entitlement application counts"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}

export interface UseEntitlementClassificationKpisResult {
  data: EntitlementClassificationKpiResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useEntitlementClassificationKpis(): UseEntitlementClassificationKpisResult {
  const [data, setData] = useState<EntitlementClassificationKpiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchEntitlementClassificationKpis();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load classification KPIs"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}

export interface UseEntitlementRiskKpisResult {
  data: EntitlementRiskKpiResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useEntitlementRiskKpis(): UseEntitlementRiskKpisResult {
  const [data, setData] = useState<EntitlementRiskKpiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchEntitlementRiskKpis();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load risk KPIs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}

export interface UseEntitlementSprawlKpisResult {
  data: EntitlementSprawlKpiResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useEntitlementSprawlKpis(): UseEntitlementSprawlKpisResult {
  const [data, setData] = useState<EntitlementSprawlKpiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchEntitlementSprawlKpis();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sprawl KPIs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}

export interface UseEntitlementRiskDistributionResult {
  data: EntitlementRiskDistributionResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useEntitlementRiskDistribution(): UseEntitlementRiskDistributionResult {
  const [data, setData] = useState<EntitlementRiskDistributionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchEntitlementRiskDistribution();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load risk distribution"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}

export interface UseEntitlementsOptions {
  autoFetch?: boolean;
  initialPage?: number;
  initialSize?: number;
  initialSort?: string;
  initialResourceId?: string;
  initialSearch?: string;
  initialRiskLevel?: string;
  initialLifecycle?: string;
  initialKind?: string;
  initialClassified?: boolean;
  initialRequestable?: boolean;
  initialHasOwner?: boolean;
  initialOwnerId?: string;
  initialAssignmentSource?: string;
  initialMinAssignedUsers?: number;
  initialMaxAssignedUsers?: number;
}

export interface UseEntitlementsResult {
  entitlements: EntitlementResponseDto[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  isFirst: boolean;
  isLast: boolean;
  loading: boolean;
  error: string | null;
  filters: Omit<FetchEntitlementsParams, "page" | "size" | "sort">;
  goToPage: (page: number) => void;
  changePageSize: (size: number) => void;
  changeSort: (sort: string) => void;
  setFilters: (
    filters: Partial<Omit<FetchEntitlementsParams, "page" | "size" | "sort">>
  ) => void;
  replaceFilters: (
    filters: Omit<FetchEntitlementsParams, "page" | "size" | "sort">
  ) => void;
  refresh: () => void;
}

export function useEntitlements(
  options: UseEntitlementsOptions = {}
): UseEntitlementsResult {
  const {
    autoFetch = true,
    initialPage = 0,
    initialSize = 10,
    initialSort,
    initialResourceId,
    initialSearch,
    initialRiskLevel,
    initialLifecycle,
    initialKind,
    initialClassified,
    initialRequestable,
    initialHasOwner,
    initialOwnerId,
    initialAssignmentSource,
    initialMinAssignedUsers,
    initialMaxAssignedUsers,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [sort, setSort] = useState<string | undefined>(initialSort);

  const [filters, setFilterState] = useState<
    Omit<FetchEntitlementsParams, "page" | "size" | "sort">
  >({
    resourceId: initialResourceId,
    search: initialSearch,
    riskLevel: initialRiskLevel,
    lifecycle: initialLifecycle,
    kind: initialKind,
    classified: initialClassified,
    requestable: initialRequestable,
    hasOwner: initialHasOwner,
    ownerId: initialOwnerId,
    assignmentSource: initialAssignmentSource,
    minAssignedUsers: initialMinAssignedUsers,
    maxAssignedUsers: initialMaxAssignedUsers,
  });

  const [data, setData] = useState<EntitlementsPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (
      p: number,
      s: number,
      so?: string,
      currentFilters: Omit<FetchEntitlementsParams, "page" | "size" | "sort"> = filters
    ) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchEntitlements({
          ...currentFilters,
          page: p,
          size: s,
          sort: so,
        });
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load entitlements"
        );
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    if (autoFetch) {
      load(page, size, sort, filters);
    }
  }, [autoFetch, load, page, size, sort, filters]);

  const goToPage = useCallback((newPage: number) => setPage(newPage), []);

  const changePageSize = useCallback((newSize: number) => {
    setSize(newSize);
    setPage(0);
  }, []);

  const changeSort = useCallback((newSort: string) => {
    setSort(newSort);
    setPage(0);
  }, []);

  const setFilters = useCallback((
    nextFilters: Partial<Omit<FetchEntitlementsParams, "page" | "size" | "sort">>
  ) => {
    setFilterState((prev) => ({
      ...prev,
      ...nextFilters,
    }));
    setPage(0);
  }, []);

  const replaceFilters = useCallback((
    nextFilters: Omit<FetchEntitlementsParams, "page" | "size" | "sort">
  ) => {
    setFilterState(nextFilters);
    setPage(0);
  }, []);

  const refresh = useCallback(() => {
    load(page, size, sort, filters);
  }, [load, page, size, sort, filters]);

  return {
    entitlements: data?.content ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    currentPage: data?.number ?? page,
    pageSize: data?.size ?? size,
    isFirst: data?.first ?? true,
    isLast: data?.last ?? false,
    loading,
    error,
    filters,
    goToPage,
    changePageSize,
    changeSort,
    setFilters,
    replaceFilters,
    refresh,
  };
}