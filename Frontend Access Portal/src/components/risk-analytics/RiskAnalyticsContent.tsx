
import React, { useState } from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Activity, Settings, Bell, RefreshCw, BarChart3 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StandardTabs from '@/components/shared/StandardTabs';
import { RiskKPICards } from './RiskKPICards';
import { RiskTrendChart } from './RiskTrendChart';
import { IdentityRiskDistribution } from './IdentityRiskDistribution';
import { RiskHeatmap } from './RiskHeatmap';
import { TopRiskyIdentities } from './TopRiskyIdentities';
import { CertificationRiskMonitor } from './CertificationRiskMonitor';
import { RiskDataTables } from './RiskDataTables';
import { CompliancePosture } from './CompliancePosture';
import { AIRiskInsights } from './AIRiskInsights';
import { useToast } from "@/hooks/use-toast";
import { CriticalRiskDetailModal } from './modals/CriticalRiskDetailModal';
import { SoDViolationDetailModal } from './modals/SoDViolationDetailModal';
import { OrphanAccountDetailModal } from './modals/OrphanAccountDetailModal';
import { ExcessiveAccessDetailModal } from './modals/ExcessiveAccessDetailModal';
import { RiskSettingsModal } from './modals/RiskSettingsModal';
import { AlertManagementModal } from './modals/AlertManagementModal';
import { HeatmapDetailModal } from './modals/HeatmapDetailModal';
import { UnusedAccessDetailDrawer } from './drawers/UnusedAccessDetailDrawer';
import { OverdueCertsDetailDrawer } from './drawers/OverdueCertsDetailDrawer';
import { PrivilegedRiskDetailDrawer } from './drawers/PrivilegedRiskDetailDrawer';
import { ComplianceGapsDetailDrawer } from './drawers/ComplianceGapsDetailDrawer';
import { IdentitySegmentDrawer } from './drawers/IdentitySegmentDrawer';
import { RiskyIdentityDetailDrawer } from './drawers/RiskyIdentityDetailDrawer';
import { CertCampaignDetailDrawer } from './drawers/CertCampaignDetailDrawer';
import { SoDViolationDrawer } from './drawers/SoDViolationDrawer';
import { ComplianceFrameworkDrawer } from './drawers/ComplianceFrameworkDrawer';
import { useRiskAnalyticsConfig } from '@/contexts/RiskAnalyticsConfigContext';
import { RiskFilter, RiskKPIData, HighRiskIdentity, SoDViolation, CertificationCampaign, ComplianceFramework, IdentityRiskSegment } from '@/types/riskAnalytics';

