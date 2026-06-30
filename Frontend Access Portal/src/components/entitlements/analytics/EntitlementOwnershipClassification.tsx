import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InfoTooltip from "@/components/dashboard/InfoTooltip";
import {
  UserX,
  Tag,
  HandMetal,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import CatalogKpiDrilldownModal, {
  KpiDrilldownItem,
} from "@/components/access-catalog/modals/CatalogKpiDrilldownModal";
import CatalogChartDrilldownModal from "@/components/access-catalog/modals/CatalogChartDrilldownModal";
import {
  fetchEntitlements,
  useEntitlementClassificationKpis,
} from "@/hooks/useEntitlements";
import type { FetchEntitlementsParams } from "@/hooks/useEntitlements";
import { mockEntitlements } from "@/data/mock-entitlements";

const CHART_COLORS = ["#4F8EF7", "#34D399", "#F59E0B", "#EF4444", "#8B5CF6"];
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

const EntitlementOwnershipClassification = () => {
  const classificationKpis = useEntitlementClassificationKpis();

  const [kpiModal, setKpiModal] = useState<DrilldownState | null>(null);
  const [chartModal, setChartModal] = useState<ChartDrilldownState | null>(null);
  const [unownedPreview, setUnownedPreview] = useState<KpiDrilldownItem[]>([]);
  const [unownedPreviewLoading, setUnownedPreviewLoading] = useState(false);

  const kpiFetchId = useRef(0);
  const chartFetchId = useRef(0);

  const kpisLoading = classificationKpis.loading;

  const toItems = useCallback(
    (
      ents: {
        id: string;
        displayName: string;
        resourceName?: string;
        kind?: string;
        ownerId?: string | null;
      }[]
    ): KpiDrilldownItem[] =>
      ents.map((e) => ({
        id: e.id,
        name: e.displayName,
        detail: `${e.resourceName ?? "Unknown Application"} · ${e.kind ?? "entitlement"}`,
        badge: e.ownerId ? "Owned" : "No Owner",
        badgeVariant: e.ownerId ? "outline" : "destructive",
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

        if (fetchId !== kpiFetchId.current) return;

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

  // ── Unowned Preview ──

  useEffect(() => {
    const loadPreview = async () => {
      setUnownedPreviewLoading(true);
      try {
        const result = await fetchEntitlements({
          hasOwner: false,
          page: 0,
          size: 5,
          sort: "displayName,asc",
        });
        setUnownedPreview(toItems(result.content));
      } catch {
        setUnownedPreview([]);
      } finally {
        setUnownedPreviewLoading(false);
      }
    };

    loadPreview();
  }, [toItems]);

  // ── Page change handlers with clamping ──

  const handleKpiPageChange = useCallback((page: number) => {
    setKpiModal((prev) => {
      if (!prev) return prev;
      const maxPage = Math.max(0, prev.totalPages - 1);
      const clampedPage = Math.max(0, Math.min(page, maxPage));
      if (clampedPage === prev.page && !prev.loading) return prev;
      return { ...prev, page: clampedPage, loading: true };
    });
  }, []);

  const handleKpiPageSizeChange = useCallback((size: number) => {
    setKpiModal((prev) =>
      prev ? { ...prev, pageSize: size, page: 0, loading: true } : prev
    );
  }, []);

  const handleChartPageChange = useCallback((page: number) => {
    setChartModal((prev) => {
      if (!prev) return prev;
      const maxPage = Math.max(0, prev.totalPages - 1);
      const clampedPage = Math.max(0, Math.min(page, maxPage));
      if (clampedPage === prev.page && !prev.loading) return prev;
      return { ...prev, page: clampedPage, loading: true };
    });
  }, []);

  const handleChartPageSizeChange = useCallback((size: number) => {
    setChartModal((prev) =>
      prev ? { ...prev, pageSize: size, page: 0, loading: true } : prev
    );
  }, []);

  // ── Chart Data ──

  const classData = useMemo(() => {
    const classificationCounts: Record<string, number> = {};

    mockEntitlements.forEach((e) => {
      if (e.classification.length === 0) {
        classificationCounts["None"] = (classificationCounts["None"] || 0) + 1;
      }
      e.classification.forEach((c) => {
        classificationCounts[c] = (classificationCounts[c] || 0) + 1;
      });
    });

    return Object.entries(classificationCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, []);

  const getClassificationQuery = useCallback(
    (cls: string): FetchEntitlementsParams => {
      if (cls === "None") {
        return { classified: false };
      }
      return { search: cls };
    },
    []
  );

  // ── KPI Cards ──

  const kpis = useMemo(() => {
    const data = classificationKpis.data;

    return [
      {
        title: "Ownership Gaps",
        value: data?.ownershipGaps ?? 0,
        icon: UserX,
        tooltip: "Entitlements without a designated owner.",
        query: { hasOwner: false } as FetchEntitlementsParams | null,
      },
      {
        title: "Unclassified",
        value: data?.unclassified ?? 0,
        icon: Tag,
        tooltip: "No compliance or risk tags.",
        query: { classified: false } as FetchEntitlementsParams | null,
      },
      {
        title: "Requestability Rate",
        value: `${data?.requestabilityRate ?? 0}%`,
        icon: HandMetal,
        tooltip: "% requestable through Access Portal.",
        query: { requestable: true } as FetchEntitlementsParams | null,
      },
      {
        title: "Requestable",
        value: data?.requestableEntitlements ?? 0,
        icon: ShieldCheck,
        tooltip: "Entitlements marked as requestable.",
        query: { requestable: true } as FetchEntitlementsParams | null,
      },
    ].map((k) => ({
      ...k,
      onClick: () => {
        if (!k.query) return;
        openKpiModal(k.title, k.tooltip, k.query);
      },
    }));
  }, [classificationKpis.data, openKpiModal]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border bg-popover p-2 shadow-md">
        <p className="text-xs font-medium">{payload[0]?.name}</p>
        <p className="text-xs">
          Count: <span className="font-bold">{payload[0]?.value}</span>
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
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
        ) : (
          kpis.map((k) => (
            <Card
              key={k.title}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={k.onClick}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-4">
                <div className="flex items-center gap-1">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    {k.title}
                  </CardTitle>
                  <InfoTooltip text={k.tooltip} />
                </div>
                <k.icon className="h-3.5 w-3.5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <div className="text-xl font-bold text-foreground">
                  {k.value}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold">
                Classification Breakdown
              </CardTitle>
              <InfoTooltip text="Distribution by classification tags." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={classData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  onClick={(_, idx) => {
                    const entry = classData[idx];
                    openChartModal(
                      "Classification Breakdown",
                      entry.name,
                      CHART_COLORS[idx % CHART_COLORS.length],
                      getClassificationQuery(entry.name)
                    );
                  }}
                >
                  {classData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
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
                Unowned Entitlements
              </CardTitle>
              <InfoTooltip text="Entitlements needing governance attention." />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unownedPreviewLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : unownedPreview.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No unowned entitlements found.
                </p>
              ) : (
                unownedPreview.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="text-sm font-medium">{e.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.detail}
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      No Owner
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
            badgeHeader: "Ownership",
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
            badgeHeader: "Ownership",
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

export default EntitlementOwnershipClassification;