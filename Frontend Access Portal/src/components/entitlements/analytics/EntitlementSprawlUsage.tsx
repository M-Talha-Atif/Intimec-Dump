import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InfoTooltip from "@/components/dashboard/InfoTooltip";
import {
  TrendingUp,
  TrendingDown,
  Users,
  GitBranch,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import CatalogKpiDrilldownModal, {
  KpiDrilldownItem,
} from "@/components/access-catalog/modals/CatalogKpiDrilldownModal";
import {
  fetchEntitlements,
  useEntitlementSprawlKpis,
} from "@/hooks/useEntitlements";
import type { FetchEntitlementsParams } from "@/hooks/useEntitlements";

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

const EntitlementSprawlUsage = () => {
  const sprawlKpis = useEntitlementSprawlKpis();

  const [kpiModal, setKpiModal] = useState<DrilldownState | null>(null);
  const [stalePreview, setStalePreview] = useState<KpiDrilldownItem[]>([]);
  const [stalePreviewLoading, setStalePreviewLoading] = useState(false);

  const kpiFetchId = useRef(0);

  const kpisLoading = sprawlKpis.loading;

  const toItems = useCallback(
    (
      ents: {
        id: string;
        displayName: string;
        resourceName?: string;
        kind?: string;
        lifecycle?: string | null;
      }[]
    ): KpiDrilldownItem[] =>
      ents.map((e) => ({
        id: e.id,
        name: e.displayName,
        detail: `${e.resourceName ?? "Unknown Application"} · ${e.kind ?? "entitlement"}`,
        badge: e.lifecycle ?? "Active",
        badgeVariant: e.lifecycle === "Orphaned" ? "destructive" : "outline",
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

  // ── Stale Preview ──

  useEffect(() => {
    const loadPreview = async () => {
      setStalePreviewLoading(true);
      try {
        const orphanedResult = await fetchEntitlements({
          lifecycle: "Orphaned",
          page: 0,
          size: 5,
          sort: "displayName,asc",
        });
        setStalePreview(toItems(orphanedResult.content));
      } catch {
        setStalePreview([]);
      } finally {
        setStalePreviewLoading(false);
      }
    };

    loadPreview();
  }, [toItems]);

  // ── KPI Cards ──

  const kpis = useMemo(() => {
    const data = sprawlKpis.data;

    return [
      {
        title: "Sprawl Index",
        value: data?.sprawlIndex ?? 0,
        icon: TrendingUp,
        tooltip: "Average entitlements per user.",
        query: null,
      },
      {
        title: "Stale Entitlements",
        value: data?.staleEntitlements ?? 0,
        icon: TrendingDown,
        tooltip: "Deprecated or unused since start of year.",
        query: { lifecycle: "Deprecated" } as FetchEntitlementsParams | null,
      },
      {
        title: "Over-Provisioned",
        value: data?.overProvisionedCount ?? 0,
        icon: Users,
        tooltip: "Entitlements assigned to 100+ users.",
        query: { minAssignedUsers: 101 } as FetchEntitlementsParams | null,
      },
      {
        title: "Direct Assignment",
        value: data?.directAssignmentCount ?? 0,
        icon: GitBranch,
        tooltip: "Assigned directly vs through roles.",
        query: {
          assignmentSource: "IMPORT",
        } as FetchEntitlementsParams | null,
      },
    ].map((k) => ({
      ...k,
      onClick: () => {
        if (!k.query) return;
        openKpiModal(k.title, k.tooltip, k.query);
      },
    }));
  }, [sprawlKpis.data, openKpiModal]);

  // ── Chart Data ──

  const trendData = [
    { month: "Jan", sprawl: 180 },
    { month: "Feb", sprawl: 195 },
    { month: "Mar", sprawl: 210 },
    { month: "Apr", sprawl: 225 },
    { month: "May", sprawl: 240 },
    { month: "Jun", sprawl: 258 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border bg-popover p-2 shadow-md">
        <p className="text-xs font-medium">{label}</p>
        <p className="text-xs" style={{ color: payload[0]?.stroke }}>
          Sprawl: <span className="font-bold">{payload[0]?.value}</span>
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

      {/* Sprawl Trend */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold">
              Entitlement Sprawl Trend
            </CardTitle>
            <InfoTooltip text="Growth of entitlement assignments over time." />
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="sprawl"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.15}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Stale & Orphaned Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold">
              Stale & Orphaned Entitlements
            </CardTitle>
            <InfoTooltip text="Entitlements that should be cleaned up." />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stalePreviewLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : stalePreview.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No stale or orphaned entitlements found.
              </p>
            ) : (
              stalePreview.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="text-sm font-medium">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{e.detail}</p>
                  </div>
                  <Badge
                    variant={
                      e.badge === "Orphaned" ? "destructive" : "secondary"
                    }
                    className="text-xs"
                  >
                    {e.badge}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

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
            badgeHeader: "Lifecycle",
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
    </div>
  );
};

export default EntitlementSprawlUsage;