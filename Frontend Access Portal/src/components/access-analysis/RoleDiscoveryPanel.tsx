import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';
import { useCssVariable } from '@/hooks/useCssVariable';
import { Play, Loader2, Brain, Users, Shield, Layers, Clock, CheckCircle2, XCircle, Eye, ChevronDown, ScanSearch, Target, Crosshair, AlertTriangle, Sparkles, UserCheck } from 'lucide-react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { usePagination, StandardPagination } from '@/components/shared/StandardPagination';
import { AccessAnalysisDrilldownDrawer } from './AccessAnalysisDrilldownDrawer';
import { toast } from 'sonner';

const departments = ['Engineering', 'Finance', 'HR', 'Marketing', 'Sales', 'IT', 'Operations', 'Legal'];
const applications = ['SAP', 'Workday', 'Salesforce', 'GitHub', 'AWS', 'O365', 'Oracle', 'Jenkins'];

const algorithmDescriptions: Record<string, { description: string; bestFor: string }> = {
  kmeans: {
    description: 'Partitions identities into K groups by minimizing within-cluster variance of entitlement vectors. Requires specifying the expected number of roles upfront.',
    bestFor: 'Well-separated clusters with a known approximate role count. Good for structured environments with clear departmental boundaries.',
  },
  hierarchical: {
    description: 'Builds a dendrogram by progressively merging similar access patterns. Allows cutting at any level to produce different numbers of candidate roles.',
    bestFor: 'Exploratory analysis when the optimal role count is unknown. Works well for nested organizational structures.',
  },
  dbscan: {
    description: 'Density-based clustering that finds arbitrarily shaped clusters and identifies outlier access patterns as noise. Does not require specifying role count.',
    bestFor: 'Detecting unusual access patterns and outliers. Ideal when roles have irregular shapes or when you need to identify anomalous access.',
  },
};

const discoveredRoles = [
  { id: 'DR-001', name: 'Finance Analyst Standard', confidence: 94, users: 45, entitlements: 12, coverage: 88, complexity: 35, risk: 'Low' },
  { id: 'DR-002', name: 'Engineering Developer', confidence: 91, users: 78, entitlements: 18, coverage: 82, complexity: 52, risk: 'Medium' },
  { id: 'DR-003', name: 'HR Operations', confidence: 89, users: 32, entitlements: 9, coverage: 91, complexity: 28, risk: 'Low' },
  { id: 'DR-004', name: 'Sales Representative', confidence: 87, users: 56, entitlements: 11, coverage: 85, complexity: 32, risk: 'Low' },
  { id: 'DR-005', name: 'IT Infrastructure Admin', confidence: 82, users: 12, entitlements: 28, coverage: 72, complexity: 78, risk: 'High' },
  { id: 'DR-006', name: 'Marketing Specialist', confidence: 86, users: 38, entitlements: 14, coverage: 79, complexity: 42, risk: 'Medium' },
  { id: 'DR-007', name: 'Compliance Auditor', confidence: 93, users: 8, entitlements: 16, coverage: 95, complexity: 48, risk: 'Medium' },
  { id: 'DR-008', name: 'Operations Manager', confidence: 80, users: 22, entitlements: 21, coverage: 74, complexity: 62, risk: 'High' },
];

const entitlementFrequency = [
  { name: 'Email Access', count: 245, risk: 'Low' },
  { name: 'VPN Access', count: 230, risk: 'Low' },
  { name: 'Directory Read', count: 220, risk: 'Low' },
  { name: 'CRM Read', count: 156, risk: 'Low' },
  { name: 'Cloud Console', count: 112, risk: 'Medium' },
  { name: 'Code Repo', count: 98, risk: 'Low' },
  { name: 'Budget View', count: 87, risk: 'Medium' },
  { name: 'HR Records', count: 64, risk: 'Medium' },
  { name: 'CI/CD Admin', count: 42, risk: 'High' },
  { name: 'Infra Admin', count: 28, risk: 'High' },
];

