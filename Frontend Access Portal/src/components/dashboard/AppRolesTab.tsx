import { useState } from "react";
import { Server, Activity, ShieldAlert, UserX, Layers } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InfoTooltip from "./InfoTooltip";
import MetricCard from "./MetricCard";
import { roleMetrics } from "@/services/mockRoleEntitlementMetrics";
import { RoleGovernanceModal } from "./modals/RoleGovernanceModal";
// import { getRiskBadgeClass, getRiskIconColor } from '@/utils/getRiskColor';
import { useCssVariable } from "@/hooks/useCssVariable";
import { useTranslations } from "next-intl";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RISK_COLORS = {
  Low: "hsl(var(--risk-low))",
  Medium: "hsl(var(--risk-medium))",
  High: "hsl(var(--risk-high))",
};

// ---------------------------------------------------------------------------
// Derived data (module-level — stable across renders)
// ---------------------------------------------------------------------------

const rolesPerApp: Record<string, number> = {};
roleMetrics.appRoles.forEach(r => {
  r.entitlements.forEach(e => {
    rolesPerApp[e.application] = (rolesPerApp[e.application] || 0) + 1;
  });
});

const enabledRoles = roleMetrics.totalActive;
const activePercent = enabledRoles > 0
  ? Math.round((roleMetrics.activeRolesCount / enabledRoles) * 100)
  : 0;

const appBarData = Object.entries(rolesPerApp)
  .map(([app, count]) => ({ application: app, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 8);

const displayAppData = appBarData.length > 0 ? appBarData : [
  { application: "Finance", count: roleMetrics.byBusinessUnit?.finance || 0 },
  { application: "Engineering", count: roleMetrics.byBusinessUnit?.engineering || 0 },
  { application: "HR", count: roleMetrics.byBusinessUnit?.hr || 0 },
  { application: "Marketing", count: roleMetrics.byBusinessUnit?.marketing || 0 },
];

const riskData = [
  { name: "Low", value: roleMetrics.byRisk.low, fill: RISK_COLORS.Low },
  { name: "Medium", value: roleMetrics.byRisk.medium, fill: RISK_COLORS.Medium },
  { name: "High", value: roleMetrics.byRisk.high, fill: RISK_COLORS.High },
];

const buChartData = [
  { name: "Finance", count: roleMetrics.byBusinessUnit.finance || 0 },
  { name: "Engineering", count: roleMetrics.byBusinessUnit.engineering || 0 },
  { name: "HR", count: roleMetrics.byBusinessUnit.hr || 0 },
  { name: "Marketing", count: roleMetrics.byBusinessUnit.marketing || 0 },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const AppRolesTab = () => {
  const t = useTranslations("dashboard.tabs.appRolesTab");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("distribution");
  const primaryColor = useCssVariable("--primary");

  const openModal = (tab = "distribution") => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="space-y-4">

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <MetricCard
            title={t("metrics.totalAppRoles.title")}
            value={String(roleMetrics.byType.application)}
            change={t("metrics.totalAppRoles.change", { total: roleMetrics.total })}
            trend="up"
            trendDirection="positive"
            icon={Server}
            onClick={() => openModal("distribution")}
            tooltip={t("metrics.totalAppRoles.tooltip")}
          />

          <MetricCard
            title={t("metrics.activeVsUnused.title")}
            value={`${activePercent}%`}
            change={t("metrics.activeVsUnused.change", { count: roleMetrics.unusedRolesCount })}
            trend={roleMetrics.unusedRolesCount > 0 ? "up" : "down"}
            trendDirection={roleMetrics.unusedRolesCount > 0 ? "negative" : "positive"}
            icon={Activity}
            onClick={() => openModal("quality")}
            tooltip={t("metrics.activeVsUnused.tooltip")}
          />

          <MetricCard
            title={t("metrics.highRiskRoles.title")}
            value={String(roleMetrics.highRiskRoles.length)}
            change={t("metrics.highRiskRoles.change")}
            trend="up"
            trendDirection="negative"
            icon={ShieldAlert}
            onClick={() => openModal("distribution")}
            tooltip={t("metrics.highRiskRoles.tooltip")}
          />

          <MetricCard
            title={t("metrics.unownedRoles.title")}
            value={String(roleMetrics.withoutOwners)}
            change={t("metrics.unownedRoles.change")}
            trend="up"
            trendDirection={roleMetrics.withoutOwners > 0 ? "negative" : "positive"}
            icon={UserX}
            onClick={() => openModal("quality")}
            tooltip={t("metrics.unownedRoles.tooltip")}
          />

          <MetricCard
            title={t("metrics.overlappingRoles.title")}
            value={String(roleMetrics.overlappingRoles.length)}
            change={t("metrics.overlappingRoles.change")}
            trend={roleMetrics.overlappingRoles.length > 0 ? "up" : "down"}
            trendDirection={roleMetrics.overlappingRoles.length > 0 ? "negative" : "positive"}
            icon={Layers}
            onClick={() => openModal("quality")}
            tooltip={t("metrics.overlappingRoles.tooltip")}
          />
        </div>

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">

          {/* Roles by Business Unit */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("charts.rolesByBusinessUnit.title")}
                </CardTitle>
                <InfoTooltip
                  text={t("charts.rolesByBusinessUnit.tooltip")}
                  side="right"
                />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={buChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} isAnimationActive>
                    {buChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={primaryColor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Role Risk Severity */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("charts.roleRiskSeverity.title")}
                </CardTitle>
                <InfoTooltip
                  text={t("charts.roleRiskSeverity.tooltip")}
                  side="right"
                />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={riskData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {riskData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>
      </div>

      <RoleGovernanceModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultTab={modalTab}
      />
    </>
  );
};

export default AppRolesTab;