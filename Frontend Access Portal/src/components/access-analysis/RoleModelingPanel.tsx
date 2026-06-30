import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, X, GitCompare, ArrowRight, Layers, Users, Shield, Eye, AlertTriangle, CheckCircle2, FileText, UserCircle } from 'lucide-react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { usePagination, StandardPagination } from '@/components/shared/StandardPagination';
import { AccessAnalysisDrilldownDrawer } from './AccessAnalysisDrilldownDrawer';
import { toast } from 'sonner';

const entitlementCatalog = [
  { id: 'ENT-001', name: 'Financial Reports View', app: 'SAP', risk: 'Low' },
  { id: 'ENT-002', name: 'Budget Approval', app: 'SAP', risk: 'High' },
  { id: 'ENT-003', name: 'HR Records Read', app: 'Workday', risk: 'Medium' },
  { id: 'ENT-004', name: 'Payroll Processing', app: 'Workday', risk: 'High' },
  { id: 'ENT-005', name: 'Code Repository Access', app: 'GitHub', risk: 'Low' },
  { id: 'ENT-006', name: 'CI/CD Pipeline Admin', app: 'Jenkins', risk: 'High' },
  { id: 'ENT-007', name: 'CRM Read', app: 'Salesforce', risk: 'Low' },
  { id: 'ENT-008', name: 'CRM Admin', app: 'Salesforce', risk: 'High' },
  { id: 'ENT-009', name: 'Email Access', app: 'O365', risk: 'Low' },
  { id: 'ENT-010', name: 'SharePoint Admin', app: 'O365', risk: 'Medium' },
  { id: 'ENT-011', name: 'Cloud Infrastructure', app: 'AWS', risk: 'High' },
  { id: 'ENT-012', name: 'Database Read', app: 'Oracle', risk: 'Low' },
];

const sodConflicts: [string, string, string][] = [
  ['ENT-002', 'ENT-004', 'Budget Approval + Payroll Processing violates SOX financial controls'],
  ['ENT-006', 'ENT-011', 'CI/CD Admin + Cloud Infrastructure creates uncontrolled deployment path'],
  ['ENT-008', 'ENT-003', 'CRM Admin + HR Records creates data exposure risk'],
];

const existingRoles = [
  { id: 'R-001', name: 'Finance Analyst', entitlements: 12, users: 45, coverage: 85, complexity: 35, efficiency: 78, risk: 'Low' },
  { id: 'R-002', name: 'HR Manager', entitlements: 9, users: 32, coverage: 92, complexity: 28, efficiency: 88, risk: 'Low' },
  { id: 'R-003', name: 'Engineering Lead', entitlements: 18, users: 28, coverage: 71, complexity: 68, efficiency: 62, risk: 'Medium' },
  { id: 'R-004', name: 'Sales Representative', entitlements: 11, users: 56, coverage: 88, complexity: 32, efficiency: 91, risk: 'Low' },
  { id: 'R-005', name: 'IT Administrator', entitlements: 28, users: 12, coverage: 65, complexity: 82, efficiency: 48, risk: 'High' },
  { id: 'R-006', name: 'Compliance Auditor', entitlements: 16, users: 8, coverage: 94, complexity: 55, efficiency: 75, risk: 'Medium' },
  { id: 'R-007', name: 'Marketing Specialist', entitlements: 14, users: 38, coverage: 79, complexity: 42, efficiency: 70, risk: 'Low' },
  { id: 'R-008', name: 'Operations Manager', entitlements: 21, users: 22, coverage: 74, complexity: 62, efficiency: 58, risk: 'Medium' },
  { id: 'R-009', name: 'Data Analyst', entitlements: 15, users: 18, coverage: 81, complexity: 45, efficiency: 73, risk: 'Low' },
  { id: 'R-010', name: 'Security Engineer', entitlements: 24, users: 6, coverage: 68, complexity: 76, efficiency: 52, risk: 'High' },
];

const roleOwners = ['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Eva Martinez'];

// Generate dynamic comparison entitlements based on selected roles
const allEntitlementNames = [
  'Financial Reports View', 'Budget Approval', 'HR Records Read', 'Payroll Processing',
  'Code Repository Access', 'CI/CD Pipeline Admin', 'CRM Read', 'CRM Admin',
  'Email Access', 'SharePoint Admin', 'Cloud Infrastructure', 'Database Read',
  'VPN Access', 'Directory Read', 'Expense Approval', 'Document Management',
  'Reporting Dashboard', 'Cloud Console', 'Ticket System', 'Audit Logs',
];