const miningHistory = [
  { id: 'MS-001', algorithm: 'K-Means', date: '2026-03-05', rolesFound: 8, status: 'completed', coverage: 82, duration: '4m 32s' },
  { id: 'MS-002', algorithm: 'DBSCAN', date: '2026-03-01', rolesFound: 12, status: 'completed', coverage: 76, duration: '6m 15s' },
  { id: 'MS-003', algorithm: 'Hierarchical', date: '2026-02-25', rolesFound: 6, status: 'completed', coverage: 88, duration: '8m 42s' },
  { id: 'MS-004', algorithm: 'K-Means', date: '2026-02-20', rolesFound: 10, status: 'completed', coverage: 79, duration: '5m 08s' },
  { id: 'MS-005', algorithm: 'DBSCAN', date: '2026-02-15', rolesFound: 9, status: 'failed', coverage: 0, duration: '2m 11s' },
  { id: 'MS-006', algorithm: 'K-Means', date: '2026-02-10', rolesFound: 7, status: 'completed', coverage: 84, duration: '3m 55s' },
  { id: 'MS-007', algorithm: 'Hierarchical', date: '2026-02-05', rolesFound: 5, status: 'completed', coverage: 90, duration: '9m 20s' },
  { id: 'MS-008', algorithm: 'DBSCAN', date: '2026-01-30', rolesFound: 11, status: 'completed', coverage: 73, duration: '7m 05s' },
];

const getRoleEntitlements = (roleName: string) => [
  { entitlement: 'Email Access', application: 'O365', risk: 'Low', usageRate: '98%', lastUsed: '2026-03-07' },
  { entitlement: 'VPN Access', application: 'Network', risk: 'Low', usageRate: '95%', lastUsed: '2026-03-07' },
  { entitlement: 'Financial Reports View', application: 'SAP', risk: 'Low', usageRate: '92%', lastUsed: '2026-03-06' },
  { entitlement: 'CRM Read', application: 'Salesforce', risk: 'Low', usageRate: '88%', lastUsed: '2026-03-05' },
  { entitlement: 'Budget Dashboard', application: 'SAP', risk: 'Medium', usageRate: '76%', lastUsed: '2026-03-04' },
  { entitlement: 'Document Management', application: 'SharePoint', risk: 'Low', usageRate: '85%', lastUsed: '2026-03-06' },
  { entitlement: 'Expense Approval', application: 'Concur', risk: 'Medium', usageRate: '62%', lastUsed: '2026-02-28' },
  { entitlement: 'Directory Read', application: 'AD', risk: 'Low', usageRate: '100%', lastUsed: '2026-03-07' },
  { entitlement: 'Cloud Console Read', application: 'AWS', risk: 'Medium', usageRate: '34%', lastUsed: '2026-01-15' },
  { entitlement: 'Backup Reports', application: 'Veeam', risk: 'Low', usageRate: '18%', lastUsed: '2025-12-20' },
];

const getRoleUsers = (roleName: string) => {
  const userSets: Record<string, { name: string; department: string; lastLogin: string; riskScore: number; status: string }[]> = {
    'Finance Analyst Standard': [
      { name: 'Sarah Chen', department: 'Finance', lastLogin: '2026-03-07', riskScore: 12, status: 'Active' },
      { name: 'Michael Torres', department: 'Finance', lastLogin: '2026-03-07', riskScore: 8, status: 'Active' },
      { name: 'Emily Watson', department: 'Finance', lastLogin: '2026-03-06', riskScore: 15, status: 'Active' },
      { name: 'David Park', department: 'Accounting', lastLogin: '2026-03-05', riskScore: 22, status: 'Active' },
      { name: 'Lisa Kim', department: 'Finance', lastLogin: '2026-02-28', riskScore: 45, status: 'Review' },
    ],
    'Engineering Developer': [
      { name: 'Alex Johnson', department: 'Engineering', lastLogin: '2026-03-07', riskScore: 18, status: 'Active' },
      { name: 'Priya Sharma', department: 'Engineering', lastLogin: '2026-03-07', riskScore: 25, status: 'Active' },
      { name: 'Carlos Rivera', department: 'Engineering', lastLogin: '2026-03-06', riskScore: 14, status: 'Active' },
      { name: 'James Wilson', department: 'DevOps', lastLogin: '2026-03-07', riskScore: 38, status: 'Active' },
      { name: 'Nina Patel', department: 'Engineering', lastLogin: '2026-03-04', riskScore: 52, status: 'Review' },
    ],
  };
  return userSets[roleName] || [
    { name: 'John Smith', department: 'IT', lastLogin: '2026-03-07', riskScore: 20, status: 'Active' },
    { name: 'Jane Doe', department: 'Operations', lastLogin: '2026-03-06', riskScore: 15, status: 'Active' },
    { name: 'Robert Lee', department: 'IT', lastLogin: '2026-03-05', riskScore: 30, status: 'Active' },
    { name: 'Maria Garcia', department: 'IT', lastLogin: '2026-03-04', riskScore: 42, status: 'Review' },
    { name: 'Thomas Brown', department: 'Operations', lastLogin: '2026-02-20', riskScore: 55, status: 'Inactive' },
  ];
};

