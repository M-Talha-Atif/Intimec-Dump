import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockEntitlements } from "@/data/mock-entitlements";
import InfoTooltip from "@/components/dashboard/InfoTooltip";
import { ClipboardList, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import CatalogKpiDrilldownModal, { KpiDrilldownItem } from "@/components/access-catalog/modals/CatalogKpiDrilldownModal";

const EntitlementReviewsAnalytics = () => {
  const [kpiModal, setKpiModal] = useState<{ title: string; description: string; items: KpiDrilldownItem[] } | null>(null);

  const allReviews = mockEntitlements.flatMap(e => (e.reviewHistory ?? []).map(r => ({ ...r, entitlementName: e.displayName, entitlementId: e.id })));

  const mockCampaigns = [
    { name: "Q2 2025 Entitlement Review", total: 45, completed: 38, pct: 84 },
    { name: "Q1 2025 SOX Compliance", total: 20, completed: 20, pct: 100 },
    { name: "Annual PII Access Review", total: 12, completed: 10, pct: 83 },
  ];

  const reviewToItems = (reviews: typeof allReviews): KpiDrilldownItem[] =>
    reviews.map((r, i) => ({ id: `${r.entitlementId}-${i}`, name: r.entitlementName, detail: `${r.campaign} · ${r.reviewer}`, badge: r.outcome, badgeVariant: "outline" as const }));

  const kpis = [
    { title: "Active Campaigns", value: mockCampaigns.length, icon: ClipboardList, tooltip: "Certification campaigns tracked.", items: [] as KpiDrilldownItem[] },
    { title: "Avg Completion", value: `${Math.round(mockCampaigns.reduce((s, c) => s + c.pct, 0) / mockCampaigns.length)}%`, icon: CheckCircle2, tooltip: "Average completion rate.", items: reviewToItems(allReviews) },
    { title: "Pending Reviews", value: 19, icon: AlertCircle, tooltip: "Reviews still pending.", items: [] as KpiDrilldownItem[] },
    { title: "Overdue", value: 3, icon: Clock, tooltip: "Reviews past due date.", items: [] as KpiDrilldownItem[] },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(k => (
          <Card key={k.title}
            className={k.items.length > 0 ? "cursor-pointer hover:shadow-md transition-shadow" : ""}
            onClick={() => k.items.length > 0 && setKpiModal({ title: k.title, description: k.tooltip, items: k.items })}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-4">
              <div className="flex items-center gap-1">
                <CardTitle className="text-xs font-medium text-muted-foreground">{k.title}</CardTitle>
                <InfoTooltip text={k.tooltip} />
              </div>
              <k.icon className="h-3.5 w-3.5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <div className="text-xl font-bold text-foreground">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold">Campaign Progress</CardTitle>
            <InfoTooltip text="Completion status of entitlement certification campaigns." />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockCampaigns.map(c => (
              <div key={c.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{c.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{c.completed}/{c.total}</Badge>
                    <span className="text-xs font-medium text-muted-foreground">{c.pct}%</span>
                  </div>
                </div>
                <Progress value={c.pct} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold">Recent Reviews</CardTitle>
            <InfoTooltip text="Latest entitlement review outcomes." />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {allReviews.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6).map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">{r.entitlementName}</p>
                  <p className="text-xs text-muted-foreground">{r.campaign} · {r.reviewer}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                  <Badge variant="default" className="text-xs">{r.outcome}</Badge>
                </div>
              </div>
            ))}
            {allReviews.length === 0 && <p className="text-sm text-muted-foreground">No review history available.</p>}
          </div>
        </CardContent>
      </Card>

            {kpiModal && (
        <CatalogKpiDrilldownModal
          open={!!kpiModal}
          onOpenChange={() => setKpiModal(null)}
          title={kpiModal.title}
          description={kpiModal.description}
          items={kpiModal.items}
          columns={{
            nameHeader: "Entitlement",
            detailHeader: "Campaign · Reviewer",
            badgeHeader: "Outcome",
          }}
        />
      )}
    </div>
  );
};

export default EntitlementReviewsAnalytics;
