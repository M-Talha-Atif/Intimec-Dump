import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart3, Search, Shield, Settings, RefreshCw, Filter, FileText, Pickaxe, Layers, GitCompare, Zap, Scale } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StandardTabs from '@/components/shared/StandardTabs';
import IconTabs from '@/components/shared/IconTabs';
import { AccessAnalysisProvider } from '@/contexts/AccessAnalysisContext';
import { StatCard } from './StatCard';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { RoleDiscoveryPanel } from './RoleDiscoveryPanel';
import { RoleModelingPanel } from './RoleModelingPanel';
import { ConsolidationPanel } from './ConsolidationPanel';
import { ImpactAnalysisPanel } from './ImpactAnalysisPanel';
import { GovernanceIntelligence } from './GovernanceIntelligence';
import { AccessAnalysisDrilldownDrawer } from './AccessAnalysisDrilldownDrawer';
import { AdvancedFiltersModal, ComplianceReportModal } from './modals';
import { SettingsModal } from './modals';

const kpiData = [
  { title: 'Role Coverage Rate', value: '62%', icon: Shield, tooltip: 'Percentage of total access granted through defined roles vs. direct assignments. Higher coverage indicates better role-based governance maturity.', trend: { value: 8, isPositive: true }, iconClassName: 'bg-primary/10 text-primary' },
  { title: 'Entitlement Sprawl Index', value: '18.4', icon: Layers, tooltip: 'Average number of entitlements per identity across the organization. Lower values indicate tighter access control.', trend: { value: 3, isPositive: false }, iconClassName: 'bg-warning/10 text-warning' },
  { title: 'Role Redundancy Score', value: '23%', icon: GitCompare, tooltip: 'Percentage of roles with >30% entitlement overlap with at least one other role. These represent consolidation opportunities.', trend: { value: 5, isPositive: false }, iconClassName: 'bg-destructive/10 text-destructive' },
  { title: 'Direct Access Exposure', value: '342', icon: Shield, tooltip: 'Number of identities with access granted directly rather than through roles. These bypass governance controls.', trend: { value: 12, isPositive: false }, iconClassName: 'bg-warning/10 text-warning' },
  { title: 'SoD Violations', value: '8', icon: Scale, tooltip: 'Active Segregation of Duty policy violations across SOX, GDPR, and HIPAA frameworks requiring remediation.', trend: { value: 2, isPositive: false }, badge: { label: 'Action Required', variant: 'destructive' as const }, iconClassName: 'bg-destructive/10 text-destructive' },
  { title: 'Avg Role Complexity', value: '14.2', icon: Layers, tooltip: 'Average number of entitlements per role. Roles with high complexity are harder to certify and maintain.', trend: { value: 4, isPositive: false }, iconClassName: 'bg-muted text-muted-foreground' },
  { title: 'Governance Maturity', value: '68', icon: BarChart3, tooltip: 'Composite governance maturity score (0-100) based on role coverage, certification rates, policy compliance, and owner accountability.', trend: { value: 6, isPositive: true }, badge: { label: 'Improving', variant: 'outline' as const }, iconClassName: 'bg-success/10 text-success' },
  { title: 'Optimization Opportunities', value: '15', icon: Zap, tooltip: 'Total actionable optimization opportunities including role merges, unused access removals, and coverage improvements.', badge: { label: 'Pending', variant: 'default' as const }, iconClassName: 'bg-primary/10 text-primary' },
];

