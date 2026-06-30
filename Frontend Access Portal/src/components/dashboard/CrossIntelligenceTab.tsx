import { useState } from "react";
import { Gauge, Brain, AlertTriangle, ShieldCheck } from "lucide-react";
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InfoTooltip from "./InfoTooltip";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { governanceMetrics } from "@/services/mockRoleEntitlementMetrics";
import { CrossIntelligenceModal } from "./modals/CrossIntelligenceModal";
import { useCssVariable } from "@/hooks/useCssVariable";

const radarData = [
  { dimension: 'Coverage', value: governanceMetrics.maturityDimensions.roleCoverage },
  { dimension: 'Ownership', value: governanceMetrics.maturityDimensions.ownershipCompleteness },
  { dimension: 'Certification', value: governanceMetrics.maturityDimensions.certificationCoverage },
  { dimension: 'Role-Based', value: governanceMetrics.maturityDimensions.roleBasedRatio },
  { dimension: 'Risk', value: governanceMetrics.maturityDimensions.riskPosture },
];

type ScoreCardProps = {
  title: string;
  value: number;
  maxValue?: number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
  badgeVariant?: 'default' | 'destructive' | 'secondary';
  onClick?: () => void;
  tooltip?: string;
};


const ScoreCard = ({ title, value, maxValue = 100, subtitle, icon: Icon, color, badge, badgeVariant = 'secondary', onClick, tooltip }: ScoreCardProps) => (
  <Card className={`transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`} onClick={onClick}>
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
          {tooltip && <InfoTooltip text={tooltip} />}
        </div>
        {badge && <Badge variant={badgeVariant} className="text-xs">{badge}</Badge>}
      </div>
      <div className="text-3xl font-bold text-foreground mb-1">{value}<span className="text-lg text-muted-foreground">/{maxValue}</span></div>
      <Progress value={(value / maxValue) * 100} className="h-2 mb-2" />
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </CardContent>
  </Card>
);

const CrossIntelligenceTab = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("maturity");

  const openModal = (tab = "maturity") => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  const primaryColor = useCssVariable("--primary");

  return (
    <>
      <div className="space-y-4">
        {/* 4 Score Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ScoreCard
            title="Governance Maturity"
            value={governanceMetrics.maturityIndex}
            subtitle="Composite of coverage, ownership, certification & risk"
            icon={Gauge}
            color="primary"
            onClick={() => openModal("maturity")}
            tooltip="Composite index (0-100) measuring role coverage, ownership, certification, role-based ratio, and risk posture."
          />
          <ScoreCard
            title="Access Complexity"
            value={governanceMetrics.complexityScore}
            subtitle="Lower is better — roles/user + entitlements/account"
            icon={Brain}
            color="chart-4"
            onClick={() => openModal("complexity")}
            tooltip="Score reflecting average roles per user, entitlements per account, and nesting depth. Lower is better."
          />
          <ScoreCard
            title="Role Explosion"
            value={governanceMetrics.roleGrowthRate}
            maxValue={20}
            subtitle={`Role growth ${governanceMetrics.roleGrowthRate}% vs user growth ${governanceMetrics.userGrowthRate}%`}
            icon={AlertTriangle}
            color="destructive"
            badge={governanceMetrics.roleExplosionAlert ? "Alert" : undefined}
            badgeVariant="destructive"
            onClick={() => openModal("trends")}
            tooltip="Compares role growth rate to user growth rate. Alert triggers when role growth exceeds 2x user growth."
          />
          <ScoreCard
            title="Certification Coverage"
            value={governanceMetrics.certificationCoverage}
            subtitle="Entitlements with at least one review cycle"
            icon={ShieldCheck}
            color="chart-2"
            onClick={() => openModal("maturity")}
            tooltip="Percentage of entitlements that have completed at least one review cycle."
          />
        </div>

        {/* Visualizations */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-sm font-medium text-muted-foreground">Governance Maturity Breakdown</CardTitle>
                <InfoTooltip text="Radar chart showing five governance dimensions: Coverage, Ownership, Certification, Role-Based ratio, and Risk posture." side="right" />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Radar
                    name="Maturity"
                    dataKey="value"
                    stroke={primaryColor}
                    fill={primaryColor}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-sm font-medium text-muted-foreground">Role Growth vs User Growth</CardTitle>
                <InfoTooltip text="Trend comparison detecting whether role creation is outpacing organizational growth." side="right" />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={governanceMetrics.roleGrowthTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="roles" allowDecimals={false} orientation="left" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="users" allowDecimals={false} orientation="right" tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line yAxisId="roles" type="monotone" dataKey="roles" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Roles" dot={false} />
                  <Line yAxisId="users" type="monotone" dataKey="users" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Users" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <CrossIntelligenceModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultTab={modalTab}
      />
    </>
  );
};

export default CrossIntelligenceTab;
