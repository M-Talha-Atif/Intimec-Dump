import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockRoles } from "@/data/mock-roles";
import InfoTooltip from "@/components/dashboard/InfoTooltip";
import { Users, TrendingDown, Percent, GitBranch } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import CatalogKpiDrilldownModal, { KpiDrilldownItem } from "@/components/access-catalog/modals/CatalogKpiDrilldownModal";

const RoleUsageCoverage = () => {
  const [kpiModal, setKpiModal] = useState<{ title: string; description: string; items: KpiDrilldownItem[] } | null>(null);

  const unusedRoles = mockRoles.filter(r => r.userCount === 0 && r.status === "Enabled");
  const adoptionRate = ((mockRoles.filter(r => r.userCount > 0).length / mockRoles.filter(r => r.status === "Enabled").length) * 100).toFixed(0);

  const toItems = (roles: typeof mockRoles): KpiDrilldownItem[] =>
    roles.map(r => ({ id: r.id, name: r.name, detail: `${r.businessUnit ?? "—"} · ${r.userCount} users`, badge: r.type, badgeVariant: "outline" as const }));

  const kpis = [
    { title: "Adoption Rate", value: `${adoptionRate}%`, icon: Percent, tooltip: "Percentage of enabled roles with at least one user.", items: toItems(mockRoles.filter(r => r.userCount > 0 && r.status === "Enabled")) },
    { title: "Unused Roles", value: unusedRoles.length, icon: TrendingDown, tooltip: "Enabled roles with zero users.", items: toItems(unusedRoles) },
    { title: "Direct-Only Users", value: "18%", icon: Users, tooltip: "Users with only direct entitlements.", items: [] },
    { title: "Role-to-Direct Ratio", value: "4.2:1", icon: GitBranch, tooltip: "Ratio of role-based vs direct access.", items: [] },
  ];

  const trendData = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map(month => ({
    month,
    assigned: mockRoles.reduce((s, r) => {
      const h = r.userCountHistory?.find(h => h.month === month);
      return s + (h?.count ?? r.userCount);
    }, 0),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border bg-popover p-2 shadow-md">
        <p className="text-xs font-medium">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-xs" style={{ color: p.stroke }}>Assigned: <span className="font-bold">{p.value}</span></p>
        ))}
      </div>
    );
  };

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
            <CardTitle className="text-sm font-semibold">Total Role-Based User Assignments (Trend)</CardTitle>
            <InfoTooltip text="Monthly trend of total users assigned through roles." />
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="assigned" stroke="#4F8EF7" fill="#4F8EF7" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold">Unused Roles — Candidates for Cleanup</CardTitle>
            <InfoTooltip text="Active roles with no assigned users." />
          </div>
        </CardHeader>
        <CardContent>
          {unusedRoles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No unused active roles found.</p>
          ) : (
            <div className="space-y-2">
              {unusedRoles.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.businessUnit} · {r.type}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">Last reviewed: {r.lastReviewed}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {kpiModal && <CatalogKpiDrilldownModal open={!!kpiModal} onOpenChange={() => setKpiModal(null)} {...kpiModal} />}
    </div>
  );
};

export default RoleUsageCoverage;