const getRoleAIAssessment = (role: typeof discoveredRoles[0]) => {
  const efficiencyRatio = Math.round((role.coverage / (role.coverage + role.complexity)) * 100);
  const isHighQuality = efficiencyRatio >= 70;
  const isLowComplexity = role.complexity < 40;
  const isHighCoverage = role.coverage >= 85;

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  if (isHighCoverage) strengths.push(`High coverage (${role.coverage}%) means this role explains most access patterns for its member population.`);
  else weaknesses.push(`Coverage at ${role.coverage}% is below target. Consider adding frequently-used entitlements to increase explanatory power.`);
  
  if (isLowComplexity) strengths.push(`Low complexity score (${role.complexity}%) indicates a clean, well-scoped role that is easy to certify and audit.`);
  else weaknesses.push(`Complexity score (${role.complexity}%) is elevated. Consider splitting into sub-roles or removing rarely-used entitlements.`);
  
  if (role.confidence >= 90) strengths.push(`${role.confidence}% confidence indicates strong statistical clustering — access patterns are highly consistent across members.`);
  else weaknesses.push(`Confidence at ${role.confidence}% suggests some variance in member access patterns. Review outlier users for potential re-assignment.`);
  
  if (role.risk === 'High') weaknesses.push(`High risk rating due to privileged entitlements. Ensure SoD controls and periodic certification are in place.`);
  if (role.risk === 'Low') strengths.push(`Low risk profile makes this role suitable for automated provisioning without additional approval workflows.`);

  const recommendation = isHighQuality
    ? `This role candidate is well-suited for adoption. It demonstrates ${isHighCoverage ? 'strong' : 'adequate'} coverage with ${isLowComplexity ? 'manageable' : 'moderate'} complexity. Recommended for promotion to active role status after owner assignment.`
    : `This role candidate needs refinement before adoption. Focus on ${!isHighCoverage ? 'improving coverage by adding common entitlements' : 'reducing complexity by removing infrequent entitlements'}. Consider running a targeted mining session on this population.`;

  return { strengths, weaknesses, recommendation, efficiencyRatio };
};

const getEntitlementIdentities = (entitlementName: string) => {
  const identityPool = [
    { identity: 'Sarah Chen', department: 'Finance', role: 'Finance Analyst Standard', riskScore: 12 },
    { identity: 'Michael Torres', department: 'Finance', role: 'Finance Analyst Standard', riskScore: 8 },
    { identity: 'Alex Johnson', department: 'Engineering', role: 'Engineering Developer', riskScore: 18 },
    { identity: 'Priya Sharma', department: 'Engineering', role: 'Engineering Developer', riskScore: 25 },
    { identity: 'Carlos Rivera', department: 'Engineering', role: 'Engineering Developer', riskScore: 14 },
    { identity: 'Emily Watson', department: 'Finance', role: 'Finance Analyst Standard', riskScore: 15 },
    { identity: 'James Wilson', department: 'DevOps', role: 'IT Infrastructure Admin', riskScore: 38 },
    { identity: 'Lisa Kim', department: 'Finance', role: 'Finance Analyst Standard', riskScore: 45 },
    { identity: 'John Smith', department: 'IT', role: 'IT Infrastructure Admin', riskScore: 20 },
    { identity: 'Jane Doe', department: 'HR', role: 'HR Operations', riskScore: 15 },
    { identity: 'Robert Lee', department: 'IT', role: 'IT Infrastructure Admin', riskScore: 30 },
    { identity: 'David Park', department: 'Accounting', role: 'Finance Analyst Standard', riskScore: 22 },
  ];
  const item = entitlementFrequency.find(e => e.name === entitlementName);
  const count = item ? Math.min(Math.round(item.count / 30), identityPool.length) : 5;
  return identityPool.slice(0, Math.max(4, count));
};