const kpiDrilldownData = [
  { columns: [{ key: 'category', label: 'Category' }, { key: 'count', label: 'Count' }, { key: 'pct', label: '% of Total' }], data: [{ category: 'Role-Based Access', count: '3,420', pct: '62%' }, { category: 'Direct Access', count: '1,320', pct: '24%' }, { category: 'Hybrid', count: '770', pct: '14%' }], trend: [{ label: 'Oct', value: 55 }, { label: 'Nov', value: 57 }, { label: 'Dec', value: 58 }, { label: 'Jan', value: 60 }, { label: 'Feb', value: 61 }, { label: 'Mar', value: 62 }] },
  { columns: [{ key: 'dept', label: 'Department' }, { key: 'avg', label: 'Avg Entitlements' }, { key: 'max', label: 'Max' }], data: [{ dept: 'Engineering', avg: '24.3', max: '56' }, { dept: 'Finance', avg: '18.1', max: '34' }, { dept: 'Operations', avg: '16.2', max: '31' }, { dept: 'Marketing', avg: '14.0', max: '22' }], trend: [{ label: 'Oct', value: 17.2 }, { label: 'Nov', value: 17.5 }, { label: 'Dec', value: 17.8 }, { label: 'Jan', value: 18.0 }, { label: 'Feb', value: 18.2 }, { label: 'Mar', value: 18.4 }] },
  { columns: [{ key: 'roleA', label: 'Role A' }, { key: 'roleB', label: 'Role B' }, { key: 'overlap', label: 'Overlap %' }], data: [{ roleA: 'IT Admin', roleB: 'Security Eng', overlap: '72%' }, { roleA: 'Eng Lead', roleB: 'IT Admin', overlap: '45%' }, { roleA: 'Sales Rep', roleB: 'Marketing', overlap: '38%' }], trend: [{ label: 'Oct', value: 28 }, { label: 'Nov', value: 26 }, { label: 'Dec', value: 25 }, { label: 'Jan', value: 24 }, { label: 'Feb', value: 24 }, { label: 'Mar', value: 23 }] },
  { columns: [{ key: 'identity', label: 'Identity' }, { key: 'dept', label: 'Department' }, { key: 'directCount', label: 'Direct Entitlements' }], data: [{ identity: 'David Brown', dept: 'IT', directCount: '35' }, { identity: 'Thomas Lee', dept: 'IT', directCount: '28' }, { identity: 'Sarah Johnson', dept: 'Engineering', directCount: '22' }, { identity: 'Robert Taylor', dept: 'Engineering', directCount: '17' }], trend: [{ label: 'Oct', value: 380 }, { label: 'Nov', value: 370 }, { label: 'Dec', value: 362 }, { label: 'Jan', value: 355 }, { label: 'Feb', value: 348 }, { label: 'Mar', value: 342 }] },
  { columns: [{ key: 'user', label: 'User' }, { key: 'rule', label: 'Rule' }, { key: 'framework', label: 'Framework' }], data: [{ user: 'John Smith', rule: 'SOX 404-A', framework: 'SOX' }, { user: 'Thomas Lee', rule: 'SOX 302-A', framework: 'SOX' }, { user: 'Robert Taylor', rule: 'HIPAA §164.312', framework: 'HIPAA' }], trend: [{ label: 'Oct', value: 14 }, { label: 'Nov', value: 12 }, { label: 'Dec', value: 11 }, { label: 'Jan', value: 10 }, { label: 'Feb', value: 9 }, { label: 'Mar', value: 8 }] },
  { columns: [{ key: 'role', label: 'Role' }, { key: 'entCount', label: 'Entitlements' }, { key: 'users', label: 'Users' }], data: [{ role: 'IT Admin', entCount: '28', users: '12' }, { role: 'Security Engineer', entCount: '24', users: '6' }, { role: 'Operations Manager', entCount: '21', users: '22' }], trend: [{ label: 'Oct', value: 15.8 }, { label: 'Nov', value: 15.4 }, { label: 'Dec', value: 15.0 }, { label: 'Jan', value: 14.8 }, { label: 'Feb', value: 14.5 }, { label: 'Mar', value: 14.2 }] },
  { columns: [{ key: 'dimension', label: 'Dimension' }, { key: 'score', label: 'Score' }, { key: 'status', label: 'Status' }], data: [{ dimension: 'Role Coverage', score: '62', status: 'Improving' }, { dimension: 'Certification Rate', score: '78', status: 'Good' }, { dimension: 'Policy Compliance', score: '82', status: 'Good' }, { dimension: 'Owner Accountability', score: '71', status: 'Needs Attention' }], trend: [{ label: 'Oct', value: 58 }, { label: 'Nov', value: 60 }, { label: 'Dec', value: 62 }, { label: 'Jan', value: 64 }, { label: 'Feb', value: 66 }, { label: 'Mar', value: 68 }] },
  { columns: [{ key: 'type', label: 'Opportunity Type' }, { key: 'count', label: 'Count' }, { key: 'impact', label: 'Impact' }], data: [{ type: 'Role Merges', count: '5', impact: 'High' }, { type: 'Unused Access Removal', count: '4', impact: 'Medium' }, { type: 'Coverage Improvements', count: '3', impact: 'High' }, { type: 'Complexity Reduction', count: '3', impact: 'Medium' }], trend: [{ label: 'Oct', value: 22 }, { label: 'Nov', value: 20 }, { label: 'Dec', value: 18 }, { label: 'Jan', value: 17 }, { label: 'Feb', value: 16 }, { label: 'Mar', value: 15 }] },
];

