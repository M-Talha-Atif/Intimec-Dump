import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, AlertTriangle, Brain, Users, BookCheck, TrendingUp, Eye, Lock, Key, UserX, FileWarning, Fingerprint
} from 'lucide-react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import MetricCard from '@/components/dashboard/MetricCard';
import { usePagination, StandardPagination } from '@/components/shared/StandardPagination';
import { AccessAnalysisDrilldownDrawer, DrilldownColumn } from './AccessAnalysisDrilldownDrawer';
import { toast } from 'sonner';

const governanceKpis = [
  { title: 'Entitlements with Owners', value: '78%', icon: Users, tooltip: 'Percentage of entitlements assigned to a responsible owner for governance accountability.', trend: { value: 5, isPositive: true }, iconClassName: 'bg-success/10 text-success' },
  { title: 'Users Above Risk Threshold', value: '23', icon: AlertTriangle, tooltip: 'Count of users whose cumulative risk score exceeds the organizational threshold of 70.', trend: { value: 8, isPositive: false }, iconClassName: 'bg-warning/10 text-warning' },
  { title: 'Access Outside Roles', value: '34%', icon: Shield, tooltip: 'Percentage of total access granted directly to users rather than through defined roles.', trend: { value: 3, isPositive: false }, iconClassName: 'bg-destructive/10 text-destructive' },
  { title: 'Compliance Score', value: '82', icon: BookCheck, tooltip: 'Composite compliance score based on policy adherence, certification coverage, and violation resolution rate.', trend: { value: 6, isPositive: true }, badge: { label: 'Good', variant: 'outline' as const }, iconClassName: 'bg-primary/10 text-primary' },
];

const sodViolations = [
  { id: 'SOD-001', user: 'John Smith', rule: 'SOX Rule 404-A', description: 'Finance journal entry + audit access combination', risk: 'Critical', framework: 'SOX', entitlements: ['Finance Journal Entry', 'Audit Report Access'] },
  { id: 'SOD-002', user: 'Lisa Wong', rule: 'SOX Rule 302-B', description: 'Budget approval + financial reporting access', risk: 'High', framework: 'SOX', entitlements: ['Budget Approval', 'Financial Reporting'] },
  { id: 'SOD-003', user: 'Sarah Johnson', rule: 'GDPR Art. 32', description: 'PII access without encryption controls', risk: 'High', framework: 'GDPR', entitlements: ['PII Access', 'Data Export'] },
  { id: 'SOD-004', user: 'Robert Taylor', rule: 'HIPAA §164.312', description: 'PHI access + system admin privileges', risk: 'Critical', framework: 'HIPAA', entitlements: ['PHI Records', 'System Admin'] },
  { id: 'SOD-005', user: 'David Brown', rule: 'SOX Rule 404-B', description: 'Vendor creation + payment approval', risk: 'High', framework: 'SOX', entitlements: ['Vendor Management', 'Payment Processing'] },
  { id: 'SOD-006', user: 'Jessica Anderson', rule: 'GDPR Art. 25', description: 'Customer data access + marketing automation', risk: 'Medium', framework: 'GDPR', entitlements: ['Customer Database', 'Marketing Automation'] },
  { id: 'SOD-007', user: 'Thomas Lee', rule: 'SOX Rule 302-A', description: 'IT change management + production access', risk: 'Critical', framework: 'SOX', entitlements: ['Change Management', 'Production Access'] },
  { id: 'SOD-008', user: 'Karen White', rule: 'HIPAA §164.308', description: 'Access provisioning + security audit review', risk: 'High', framework: 'HIPAA', entitlements: ['Access Provisioning', 'Security Audit'] },
];

