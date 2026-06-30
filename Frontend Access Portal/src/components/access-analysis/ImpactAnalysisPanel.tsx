import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCssVariable } from '@/hooks/useCssVariable';
import { usePagination, StandardPagination } from '@/components/shared/StandardPagination';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { Play, Loader2, ArrowRight, TrendingDown, TrendingUp, Clock, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const scenarioTypes = [
  { value: 'adopt-role', label: 'Adopt Discovered Role', description: 'Simulates assigning a discovered role candidate to matching users, replacing their direct entitlements with role-based access.' },
  { value: 'merge-roles', label: 'Merge Existing Roles', description: 'Simulates combining two overlapping roles into one unified role, consolidating shared entitlements and user memberships.' },
  { value: 'remove-entitlements', label: 'Remove Unused Entitlements', description: 'Simulates revoking entitlements that have not been used within the specified time period, reducing access sprawl.' },
  { value: 'create-role', label: 'Create New Role', description: 'Simulates creating a new role from scratch and assigning it to users who currently have matching direct access.' },
];

const targetRoles: Record<string, { value: string; label: string }[]> = {
  'adopt-role': [
    { value: 'finance-analyst', label: 'Finance Analyst Standard' },
    { value: 'eng-developer', label: 'Engineering Developer' },
    { value: 'hr-ops', label: 'HR Operations' },
    { value: 'it-admin', label: 'IT Infrastructure Admin' },
  ],
  'merge-roles': [
    { value: 'it-security', label: 'IT Admin + Security Eng' },
    { value: 'eng-it', label: 'Eng Lead + IT Admin' },
    { value: 'sales-marketing', label: 'Sales Rep + Marketing' },
  ],
  'remove-entitlements': [
    { value: 'unused-90', label: 'Unused >90 days' },
    { value: 'unused-180', label: 'Unused >180 days' },
    { value: 'low-usage', label: 'Usage <10%' },
  ],
  'create-role': [
    { value: 'revenue-ops', label: 'Revenue Operations' },
    { value: 'analytics-eng', label: 'Analytics Engineer' },
    { value: 'infra-security', label: 'Infrastructure Security' },
  ],
};

const scenarioMetrics: Record<string, { metric: string; before: number; after: number; unit: string }[]> = {
  'adopt-role': [
    { metric: 'Role Coverage', before: 62, after: 78, unit: '%' },
    { metric: 'Direct Access', before: 24, after: 12, unit: '%' },
    { metric: 'Avg Entitlements/User', before: 18, after: 14, unit: '' },
    { metric: 'SoD Violations', before: 12, after: 8, unit: '' },
    { metric: 'Redundant Roles', before: 8, after: 3, unit: '' },
    { metric: 'Governance Score', before: 68, after: 82, unit: '' },
  ],
  'merge-roles': [
    { metric: 'Role Coverage', before: 62, after: 70, unit: '%' },
    { metric: 'Total Roles', before: 60, after: 54, unit: '' },
    { metric: 'Redundant Entitlements', before: 142, after: 98, unit: '' },
    { metric: 'SoD Violations', before: 12, after: 10, unit: '' },
    { metric: 'Role Complexity Avg', before: 52, after: 44, unit: '%' },
    { metric: 'Governance Score', before: 68, after: 75, unit: '' },
  ],
  'remove-entitlements': [
    { metric: 'Total Entitlements', before: 5520, after: 4830, unit: '' },
    { metric: 'Direct Access', before: 24, after: 18, unit: '%' },
    { metric: 'Unused Access', before: 340, after: 45, unit: '' },
    { metric: 'SoD Violations', before: 12, after: 9, unit: '' },
    { metric: 'Risk Score Avg', before: 58, after: 48, unit: '' },
    { metric: 'Governance Score', before: 68, after: 79, unit: '' },
  ],
  'create-role': [
    { metric: 'Role Coverage', before: 62, after: 72, unit: '%' },
    { metric: 'Direct Access', before: 24, after: 16, unit: '%' },
    { metric: 'Total Roles', before: 60, after: 61, unit: '' },
    { metric: 'Affected Users', before: 0, after: 45, unit: '' },
    { metric: 'SoD Violations', before: 12, after: 11, unit: '' },
    { metric: 'Governance Score', before: 68, after: 74, unit: '' },
  ],
};

const scenarioSummaries: Record<string, string> = {
  'adopt-role': 'Adopting the discovered role would affect 45 users, increasing role coverage by 16% and resolving 4 SoD violations.',
  'merge-roles': 'Merging the selected roles would reduce the total role count by 6, eliminating 44 redundant entitlements across 40 users.',
  'remove-entitlements': 'Removing unused entitlements would reduce total access by 690 grants, lowering the average risk score by 10 points.',
  'create-role': 'Creating the new role would bring 45 users under role-based governance, reducing direct access exposure by 8%.',
};

// Scenario-reactive affected users
const scenarioAffectedUsers: Record<string, any[]> = {
  'adopt-role': [
    { id: 'USR-001', name: 'John Smith', dept: 'Finance', gained: 2, lost: 5, netChange: -3, violations: 'Resolved 1' },
    { id: 'USR-004', name: 'Lisa Wong', dept: 'Finance', gained: 1, lost: 4, netChange: -3, violations: 'Resolved 1' },
    { id: 'USR-012', name: 'Karen White', dept: 'Finance', gained: 1, lost: 4, netChange: -3, violations: 'None' },
    { id: 'USR-002', name: 'Sarah Johnson', dept: 'Finance', gained: 0, lost: 3, netChange: -3, violations: 'None' },
    { id: 'USR-006', name: 'Emily Davis', dept: 'Finance', gained: 1, lost: 2, netChange: -1, violations: 'None' },
    { id: 'USR-009', name: 'James Martinez', dept: 'Finance', gained: 0, lost: 6, netChange: -6, violations: 'Resolved 2' },
    { id: 'USR-013', name: 'Nancy Clark', dept: 'Finance', gained: 2, lost: 3, netChange: -1, violations: 'None' },
    { id: 'USR-014', name: 'Peter Hall', dept: 'Accounting', gained: 1, lost: 5, netChange: -4, violations: 'Resolved 1' },
  ],
  'merge-roles': [
    { id: 'USR-005', name: 'David Brown', dept: 'IT', gained: 4, lost: 12, netChange: -8, violations: 'Resolved 2' },
    { id: 'USR-011', name: 'Thomas Lee', dept: 'IT', gained: 3, lost: 10, netChange: -7, violations: 'Resolved 1' },
    { id: 'USR-007', name: 'Robert Taylor', dept: 'Engineering', gained: 2, lost: 6, netChange: -4, violations: 'None' },
    { id: 'USR-015', name: 'Chris Evans', dept: 'Security', gained: 5, lost: 8, netChange: -3, violations: 'None' },
    { id: 'USR-016', name: 'Diana Prince', dept: 'IT', gained: 3, lost: 9, netChange: -6, violations: 'Resolved 1' },
    { id: 'USR-017', name: 'Bruce Wayne', dept: 'Security', gained: 2, lost: 7, netChange: -5, violations: 'None' },
  ],
  'remove-entitlements': [
    { id: 'USR-002', name: 'Sarah Johnson', dept: 'Engineering', gained: 0, lost: 8, netChange: -8, violations: 'None' },
    { id: 'USR-003', name: 'Mike Chen', dept: 'HR', gained: 0, lost: 3, netChange: -3, violations: 'None' },
    { id: 'USR-005', name: 'David Brown', dept: 'IT', gained: 0, lost: 14, netChange: -14, violations: 'Resolved 1' },
    { id: 'USR-006', name: 'Emily Davis', dept: 'Marketing', gained: 0, lost: 2, netChange: -2, violations: 'None' },
    { id: 'USR-008', name: 'Amanda Wilson', dept: 'Legal', gained: 0, lost: 1, netChange: -1, violations: 'None' },
    { id: 'USR-010', name: 'Jessica Anderson', dept: 'Operations', gained: 0, lost: 5, netChange: -5, violations: 'None' },
    { id: 'USR-018', name: 'Laura Kim', dept: 'Sales', gained: 0, lost: 4, netChange: -4, violations: 'None' },
    { id: 'USR-019', name: 'Mark Johnson', dept: 'Engineering', gained: 0, lost: 6, netChange: -6, violations: 'None' },
    { id: 'USR-020', name: 'Rachel Green', dept: 'HR', gained: 0, lost: 2, netChange: -2, violations: 'None' },
  ],
  'create-role': [
    { id: 'USR-001', name: 'John Smith', dept: 'Finance', gained: 3, lost: 1, netChange: 2, violations: 'None' },
    { id: 'USR-009', name: 'James Martinez', dept: 'Sales', gained: 4, lost: 0, netChange: 4, violations: 'None' },
    { id: 'USR-006', name: 'Emily Davis', dept: 'Marketing', gained: 3, lost: 0, netChange: 3, violations: 'Introduced 1' },
    { id: 'USR-004', name: 'Lisa Wong', dept: 'Finance', gained: 2, lost: 0, netChange: 2, violations: 'None' },
    { id: 'USR-021', name: 'Tony Stark', dept: 'Sales', gained: 4, lost: 1, netChange: 3, violations: 'None' },
    { id: 'USR-022', name: 'Natasha Romanoff', dept: 'Marketing', gained: 3, lost: 0, netChange: 3, violations: 'None' },
    { id: 'USR-023', name: 'Steve Rogers', dept: 'Operations', gained: 2, lost: 0, netChange: 2, violations: 'None' },
  ],
};

// Scenario-reactive rollout steps
const scenarioRolloutSteps: Record<string, { step: number; title: string; duration: string; status: string }[]> = {
  'adopt-role': [
    { step: 1, title: 'Review discovered role entitlements and validate coverage', duration: '2 days', status: 'completed' },
    { step: 2, title: 'Obtain role owner and business unit approval', duration: '3 days', status: 'in-progress' },
    { step: 3, title: 'Deploy role to Finance department pilot group (10 users)', duration: '5 days', status: 'pending' },
    { step: 4, title: 'Monitor access patterns and validate no disruption', duration: '7 days', status: 'pending' },
    { step: 5, title: 'Full rollout to all 45 matching users', duration: '3 days', status: 'pending' },
    { step: 6, title: 'Post-adoption review and certification scheduling', duration: '2 days', status: 'pending' },
  ],
  'merge-roles': [
    { step: 1, title: 'Validate shared entitlements and resolve conflicts', duration: '3 days', status: 'completed' },
    { step: 2, title: 'Obtain approval from both role owners', duration: '4 days', status: 'in-progress' },
    { step: 3, title: 'Deploy merged role to IT pilot group (6 users)', duration: '5 days', status: 'pending' },
    { step: 4, title: 'Monitor for access disruptions and SoD issues', duration: '7 days', status: 'pending' },
    { step: 5, title: 'Migrate remaining users and deprecate source roles', duration: '5 days', status: 'pending' },
    { step: 6, title: 'Cleanup orphaned entitlements and update documentation', duration: '2 days', status: 'pending' },
  ],
  'remove-entitlements': [
    { step: 1, title: 'Generate detailed usage report for targeted entitlements', duration: '1 day', status: 'completed' },
    { step: 2, title: 'Notify affected users and managers of planned revocation', duration: '5 days', status: 'in-progress' },
    { step: 3, title: 'Execute revocation in staging environment', duration: '2 days', status: 'pending' },
    { step: 4, title: 'Monitor for access requests and exceptions', duration: '14 days', status: 'pending' },
    { step: 5, title: 'Execute production revocation in batches', duration: '5 days', status: 'pending' },
    { step: 6, title: 'Post-cleanup audit and compliance report', duration: '2 days', status: 'pending' },
  ],
  'create-role': [
    { step: 1, title: 'Finalize role definition with entitlements and metadata', duration: '2 days', status: 'completed' },
    { step: 2, title: 'SoD validation and policy compliance review', duration: '3 days', status: 'in-progress' },
    { step: 3, title: 'Create role in IAM system and assign to pilot group', duration: '3 days', status: 'pending' },
    { step: 4, title: 'Validate access provisioning and test user workflows', duration: '5 days', status: 'pending' },
    { step: 5, title: 'Assign to all target users and update access policies', duration: '4 days', status: 'pending' },
    { step: 6, title: 'Schedule first certification cycle and assign reviewer', duration: '2 days', status: 'pending' },
  ],
};

export const ImpactAnalysisPanel = () => {
  const chart1 = useCssVariable('--chart-1');
  const chart3 = useCssVariable('--chart-3');
  const [scenarioType, setScenarioType] = useState('adopt-role');
  const [targetRole, setTargetRole] = useState('finance-analyst');
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  const currentMetrics = useMemo(() => scenarioMetrics[scenarioType] || scenarioMetrics['adopt-role'], [scenarioType]);
  const chartData = useMemo(() => currentMetrics.map(m => ({ name: m.metric, Before: m.before, After: m.after })), [currentMetrics]);
  const currentTargets = targetRoles[scenarioType] || targetRoles['adopt-role'];
  const currentDescription = scenarioTypes.find(s => s.value === scenarioType)?.description || '';
  const currentUsers = useMemo(() => scenarioAffectedUsers[scenarioType] || [], [scenarioType]);
  const currentRollout = useMemo(() => scenarioRolloutSteps[scenarioType] || [], [scenarioType]);
  const totalDuration = useMemo(() => {
    const days = currentRollout.reduce((sum, s) => sum + parseInt(s.duration), 0);
    return `${days} days`;
  }, [currentRollout]);

  const { paginatedData, paginationProps } = usePagination(currentUsers, 6);

  const handleSimulate = () => {
    setIsSimulating(true);
    toast.info('Running impact simulation...');
    setTimeout(() => {
      setIsSimulating(false);
      setHasResults(true);
      toast.success('Simulation complete — review results below');
    }, 2500);
  };

  const handleScenarioChange = (v: string) => {
    setScenarioType(v);
    setTargetRole(targetRoles[v]?.[0]?.value || '');
    setHasResults(false);
  };

  return (
    <div className="space-y-6">
      {/* Scenario Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-1.5">
            Scenario Builder
            <InfoTooltip text="Configure a what-if scenario to simulate the impact of proposed role changes before applying them. Each scenario type models a different governance action." />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                Change Type
                <InfoTooltip text="The type of governance action to simulate. Each type affects different metrics and produces different impact patterns." />
              </label>
              <Select value={scenarioType} onValueChange={handleScenarioChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {scenarioTypes.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                Target
                <InfoTooltip text="The specific role, entitlement set, or configuration to apply the simulation against." />
              </label>
              <Select value={targetRole} onValueChange={setTargetRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {currentTargets.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleSimulate} disabled={isSimulating} className="w-full">
                {isSimulating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Simulating...</> : <><Play className="h-4 w-4 mr-2" />Run Simulation</>}
              </Button>
            </div>
          </div>
          {/* Scenario description */}
          <div className="p-3 rounded-lg bg-muted/30 border text-sm text-muted-foreground">
            {currentDescription}
          </div>
        </CardContent>
      </Card>

      {hasResults && (
        <>
          {/* Summary */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm font-medium">{scenarioSummaries[scenarioType]}</p>
          </div>

          {/* Before/After */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-1.5">
                  Before vs After Metrics
                  <InfoTooltip text="Side-by-side comparison of key governance metrics. Green indicates improvement, red indicates degradation after the proposed change." />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentMetrics.map(m => {
                    const lowerIsBetter = ['Direct Access', 'SoD Violations', 'Redundant Roles', 'Avg Entitlements/User', 'Redundant Entitlements', 'Total Entitlements', 'Unused Access', 'Risk Score Avg', 'Role Complexity Avg'].includes(m.metric);
                    const improved = lowerIsBetter ? m.after < m.before : m.after > m.before;
                    const change = m.after - m.before;
                    return (
                      <div key={m.metric} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <span className="text-sm font-medium">{m.metric}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">{m.before}{m.unit}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-bold">{m.after}{m.unit}</span>
                          <span className={`text-xs font-medium flex items-center gap-0.5 ${improved ? 'text-success' : 'text-destructive'}`}>
                            {improved ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                            {change > 0 ? '+' : ''}{change}{m.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-1.5">
                  Metric Comparison Chart
                  <InfoTooltip text="Visual comparison of before and after values for each governance metric in the simulation." />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} className="text-muted-foreground" />
                      <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="Before" fill={`hsl(${chart1} / 0.5)`} radius={[2, 2, 0, 0]} />
                      <Bar dataKey="After" fill={`hsl(${chart3})`} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Affected Entities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-1.5">
                Affected Entities
                <Badge variant="outline">{currentUsers.length} users</Badge>
                <InfoTooltip text="All users impacted by the proposed change, showing entitlements gained and lost. Violation status shows whether policy violations are resolved or introduced." />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="flex items-center gap-1">User <InfoTooltip text="Identity affected by the proposed change." /></TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Gained</TableHead>
                      <TableHead className="text-right">Lost</TableHead>
                      <TableHead className="text-right flex items-center gap-1 justify-end">Net Change <InfoTooltip text="Net entitlement change. Negative values indicate access reduction (generally positive for governance)." /></TableHead>
                      <TableHead>Violations</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.dept}</TableCell>
                        <TableCell className="text-right text-success">+{user.gained}</TableCell>
                        <TableCell className="text-right text-destructive">-{user.lost}</TableCell>
                        <TableCell className="text-right font-medium">{user.netChange}</TableCell>
                        <TableCell>
                          {user.violations.startsWith('Resolved') ? (
                            <Badge variant="outline" className="text-success"><CheckCircle2 className="h-3 w-3 mr-1" />{user.violations}</Badge>
                          ) : user.violations.startsWith('Introduced') ? (
                            <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />{user.violations}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <StandardPagination {...paginationProps} pageSizeOptions={[6, 12, 20]} />
            </CardContent>
          </Card>

          {/* Implementation Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-1.5">
                Implementation Plan
                <Badge variant="outline">{totalDuration} total</Badge>
                <InfoTooltip text="Recommended step-by-step rollout timeline for the proposed change. Steps are tailored to the selected scenario type." />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-4">
                  {currentRollout.map(step => (
                    <div key={step.step} className="flex items-start gap-4 ml-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 text-xs font-bold ${
                        step.status === 'completed' ? 'bg-success text-success-foreground' :
                        step.status === 'in-progress' ? 'bg-primary text-primary-foreground' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {step.step}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{step.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />{step.duration}
                            </span>
                            <Badge variant={step.status === 'completed' ? 'outline' : step.status === 'in-progress' ? 'default' : 'secondary'} className="text-xs">
                              {step.status === 'completed' ? 'Done' : step.status === 'in-progress' ? 'In Progress' : 'Pending'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