const getSessionRoles = (sessionId: string) => {
  const count = miningHistory.find(s => s.id === sessionId)?.rolesFound || 5;
  return discoveredRoles.slice(0, Math.min(count, discoveredRoles.length)).map(r => ({
    name: r.name, confidence: `${r.confidence}%`, users: r.users, entitlements: r.entitlements, coverage: `${r.coverage}%`, risk: r.risk,
  }));
};

const getRiskBadge = (risk: string) => {
  switch (risk) {
    case 'High': return <Badge variant="destructive">{risk}</Badge>;
    case 'Medium': return <Badge className="bg-warning/15 text-warning border-warning/30">{risk}</Badge>;
    default: return <Badge variant="outline">{risk}</Badge>;
  }
};

export const RoleDiscoveryPanel = () => {
  const [algorithm, setAlgorithm] = useState('kmeans');
  const [coverageThreshold, setCoverageThreshold] = useState([75]);
  const [complexityThreshold, setComplexityThreshold] = useState([60]);
  const [minUsers, setMinUsers] = useState('5');
  const [maxRoles, setMaxRoles] = useState('20');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [selectedEntitlement, setSelectedEntitlement] = useState<string | null>(null);
  const [scopeOpen, setScopeOpen] = useState(true);
  const [selectedDepts, setSelectedDepts] = useState<string[]>(['Engineering', 'Finance', 'IT']);
  const [selectedApps, setSelectedApps] = useState<string[]>(['SAP', 'GitHub', 'AWS', 'O365']);
  const [riskThreshold, setRiskThreshold] = useState([30]);
  const [includeServiceAccounts, setIncludeServiceAccounts] = useState(false);

  const chart1 = useCssVariable('--chart-1');
  const chart2 = useCssVariable('--chart-2');
  const chart3 = useCssVariable('--chart-3');
  const chart5 = useCssVariable('--chart-5');
  const destructive = useCssVariable('--chart-5');
  const warning = useCssVariable('--risk-medium');

  const { paginatedData: paginatedHistory, paginationProps: historyPagination } = usePagination(miningHistory, 5);

  const scatterData = useMemo(() => discoveredRoles.map(r => ({
    name: r.name,
    coverage: r.coverage,
    complexity: r.complexity,
    users: r.users,
    risk: r.risk,
    id: r.id,
  })), []);

  const getBarColor = (risk: string) => {
    if (risk === 'High') return `hsl(${destructive})`;
    if (risk === 'Medium') return `hsl(${warning})`;
    return `hsl(${chart1})`;
  };

  const getScatterColor = (risk: string) => {
    if (risk === 'High') return `hsl(${destructive})`;
    if (risk === 'Medium') return `hsl(${chart5})`;
    return `hsl(${chart2})`;
  };

  const handleRunMining = () => {
    setIsRunning(true);
    toast.info('Mining session started...');
    setTimeout(() => {
      setIsRunning(false);
      toast.success('Mining session completed — 8 role candidates discovered');
    }, 3000);
  };

  const toggleDept = (d: string) => setSelectedDepts(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  const toggleApp = (a: string) => setSelectedApps(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const handleBarClick = (data: any) => {
    if (data?.activePayload?.[0]) {
      setSelectedEntitlement(data.activePayload[0].payload.name);
    }
  };

  const handleScatterClick = (data: any) => {
    if (data) {
      const role = discoveredRoles.find(r => r.name === data.name);
      if (role) setSelectedRole(role);
    }
  };

  const selectedRoleAssessment = useMemo(() => {
    if (!selectedRole) return null;
    return getRoleAIAssessment(selectedRole);
  }, [selectedRole]);

  const selectedRoleUsers = useMemo(() => {
    if (!selectedRole) return [];
    return getRoleUsers(selectedRole.name);
  }, [selectedRole]);

  const selectedEntitlementData = useMemo(() => {
    if (!selectedEntitlement) return [];
    return getEntitlementIdentities(selectedEntitlement);
  }, [selectedEntitlement]);

  const selectedEntitlementInfo = useMemo(() => {
    if (!selectedEntitlement) return null;
    return entitlementFrequency.find(e => e.name === selectedEntitlement);
  }, [selectedEntitlement]);

  return (
    <div className="space-y-6">
      {/* Analysis Scope */}
      <Collapsible open={scopeOpen} onOpenChange={setScopeOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <CardTitle className="text-base flex items-center gap-1.5">
                <ScanSearch className="h-5 w-5 text-primary" />
                Analysis Scope
                <InfoTooltip text="Define the boundaries of the role mining analysis. Narrow the scope to specific departments, applications, and risk levels to get more targeted and actionable results." />
                <ChevronDown className={`h-4 w-4 ml-auto text-muted-foreground transition-transform ${scopeOpen ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  Identity Population
                  <InfoTooltip text="Select which departments to include in the mining analysis. Only identities belonging to these departments will be analyzed for access patterns." />
                </label>
                <div className="flex flex-wrap gap-2">
                  {departments.map(d => (
                    <Badge key={d} variant={selectedDepts.includes(d) ? 'default' : 'outline'} className="cursor-pointer transition-colors" onClick={() => toggleDept(d)}>
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  Application Sources
                  <InfoTooltip text="Select which applications to include. Entitlements from these applications will be used to discover access patterns and candidate roles." />
                </label>
                <div className="flex flex-wrap gap-2">
                  {applications.map(a => (
                    <Badge key={a} variant={selectedApps.includes(a) ? 'default' : 'outline'} className="cursor-pointer transition-colors" onClick={() => toggleApp(a)}>
                      {a}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    Minimum Risk Score: {riskThreshold[0]}
                    <InfoTooltip text="Only include identities with a risk score at or above this threshold. Set to 0 to include all identities regardless of risk level." />
                  </label>
                  <Slider value={riskThreshold} onValueChange={setRiskThreshold} min={0} max={100} step={5} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Include Service Accounts
                      <InfoTooltip text="When enabled, non-human identities (service accounts, API keys) are included in the analysis. Disable to focus only on employee access patterns." />
                    </label>
                    <p className="text-xs text-muted-foreground mt-0.5">Analyze machine identities alongside employees</p>
                  </div>
                  <Switch checked={includeServiceAccounts} onCheckedChange={setIncludeServiceAccounts} />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-md">
                <Target className="h-3.5 w-3.5 shrink-0" />
                Scope: {selectedDepts.length} departments · {selectedApps.length} applications · Risk ≥ {riskThreshold[0]} · Service accounts {includeServiceAccounts ? 'included' : 'excluded'}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Mining Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-1.5">
            <Brain className="h-5 w-5 text-primary" />
            Mining Configuration
            <InfoTooltip text="Configure the AI-driven role mining algorithm parameters. Adjust thresholds to control the granularity and coverage of discovered roles." />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-5 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                Algorithm
                <InfoTooltip text="The clustering algorithm determines how access patterns are grouped into candidate roles. Each algorithm has different strengths depending on your data." />
              </label>
              <Select value={algorithm} onValueChange={setAlgorithm}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kmeans">K-Means Clustering</SelectItem>
                  <SelectItem value="hierarchical">Hierarchical</SelectItem>
                  <SelectItem value="dbscan">DBSCAN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                Coverage: {coverageThreshold[0]}%
                <InfoTooltip text="Minimum percentage of a user's entitlements that must be explained by the discovered role. Higher values produce tighter, more accurate roles." />
              </label>
              <Slider value={coverageThreshold} onValueChange={setCoverageThreshold} min={50} max={100} step={5} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                Max Complexity: {complexityThreshold[0]}%
                <InfoTooltip text="Maximum entitlement complexity score allowed per discovered role. Lower values force simpler, more manageable roles." />
              </label>
              <Slider value={complexityThreshold} onValueChange={setComplexityThreshold} min={20} max={100} step={5} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                Min Users
                <InfoTooltip text="Minimum number of users required to form a valid role candidate. Prevents creating overly specific roles that apply to very few people." />
              </label>
              <Input type="number" value={minUsers} onChange={e => setMinUsers(e.target.value)} min={1} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                Max Roles
                <InfoTooltip text="Maximum number of role candidates to discover. Limits output to the most significant clusters to avoid role explosion." />
              </label>
              <Input type="number" value={maxRoles} onChange={e => setMaxRoles(e.target.value)} min={1} />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border text-sm space-y-1">
            <div className="flex items-center gap-1.5">
              <Crosshair className="h-4 w-4 text-primary" />
              <span className="font-medium">{algorithm === 'kmeans' ? 'K-Means Clustering' : algorithm === 'hierarchical' ? 'Hierarchical Clustering' : 'DBSCAN'}</span>
            </div>
            <p className="text-muted-foreground text-xs">{algorithmDescriptions[algorithm].description}</p>
            <p className="text-xs"><span className="font-medium">Best for:</span> <span className="text-muted-foreground">{algorithmDescriptions[algorithm].bestFor}</span></p>
          </div>

          <Button onClick={handleRunMining} disabled={isRunning}>
            {isRunning ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Running Analysis...</> : <><Play className="h-4 w-4 mr-2" />Run Mining Session</>}
          </Button>
        </CardContent>
      </Card>

      {/* Discovery Visualizations */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-1.5">
              Entitlement Frequency Distribution
              <InfoTooltip text="Top 10 most common entitlements across all discovered role candidates, colored by risk level. Click any bar to drill down into identities with that entitlement." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={entitlementFrequency} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }} onClick={handleBarClick} style={{ cursor: 'pointer' }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }}
                    formatter={(value: number) => [`${value} identities`, 'Frequency']}
                    labelFormatter={(label) => {
                      const item = entitlementFrequency.find(e => e.name === label);
                      return `${label} (${item?.risk} risk) — click to drill down`;
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} className="cursor-pointer">
                    {entitlementFrequency.map((entry, i) => (
                      <Cell key={i} fill={getBarColor(entry.risk)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: `hsl(${chart1})` }} /><span className="text-muted-foreground">Low Risk</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: `hsl(${warning})` }} /><span className="text-muted-foreground">Medium Risk</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: `hsl(${destructive})` }} /><span className="text-muted-foreground">High Risk</span></div>
              <span className="text-muted-foreground ml-auto italic">Click a bar to view identities</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-1.5">
              Role Quality Scatter
              <InfoTooltip text="Each bubble represents a discovered role candidate. X-axis shows coverage (higher = better), Y-axis shows complexity (lower = better). Click any bubble to view full role details." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" dataKey="coverage" name="Coverage" unit="%" tick={{ fontSize: 11 }} domain={[60, 100]} className="text-muted-foreground" label={{ value: 'Coverage %', position: 'insideBottom', offset: -5, fontSize: 11 }} />
                  <YAxis type="number" dataKey="complexity" name="Complexity" unit="%" tick={{ fontSize: 11 }} domain={[20, 90]} className="text-muted-foreground" label={{ value: 'Complexity %', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                  <ZAxis type="number" dataKey="users" range={[80, 400]} name="Users" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-popover border rounded-lg p-3 shadow-md text-sm space-y-1">
                          <p className="font-medium">{d.name}</p>
                          <p className="text-muted-foreground">Coverage: {d.coverage}% · Complexity: {d.complexity}%</p>
                          <p className="text-muted-foreground">{d.users} users · {d.risk} risk</p>
                          <p className="text-xs text-primary mt-1">Click to view details →</p>
                        </div>
                      );
                    }}
                  />
                  <Scatter data={scatterData} onClick={handleScatterClick} className="cursor-pointer">
                    {scatterData.map((entry, i) => (
                      <Cell key={i} fill={getScatterColor(entry.risk)} fillOpacity={0.7} stroke={getScatterColor(entry.risk)} strokeWidth={1} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(${chart2})` }} /><span className="text-muted-foreground">Low Risk</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(${chart5})` }} /><span className="text-muted-foreground">Medium Risk</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(${destructive})` }} /><span className="text-muted-foreground">High Risk</span></div>
              <span className="text-muted-foreground ml-auto italic">Click a bubble to view role details</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discovered Role Candidates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-1.5">
            Discovered Role Candidates
            <Badge variant="outline">{discoveredRoles.length} roles</Badge>
            <InfoTooltip text="AI-discovered role candidates based on access pattern clustering. Click any card to view entitlements, user membership, and AI quality assessment." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {discoveredRoles.map(role => {
              const qualityRatio = Math.round((role.coverage / (role.coverage + role.complexity)) * 100);
              return (
                <Card key={role.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedRole(role)}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm">{role.name}</h4>
                      {getRiskBadge(role.risk)}
                    </div>
                    <Badge variant="secondary" className="text-xs">{role.confidence}% confident</Badge>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><Users className="h-3 w-3" />{role.users} users</div>
                      <div className="flex items-center gap-1"><Layers className="h-3 w-3" />{role.entitlements} ent.</div>
                      <div>Coverage: {role.coverage}%</div>
                      <div>Complexity: {role.complexity}%</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Quality ratio</span>
                        <span>{qualityRatio}%</span>
                      </div>
                      <Progress value={qualityRatio} className="h-1.5" />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 text-xs"><Eye className="h-3 w-3 mr-1" />Details</Button>
                      <Button size="sm" className="flex-1 text-xs" onClick={(e) => { e.stopPropagation(); toast.success(`${role.name} queued for adoption review`); }}>Adopt</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Mining History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-1.5">
            Mining Session History
            <InfoTooltip text="History of all role mining sessions. Click any session to see discovered roles from that run, including confidence scores and quality metrics." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="flex items-center gap-1">Session ID <InfoTooltip text="Unique identifier for each mining run." /></TableHead>
                  <TableHead>Algorithm</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Roles Found</TableHead>
                  <TableHead className="text-right flex items-center gap-1 justify-end">Coverage <InfoTooltip text="Percentage of total access patterns explained by discovered roles." /></TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedHistory.map(session => (
                  <TableRow key={session.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedSession(session)}>
                    <TableCell className="font-mono text-xs">{session.id}</TableCell>
                    <TableCell>{session.algorithm}</TableCell>
                    <TableCell className="text-muted-foreground">{session.date}</TableCell>
                    <TableCell className="text-right">{session.rolesFound}</TableCell>
                    <TableCell className="text-right">{session.coverage}%</TableCell>
                    <TableCell className="text-muted-foreground">{session.duration}</TableCell>
                    <TableCell>
                      {session.status === 'completed' ? (
                        <Badge variant="outline" className="text-success"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>
                      ) : (
                        <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <StandardPagination {...historyPagination} pageSizeOptions={[5, 10, 20]} />
        </CardContent>
      </Card>

      {/* Role Detail Drawer — enriched with users, AI assessment, summary cards */}
      <AccessAnalysisDrilldownDrawer
        open={!!selectedRole}
        onOpenChange={(open) => !open && setSelectedRole(null)}
        title={selectedRole?.name || ''}
        description={`Confidence: ${selectedRole?.confidence}% · ${selectedRole?.users} users · ${selectedRole?.entitlements} entitlements`}
        metric={selectedRole ? { value: `${selectedRole.confidence}%`, trend: { value: 3, isPositive: true } } : undefined}
        columns={[
          { key: 'entitlement', label: 'Entitlement' },
          { key: 'application', label: 'Application' },
          { key: 'risk', label: 'Risk', render: (v) => getRiskBadge(v) },
          { key: 'usageRate', label: 'Usage Rate' },
          { key: 'lastUsed', label: 'Last Used' },
        ]}
        data={selectedRole ? getRoleEntitlements(selectedRole.name) : []}
        trendData={[
          { label: 'Week 1', value: selectedRole?.confidence - 6 || 0 },
          { label: 'Week 2', value: selectedRole?.confidence - 3 || 0 },
          { label: 'Week 3', value: selectedRole?.confidence - 1 || 0 },
          { label: 'Week 4', value: selectedRole?.confidence || 0 },
        ]}
        trendLabel="Confidence"
      >
        {/* Summary Cards */}
        {selectedRole && selectedRoleAssessment && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Target className="h-3.5 w-3.5" />Coverage Score
                </div>
                <p className="text-2xl font-bold">{selectedRole.coverage}%</p>
                <p className="text-xs text-muted-foreground">
                  {selectedRole.coverage >= 85 ? 'Explains most access patterns for member population' : 'Below target — consider adding common entitlements'}
                </p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Layers className="h-3.5 w-3.5" />Complexity Score
                </div>
                <p className="text-2xl font-bold">{selectedRole.complexity}%</p>
                <p className="text-xs text-muted-foreground">
                  {selectedRole.complexity < 40 ? 'Clean, well-scoped role easy to certify' : 'Elevated — consider splitting or removing rarely-used entitlements'}
                </p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" />Efficiency Rating
                </div>
                <p className="text-2xl font-bold">{selectedRoleAssessment.efficiencyRatio}%</p>
                <p className="text-xs text-muted-foreground">
                  {selectedRoleAssessment.efficiencyRatio >= 70 ? 'High efficiency — strong adoption candidate' : 'Needs optimization before adoption'}
                </p>
              </div>
            </div>

            {/* AI Quality Assessment */}
            <div className="p-4 rounded-lg border bg-muted/20 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">AI Quality Assessment</span>
              </div>
              {selectedRoleAssessment.strengths.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-success flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Strengths</span>
                  {selectedRoleAssessment.strengths.map((s, i) => (
                    <p key={i} className="text-xs text-muted-foreground pl-4">• {s}</p>
                  ))}
                </div>
              )}
              {selectedRoleAssessment.weaknesses.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-warning flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Areas for Improvement</span>
                  {selectedRoleAssessment.weaknesses.map((w, i) => (
                    <p key={i} className="text-xs text-muted-foreground pl-4">• {w}</p>
                  ))}
                </div>
              )}
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Recommendation:</span> {selectedRoleAssessment.recommendation}</p>
              </div>
            </div>

            {/* User Membership */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">User Membership</span>
                <Badge variant="outline" className="text-xs">{selectedRole.users} total</Badge>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Risk Score</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedRoleUsers.map((user, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-muted-foreground">{user.department}</TableCell>
                        <TableCell className="text-muted-foreground">{user.lastLogin}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={user.riskScore >= 40 ? 'destructive' : user.riskScore >= 25 ? 'outline' : 'secondary'} className="text-xs">
                            {user.riskScore}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'Active' ? 'secondary' : user.status === 'Review' ? 'outline' : 'destructive'} className="text-xs">
                            {user.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {selectedRole.users > selectedRoleUsers.length && (
                <p className="text-xs text-muted-foreground text-center">Showing {selectedRoleUsers.length} of {selectedRole.users} members</p>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground pt-2">
              <Layers className="h-3.5 w-3.5" />
              Entitlements ({selectedRole.entitlements})
            </div>
          </div>
        )}
      </AccessAnalysisDrilldownDrawer>

      {/* Entitlement Drill-down Drawer */}
      <AccessAnalysisDrilldownDrawer
        open={!!selectedEntitlement}
        onOpenChange={(open) => !open && setSelectedEntitlement(null)}
        title={selectedEntitlement || ''}
        description={selectedEntitlementInfo ? `${selectedEntitlementInfo.count} identities · ${selectedEntitlementInfo.risk} risk entitlement` : ''}
        metric={selectedEntitlementInfo ? { value: selectedEntitlementInfo.count } : undefined}
        columns={[
          { key: 'identity', label: 'Identity' },
          { key: 'department', label: 'Department' },
          { key: 'role', label: 'Discovered Role' },
          { key: 'riskScore', label: 'Risk Score', render: (v) => (
            <Badge variant={v >= 40 ? 'destructive' : v >= 25 ? 'outline' : 'secondary'} className="text-xs">{v}</Badge>
          )},
        ]}
        data={selectedEntitlementData}
      >
        {selectedEntitlementInfo && (
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Total Assignments</span>
              <p className="text-xl font-bold">{selectedEntitlementInfo.count}</p>
            </div>
            <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Risk Level</span>
              <div className="pt-1">{getRiskBadge(selectedEntitlementInfo.risk)}</div>
            </div>
            <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Birthright Candidate</span>
              <p className="text-sm font-medium">{selectedEntitlementInfo.count >= 200 ? '✓ Yes — high prevalence' : '✗ No — targeted access'}</p>
            </div>
          </div>
        )}
      </AccessAnalysisDrilldownDrawer>

      {/* Session Detail Drawer */}
      <AccessAnalysisDrilldownDrawer
        open={!!selectedSession}
        onOpenChange={(open) => !open && setSelectedSession(null)}
        title={`Session ${selectedSession?.id || ''}`}
        description={`${selectedSession?.algorithm} · ${selectedSession?.date} · ${selectedSession?.duration} · ${selectedSession?.rolesFound} roles discovered`}
        columns={[
          { key: 'name', label: 'Discovered Role' },
          { key: 'confidence', label: 'Confidence' },
          { key: 'users', label: 'Users' },
          { key: 'entitlements', label: 'Entitlements' },
          { key: 'coverage', label: 'Coverage' },
          { key: 'risk', label: 'Risk' },
        ]}
        data={selectedSession ? getSessionRoles(selectedSession.id) : []}
      />
    </div>
  );
};