const generateComparisonEntitlements = (roleAId: string, roleBId: string) => {
  const roleA = existingRoles.find(r => r.id === roleAId);
  const roleB = existingRoles.find(r => r.id === roleBId);
  if (!roleA || !roleB) return [];

  const countA = Math.min(roleA.entitlements, allEntitlementNames.length);
  const countB = Math.min(roleB.entitlements, allEntitlementNames.length);
  const seedA = parseInt(roleAId.replace('R-', ''));
  const seedB = parseInt(roleBId.replace('R-', ''));

  const entsA = new Set<string>();
  const entsB = new Set<string>();
  for (let i = 0; i < countA; i++) entsA.add(allEntitlementNames[(seedA * 3 + i * 2) % allEntitlementNames.length]);
  for (let i = 0; i < countB; i++) entsB.add(allEntitlementNames[(seedB * 5 + i * 3) % allEntitlementNames.length]);

  const allEnts = new Set([...entsA, ...entsB]);
  return Array.from(allEnts).map(name => ({
    name,
    inA: entsA.has(name),
    inB: entsB.has(name),
    type: entsA.has(name) && entsB.has(name) ? 'shared' as const : entsA.has(name) ? 'unique-a' as const : 'unique-b' as const,
  }));
};

const getRoleDetailData = (role: any) => [
  { entitlement: 'Email Access', application: 'O365', type: 'Core', usageRate: '98%', risk: 'Low' },
  { entitlement: 'VPN Access', application: 'Network', type: 'Core', usageRate: '95%', risk: 'Low' },
  { entitlement: 'Financial Reports View', application: 'SAP', type: 'Functional', usageRate: '92%', risk: 'Low' },
  { entitlement: 'Budget Dashboard', application: 'SAP', type: 'Functional', usageRate: '76%', risk: 'Medium' },
  { entitlement: 'Document Management', application: 'SharePoint', type: 'Core', usageRate: '85%', risk: 'Low' },
  { entitlement: 'Expense Approval', application: 'Concur', type: 'Functional', usageRate: '62%', risk: 'Medium' },
  { entitlement: 'Directory Read', application: 'AD', type: 'Core', usageRate: '100%', risk: 'Low' },
  { entitlement: 'Cloud Console Read', application: 'AWS', type: 'Optional', usageRate: '34%', risk: 'Medium' },
];

const getRiskBadge = (risk: string) => {
  switch (risk) {
    case 'High': return <Badge variant="destructive">{risk}</Badge>;
    case 'Medium': return <Badge className="bg-warning/15 text-warning border-warning/30">{risk}</Badge>;
    default: return <Badge variant="outline">{risk}</Badge>;
  }
};

