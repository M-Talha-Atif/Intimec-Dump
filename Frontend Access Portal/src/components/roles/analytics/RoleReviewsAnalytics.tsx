import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockRoles } from "@/data/mock-roles";
import InfoTooltip from "@/components/dashboard/InfoTooltip";
import { ClipboardList, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import CatalogKpiDrilldownModal, { KpiDrilldownItem } from "@/components/access-catalog/modals/CatalogKpiDrilldownModal";

const RoleReviewsAnalytics = () => {
  const [kpiModal, setKpiModal] = useState<{ title: string; description: string; items: KpiDrilldownItem[] } | null>(null);

  const allCerts = mockRoles.flatMap(r => (r.certificationHistory ?? []).map(c => ({ ...c, roleName: r.name, roleId: r.id })));
  const campaigns = [...new Set(allCerts.map(c => c.campaignName))];
  const completed = allCerts.filter(c => c.status === "Complete");
  const overdue = allCerts.filter(c => c.status === "Overdue");
  const inProgress = allCerts.filter(c => c.status === "In Progress");
  const completionRate = allCerts.length > 0 ? ((completed.length / allCerts.length) * 100).toFixed(0) : "0";

  const certToItems = (certs: typeof allCerts): KpiDrilldownItem[] =>
    certs.map((c, i) => ({ id: `${c.roleId}-${i}`, name: c.roleName, detail: `${c.campaignName} · ${c.reviewer ?? "—"}`, badge: c.status, badgeVariant: c.status === "Overdue" ? "destructive" as const : "outline" as const }));

  const kpis = [
    { title: "Total Campaigns", value: campaigns.length, icon: ClipboardList, tooltip: "Unique certification campaigns.", items: [] as KpiDrilldownItem[] },
    { title: "Completion Rate", value: `${completionRate}%`, icon: CheckCircle2, tooltip: "Percentage of completed certifications.", items: certToItems(completed) },
    { title: "Overdue Reviews", value: overdue.length, icon: AlertCircle, tooltip: "Reviews past their due date.", items: certToItems(overdue) },
    { title: "In Progress", value: inProgress.length, icon: Clock, tooltip: "Certification reviews underway.", items: certToItems(inProgress) },
  ];

  const campaignData = campaigns.map(name => {
    const items = allCerts.filter(c => c.campaignName === name);
    const comp = items.filter(c => c.status === "Complete").length;
    return { name, total: items.length, completed: comp, pct: Math.round((comp / items.length) * 100) };
  });

  return (
    <div className="space-y-6 pt-4">
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
            <CardTitle className="text-sm font-semibold">Certification Campaigns</CardTitle>
            <InfoTooltip text="Progress of each certification campaign." />
          </div>
        </CardHeader>
        <CardContent>
          {campaignData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No certification campaigns found.</p>
          ) : (
            <div className="space-y-4">
              {campaignData.map(c => (
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
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold">Recent Certifications</CardTitle>
            <InfoTooltip text="Most recent role certification outcomes." />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {allCerts.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6).map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">{c.roleName}</p>
                  <p className="text-xs text-muted-foreground">{c.campaignName} · {c.reviewer}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{c.date}</span>
                  <Badge variant={c.status === "Complete" ? "default" : c.status === "Overdue" ? "destructive" : "secondary"} className="text-xs">
                    {c.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {kpiModal && <CatalogKpiDrilldownModal open={!!kpiModal} onOpenChange={() => setKpiModal(null)} {...kpiModal} />}
    </div>
  );
};

export default RoleReviewsAnalytics;
