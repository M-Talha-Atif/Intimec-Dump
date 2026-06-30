import { useState } from "react";
import { Key, AlertTriangle, ShieldOff, Lock, GitBranch } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InfoTooltip from "./InfoTooltip";
import MetricCard from "./MetricCard";
import { entitlementMetrics } from "@/services/mockRoleEntitlementMetrics";
import { EntitlementGovernanceModal } from "./modals/EntitlementGovernanceModal";
import { useCssVariable } from "@/hooks/useCssVariable";


const PRIVILEGE_COLORS = [
  "hsl(var(--chart-2))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const appData = Object.entries(entitlementMetrics.byApplication)
  .map(([app, count]) => ({ application: app, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 8);

const privilegeData = [
  { name: "Read", value: entitlementMetrics.byPrivilege.read },
  { name: "Write", value: entitlementMetrics.byPrivilege.write },
  { name: "Admin", value: entitlementMetrics.byPrivilege.admin },
];

const assignedPercent = entitlementMetrics.total > 0
  ? Math.round((entitlementMetrics.assignedEntitlements / entitlementMetrics.total) * 100)
  : 0;

const EntitlementGovernanceTab = () => {
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
        {/* 5 KPI Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <MetricCard
            title="Total Entitlements"
            value={String(entitlementMetrics.total)}
            change={`${Object.keys(entitlementMetrics.byApplication).length} apps`}
            trend="up"
            trendDirection="positive"
            icon={Key}
            onClick={() => openModal("distribution")}
            tooltip="Complete inventory of access permissions, groups, and policies across all connected applications."
          />
          <MetricCard
            title="Assigned vs Unassigned"
            value={`${assignedPercent}%`}
            change={`${entitlementMetrics.unassignedEntitlements} unused`}
            trend={entitlementMetrics.unassignedEntitlements > 0 ? "up" : "down"}
            trendDirection={entitlementMetrics.unassignedEntitlements > 3 ? "negative" : "positive"}
            icon={ShieldOff}
            onClick={() => openModal("utilization")}
            tooltip="Utilization rate — percentage of entitlements actively assigned to at least one user. Unassigned entitlements increase attack surface."
          />
          <MetricCard
            title="High-Risk Entitlements"
            value={String(entitlementMetrics.highRisk.length)}
            change="critical exposure"
            trend="up"
            trendDirection="negative"
            icon={AlertTriangle}
            onClick={() => openModal("risk")}
            tooltip="Entitlements classified as high risk due to admin privileges or sensitive data access."
          />
          <MetricCard
            title="Direct vs Role-Based"
            value={`${entitlementMetrics.roleBasedPercent}%`}
            change={`${entitlementMetrics.directAccessPercent}% direct`}
            trend="up"
            trendDirection={entitlementMetrics.roleBasedPercent >= 60 ? "positive" : "negative"}
            icon={GitBranch}
            onClick={() => openModal("utilization")}
            tooltip="Percentage of access granted through roles vs direct assignment. Higher role-based ratio indicates governance maturity."
          />
          <MetricCard
            title="Uncertified Access"
            value={String(entitlementMetrics.uncertifiedEntitlements)}
            change="never reviewed"
            trend="up"
            trendDirection={entitlementMetrics.uncertifiedEntitlements > 0 ? "negative" : "positive"}
            icon={Lock}
            onClick={() => openModal("certification")}
            tooltip="Entitlements that have never been through an access review cycle. These represent unvalidated access risk."
          />
        </div>

        {/* Visualizations */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-sm font-medium text-muted-foreground">Entitlements by Application</CardTitle>
                <InfoTooltip text="Count of entitlements per connected application, sorted by volume." side="right" />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={appData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="application" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill={primaryColor} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-sm font-medium text-muted-foreground">Privilege Distribution</CardTitle>
                <InfoTooltip text="Breakdown of entitlements by privilege level: Read-only, Write, and Admin." side="right" />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={privilegeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {privilegeData.map((_, i) => (
                      <Cell key={i} fill={PRIVILEGE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <EntitlementGovernanceModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultTab={modalTab}
      />
    </>
  );
};

export default EntitlementGovernanceTab;
