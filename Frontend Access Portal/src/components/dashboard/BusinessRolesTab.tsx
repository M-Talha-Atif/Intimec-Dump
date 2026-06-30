import { useState } from "react";
import { Briefcase, Target, TrendingUp, ShieldOff, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InfoTooltip from "./InfoTooltip";
import MetricCard from "./MetricCard";
import { roleMetrics, governanceMetrics } from "@/services/mockRoleEntitlementMetrics";
import { BusinessRolesModal } from "./modals/BusinessRolesModal";

const BusinessRolesTab = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("distribution");

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
            title="Total Business Roles"
            value={String(roleMetrics.byType.business)}
            change={`${roleMetrics.businessRolesEnabled.length} enabled`}
            trend="up"
            trendDirection="positive"
            icon={Briefcase}
            onClick={() => openModal("distribution")}
            tooltip="Organizational access bundles grouping entitlements from multiple applications into a single assignable role."
          />
          <MetricCard
            title="Role Coverage Rate"
            value={`${governanceMetrics.roleCoverageRate}%`}
            change="identities covered"
            trend="up"
            trendDirection="positive"
            icon={Target}
            onClick={() => openModal("coverage")}
            tooltip="Percentage of identities whose access is managed through business roles rather than direct grants. Higher coverage indicates mature governance."
          />
          <MetricCard
            title="Role Adoption"
            value={`${roleMetrics.activeBusinessRoles}/${roleMetrics.activeBusinessRoles + roleMetrics.dormantBusinessRoles}`}
            change={`${roleMetrics.dormantBusinessRoles} dormant`}
            trend={roleMetrics.dormantBusinessRoles > 0 ? "up" : "down"}
            trendDirection={roleMetrics.dormantBusinessRoles > 0 ? "negative" : "positive"}
            icon={TrendingUp}
            onClick={() => openModal("adoption")}
            tooltip="Ratio of actively assigned business roles to total. Dormant roles may need review or retirement."
          />
          <MetricCard
            title="Policy Violations"
            value={String(roleMetrics.rolesWithConflicts)}
            change="SoD conflicts"
            trend="up"
            trendDirection={roleMetrics.rolesWithConflicts > 0 ? "negative" : "positive"}
            icon={ShieldOff}
            onClick={() => openModal("violations")}
            tooltip="Business roles containing Segregation of Duty conflicts or risk policy breaches."
          />
          <MetricCard
            title="AI Suggested Roles"
            value={String(governanceMetrics.aiSuggestedRoles)}
            change="optimization ops"
            trend="up"
            trendDirection="positive"
            icon={Sparkles}
            onClick={() => openModal("ai")}
            tooltip="Role mining recommendations based on access pattern analysis and entitlement clustering."
          />
        </div>

        {/* Visualizations */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-sm font-medium text-muted-foreground">Role Coverage by Department</CardTitle>
                <InfoTooltip text="Stacked view of role-based vs direct access per department. Higher role-based access indicates better governance." side="right" />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={governanceMetrics.coverageByDept} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="dept" width={90} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Bar dataKey="covered" fill="hsl(var(--chart-2))" name="Role-Based" radius={[0, 4, 4, 0]} stackId="a" />
                  <Bar dataKey="direct" fill="hsl(var(--chart-4))" name="Direct Access" radius={[0, 4, 4, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-sm font-medium text-muted-foreground">Adoption Trend</CardTitle>
                <InfoTooltip text="Active vs dormant business role trend over the last 6 months." side="right" />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={governanceMetrics.adoptionTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="active" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.15} name="Active" />
                  <Area type="monotone" dataKey="dormant" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.15} name="Dormant" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <BusinessRolesModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultTab={modalTab}
      />
    </>
  );
};

export default BusinessRolesTab;