const AccessAnalysisContentInner = () => {
  const [primaryTab, setPrimaryTab] = useState('analytics');
  const [opsTab, setOpsTab] = useState('discovery');
  const [showFilters, setShowFilters] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [kpiDrawer, setKpiDrawer] = useState<number | null>(null);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-background">
      <PageHeader
        title="Access Intelligence"
        description="AI-powered role engineering, access analytics, and governance insights"
        icon={<Search className="h-5 w-5 text-primary" />}
        tooltip="Enterprise role intelligence workspace for discovering, analyzing, comparing, and optimizing roles across the organization. Analytics provides KPI dashboards and access pattern visualizations. Operations enables role discovery, modeling, consolidation, impact analysis, and governance."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(true)}>
              <Filter className="h-4 w-4 mr-2" />Filters
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowReport(true)}>
              <FileText className="h-4 w-4 mr-2" />Report
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setIsRefreshing(true); setTimeout(() => setIsRefreshing(false), 1000); }} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        }
      />



      <Tabs value={primaryTab} onValueChange={setPrimaryTab}>
        <StandardTabs
          tabs={[
            { value: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
            { value: "operations", label: "Operations", icon: <Settings className="h-4 w-4" /> },
          ]}
        />

        <TabsContent value="analytics" className="mt-4">
          {/* 8 KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            {kpiData.map((kpi, index) => (
              <StatCard key={index} {...kpi} onClick={() => setKpiDrawer(index)} />
            ))}
          </div>
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="operations" className="mt-4">
          <Tabs value={opsTab} onValueChange={setOpsTab}>
            <IconTabs
              tabs={[
                { value: "discovery", label: "Role Discovery", icon: Pickaxe },
                { value: "modeling", label: "Role Modeling", icon: Layers },
                { value: "consolidation", label: "Consolidation", icon: GitCompare },
                { value: "impact", label: "Impact Analysis", icon: Zap },
                { value: "governance", label: "Governance", icon: Shield },
              ]}
              columns={5}
            />
            <TabsContent value="discovery" className="mt-4"><RoleDiscoveryPanel /></TabsContent>
            <TabsContent value="modeling" className="mt-4"><RoleModelingPanel /></TabsContent>
            <TabsContent value="consolidation" className="mt-4"><ConsolidationPanel /></TabsContent>
            <TabsContent value="impact" className="mt-4"><ImpactAnalysisPanel /></TabsContent>
            <TabsContent value="governance" className="mt-4"><GovernanceIntelligence /></TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* KPI Drilldown Drawer */}
      <AccessAnalysisDrilldownDrawer
        open={kpiDrawer !== null}
        onOpenChange={(open) => !open && setKpiDrawer(null)}
        title={kpiDrawer !== null ? kpiData[kpiDrawer].title : ''}
        description={kpiDrawer !== null ? kpiData[kpiDrawer].tooltip : ''}
        metric={kpiDrawer !== null ? { value: kpiData[kpiDrawer].value, trend: kpiData[kpiDrawer].trend } : undefined}
        columns={kpiDrawer !== null ? kpiDrilldownData[kpiDrawer].columns : []}
        data={kpiDrawer !== null ? kpiDrilldownData[kpiDrawer].data : []}
        trendData={kpiDrawer !== null ? kpiDrilldownData[kpiDrawer].trend : undefined}
        trendLabel={kpiDrawer !== null ? kpiData[kpiDrawer].title : ''}
      />

      <AdvancedFiltersModal open={showFilters} onOpenChange={setShowFilters} />
      <ComplianceReportModal open={showReport} onOpenChange={setShowReport} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};

export const AccessAnalysisContent = () => (
  <AccessAnalysisProvider>
    <AccessAnalysisContentInner />
  </AccessAnalysisProvider>
);
