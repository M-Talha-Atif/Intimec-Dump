import { useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";
import {
  Shield, ClipboardCheck, UserX, ShieldAlert, FileCheck, Timer,
  Users, KeyRound, RefreshCw, Download, CalendarDays, LayoutDashboard,
} from "lucide-react";
import InfoTooltip from "./InfoTooltip";
import MetricCard from "./MetricCard";
import RiskPostureChart from "./RiskPostureChart";
import AttentionItems from "./AttentionItems";
import GovernanceSummaryCard from "./GovernanceSummaryCard";
import AppRolesTab from "./AppRolesTab";
import BusinessRolesTab from "./BusinessRolesTab";
import EntitlementGovernanceTab from "./EntitlementGovernanceTab";
import CrossIntelligenceTab from "./CrossIntelligenceTab";
import { TaskSummaryModal } from "./modals/TaskSummaryModal";
import { ComplianceDetailModal } from "./modals/ComplianceDetailModal";
import { CertificationDetailModal } from "./modals/CertificationDetailModal";
import { ApplicationHealthModal } from "./modals/ApplicationHealthModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DateRangeSelect from "../common/DateRangeSelect";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";
import IconTabs from "@/components/shared/IconTabs";

const GovernanceCommandCenter = () => {
  const { config, lastRefresh, triggerRefresh } = useDashboardConfig();
  const [dateRange, setDateRange] = useState<string>(config.defaultDateRange);
  const { data, loading } = useDashboardData(dateRange, lastRefresh);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);
  const [isCertificationModalOpen, setIsCertificationModalOpen] = useState(false);
  const [isAppHealthModalOpen, setIsAppHealthModalOpen] = useState(false);

  if (loading || !data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-muted-foreground">Loading governance data…</div>
      </div>
    );
  }

  const riskScore = Math.round(
    (data.identityRisk.terminated.count * 4 +
      data.identityRisk.orphan.count * 5 +
      data.identityRisk.risky.count * 3 +
      data.identityRisk.inactive.count * 1) / 5
  );
  const complianceScore = data.compliance.overallScore;
  const orphanCount = data.identityRisk.orphan.count;
  const sodViolations = data.compliance.policyViolations.critical + data.compliance.policyViolations.high;
  const certProgress = data.certifications.completionRate;
  const slaOnTime = Math.round((data.sla.onTime / (data.sla.onTime + data.sla.nearBreach + data.sla.breached)) * 100);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-background">
      {/* Standardized Header */}
      <PageHeader
        title="Identity Governance Command Center"
        description="Enterprise governance posture & operational readiness"
        tooltip="Executive governance dashboard providing real-time visibility into identity risk posture, compliance status, certification progress, and operational SLA performance across the enterprise."
        icon={<LayoutDashboard className="h-6 w-6 text-primary" />}
        actions={
          <>
            <DateRangeSelect
              value={dateRange}
              onChange={setDateRange}
              tooltip="Filter dashboard metrics by submission date"
              triggerClassName="w-[180px]"
              options={[
                { label: "Last 7 days", value: "7days" },
                { label: "Last 30 days", value: "30days" },
                { label: "Last 90 days", value: "90days" },
              ]}
            />

            <Button variant="outline" size="icon" onClick={triggerRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="icon" onClick={() => toast.success("Export started")}>
              <Download className="h-4 w-4" />
            </Button>
          </>
        }
      />

      {/* Executive KPI Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard title="Identity Risk Score" value={String(riskScore)} change="-3.2%" trend="down" trendDirection="positive" icon={Shield} tooltip="Composite score calculated from terminated, orphan, risky, and inactive identities. Lower is better." />
        <MetricCard title="Compliance Score" value={`${complianceScore}%`} change="+2.1%" trend="up" trendDirection="positive" icon={ClipboardCheck} tooltip="Overall regulatory compliance percentage across all governance policies and controls." />
        <MetricCard title="Orphan Accounts" value={String(orphanCount)} change={data.identityRisk.orphan.trend} trend="up" trendDirection="negative" icon={UserX} tooltip="Accounts without an active owner or manager. These represent uncontrolled access risk." />
        <MetricCard title="SoD Violations" value={String(sodViolations)} change="+5" trend="up" trendDirection="negative" icon={ShieldAlert} tooltip="Segregation of Duty conflicts where users hold incompatible permissions across systems." />
        <MetricCard title="Certification Progress" value={`${certProgress}%`} change="-8%" trend="down" trendDirection="negative" icon={FileCheck} tooltip="Completion rate of active access review campaigns. Target: 100% before deadline." />
        <MetricCard title="Provisioning SLA" value={`${slaOnTime}%`} change="+1.2%" trend="up" trendDirection="positive" icon={Timer} tooltip="Percentage of access requests fulfilled within the agreed service level timeframe." />
      </div>

      {/* Tabbed Analytics Layer */}
      <Tabs defaultValue="app-roles" className="space-y-4">
       <IconTabs
          tabs={[
            { value: "app-roles", label: "App Roles", icon: Shield },
            { value: "business-roles", label: "Business Roles", icon: Users },
            { value: "entitlements", label: "Entitlements", icon: KeyRound },
            { value: "intelligence", label: "Intelligence", icon: ShieldAlert },
          ]}
          columns={4}
        />

        <TabsContent value="app-roles"><AppRolesTab /></TabsContent>
        <TabsContent value="business-roles"><BusinessRolesTab /></TabsContent>
        <TabsContent value="entitlements"><EntitlementGovernanceTab /></TabsContent>
        <TabsContent value="intelligence"><CrossIntelligenceTab /></TabsContent>
      </Tabs>

      {/* Persistent Footer */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="lg:col-span-1"><RiskPostureChart /></div>
        <GovernanceSummaryCard title="Access Lifecycle" icon={Users} tooltip="Joiner/Mover/Leaver activity and average provisioning times for the selected period." rows={[{ label: "Joiners (30d)", value: data.lifecycle.joiners.count }, { label: "Movers (30d)", value: data.lifecycle.movers.count }, { label: "Leavers (30d)", value: data.lifecycle.leavers.count }, { label: "Avg Provisioning", value: `${data.lifecycle.provisioning.avgTime}h` }]} />
        <GovernanceSummaryCard title="Certification Campaigns" icon={FileCheck} tooltip="Status of active access review campaigns including overdue reviews and pending items." rows={[{ label: "Active Campaigns", value: data.certifications.activeCampaigns }, { label: "Overdue Reviews", value: data.certifications.overdueReviews, highlight: data.certifications.overdueReviews > 0 }, { label: "Pending Items", value: data.certifications.itemsPending }]} progress={{ label: "Completion Rate", value: data.certifications.completionRate }} onViewAll={() => setIsCertificationModalOpen(true)} />
        <GovernanceSummaryCard title="Privileged Access" icon={KeyRound} tooltip="Overview of privileged accounts, active sessions, and associated policy violations." rows={[{ label: "Total Accounts", value: data.privilegedAccess.totalAccounts }, { label: "Active Sessions", value: data.privilegedAccess.activeSessions }, { label: "Policy Violations", value: data.privilegedAccess.violations, highlight: data.privilegedAccess.violations > 0 }]} />
      </div>

      {/* Attention Items */}
      <AttentionItems data={data} onOpenTasks={() => setIsTaskModalOpen(true)} onOpenCompliance={() => setIsComplianceModalOpen(true)} onOpenCertification={() => setIsCertificationModalOpen(true)} onOpenAppHealth={() => setIsAppHealthModalOpen(true)} />

      {/* Modals */}
      <TaskSummaryModal open={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} data={data.tasks} />
      <ComplianceDetailModal open={isComplianceModalOpen} onClose={() => setIsComplianceModalOpen(false)} data={data.compliance} />
      <CertificationDetailModal open={isCertificationModalOpen} onClose={() => setIsCertificationModalOpen(false)} data={data.certifications} />
      <ApplicationHealthModal open={isAppHealthModalOpen} onClose={() => setIsAppHealthModalOpen(false)} data={data.applicationHealth} />
    </div>
  );
};

export default GovernanceCommandCenter;
