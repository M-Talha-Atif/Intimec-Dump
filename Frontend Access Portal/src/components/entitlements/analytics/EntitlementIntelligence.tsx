import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InfoTooltip from "@/components/dashboard/InfoTooltip";
import {
  Layers,
  ShieldCheck,
  Archive,
  UserX,
  Users,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import CatalogKpiDrilldownModal, {
  KpiDrilldownItem,
} from "@/components/access-catalog/modals/CatalogKpiDrilldownModal";
import CatalogChartDrilldownModal from "@/components/access-catalog/modals/CatalogChartDrilldownModal";
import {
  fetchEntitlements,
  useEntitlementApplicationCounts,
  useEntitlementIntelligenceKpis,
} from "@/hooks/useEntitlements";
import type { FetchEntitlementsParams } from "@/hooks/useEntitlements";
import { mockEntitlements } from "@/data/mock-entitlements";

const CHART_COLORS = [
  "#4F8EF7",
  "#34D399",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
];

const DEFAULT_PAGE_SIZE = 10;

type DrilldownState = {
  title: string;
  description?: string;
  query: FetchEntitlementsParams;
  page: number;
  pageSize: number;
  items: KpiDrilldownItem[];
  totalPages: number;
  totalElements: number;
  loading: boolean;
};

type ChartDrilldownState = {
  title: string;
  segmentLabel: string;
  segmentColor: string;
  query: FetchEntitlementsParams;
  page: number;
  pageSize: number;
  items: KpiDrilldownItem[];
  totalPages: number;
  totalElements: number;
  loading: boolean;
};

const EntitlementIntelligence = () => {
  const intelligenceKpis = useEntitlementIntelligenceKpis();
  const applicationCounts = useEntitlementApplicationCounts();

  const [kpiModal, setKpiModal] = useState<DrilldownState | null>(null);
  const [chartModal, setChartModal] = useState<ChartDrilldownState | null>(
    null
  );

  // Fetch ID counters — increment on every state change that should trigger a fetch
  const kpiFetchId = useRef(0);
  const chartFetchId = useRef(0);

  const kpisLoading = intelligenceKpis.loading;

  const toItems = useCallback(
    (
      ents: {
        id: string;
        displayName: string;
        resourceName?: string;
        kind?: string;
        riskLevel?: string | null;
      }[]
    ): KpiDrilldownItem[] =>
      ents.map((e) => ({
        id: e.id,
        name: e.displayName,
        detail: `${e.resourceName ?? "Unknown Application"} · ${e.kind ?? "entitlement"}`,
        badge: e.riskLevel ?? undefined,
        badgeVariant:
          e.riskLevel?.toUpperCase() === "HIGH" ? "destructive" : "outline",
      })),
    []
  );

  // ── KPI Modal ──

  const loadKpiModalPage = useCallback(
    async (
      title: string,
      description: string,
      query: FetchEntitlementsParams,
      page: number,
      pageSize: number
    ) => {
      const fetchId = ++kpiFetchId.current;

      try {
        const result = await fetchEntitlements({
          ...query,
          page,
          size: pageSize,
          sort: "displayName,asc",
        });

        // Stale check — only apply if this is still the latest fetch
        if (fetchId !== kpiFetchId.current) return;

        // Clamp: if the requested page is beyond what the server returned,
        // re-fetch page 0 instead of showing empty
        if (page > 0 && result.content.length === 0 && result.totalPages > 0) {
          const clampedPage = Math.max(0, result.totalPages - 1);
          setKpiModal({
            title,
            description,
            query,
            page: clampedPage,
            pageSize,
            items: [],
            totalPages: result.totalPages,
            totalElements: result.totalElements,
            loading: true,
          });
          return;
        }

        setKpiModal({
          title,
          description,
          query,
          page,
          pageSize,
          items: toItems(result.content),
          totalPages: result.totalPages,
          totalElements: result.totalElements,
          loading: false,
        });
      } catch {
        if (fetchId !== kpiFetchId.current) return;
        setKpiModal({
          title,
          description,
          query,
          page: 0,
          pageSize,
          items: [],
          totalPages: 0,
          totalElements: 0,
          loading: false,
        });
      }
    },
    [toItems]
  );

  const openKpiModal = useCallback(
    async (
      title: string,
      description: string,
      query: FetchEntitlementsParams
    ) => {
      setKpiModal({
        title,
        description,
        query,
        page: 0,
        pageSize: DEFAULT_PAGE_SIZE,
        items: [],
        totalPages: 0,
        totalElements: 0,
        loading: true,
      });
      await loadKpiModalPage(title, description, query, 0, DEFAULT_PAGE_SIZE);
    },
    [loadKpiModalPage]
  );

  // Re-fetch when kpiModal loading becomes true
  useEffect(() => {
    if (!kpiModal || !kpiModal.loading) return;
    loadKpiModalPage(
      kpiModal.title,
      kpiModal.description ?? "",
      kpiModal.query,
      kpiModal.page,
      kpiModal.pageSize
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiModal?.page, kpiModal?.pageSize, kpiModal?.loading]);

  // ── Chart Modal ──

  const loadChartModalPage = useCallback(
    async (
      title: string,
      segmentLabel: string,
      segmentColor: string,
      query: FetchEntitlementsParams,
      page: number,
      pageSize: number
    ) => {
      const fetchId = ++chartFetchId.current;

      try {
        const result = await fetchEntitlements({
          ...query,
          page,
          size: pageSize,
          sort: "displayName,asc",
        });

        if (fetchId !== chartFetchId.current) return;

        // Clamp: if page is out of bounds, redirect to last valid page
        if (page > 0 && result.content.length === 0 && result.totalPages > 0) {
          const clampedPage = Math.max(0, result.totalPages - 1);
          setChartModal({
            title,
            segmentLabel,
            segmentColor,
            query,
            page: clampedPage,
            pageSize,
            items: [],
            totalPages: result.totalPages,
            totalElements: result.totalElements,
            loading: true,
          });
          return;
        }

        setChartModal({
          title,
          segmentLabel,
          segmentColor,
          query,
          page,
          pageSize,
          items: toItems(result.content),
          totalPages: result.totalPages,
          totalElements: result.totalElements,
          loading: false,
        });
      } catch {
        if (fetchId !== chartFetchId.current) return;
        setChartModal({
          title,
          segmentLabel,
          segmentColor,
          query,
          page: 0,
          pageSize,
          items: [],
          totalPages: 0,
          totalElements: 0,
          loading: false,
        });
      }
    },
    [toItems]
  );

  const openChartModal = useCallback(
    async (
      title: string,
      segmentLabel: string,
      segmentColor: string,
      query: FetchEntitlementsParams
    ) => {
      setChartModal({
        title,
        segmentLabel,
        segmentColor,
        query,
        page: 0,
        pageSize: DEFAULT_PAGE_SIZE,
        items: [],
        totalPages: 0,
        totalElements: 0,
        loading: true,
      });
      await loadChartModalPage(
        title,
        segmentLabel,
        segmentColor,
        query,
        0,
        DEFAULT_PAGE_SIZE
      );
    },
    [loadChartModalPage]
  );

  // Re-fetch when chartModal loading becomes true
  useEffect(() => {
    if (!chartModal || !chartModal.loading) return;
    loadChartModalPage(
      chartModal.title,
      chartModal.segmentLabel,
      chartModal.segmentColor,
      chartModal.query,
      chartModal.page,
      chartModal.pageSize
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartModal?.page, chartModal?.pageSize, chartModal?.loading]);

  // ── KPI Cards ──

  const kpiCards = useMemo(() => {
    const data = intelligenceKpis.data;

    return [
      {
        title: "Total Entitlements",
        value: data?.totalEntitlements ?? 0,
        icon: Layers,
        tooltip: "Total entitlements across all applications.",
        query: {} as FetchEntitlementsParams | null,
      },
      {
        title: "Active",
        value: data?.activeEntitlements ?? 0,
        icon: ShieldCheck,
        tooltip: "Entitlements with Active lifecycle.",
        query: { lifecycle: "Active" } as FetchEntitlementsParams | null,
      },
      {
        title: "Without Owners",
        value: data?.orphanedEntitlements ?? 0,
        icon: Archive,
        tooltip: "Entitlements without a valid owner.",
        query: { hasOwner: false } as FetchEntitlementsParams | null,
      },
      {
        title: "Unclassified",
        value: data?.unclassifiedEntitlements ?? 0,
        icon: UserX,
        tooltip: "Entitlements with no classification.",
        query: { classified: false } as FetchEntitlementsParams | null,
      },
      {
        title: "Avg Users",
        value: data?.averageUsersPerEntitlement ?? 0,
        icon: Users,
        tooltip: "Average users per entitlement.",
        query: null,
      },
      {
        title: "High Risk",
        value: data?.highRiskEntitlements ?? 0,
        icon: ShieldAlert,
        tooltip: "Entitlements flagged as High risk.",
        query: { riskLevel: "HIGH" } as FetchEntitlementsParams | null,
      },
    ].map((k) => ({
      ...k,
      onClick: () => {
        if (!k.query) return;
        openKpiModal(k.title, k.tooltip, k.query);
      },
    }));
  }, [intelligenceKpis.data, openKpiModal]);

  // ── Chart Data ──

  const typeData = useMemo(() => {
    const types = ["Group", "Role", "Responsibility", "Policy", "Permission"];
    return types.map((t) => ({
      name: t,
      value: mockEntitlements.filter((e) => e.type === t).length,
    }));
  }, []);

  const appData = useMemo(() => {
    const apps = applicationCounts.data?.applications ?? [];
    return apps
      .map((a) => ({
        name: a.applicationName,
        applicationId: a.applicationId,
        count: a.entitlementCount,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [applicationCounts.data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border bg-popover p-2 shadow-md">
        <p className="text-xs font-medium">{label || payload[0]?.name}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-xs" style={{ color: p.fill || p.color }}>
            {p.name || p.dataKey}:{" "}
            <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  };

  // ── Page change handlers with clamping ──

  const handleKpiPageChange = useCallback(
    (page: number) => {
      setKpiModal((prev) => {
        if (!prev) return prev;
        const maxPage = Math.max(0, prev.totalPages - 1);
        const clampedPage = Math.max(0, Math.min(page, maxPage));
        // Don't trigger a re-fetch if we're already on this page
        if (clampedPage === prev.page && !prev.loading) return prev;
        return { ...prev, page: clampedPage, loading: true };
      });
    },
    []
  );

  const handleKpiPageSizeChange = useCallback(
    (size: number) => {
      setKpiModal((prev) =>
        prev ? { ...prev, pageSize: size, page: 0, loading: true } : prev
      );
    },
    []
  );

  const handleChartPageChange = useCallback(
    (page: number) => {
      setChartModal((prev) => {
        if (!prev) return prev;
        const maxPage = Math.max(0, prev.totalPages - 1);
        const clampedPage = Math.max(0, Math.min(page, maxPage));
        if (clampedPage === prev.page && !prev.loading) return prev;
        return { ...prev, page: clampedPage, loading: true };
      });
    },
    []
  );

  const handleChartPageSizeChange = useCallback(
    (size: number) => {
      setChartModal((prev) =>
        prev ? { ...prev, pageSize: size, page: 0, loading: true } : prev
      );
    },
    []
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpisLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                  <div className="flex items-center gap-1.5">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                      Loading...
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ))
          : kpiCards.map((kpi) => (
              <Card
                key={kpi.title}
                className={
                  kpi.query
                    ? "cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30"
                    : ""
                }
                onClick={kpi.query ? kpi.onClick : undefined}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {kpi.title}
                    </span>
                    <div className="flex items-center gap-1">
                      <InfoTooltip text={kpi.tooltip} />
                      <kpi.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="text-xl font-bold text-foreground">
                    {kpi.value}
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold">
                Distribution by Type
              </CardTitle>
              <InfoTooltip text="Breakdown across entitlement types." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  onClick={(_, idx) => {
                    const entry = typeData[idx];
                    openChartModal(
                      "Distribution by Type",
                      entry.name,
                      CHART_COLORS[idx],
                      { kind: entry.name }
                    );
                  }}
                >
                  {typeData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CHART_COLORS[i]}
                      className="cursor-pointer hover:opacity-80"
                    />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold">
                Entitlements by Application
              </CardTitle>
              <InfoTooltip text="Number of entitlements per application." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={appData}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  name="Entitlements"
                  fill="#4F8EF7"
                  radius={[4, 4, 0, 0]}
                  onClick={(data: {
                    name: string;
                    applicationId: string;
                  }) => {
                    openChartModal(
                      "Entitlements by Application",
                      data.name,
                      "#4F8EF7",
                      { resourceId: data.applicationId }
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* KPI Drilldown Modal */}
            {kpiModal && (
        <CatalogKpiDrilldownModal
          open={!!kpiModal}
          onOpenChange={() => setKpiModal(null)}
          title={kpiModal.title}
          description={kpiModal.description}
          items={kpiModal.items}
          columns={{
            nameHeader: "Entitlement",
            detailHeader: "Application · Type",
            badgeHeader: "Risk Level",
          }}
          currentPage={kpiModal.page}
          totalPages={kpiModal.totalPages}
          totalElements={kpiModal.totalElements}
          loading={kpiModal.loading}
          pageSize={kpiModal.pageSize}
          onPageChange={handleKpiPageChange}
          onPageSizeChange={handleKpiPageSizeChange}
        />
      )}

      {chartModal && (
        <CatalogChartDrilldownModal
          open={!!chartModal}
          onOpenChange={() => setChartModal(null)}
          title={chartModal.title}
          segmentLabel={chartModal.segmentLabel}
          segmentColor={chartModal.segmentColor}
          items={chartModal.items}
          columns={{
            nameHeader: "Entitlement",
            detailHeader: "Application · Type",
            badgeHeader: "Risk Level",
          }}
          currentPage={chartModal.page}
          totalPages={chartModal.totalPages}
          totalElements={chartModal.totalElements}
          loading={chartModal.loading}
          pageSize={chartModal.pageSize}
          onPageChange={handleChartPageChange}
          onPageSizeChange={handleChartPageSizeChange}
        />
      )}
    </div>
  );
};

export default EntitlementIntelligence;