const aiInsights = [
  { id: 'AI-001', user: 'John Smith', entitlement: 'Admin Panel Access', tag: 'Unusual Access', explanation: 'Not observed in Finance department peer group. 0 of 44 peers have this entitlement.', confidence: 94, recommendation: 'Review with department head and consider removal', icon: AlertTriangle },
  { id: 'AI-002', user: 'Mike Chen', entitlement: 'Customer Database', tag: 'Likely Unused', explanation: 'No access events recorded in 127 days. Average peer usage is 3.2 events/week.', confidence: 87, recommendation: 'Consider removal after manager approval', icon: UserX },
  { id: 'AI-003', user: 'David Brown', entitlement: 'Audit Reports', tag: 'Peer Deviation', explanation: '2.3x more audit permissions than IT team average. Median for IT is 4 audit entitlements.', confidence: 91, recommendation: 'Validate business justification with IT manager', icon: TrendingUp },
  { id: 'AI-004', user: 'Lisa Wong', entitlement: 'Payment Processing + Vendor Mgmt', tag: 'Toxic Combination', explanation: 'Combining these entitlements creates an uncontrolled payment path violating SOX controls.', confidence: 96, recommendation: 'Immediately separate duties or implement compensating control', icon: Lock },
  { id: 'AI-005', user: 'Robert Taylor', entitlement: 'Root Access - Production', tag: 'Privilege Escalation', explanation: 'Engineering role escalated to include root production access not in role definition.', confidence: 92, recommendation: 'Revoke escalated privilege and review provisioning workflow', icon: Key },
  { id: 'AI-006', user: 'Amanda Wilson', entitlement: 'Legal Document Archive', tag: 'Unusual Access', explanation: 'Legal department access granted to non-legal employee. No business justification on record.', confidence: 88, recommendation: 'Request justification from manager within 5 business days', icon: FileWarning },
  { id: 'AI-007', user: 'Thomas Lee', entitlement: 'Backup Admin Console', tag: 'Likely Unused', explanation: 'Access granted 18 months ago, used only twice. Backup responsibilities transferred to SRE team.', confidence: 85, recommendation: 'Remove access as responsibilities have been reassigned', icon: UserX },
  { id: 'AI-008', user: 'Emily Davis', entitlement: 'API Gateway Admin', tag: 'Peer Deviation', explanation: 'Marketing user with API admin access. 0 of 37 marketing peers have infrastructure entitlements.', confidence: 93, recommendation: 'Review whether access was provisioned in error', icon: Fingerprint },
];

// Enriched violation drill-down
const getViolationDetail = (violation: any) => [
  { field: 'User', value: violation.user, detail: 'Identity with conflicting access' },
  { field: 'Rule', value: violation.rule, detail: `${violation.framework} compliance rule` },
  { field: 'Risk Level', value: violation.risk, detail: 'Assessed severity of the violation' },
  { field: 'Conflicting Entitlements', value: violation.entitlements.join(' + '), detail: 'Entitlements creating the SoD conflict' },
  { field: 'Detection Date', value: '2026-02-15', detail: 'When the violation was first detected' },
  { field: 'Days Open', value: '21', detail: 'Days since detection without remediation' },
  { field: 'Compensating Control', value: 'None', detail: 'Mitigating controls in place' },
  { field: 'Recommended Action', value: 'Separate duties to different users', detail: 'Primary remediation approach' },
  { field: 'Escalation Status', value: violation.risk === 'Critical' ? 'Escalated to CISO' : 'Pending manager review', detail: 'Current review status' },
];

// Enriched insight drill-down
const getInsightDetail = (insight: any) => [
  { field: 'User', value: insight.user, detail: 'Affected identity' },
  { field: 'Entitlement', value: insight.entitlement, detail: 'Flagged access' },
  { field: 'Category', value: insight.tag, detail: 'Type of anomaly detected' },
  { field: 'Confidence', value: `${insight.confidence}%`, detail: 'AI model confidence in this finding' },
  { field: 'Peer Group Size', value: insight.tag.includes('Peer') ? '37 users' : '44 users', detail: 'Number of peers in comparison group' },
  { field: 'Peers with Access', value: insight.tag === 'Unusual Access' ? '0' : insight.tag === 'Peer Deviation' ? '4' : 'N/A', detail: 'Peers holding the same entitlement' },
  { field: 'Last Access Event', value: insight.tag === 'Likely Unused' ? '127 days ago' : '3 days ago', detail: 'Most recent usage of this entitlement' },
  { field: 'Recommendation', value: insight.recommendation, detail: 'Suggested action based on analysis' },
];

