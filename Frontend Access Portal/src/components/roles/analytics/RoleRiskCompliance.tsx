import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockRoles } from "@/data/mock-roles";
import InfoTooltip from "@/components/dashboard/InfoTooltip";
import { ShieldAlert, AlertTriangle, Crown, FileCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import CatalogKpiDrilldownModal, { KpiDrilldownItem } from "@/components/access-catalog/modals/CatalogKpiDrilldownModal";
import CatalogChartDrilldownModal from "@/components/access-catalog/modals/CatalogChartDrilldownModal";

const RoleRiskCompliance = () => {
  const [kpiModal, setKpiModal] = useState<{ title: string; description: string; items: KpiDrilldownItem[] } | null>(null);
  const [chartModal, setChartModal] = useState<{ title: string; segmentLabel: string; segmentColor: string; items: KpiDrilldownItem[] } | null>(null);

  const highRisk = mockRoles.filter(r => r.risk?.score === "High");
  const sodConflicts = mockRoles.filter(r => r.risk?.conflict);
  const privileged = mockRoles.filter(r => r.classification === "Admin Role" || r.classification === "Privileged");
  const complianceTagged = mockRoles.filter(r => r.tags?.some(t => ["SOX", "GDPR", "PII Access"].includes(t)));

  const toItems = (roles: typeof mockRoles): KpiDrilldownItem[] =>
    roles.map(r => ({ id: r.id, name: r.name, detail: `${r.owner} · ${r.businessUnit ?? "—"}`, badge: r.risk?.score ?? "—", badgeVariant: r.risk?.score === "High" ? "destructive" as const : "outline" as const }));

  const riskColors: Record<string, string> = { High: "#EF4444", Medium: "#F59E0B", Low: "#34D399", Unscored: "#94A3B8" };
  const riskDistribution = [
    { name: "High", value: mockRoles.filter(r => r.risk?.score === "High").length, color: riskColors.High },
    { name: "Medium", value: mockRoles.filter(r => r.risk?.score === "Medium").length, color: riskColors.Medium },
    { name: "Low", value: mockRoles.filter(r => r.risk?.score === "Low").length, color: riskColors.Low },
    { name: "Unscored", value: mockRoles.filter(r => !r.risk).length, color: riskColors.Unscored },
  ];

  const getRiskItems = (level: string): KpiDrilldownItem[] => {
    if (level === "Unscored") return toItems(mockRoles.filter(r => !r.risk));
    return toItems(mockRoles.filter(r => r.risk?.score === level));
  };

  const kpis = [
    { title: "High Risk Roles", value: highRisk.length, icon: ShieldAlert, tooltip: "Roles with High risk score.", items: toItems(highRisk) },
    { title: "SoD Conflicts", value: sodConflicts.length, icon: AlertTriangle, tooltip: "Roles with entitlement overlap — potential SoD violations.", items: toItems(sodConflicts) },
    { title: "Privileged Roles", value: privileged.length, icon: Crown, tooltip: "Admin or Privileged classified roles.", items: toItems(privileged) },
    { title: "Compliance Tagged", value: complianceTagged.length, icon: FileCheck, tooltip: "Roles tagged with compliance frameworks.", items: toItems(complianceTagged) },
  ];

  const conflictRoles = sodConflicts.slice(0, 5);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border bg-popover p-2 shadow-md">
        <p className="text-xs font-medium">{payload[0]?.payload?.name}</p>
        <p className="text-xs">Count: <span className="font-bold">{payload[0]?.value}</span></p>
      </div>
    );
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(k => (
          <Card key={k.title}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setKpiModal({ title: k.title, description: k.tooltip, items: k.items })}
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
              <CardTitle className="text-sm font-semibold">Risk Distribution</CardTitle>
              <InfoTooltip text="Breakdown of roles by risk score level." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={riskDistribution} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={70} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}
                  onClick={(data) => {
                    setChartModal({
                      title: "Risk Distribution",
                      segmentLabel: data.name,
                      segmentColor: data.color,
                      items: getRiskItems(data.name),
                    });
                  }}
                >
                  {riskDistribution.map((entry, i) => <Cell key={i} fill={entry.color} className="cursor-pointer hover:opacity-80" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold">SoD Conflict Details</CardTitle>
              <InfoTooltip text="Roles with overlapping entitlements." />
            </div>
          </CardHeader>
          <CardContent>
            {conflictRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No SoD conflicts detected.</p>
            ) : (
              <div className="space-y-2">
                {conflictRoles.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground">Conflicts with: {r.risk?.conflict?.roleName}</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">{r.risk?.conflict?.overlap}% overlap</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {kpiModal && <CatalogKpiDrilldownModal open={!!kpiModal} onOpenChange={() => setKpiModal(null)} {...kpiModal} />}
      {chartModal && <CatalogChartDrilldownModal open={!!chartModal} onOpenChange={() => setChartModal(null)} {...chartModal} />}
    </div>
  );
};

export default RoleRiskCompliance;
