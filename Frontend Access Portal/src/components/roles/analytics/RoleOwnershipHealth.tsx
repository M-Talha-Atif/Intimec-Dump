import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockRoles } from "@/data/mock-roles";
import InfoTooltip from "@/components/dashboard/InfoTooltip";
import { UserX, ClipboardCheck, Clock, GitMerge } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import CatalogKpiDrilldownModal, { KpiDrilldownItem } from "@/components/access-catalog/modals/CatalogKpiDrilldownModal";
import CatalogChartDrilldownModal from "@/components/access-catalog/modals/CatalogChartDrilldownModal";

const CHART_COLORS = ["#4F8EF7", "#F59E0B", "#EF4444"];

const RoleOwnershipHealth = () => {
  const [kpiModal, setKpiModal] = useState<{ title: string; description: string; items: KpiDrilldownItem[] } | null>(null);
  const [chartModal, setChartModal] = useState<{ title: string; segmentLabel: string; segmentColor: string; items: KpiDrilldownItem[] } | null>(null);

  const noBackup = mockRoles.filter(r => !r.backupOwner && r.status === "Enabled");
  const staleRoles = mockRoles.filter(r => {
    if (!r.lastReviewed) return true;
    const d = new Date(r.lastReviewed);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return d < sixMonthsAgo;
  });
  const certReady = mockRoles.filter(r => r.certificationHistory && r.certificationHistory.length > 0);
  const similarityAlerts = mockRoles.filter(r => r.risk?.conflict && r.risk.conflict.overlap > 50);

  const toItems = (roles: typeof mockRoles): KpiDrilldownItem[] =>
    roles.map(r => ({ id: r.id, name: r.name, detail: `${r.owner} · ${r.businessUnit ?? "—"}`, badge: r.status, badgeVariant: "outline" as const }));

  const ownershipData = [
    { name: "Full Ownership", value: mockRoles.filter(r => r.backupOwner).length },
    { name: "No Backup", value: noBackup.length },
    { name: "Stale Review", value: staleRoles.length },
  ];

  const getChartItems = (segment: string): KpiDrilldownItem[] => {
    switch (segment) {
      case "Full Ownership": return toItems(mockRoles.filter(r => r.backupOwner));
      case "No Backup": return toItems(noBackup);
      case "Stale Review": return toItems(staleRoles);
      default: return [];
    }
  };

  const kpis = [
    { title: "Ownership Gaps", value: noBackup.length, icon: UserX, tooltip: "Roles without a backup owner.", items: toItems(noBackup) },
    { title: "Cert Ready", value: `${certReady.length}/${mockRoles.length}`, icon: ClipboardCheck, tooltip: "Roles with at least one certification.", items: toItems(certReady) },
    { title: "Stale (>6mo)", value: staleRoles.length, icon: Clock, tooltip: "Roles not reviewed in 6+ months.", items: toItems(staleRoles) },
    { title: "Similarity Alerts", value: similarityAlerts.length, icon: GitMerge, tooltip: "Roles with >50% entitlement overlap.", items: toItems(similarityAlerts) },
  ];

  const attentionRoles = [...noBackup, ...staleRoles].reduce((acc, r) => {
    if (!acc.find(x => x.id === r.id)) acc.push(r);
    return acc;
  }, [] as typeof mockRoles).slice(0, 5);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border bg-popover p-2 shadow-md">
        <p className="text-xs font-medium">{payload[0]?.name}</p>
        <p className="text-xs">Count: <span className="font-bold">{payload[0]?.value}</span></p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold">Ownership Coverage</CardTitle>
              <InfoTooltip text="Distribution by ownership completeness." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={ownershipData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  onClick={(_, idx) => {
                    const entry = ownershipData[idx];
                    setChartModal({
                      title: "Ownership Coverage",
                      segmentLabel: entry.name,
                      segmentColor: CHART_COLORS[idx],
                      items: getChartItems(entry.name),
                    });
                  }}
                >
                  {ownershipData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} className="cursor-pointer hover:opacity-80" />)}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold">Roles Needing Attention</CardTitle>
              <InfoTooltip text="Roles with ownership gaps or stale reviews." />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attentionRoles.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.owner}</p>
                  </div>
                  <div className="flex gap-1">
                    {!r.backupOwner && <Badge variant="destructive" className="text-xs">No Backup</Badge>}
                    {staleRoles.includes(r) && <Badge variant="outline" className="text-xs">Stale</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {kpiModal && <CatalogKpiDrilldownModal open={!!kpiModal} onOpenChange={() => setKpiModal(null)} {...kpiModal} />}
      {chartModal && <CatalogChartDrilldownModal open={!!chartModal} onOpenChange={() => setChartModal(null)} {...chartModal} />}
    </div>
  );
};

export default RoleOwnershipHealth;