export const RiskAnalyticsContent = () => {
  const [primaryTab, setPrimaryTab] = useState('analytics');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // KPI modals
  const [criticalRiskModalOpen, setCriticalRiskModalOpen] = useState(false);
  const [sodViolationModalOpen, setSodViolationModalOpen] = useState(false);
  const [orphanAccountModalOpen, setOrphanAccountModalOpen] = useState(false);
  const [excessiveAccessModalOpen, setExcessiveAccessModalOpen] = useState(false);
  const [unusedAccessDrawerOpen, setUnusedAccessDrawerOpen] = useState(false);
  const [overdueCertsDrawerOpen, setOverdueCertsDrawerOpen] = useState(false);
  const [privilegedRiskDrawerOpen, setPrivilegedRiskDrawerOpen] = useState(false);
  const [complianceGapsDrawerOpen, setComplianceGapsDrawerOpen] = useState(false);

  // Settings/Alerts
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [alertManagementModalOpen, setAlertManagementModalOpen] = useState(false);

  // Chart drill-downs
  const [heatmapModalOpen, setHeatmapModalOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<IdentityRiskSegment | null>(null);
  const [segmentDrawerOpen, setSegmentDrawerOpen] = useState(false);

  // Table row drill-downs
  const [selectedIdentity, setSelectedIdentity] = useState<HighRiskIdentity | null>(null);
  const [identityDrawerOpen, setIdentityDrawerOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CertificationCampaign | null>(null);
  const [campaignDrawerOpen, setCampaignDrawerOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<SoDViolation | null>(null);
  const [violationDrawerOpen, setViolationDrawerOpen] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null);
  const [frameworkDrawerOpen, setFrameworkDrawerOpen] = useState(false);

  const { toast } = useToast();
  // const router = useRouter();
  const { config } = useRiskAnalyticsConfig();

  const mockKpiData: RiskKPIData = {
    totalCriticalRisks: { id: 'critical-risks', name: 'Total Critical Risks', value: 23, previousValue: 18, trend: 'up', severity: 'critical', description: '', sources: [], lastUpdated: new Date() },
    sodViolations: { id: 'sod-violations', name: 'SoD Violations', value: 14, previousValue: 19, trend: 'down', severity: 'high', description: '', sources: [], lastUpdated: new Date() },
    orphanAccounts: { id: 'orphan-accounts', name: 'Orphan Accounts', value: 38, previousValue: 45, trend: 'down', severity: 'medium', description: '', sources: [], lastUpdated: new Date() },
    excessiveAccess: { id: 'excessive-access', name: 'Excessive Access', value: 156, previousValue: 142, trend: 'up', severity: 'high', description: '', sources: [], lastUpdated: new Date() },
    riskyRoles: { id: 'risky-roles', name: 'Risky Roles', value: 12, previousValue: 15, trend: 'down', severity: 'high', description: '', sources: [], lastUpdated: new Date() },
    processFailures: { id: 'process-failures', name: 'Process Failures', value: 8, previousValue: 11, trend: 'down', severity: 'medium', description: '', sources: [], lastUpdated: new Date() },
    riskDistribution: { employee: 68, nonEmployee: 24, nonHuman: 8 },
  };

  const mockFilters: RiskFilter = {
    timeRange: '30d',
    severity: ['critical', 'high', 'medium', 'low'],
    identityTypes: ['employee', 'non-employee', 'non-human'],
    sources: [],
  };

  const handleCardClick = (riskId: string) => {
    switch (riskId) {
      case 'overall-risk': setCriticalRiskModalOpen(true); break;
      case 'sod-violations': setSodViolationModalOpen(true); break;
      case 'orphaned-accounts': setOrphanAccountModalOpen(true); break;
      case 'excessive-access': setExcessiveAccessModalOpen(true); break;
      case 'unused-access': setUnusedAccessDrawerOpen(true); break;
      case 'overdue-certs': setOverdueCertsDrawerOpen(true); break;
      case 'privileged-risk': setPrivilegedRiskDrawerOpen(true); break;
      case 'compliance-gaps': setComplianceGapsDrawerOpen(true); break;
      default: break;
    }
  };

  const handleRefresh = () => {
    setLastRefresh(new Date());
    toast({ title: "Data Refreshed", description: "Risk analytics data has been updated." });
  };

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Risk Analytics"
        description="IGA risk posture — access violations, certification health, and compliance gaps"
        icon={<Activity className="h-5 w-5 text-primary" />}
        tooltip="Unified view of Identity Governance risk metrics. Analytics shows risk trends, identity distribution, app-level heatmaps, and high-risk identities. Operations shows SoD violations, compliance posture, and AI-driven remediation insights."
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSettingsModalOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />Settings
            </Button>
            <Button size="sm" onClick={() => setAlertManagementModalOpen(true)}>
              <Bell className="h-4 w-4 mr-2" />Alerts
            </Button>
          </div>
        }
      />

      <p className="text-xs text-muted-foreground">Last updated: {lastRefresh.toLocaleString()}</p>

      <RiskKPICards onCardClick={handleCardClick} />

      <Tabs value={primaryTab} onValueChange={setPrimaryTab}>
        <StandardTabs
          tabs={[
            { value: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
            { value: "operations", label: "Operations", icon: <Settings className="h-4 w-4" /> },
          ]}
        />

        <TabsContent value="analytics" className="mt-6 space-y-6">
          <RiskTrendChart />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <IdentityRiskDistribution onSegmentClick={(segment) => { setSelectedSegment(segment); setSegmentDrawerOpen(true); }} />
            <RiskHeatmap onCellClick={() => setHeatmapModalOpen(true)} />
          </div>

          <TopRiskyIdentities onIdentityClick={(identity) => { setSelectedIdentity(identity); setIdentityDrawerOpen(true); }} />
          <CertificationRiskMonitor onCampaignClick={(campaign) => { setSelectedCampaign(campaign); setCampaignDrawerOpen(true); }} />
        </TabsContent>

        <TabsContent value="operations" className="mt-6 space-y-6">
          <RiskDataTables onViolationClick={(violation) => { setSelectedViolation(violation); setViolationDrawerOpen(true); }} />
          <CompliancePosture onFrameworkClick={(framework) => { setSelectedFramework(framework); setFrameworkDrawerOpen(true); }} />
          <AIRiskInsights filters={mockFilters} riskData={mockKpiData} />
        </TabsContent>
      </Tabs>

      {/* KPI Modals */}
      <CriticalRiskDetailModal isOpen={criticalRiskModalOpen} onClose={() => setCriticalRiskModalOpen(false)} />
      <SoDViolationDetailModal isOpen={sodViolationModalOpen} onClose={() => setSodViolationModalOpen(false)} />
      <OrphanAccountDetailModal isOpen={orphanAccountModalOpen} onClose={() => setOrphanAccountModalOpen(false)} />
      <ExcessiveAccessDetailModal isOpen={excessiveAccessModalOpen} onClose={() => setExcessiveAccessModalOpen(false)} />
      <UnusedAccessDetailDrawer isOpen={unusedAccessDrawerOpen} onClose={() => setUnusedAccessDrawerOpen(false)} />
      <OverdueCertsDetailDrawer isOpen={overdueCertsDrawerOpen} onClose={() => setOverdueCertsDrawerOpen(false)} />
      <PrivilegedRiskDetailDrawer isOpen={privilegedRiskDrawerOpen} onClose={() => setPrivilegedRiskDrawerOpen(false)} />
      <ComplianceGapsDetailDrawer isOpen={complianceGapsDrawerOpen} onClose={() => setComplianceGapsDrawerOpen(false)} />

      {/* Settings/Alerts */}
      <RiskSettingsModal isOpen={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} />
      <AlertManagementModal isOpen={alertManagementModalOpen} onClose={() => setAlertManagementModalOpen(false)} />

      {/* Chart Drill-downs */}
      <HeatmapDetailModal isOpen={heatmapModalOpen} onClose={() => setHeatmapModalOpen(false)} />
      <IdentitySegmentDrawer isOpen={segmentDrawerOpen} onClose={() => setSegmentDrawerOpen(false)} segment={selectedSegment} />

      {/* Table Row Drill-downs */}
      <RiskyIdentityDetailDrawer isOpen={identityDrawerOpen} onClose={() => setIdentityDrawerOpen(false)} identity={selectedIdentity} />
      <CertCampaignDetailDrawer isOpen={campaignDrawerOpen} onClose={() => setCampaignDrawerOpen(false)} campaign={selectedCampaign} />
      <SoDViolationDrawer isOpen={violationDrawerOpen} onClose={() => setViolationDrawerOpen(false)} violation={selectedViolation} />
      <ComplianceFrameworkDrawer isOpen={frameworkDrawerOpen} onClose={() => setFrameworkDrawerOpen(false)} framework={selectedFramework} />
    </div>
  );
};