export const RoleModelingPanel = () => {
  const [search, setSearch] = useState('');
  const [appFilter, setAppFilter] = useState('all');
  const [selectedEntitlements, setSelectedEntitlements] = useState<string[]>(['ENT-001', 'ENT-005', 'ENT-009']);
  const [roleA, setRoleA] = useState('R-001');
  const [roleB, setRoleB] = useState('R-003');
  const [selectedRoleDetail, setSelectedRoleDetail] = useState<any>(null);

  // Role metadata
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [roleOwner, setRoleOwner] = useState('');
  const [roleType, setRoleType] = useState('business');

  const filteredCatalog = entitlementCatalog.filter(e =>
    (appFilter === 'all' || e.app === appFilter) &&
    (e.name.toLowerCase().includes(search.toLowerCase()) || e.app.toLowerCase().includes(search.toLowerCase()))
  );

  const apps = [...new Set(entitlementCatalog.map(e => e.app))];
  const roleAData = existingRoles.find(r => r.id === roleA);
  const roleBData = existingRoles.find(r => r.id === roleB);

  // Dynamic comparison
  const comparisonEntitlements = useMemo(() => generateComparisonEntitlements(roleA, roleB), [roleA, roleB]);
  const sharedCount = comparisonEntitlements.filter(e => e.type === 'shared').length;
  const uniqueACount = comparisonEntitlements.filter(e => e.type === 'unique-a').length;
  const uniqueBCount = comparisonEntitlements.filter(e => e.type === 'unique-b').length;
  const overlapPct = comparisonEntitlements.length > 0 ? Math.round((sharedCount / comparisonEntitlements.length) * 100) : 0;

  const { paginatedData: paginatedRoles, paginationProps: rolesPagination } = usePagination(existingRoles, 6);

  // Real-time risk summary
  const riskSummary = useMemo(() => {
    const selected = entitlementCatalog.filter(e => selectedEntitlements.includes(e.id));
    const highRisk = selected.filter(e => e.risk === 'High').length;
    const medRisk = selected.filter(e => e.risk === 'Medium').length;
    const conflicts = sodConflicts.filter(([a, b]) => selectedEntitlements.includes(a) && selectedEntitlements.includes(b));
    const coverageEstimate = Math.min(100, Math.round(selected.length * 8.5));
    const riskLevel = conflicts.length > 0 ? 'Critical' : highRisk >= 3 ? 'High' : highRisk >= 1 ? 'Medium' : 'Low';
    return { total: selected.length, highRisk, medRisk, conflicts, coverageEstimate, riskLevel };
  }, [selectedEntitlements]);

  // Policy validation checks
  const policyValidation = useMemo(() => {
    const hasOwner = roleOwner !== '';
    const hasDescription = roleDescription.length >= 10;
    const hasName = roleName.length >= 3;
    const highRiskEnts = entitlementCatalog.filter(e => selectedEntitlements.includes(e.id) && e.risk === 'High');
    const conflicts = sodConflicts.filter(([a, b]) => selectedEntitlements.includes(a) && selectedEntitlements.includes(b));

    return [
      {
        label: 'SoD Compliance',
        passed: conflicts.length === 0,
        detail: conflicts.length === 0 ? 'No separation of duty conflicts detected' : `${conflicts.length} SoD conflict${conflicts.length > 1 ? 's' : ''} found — review required`,
        icon: Shield,
      },
      {
        label: 'Least Privilege',
        passed: highRiskEnts.length <= 1,
        detail: highRiskEnts.length <= 1 ? 'Entitlement set follows least privilege principles' : `${highRiskEnts.length} high-risk entitlements — consider removing non-essential ones`,
        icon: AlertTriangle,
      },
      {
        label: 'Peer Alignment',
        passed: selectedEntitlements.length >= 3 && selectedEntitlements.length <= 15,
        detail: selectedEntitlements.length >= 3 && selectedEntitlements.length <= 15 ? '82% aligned with peer roles in similar business functions' : selectedEntitlements.length < 3 ? 'Too few entitlements to assess peer alignment' : 'More entitlements than typical peer roles — consider splitting',
        icon: Users,
      },
      {
        label: 'Certification Readiness',
        passed: hasOwner && hasDescription && hasName,
        detail: !hasName ? 'Role name is required (3+ characters)' : !hasDescription ? 'Description is required (10+ characters)' : !hasOwner ? 'Role owner must be assigned' : 'All metadata complete — ready for certification',
        icon: FileText,
      },
    ];
  }, [selectedEntitlements, roleName, roleDescription, roleOwner]);

  return (
    <div className="space-y-6">
      {/* Role Designer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-1.5">
            <Layers className="h-5 w-5 text-primary" />
            Role Designer
            <InfoTooltip text="Compose a new role by defining metadata and selecting entitlements from the catalog. The risk summary and policy validation update in real-time." />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Role Metadata */}
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1">
                Role Name
                <InfoTooltip text="A descriptive name for the role. Should clearly convey the business function it represents." />
              </label>
              <Input placeholder="e.g. Finance Analyst" value={roleName} onChange={e => setRoleName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1">
                Role Type
                <InfoTooltip text="Business roles map to job functions. Technical roles map to system-level access. Composite roles combine multiple sub-roles." />
              </label>
              <Select value={roleType} onValueChange={setRoleType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">Business Role</SelectItem>
                  <SelectItem value="technical">Technical Role</SelectItem>
                  <SelectItem value="composite">Composite Role</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1">
                Owner
                <InfoTooltip text="The person accountable for this role's entitlements and periodic certification reviews." />
              </label>
              <Select value={roleOwner} onValueChange={setRoleOwner}>
                <SelectTrigger><SelectValue placeholder="Select owner" /></SelectTrigger>
                <SelectContent>
                  {roleOwners.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea placeholder="Describe the role's purpose..." value={roleDescription} onChange={e => setRoleDescription(e.target.value)} className="h-[36px] min-h-[36px] resize-none" />
            </div>
          </div>

          {/* Real-time risk summary strip */}
          {selectedEntitlements.length > 0 && (
            <div className="p-3 rounded-lg bg-muted/50 border flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{riskSummary.total}</span>
                <span className="text-muted-foreground">entitlements</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-destructive" />
                <span className="font-medium">{riskSummary.highRisk}</span>
                <span className="text-muted-foreground">high-risk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Coverage est:</span>
                <span className="font-medium">{riskSummary.coverageEstimate}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Risk Level:</span>
                {getRiskBadge(riskSummary.riskLevel)}
              </div>
              {riskSummary.conflicts.length > 0 && (
                <div className="flex items-center gap-1.5 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">{riskSummary.conflicts.length} SoD conflict{riskSummary.conflicts.length > 1 ? 's' : ''}</span>
                </div>
              )}
              {riskSummary.conflicts.length === 0 && (
                <div className="flex items-center gap-1.5 text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">No SoD conflicts</span>
                </div>
              )}
            </div>
          )}

          {/* SoD conflict details */}
          {riskSummary.conflicts.length > 0 && (
            <div className="space-y-2">
              {riskSummary.conflicts.map(([a, b, desc], i) => (
                <div key={i} className="p-2 rounded-md bg-destructive/10 border border-destructive/20 text-sm flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            {/* Left: Entitlement Catalog */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-1">
                Entitlement Catalog
                <InfoTooltip text="Browse and search available entitlements. Click to add or remove from the role composition. Filter by application to narrow results." />
              </h4>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search entitlements..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
                </div>
                <Select value={appFilter} onValueChange={setAppFilter}>
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Apps</SelectItem>
                    {apps.map(app => <SelectItem key={app} value={app}>{app}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <ScrollArea className="h-[280px] border rounded-lg">
                <div className="p-2 space-y-1">
                  {filteredCatalog.map(ent => {
                    const isSelected = selectedEntitlements.includes(ent.id);
                    return (
                      <div key={ent.id} className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/50'}`}
                        onClick={() => {
                          if (isSelected) setSelectedEntitlements(prev => prev.filter(id => id !== ent.id));
                          else setSelectedEntitlements(prev => [...prev, ent.id]);
                        }}>
                        <div>
                          <p className="text-sm font-medium">{ent.name}</p>
                          <p className="text-xs text-muted-foreground">{ent.app}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getRiskBadge(ent.risk)}
                          {isSelected ? <X className="h-4 w-4 text-muted-foreground" /> : <Plus className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Right: Role Composition */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Role Composition</h4>
                <Badge variant="outline">{selectedEntitlements.length} entitlements</Badge>
              </div>
              <ScrollArea className="h-[340px] border rounded-lg">
                <div className="p-2 space-y-1">
                  {selectedEntitlements.map(id => {
                    const ent = entitlementCatalog.find(e => e.id === id);
                    if (!ent) return null;
                    return (
                      <div key={id} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                        <div>
                          <p className="text-sm font-medium">{ent.name}</p>
                          <p className="text-xs text-muted-foreground">{ent.app}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedEntitlements(prev => prev.filter(i => i !== id))}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                  {selectedEntitlements.length === 0 && (
                    <div className="text-center py-12 text-sm text-muted-foreground">
                      Select entitlements from the catalog to compose a role
                    </div>
                  )}
                </div>
              </ScrollArea>
              <Button className="w-full" disabled={selectedEntitlements.length === 0} onClick={() => toast.success('Role draft saved successfully')}>
                Save Role Draft
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policy Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-1.5">
            <Shield className="h-5 w-5 text-primary" />
            Policy Validation
            <InfoTooltip text="Real-time validation of the role being designed against governance policies. All checks must pass before the role can be submitted for approval." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {policyValidation.map((check) => (
              <div key={check.label} className={`p-3 rounded-lg border flex items-start gap-3 ${check.passed ? 'bg-success/5 border-success/20' : 'bg-warning/5 border-warning/20'}`}>
                <div className={`mt-0.5 ${check.passed ? 'text-success' : 'text-warning'}`}>
                  {check.passed ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{check.label}</p>
                  <p className="text-xs text-muted-foreground">{check.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-1.5">
            <GitCompare className="h-5 w-5 text-primary" />
            Role Comparison
            <InfoTooltip text="Compare two existing roles side-by-side to identify entitlement overlap and uniqueness. Select different roles to dynamically update the comparison." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4 mb-4">
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                Role A
                <InfoTooltip text="First role in the comparison. Its unique entitlements will be highlighted in blue." />
              </label>
              <Select value={roleA} onValueChange={setRoleA}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {existingRoles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {roleAData && (
                <div className="p-3 rounded-lg bg-muted/30 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Users</span><span className="font-medium">{roleAData.users}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Entitlements</span><span className="font-medium">{roleAData.entitlements}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Risk</span>{getRiskBadge(roleAData.risk)}</div>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
              <div className="text-center">
                <p className="text-2xl font-bold">{overlapPct}%</p>
                <p className="text-xs text-muted-foreground">Overlap</p>
              </div>
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                Role B
                <InfoTooltip text="Second role in the comparison. Its unique entitlements will be highlighted in green." />
              </label>
              <Select value={roleB} onValueChange={setRoleB}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {existingRoles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {roleBData && (
                <div className="p-3 rounded-lg bg-muted/30 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Users</span><span className="font-medium">{roleBData.users}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Entitlements</span><span className="font-medium">{roleBData.entitlements}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Risk</span>{getRiskBadge(roleBData.risk)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Comparison summary */}
          <div className="flex items-center gap-4 mb-4 text-sm">
            <Badge className="bg-primary/10 text-primary">{sharedCount} shared</Badge>
            <Badge variant="outline">{uniqueACount} unique to {roleAData?.name}</Badge>
            <Badge variant="outline">{uniqueBCount} unique to {roleBData?.name}</Badge>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="flex items-center gap-1">Entitlement <InfoTooltip text="Entitlement name showing membership in each role." /></TableHead>
                  <TableHead className="text-center">{roleAData?.name || 'Role A'}</TableHead>
                  <TableHead className="text-center">{roleBData?.name || 'Role B'}</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonEntitlements.map(ent => (
                  <TableRow key={ent.name}>
                    <TableCell className="font-medium">{ent.name}</TableCell>
                    <TableCell className="text-center">{ent.inA ? <Badge variant="outline" className="text-success">✓</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-center">{ent.inB ? <Badge variant="outline" className="text-success">✓</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>
                      <Badge variant={ent.type === 'shared' ? 'secondary' : 'outline'} className={
                        ent.type === 'shared' ? 'bg-primary/10 text-primary' :
                          ent.type === 'unique-a' ? 'bg-chart-1/10 text-chart-1' : 'bg-chart-3/10 text-chart-3'
                      }>
                        {ent.type === 'shared' ? 'Shared' : ent.type === 'unique-a' ? `Only ${roleAData?.name}` : `Only ${roleBData?.name}`}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Existing Role Models */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-1.5">
            Existing Role Models
            <Badge variant="outline">{existingRoles.length} roles</Badge>
            <InfoTooltip text="Current role inventory with quality metrics. Click any role to view detailed entitlements, users, and optimization recommendations." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>

                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      Entitlements
                      <InfoTooltip text="Number of distinct entitlements assigned to this role." />
                    </div>
                  </TableHead>

                  <TableHead className="text-right">Users</TableHead>

                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      Coverage
                      <InfoTooltip text="Percentage of users' access that this role covers." />
                    </div>
                  </TableHead>

                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      Efficiency
                      <InfoTooltip text="How well the role's entitlements are utilized by its members. Higher is better." />
                    </div>
                  </TableHead>

                  <TableHead>Risk</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRoles.map(role => (
                  <TableRow key={role.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedRoleDetail(role)}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell className="text-right">{role.entitlements}</TableCell>
                    <TableCell className="text-right">{role.users}</TableCell>
                    <TableCell className="text-right">{role.coverage}%</TableCell>
                    <TableCell className="text-right">{role.efficiency}%</TableCell>
                    <TableCell>{getRiskBadge(role.risk)}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <StandardPagination {...rolesPagination} pageSizeOptions={[6, 10, 20]} />
        </CardContent>
      </Card>

      {/* Role detail drawer */}
      <AccessAnalysisDrilldownDrawer
        open={!!selectedRoleDetail}
        onOpenChange={(open) => !open && setSelectedRoleDetail(null)}
        title={selectedRoleDetail?.name || ''}
        description={`${selectedRoleDetail?.users} users · ${selectedRoleDetail?.entitlements} entitlements · Coverage: ${selectedRoleDetail?.coverage}% · Efficiency: ${selectedRoleDetail?.efficiency}%`}
        columns={[
          { key: 'entitlement', label: 'Entitlement' },
          { key: 'application', label: 'Application' },
          { key: 'type', label: 'Type' },
          { key: 'usageRate', label: 'Usage Rate' },
          { key: 'risk', label: 'Risk' },
        ]}
        data={selectedRoleDetail ? getRoleDetailData(selectedRoleDetail) : []}
      />
    </div>
  );
};
