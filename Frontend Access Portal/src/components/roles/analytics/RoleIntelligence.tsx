import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockRoles } from "@/data/mock-roles";
import InfoTooltip from "@/components/dashboard/InfoTooltip";
import { ShieldCheck, ShieldAlert, Archive, Users, Layers, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import CatalogKpiDrilldownModal, { KpiDrilldownItem } from "@/components/access-catalog/modals/CatalogKpiDrilldownModal";
import CatalogChartDrilldownModal from "@/components/access-catalog/modals/CatalogChartDrilldownModal";

const CHART_COLORS = ["#4F8EF7", "#34D399", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const RoleIntelligence = () => {
  const [kpiModal, setKpiModal] = useState<{ title: string; description: string; items: KpiDrilldownItem[] } | null>(null);
  const [chartModal, setChartModal] = useState<{ title: string; segmentLabel: string; segmentColor: string; items: KpiDrilldownItem[] } | null>(null);

  const total = mockRoles.length;
  const active = mockRoles.filter(r => r.status === "Enabled");
  const deprecated = mockRoles.filter(r => r.status === "Deprecated");
  const orphaned = mockRoles.filter(r => r.userCount === 0 && r.status === "Enabled");
  const avgEntitlements = (mockRoles.reduce((sum, r) => sum + r.entitlements.length, 0) / total).toFixed(1);
  const highRisk = mockRoles.filter(r => r.risk?.score === "High");

  const toItems = (roles: typeof mockRoles): KpiDrilldownItem[] =>
    roles.map(r => ({ id: r.id, name: r.name, detail: `${r.businessUnit ?? "—"} · ${r.type}`, badge: r.status, badgeVariant: r.status === "Deprecated" ? "destructive" as const : "outline" as const }));

  const kpis = [
    { title: "Total Roles", value: total, icon: Layers, tooltip: "Total number of roles defined in the catalog.", items: toItems(mockRoles) },
    { title: "Active Roles", value: active.length, icon: ShieldCheck, tooltip: "Roles currently enabled and assignable.", items: toItems(active) },
    { title: "Deprecated", value: deprecated.length, icon: Archive, tooltip: "Roles marked for retirement.", items: toItems(deprecated) },
    { title: "Orphaned (0 Users)", value: orphaned.length, icon: Users, tooltip: "Active roles with zero assigned users.", items: toItems(orphaned) },
    { title: "Avg Entitlements/Role", value: avgEntitlements, icon: BarChart3, tooltip: "Average entitlements per role.", items: [] },
    { title: "High Risk Roles", value: highRisk.length, icon: ShieldAlert, tooltip: "Roles flagged with High risk score.", items: toItems(highRisk) },
  ];

  const typeData = ["Business Role", "Technical Role", "Functional Role", "Application Role"].map(type => ({
    name: type.replace(" Role", ""), fullType: type,
    value: mockRoles.filter(r => r.type === type).length,
  }));

  const buData = ["Finance", "Engineering", "Human Resources", "Marketing"].map(bu => ({
    name: bu,
    total: mockRoles.filter(r => r.businessUnit === bu).length,
    users: mockRoles.filter(r => r.businessUnit === bu).reduce((s, r) => s + r.userCount, 0),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border bg-popover p-2 shadow-md">
        <p className="text-xs font-medium">{label || payload[0]?.name}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-xs" style={{ color: p.fill || p.color }}>
            {p.name || p.dataKey}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map(k => (
          <Card
            key={k.title}
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
              <CardTitle className="text-sm font-semibold">Role Distribution by Type</CardTitle>
              <InfoTooltip text="Breakdown of roles across types." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  onClick={(_, idx) => {
                    const entry = typeData[idx];
                    setChartModal({
                      title: "Role Distribution by Type",
                      segmentLabel: entry.name,
                      segmentColor: CHART_COLORS[idx % CHART_COLORS.length],
                      items: toItems(mockRoles.filter(r => r.type === entry.fullType)),
                    });
                  }}
                >
                  {typeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} className="cursor-pointer hover:opacity-80" />)}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold">Roles & Users by Business Unit</CardTitle>
              <InfoTooltip text="Number of roles and users per business unit." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={buData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="total" name="Roles" fill="#4F8EF7" radius={[4, 4, 0, 0]}
                  onClick={(data) => {
                    setChartModal({
                      title: "Roles by Business Unit",
                      segmentLabel: data.name,
                      segmentColor: "#4F8EF7",
                      items: toItems(mockRoles.filter(r => r.businessUnit === data.name)),
                    });
                  }}
                />
                <Bar dataKey="users" name="Users" fill="#34D399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {kpiModal && <CatalogKpiDrilldownModal open={!!kpiModal} onOpenChange={() => setKpiModal(null)} {...kpiModal} />}
      {chartModal && <CatalogChartDrilldownModal open={!!chartModal} onOpenChange={() => setChartModal(null)} {...chartModal} />}
    </div>
  );
};

export default RoleIntelligence;