const getRiskBadge = (risk: string) => {
  switch (risk) {
    case 'Critical': return <Badge variant="destructive">{risk}</Badge>;
    case 'High': return <Badge className="bg-warning/15 text-warning border-warning/30">{risk}</Badge>;
    case 'Medium': return <Badge variant="secondary">{risk}</Badge>;
    default: return <Badge variant="outline">{risk}</Badge>;
  }
};

const getTagColor = (tag: string) => {
  switch (tag) {
    case 'Unusual Access': return 'bg-warning/15 text-warning';
    case 'Likely Unused': return 'bg-muted text-muted-foreground';
    case 'Peer Deviation': return 'bg-destructive/10 text-destructive';
    case 'Toxic Combination': return 'bg-destructive/15 text-destructive';
    case 'Privilege Escalation': return 'bg-destructive/20 text-destructive';
    default: return 'bg-muted';
  }
};

const frameworkOptions = ['All', 'SOX', 'GDPR', 'HIPAA'];
const categoryOptions = ['All', 'Unusual Access', 'Likely Unused', 'Peer Deviation', 'Toxic Combination', 'Privilege Escalation'];

export const GovernanceIntelligence = () => {
  const [selectedViolation, setSelectedViolation] = useState<any>(null);
  const [selectedInsight, setSelectedInsight] = useState<any>(null);
  const [kpiDrawer, setKpiDrawer] = useState<number | null>(null);
  const [frameworkFilter, setFrameworkFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredViolations = useMemo(() =>
    frameworkFilter === 'All' ? sodViolations : sodViolations.filter(v => v.framework === frameworkFilter),
    [frameworkFilter]
  );
  const filteredInsights = useMemo(() =>
    categoryFilter === 'All' ? aiInsights : aiInsights.filter(i => i.tag === categoryFilter),
    [categoryFilter]
  );

  const { paginatedData: paginatedViolations, paginationProps: violationPagination } = usePagination(filteredViolations, 5);
  const { paginatedData: paginatedInsights, paginationProps: insightPagination } = usePagination(filteredInsights, 5);

  return (
    <div className="space-y-6">
      {/* Governance KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {governanceKpis.map((kpi, index) => (
          <MetricCard
            key={index}
            title={kpi.title}
            value={String(kpi.value)}
            change={`${kpi.trend.isPositive ? '+' : '-'}${kpi.trend.value}%`}
            trend={kpi.trend.isPositive ? 'up' : 'down'}
            trendDirection={kpi.trend.isPositive ? 'positive' : 'negative'}
            icon={kpi.icon}
            onClick={() => setKpiDrawer(index)}
            tooltip={kpi.tooltip}
          />
        ))}
      </div>

      {/* SoD Violations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-1.5">
              <Shield className="h-5 w-5 text-destructive" />
              Segregation of Duty Violations
              <Badge variant="destructive">{filteredViolations.length}</Badge>
              <InfoTooltip text="Active SoD policy violations. Click any violation to see timeline, affected entitlements, and remediation options." />
            </CardTitle>
            <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
              <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {frameworkOptions.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paginatedViolations.map(violation => (
              <div key={violation.id} className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedViolation(violation)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{violation.user}</span>
                    <Badge variant="outline" className="text-xs">{violation.framework}</Badge>
                  </div>
                  {getRiskBadge(violation.risk)}
                </div>
                <p className="text-sm text-muted-foreground mb-1">{violation.rule}</p>
                <p className="text-sm">{violation.description}</p>
                <div className="mt-2 flex gap-2">
                  {violation.entitlements.map(ent => (
                    <Badge key={ent} variant="secondary" className="text-xs">{ent}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <StandardPagination {...violationPagination} pageSizeOptions={[5, 10]} />
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-1.5">
              <Brain className="h-5 w-5 text-primary" />
              AI Access Intelligence
              <Badge variant="outline">{filteredInsights.length} insights</Badge>
              <InfoTooltip text="ML-driven access pattern analysis. Click any insight to see peer comparison, access history, and similar anomalies." />
            </CardTitle>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {categoryOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedInsights.map(insight => {
              const InsightIcon = insight.icon;
              return (
                <div key={insight.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <InsightIcon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium text-sm">{insight.user}</h4>
                        <p className="text-xs text-muted-foreground">{insight.entitlement}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTagColor(insight.tag)}>{insight.tag}</Badge>
                      <Badge variant="outline">{insight.confidence}% confident</Badge>
                    </div>
                  </div>
                  <p className="text-sm">{insight.explanation}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">{insight.recommendation}</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setSelectedInsight(insight)}>
                      <Eye className="h-4 w-4 mr-1" />Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          <StandardPagination {...insightPagination} pageSizeOptions={[5, 10]} />
        </CardContent>
      </Card>

      {/* Violation Drilldown — enriched */}
      <AccessAnalysisDrilldownDrawer
        open={!!selectedViolation}
        onOpenChange={(open) => !open && setSelectedViolation(null)}
        title={`Violation: ${selectedViolation?.rule || ''}`}
        description={`${selectedViolation?.user} · ${selectedViolation?.framework} · ${selectedViolation?.risk} risk`}
        columns={[
          { key: 'field', label: 'Detail' },
          { key: 'value', label: 'Value' },
          { key: 'detail', label: 'Description' },
        ]}
        data={selectedViolation ? getViolationDetail(selectedViolation) : []}
      />

      {/* Insight Drilldown — enriched */}
      <AccessAnalysisDrilldownDrawer
        open={!!selectedInsight}
        onOpenChange={(open) => !open && setSelectedInsight(null)}
        title={`AI Insight: ${selectedInsight?.tag || ''}`}
        description={`${selectedInsight?.user} · ${selectedInsight?.entitlement} · ${selectedInsight?.confidence}% confidence`}
        columns={[
          { key: 'field', label: 'Detail' },
          { key: 'value', label: 'Value' },
          { key: 'detail', label: 'Description' },
        ]}
        data={selectedInsight ? getInsightDetail(selectedInsight) : []}
      />

      {/* KPI Drilldown */}
      <AccessAnalysisDrilldownDrawer
        open={kpiDrawer !== null}
        onOpenChange={(open) => !open && setKpiDrawer(null)}
        title={kpiDrawer !== null ? governanceKpis[kpiDrawer].title : ''}
        description={kpiDrawer !== null ? governanceKpis[kpiDrawer].tooltip : ''}
        metric={kpiDrawer !== null ? { value: governanceKpis[kpiDrawer].value, trend: governanceKpis[kpiDrawer].trend } : undefined}
        columns={[
          { key: 'entity', label: 'Entity' },
          { key: 'status', label: 'Status' },
          { key: 'detail', label: 'Detail' },
        ]}
        data={[
          { entity: 'SAP Finance', status: 'Compliant', detail: '92% coverage' },
          { entity: 'Workday HR', status: 'At Risk', detail: '68% coverage' },
          { entity: 'GitHub Engineering', status: 'Compliant', detail: '85% coverage' },
          { entity: 'Salesforce CRM', status: 'Non-Compliant', detail: '54% coverage' },
          { entity: 'AWS Infrastructure', status: 'At Risk', detail: '71% coverage' },
        ]}
        trendData={[
          { label: 'Oct', value: 72 }, { label: 'Nov', value: 74 }, { label: 'Dec', value: 76 },
          { label: 'Jan', value: 78 }, { label: 'Feb', value: 80 }, { label: 'Mar', value: 82 },
        ]}
        trendLabel="Score"
      />
    </div>
  );
};
