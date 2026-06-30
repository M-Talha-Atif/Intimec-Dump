import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InfoTooltip from "@/components/dashboard/InfoTooltip";
import {
  ShieldAlert,
  AlertTriangle,
  FileCheck,
  Database,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import CatalogKpiDrilldownModal, {
  KpiDrilldownItem,
} from "@/components/access-catalog/modals/CatalogKpiDrilldownModal";
import CatalogChartDrilldownModal from "@/components/access-catalog/modals/CatalogChartDrilldownModal";
import {
  fetchEntitlements,
  useEntitlementRiskDistribution,
  useEntitlementRiskKpis,
} from "@/hooks/useEntitlements";
import type { FetchEntitlementsParams } from "@/hooks/useEntitlements";
import { mockEntitlements } from "@/data/mock-entitlements";

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

const EntitlementRiskCompliance = () => {
  const riskKpis = useEntitlementRiskKpis();
  const riskDistributionApi = useEntitlementRiskDistribution();

  const [kpiModal, setKpiModal] = useState<DrilldownState | null>(null);
  const [chartModal, setChartModal] = useState<ChartDrilldownState | null>(null);

  const kpiFetchId = useRef(0);
  const chartFetchId = useRef(0);

  const kpisLoading = riskKpis.loading;

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

  const riskColors: Record<string, string> = {
    High: "#EF4444",
    Medium: "#F59E0B",
    Low: "#34D399",
  };

  const riskDistribution = useMemo(() => {
    const data = riskDistributionApi.data;
    return [
      {
        name: "High",
        value: data?.highRiskEntitlements ?? 0,
        color: riskColors.High,
      },
      {
        name: "Medium",
        value: data?.mediumRiskEntitlements ?? 0,
        color: riskColors.Medium,
      },
      {
        name: "Low",
        value: data?.lowRiskEntitlements ?? 0,
        color: riskColors.Low,
      },
    ];
  }, [riskDistributionApi.data]);

  const complianceMapping = ["SOX", "PII", "GDPR", "High Risk"].map((tag) => ({
    name: tag,
    count: mockEntitlements.filter((e) =>
      e.classification.includes(tag as any)
    ).length,
  }));

  // ── KPI Cards ──

  const kpis = useMemo(() => {
    const data = riskKpis.data;

    return [
      {
        title: "High Risk",
        value: data?.highRiskEntitlements ?? 0,
        icon: ShieldAlert,
        tooltip: "Entitlements with High risk rating.",
        query: { riskLevel: "HIGH" } as FetchEntitlementsParams | null,
      },
      {
        title: "SoD Exposure",
        value: data?.sodExposure ?? 0,
        icon: AlertTriangle,
        tooltip: "SOX + High risk — potential SoD violations.",
        query: null,
      },
      {
        title: "Compliance Tagged",
        value: data?.complianceTagged ?? 0,
        icon: FileCheck,
        tooltip: "Entitlements with compliance tags.",
        query: null,
      },
      {
        title: "Data Sensitive",
        value: data?.dataSensitive ?? 0,
        icon: Database,
        tooltip: "PII or GDPR tagged entitlements.",
        query: null,
      },
    ].map((k) => ({
      ...k,
      onClick: () => {
        if (!k.query) return;
        openKpiModal(k.title, k.tooltip, k.query);
      },
    }));
  }, [riskKpis.data, openKpiModal]);

  const getRiskQuery = useCallback(
    (level: string): FetchEntitlementsParams => {
      return { riskLevel: level.toUpperCase() };
    },
    []
  );

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border bg-popover p-2 shadow-md">
        <p className="text-xs font-medium">{payload[0]?.payload?.name}</p>
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
              className={
                k.query
                  ? "cursor-pointer hover:shadow-md transition-shadow"
                  : ""
              }
              onClick={k.query ? k.onClick : undefined}
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
                Risk Distribution
              </CardTitle>
              <InfoTooltip text="Entitlement count by risk level." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={riskDistribution} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  width={70}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  radius={[0, 4, 4, 0]}
                  onClick={(data: { name: string; color: string }) => {
                    openChartModal(
                      "Risk Distribution",
                      data.name,
                      data.color,
                      getRiskQuery(data.name)
                    );
                  }}
                >
                  {riskDistribution.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.color}
                      className="cursor-pointer hover:opacity-80"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold">
                Compliance Coverage
              </CardTitle>
              <InfoTooltip text="Entitlements per compliance framework." />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {complianceMapping.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() =>
                    openChartModal("Compliance Coverage", c.name, "#8B5CF6", {
                      search: c.name,
                    })
                  }
                >
                  <Badge variant="outline">{c.name}</Badge>
                  <span className="text-sm font-bold">
                    {c.count} entitlements
                  </span>
                </div>
              ))}
            </div>
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

export default EntitlementRiskCompliance;