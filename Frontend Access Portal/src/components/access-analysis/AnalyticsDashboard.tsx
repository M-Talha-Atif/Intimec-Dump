import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, ReferenceLine } from 'recharts';
import { useCssVariable } from '@/hooks/useCssVariable';
import { usePagination, StandardPagination } from '@/components/shared/StandardPagination';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { ArrowUpRight } from 'lucide-react';
import { AccessAnalysisDrilldownDrawer, DrilldownColumn } from './AccessAnalysisDrilldownDrawer';

const coverageData = [
  { name: 'Role-Based', value: 62 },
  { name: 'Direct Access', value: 24 },
  { name: 'Hybrid', value: 14 },
];

const sprawlByDept = [
  { dept: 'Finance', avg: 18, threshold: 12 },
  { dept: 'Engineering', avg: 24, threshold: 12 },
  { dept: 'HR', avg: 9, threshold: 12 },
  { dept: 'Marketing', avg: 14, threshold: 12 },
  { dept: 'Sales', avg: 11, threshold: 12 },
  { dept: 'Legal', avg: 7, threshold: 12 },
  { dept: 'Operations', avg: 16, threshold: 12 },
];

const roleQuality = [
  { role: 'Finance Analyst', coverage: 85, complexity: 45, efficiency: 78 },
  { role: 'HR Manager', coverage: 92, complexity: 32, efficiency: 88 },
  { role: 'Dev Lead', coverage: 71, complexity: 68, efficiency: 62 },
  { role: 'Sales Rep', coverage: 88, complexity: 28, efficiency: 91 },
  { role: 'IT Admin', coverage: 65, complexity: 82, efficiency: 48 },
  { role: 'Compliance Officer', coverage: 94, complexity: 55, efficiency: 75 },
];

const accessGrowth = [
  { month: 'Apr', entitlements: 4200, roles: 42, directAccess: 1100 },
  { month: 'May', entitlements: 4350, roles: 44, directAccess: 1080 },
  { month: 'Jun', entitlements: 4500, roles: 45, directAccess: 1150 },
  { month: 'Jul', entitlements: 4420, roles: 47, directAccess: 1020 },
  { month: 'Aug', entitlements: 4600, roles: 48, directAccess: 980 },
  { month: 'Sep', entitlements: 4750, roles: 50, directAccess: 960 },
  { month: 'Oct', entitlements: 4680, roles: 51, directAccess: 920 },
  { month: 'Nov', entitlements: 4900, roles: 53, directAccess: 890 },
  { month: 'Dec', entitlements: 5100, roles: 55, directAccess: 870 },
  { month: 'Jan', entitlements: 5250, roles: 56, directAccess: 850 },
  { month: 'Feb', entitlements: 5400, roles: 58, directAccess: 830 },
  { month: 'Mar', entitlements: 5520, roles: 60, directAccess: 810 },
];

const identityInsights = [
  { id: 'USR-001', name: 'John Smith', department: 'Finance', entitlements: 34, roleBased: 62, directAccess: 13, riskScore: 78, lastReview: '2025-12-15' },
  { id: 'USR-002', name: 'Sarah Johnson', department: 'Engineering', entitlements: 42, roleBased: 48, directAccess: 22, riskScore: 85, lastReview: '2025-11-20' },
  { id: 'USR-003', name: 'Mike Chen', department: 'HR', entitlements: 18, roleBased: 89, directAccess: 2, riskScore: 32, lastReview: '2026-01-10' },
  { id: 'USR-004', name: 'Lisa Wong', department: 'Finance', entitlements: 28, roleBased: 54, directAccess: 13, riskScore: 71, lastReview: '2025-10-05' },
  { id: 'USR-005', name: 'David Brown', department: 'IT', entitlements: 56, roleBased: 38, directAccess: 35, riskScore: 92, lastReview: '2025-09-22' },
  { id: 'USR-006', name: 'Emily Davis', department: 'Marketing', entitlements: 22, roleBased: 73, directAccess: 6, riskScore: 45, lastReview: '2026-02-01' },
  { id: 'USR-007', name: 'Robert Taylor', department: 'Engineering', entitlements: 38, roleBased: 55, directAccess: 17, riskScore: 68, lastReview: '2025-12-08' },
  { id: 'USR-008', name: 'Amanda Wilson', department: 'Legal', entitlements: 15, roleBased: 93, directAccess: 1, riskScore: 28, lastReview: '2026-01-25' },
  { id: 'USR-009', name: 'James Martinez', department: 'Sales', entitlements: 20, roleBased: 80, directAccess: 4, riskScore: 38, lastReview: '2026-02-15' },
  { id: 'USR-010', name: 'Jessica Anderson', department: 'Operations', entitlements: 31, roleBased: 58, directAccess: 13, riskScore: 64, lastReview: '2025-11-30' },
  { id: 'USR-011', name: 'Thomas Lee', department: 'IT', entitlements: 48, roleBased: 42, directAccess: 28, riskScore: 88, lastReview: '2025-10-18' },
  { id: 'USR-012', name: 'Karen White', department: 'Finance', entitlements: 25, roleBased: 68, directAccess: 8, riskScore: 52, lastReview: '2026-01-05' },
  { id: 'USR-013', name: 'Christopher Harris', department: 'Engineering', entitlements: 44, roleBased: 50, directAccess: 22, riskScore: 76, lastReview: '2025-12-22' },
  { id: 'USR-014', name: 'Michelle Clark', department: 'HR', entitlements: 16, roleBased: 88, directAccess: 2, riskScore: 30, lastReview: '2026-02-10' },
  { id: 'USR-015', name: 'Daniel Robinson', department: 'Sales', entitlements: 19, roleBased: 84, directAccess: 3, riskScore: 35, lastReview: '2026-01-18' },
];

// Enriched identity drill-down data
const getIdentityEntitlements = (name: string) => [
  { entitlement: 'Email Access', application: 'O365', type: 'Role-Based', risk: 'Low', lastUsed: '2026-03-07' },
  { entitlement: 'Financial Reports View', application: 'SAP', type: 'Role-Based', risk: 'Low', lastUsed: '2026-03-06' },
  { entitlement: 'Budget Approval', application: 'SAP', type: 'Direct', risk: 'High', lastUsed: '2026-02-28' },
  { entitlement: 'CRM Read', application: 'Salesforce', type: 'Role-Based', risk: 'Low', lastUsed: '2026-03-05' },
  { entitlement: 'VPN Access', application: 'Network', type: 'Role-Based', risk: 'Low', lastUsed: '2026-03-07' },
  { entitlement: 'SharePoint Admin', application: 'O365', type: 'Direct', risk: 'Medium', lastUsed: '2026-01-15' },
  { entitlement: 'Cloud Console', application: 'AWS', type: 'Direct', risk: 'High', lastUsed: '2025-12-20' },
  { entitlement: 'Database Read', application: 'Oracle', type: 'Role-Based', risk: 'Low', lastUsed: '2026-03-04' },
];

// Coverage type drill-down identities
const coverageDrilldownData: Record<string, any[]> = {
  'Role-Based': identityInsights.filter(i => i.roleBased >= 70).map(i => ({ ...i, accessType: 'Role-Based' })),
  'Direct Access': identityInsights.filter(i => i.directAccess >= 15).map(i => ({ ...i, accessType: 'Direct' })),
  'Hybrid': identityInsights.filter(i => i.roleBased >= 40 && i.roleBased < 70).map(i => ({ ...i, accessType: 'Hybrid' })),
};

// Dept drill-down identities
const deptDrilldownData = (dept: string) => identityInsights.filter(i => i.department === dept);

// Role quality drill-down
const roleQualityDrilldown = (role: string) => {
  const r = roleQuality.find(rq => rq.role === role);
  if (!r) return [];
  return [
    { metric: 'Coverage Score', value: `${r.coverage}%`, status: r.coverage >= 80 ? 'Good' : r.coverage >= 60 ? 'Fair' : 'Poor', description: 'Percentage of users\' access needs addressed by this role' },
    { metric: 'Complexity Score', value: `${r.complexity}%`, status: r.complexity <= 40 ? 'Good' : r.complexity <= 60 ? 'Fair' : 'High', description: 'Number of entitlements relative to role purpose' },
    { metric: 'Efficiency Score', value: `${r.efficiency}%`, status: r.efficiency >= 75 ? 'Good' : r.efficiency >= 50 ? 'Fair' : 'Poor', description: 'Ratio of used vs assigned entitlements' },
    { metric: 'User Count', value: String(Math.round(r.coverage * 0.5)), status: 'N/A', description: 'Number of identities assigned this role' },
    { metric: 'Entitlements', value: String(Math.round(r.complexity * 0.3)), status: 'N/A', description: 'Total entitlements in this role' },
    { metric: 'SoD Conflicts', value: r.complexity > 60 ? '2' : '0', status: r.complexity > 60 ? 'Warning' : 'Clear', description: 'Segregation of duty conflicts within role' },
  ];
};

// Month drill-down
const monthDrilldown = (month: string) => {
  const d = accessGrowth.find(m => m.month === month);
  const idx = accessGrowth.findIndex(m => m.month === month);
  const prev = idx > 0 ? accessGrowth[idx - 1] : null;
  if (!d) return [];
  return [
    { metric: 'Total Entitlements', value: d.entitlements, change: prev ? d.entitlements - prev.entitlements : 0 },
    { metric: 'Active Roles', value: d.roles, change: prev ? d.roles - prev.roles : 0 },
    { metric: 'Direct Access Grants', value: d.directAccess, change: prev ? d.directAccess - prev.directAccess : 0 },
    { metric: 'Role Coverage %', value: `${Math.round((1 - d.directAccess / d.entitlements) * 100)}%`, change: prev ? Math.round((1 - d.directAccess / d.entitlements) * 100) - Math.round((1 - prev.directAccess / prev.entitlements) * 100) : 0 },
  ];
};

const getRiskBadge = (score: number) => {
  if (score >= 80) return <Badge variant="destructive">Critical</Badge>;
  if (score >= 60) return <Badge className="bg-warning/15 text-warning border-warning/30">High</Badge>;
  if (score >= 40) return <Badge variant="secondary">Medium</Badge>;
  return <Badge variant="outline">Low</Badge>;
};

type DrawerState = 
  | { type: 'identity'; data: any }
  | { type: 'coverage'; name: string }
  | { type: 'dept'; dept: string }
  | { type: 'roleQuality'; role: string }
  | { type: 'month'; month: string }
  | null;

export const AnalyticsDashboard = () => {
  const chart1 = useCssVariable('--chart-1');
  const chart2 = useCssVariable('--chart-2');
  const chart3 = useCssVariable('--chart-3');
  const chart4 = useCssVariable('--chart-4');
  const chart5 = useCssVariable('--chart-5');

  const [drawer, setDrawer] = useState<DrawerState>(null);

  const sortedIdentities = [...identityInsights].sort((a, b) => b.riskScore - a.riskScore);
  const { paginatedData, paginationProps } = usePagination(sortedIdentities, 10);

  const pieColors = [chart1, chart2, chart3].map(c => `hsl(${c})`);

  // Build drawer props based on state
  const getDrawerProps = () => {
    if (!drawer) return null;
    switch (drawer.type) {
      case 'identity': {
        const row = drawer.data;
        return {
          title: row.name,
          description: `${row.department} · Risk Score: ${row.riskScore} · ${row.entitlements} total entitlements`,
          metric: { value: row.riskScore, trend: { value: row.riskScore > 60 ? 5 : -3, isPositive: row.riskScore <= 60 } },
          columns: [
            { key: 'entitlement', label: 'Entitlement' },
            { key: 'application', label: 'Application' },
            { key: 'type', label: 'Access Type' },
            { key: 'risk', label: 'Risk' },
            { key: 'lastUsed', label: 'Last Used' },
          ] as DrilldownColumn[],
          data: getIdentityEntitlements(row.name),
          trendData: [
            { label: 'Oct', value: row.riskScore - 8 },
            { label: 'Nov', value: row.riskScore - 5 },
            { label: 'Dec', value: row.riskScore - 2 },
            { label: 'Jan', value: row.riskScore + 1 },
            { label: 'Feb', value: row.riskScore - 1 },
            { label: 'Mar', value: row.riskScore },
          ],
          trendLabel: 'Risk Score',
        };
      }
      case 'coverage': {
        const items = coverageDrilldownData[drawer.name] || [];
        return {
          title: `${drawer.name} Access`,
          description: `${items.length} identities with ${drawer.name.toLowerCase()} access assignments`,
          metric: { value: `${coverageData.find(c => c.name === drawer.name)?.value || 0}%` },
          columns: [
            { key: 'name', label: 'Identity' },
            { key: 'department', label: 'Department' },
            { key: 'entitlements', label: 'Total Entitlements' },
            { key: 'roleBased', label: 'Role-Based %' },
            { key: 'directAccess', label: 'Direct Access' },
            { key: 'riskScore', label: 'Risk', render: (v: number) => getRiskBadge(v) },
          ] as DrilldownColumn[],
          data: items,
        };
      }
      case 'dept': {
        const items = deptDrilldownData(drawer.dept);
        const deptInfo = sprawlByDept.find(d => d.dept === drawer.dept);
        return {
          title: `${drawer.dept} Department`,
          description: `Avg ${deptInfo?.avg || 0} entitlements/user · Threshold: ${deptInfo?.threshold || 12}`,
          metric: { value: deptInfo?.avg || 0, trend: { value: (deptInfo?.avg || 0) - 12, isPositive: (deptInfo?.avg || 0) <= 12 } },
          columns: [
            { key: 'name', label: 'Identity' },
            { key: 'entitlements', label: 'Total Entitlements' },
            { key: 'roleBased', label: 'Role-Based %' },
            { key: 'directAccess', label: 'Direct Access' },
            { key: 'riskScore', label: 'Risk', render: (v: number) => getRiskBadge(v) },
          ] as DrilldownColumn[],
          data: items,
        };
      }
      case 'roleQuality': {
        return {
          title: drawer.role,
          description: 'Role quality assessment across coverage, complexity, and efficiency dimensions',
          columns: [
            { key: 'metric', label: 'Metric' },
            { key: 'value', label: 'Score' },
            { key: 'status', label: 'Status' },
            { key: 'description', label: 'Description' },
          ] as DrilldownColumn[],
          data: roleQualityDrilldown(drawer.role),
        };
      }
      case 'month': {
        return {
          title: `Access Changes — ${drawer.month}`,
          description: 'Monthly change summary across entitlements, roles, and direct access',
          columns: [
            { key: 'metric', label: 'Metric' },
            { key: 'value', label: 'Value' },
            { key: 'change', label: 'Change from Prior Month' },
          ] as DrilldownColumn[],
          data: monthDrilldown(drawer.month),
        };
      }
    }
  };

  const drawerProps = getDrawerProps();

  return (
    <div className="space-y-6 pt-6">
      {/* Charts 2x2 Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Role Coverage Distribution - Donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-1.5">
              Role Coverage Distribution
              <InfoTooltip text="Breakdown of access assignments by type: role-based (through roles), direct (individual grants), and hybrid (both). Higher role-based % indicates better governance maturity. Click a slice to explore identities." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] flex items-center">
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie data={coverageData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value"
                    onClick={(_, index) => setDrawer({ type: 'coverage', name: coverageData[index].name })}
                    className="cursor-pointer"
                  >
                    {coverageData.map((_, i) => (
                      <Cell key={i} fill={pieColors[i]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }} formatter={(value: number) => [`${value}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {coverageData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded-md p-1 -m-1 transition-colors" onClick={() => setDrawer({ type: 'coverage', name: item.name })}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pieColors[i] }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-lg font-bold">{item.value}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Entitlement Sprawl by Department - Bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-1.5">
              Entitlement Sprawl by Department
              <InfoTooltip text="Average number of entitlements per identity in each department. The threshold line (12) represents the organizational target. Click a bar to see department identities." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sprawlByDept} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="dept" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }} />
                  <ReferenceLine y={12} stroke={`hsl(${chart4})`} strokeDasharray="5 5" label={{ value: 'Threshold', fill: `hsl(${chart4})`, fontSize: 11 }} />
                  <Bar dataKey="avg" name="Avg Entitlements" fill={`hsl(${chart2})`} radius={[4, 4, 0, 0]} className="cursor-pointer"
                    onClick={(data) => setDrawer({ type: 'dept', dept: data.dept })}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Role Quality Scores - Grouped Bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-1.5">
              Role Quality Scores
              <InfoTooltip text="Quality assessment of each role across three dimensions. Click any bar group to view detailed role quality breakdown." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleQuality} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  onClick={(state) => {
                    if (state?.activeLabel) setDrawer({ type: 'roleQuality', role: state.activeLabel });
                  }}
                  className="cursor-pointer"
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="role" tick={{ fontSize: 10 }} className="text-muted-foreground" angle={-15} />
                  <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="coverage" name="Coverage" fill={`hsl(${chart1})`} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="complexity" name="Complexity" fill={`hsl(${chart3})`} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="efficiency" name="Efficiency" fill={`hsl(${chart5})`} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Access Growth Trend - Area */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-1.5">
              Access Growth Trend
              <InfoTooltip text="12-month trend showing growth of total entitlements and direct access. Click a month to see the change summary." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={accessGrowth} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  onClick={(state) => {
                    if (state?.activeLabel) setDrawer({ type: 'month', month: state.activeLabel });
                  }}
                  className="cursor-pointer"
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="entitlements" name="Total Entitlements" stroke={`hsl(${chart1})`} fill={`hsl(${chart1} / 0.15)`} />
                  <Area type="monotone" dataKey="directAccess" name="Direct Access" stroke={`hsl(${chart4})`} fill={`hsl(${chart4} / 0.15)`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Access Pattern Insights Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-1.5">
            Access Pattern Insights
            <InfoTooltip text="Top identities ranked by risk score. Click any row to view full entitlement breakdown, role memberships, and access timeline." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Identity</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Entitlements</TableHead>
                  <TableHead className="text-right">Role-Based %</TableHead>
                  <TableHead className="text-right">Direct Access</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Last Review</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map(row => (
                  <TableRow key={row.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDrawer({ type: 'identity', data: row })}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell className="text-right">{row.entitlements}</TableCell>
                    <TableCell className="text-right">{row.roleBased}%</TableCell>
                    <TableCell className="text-right">{row.directAccess}</TableCell>
                    <TableCell>{getRiskBadge(row.riskScore)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.lastReview}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <StandardPagination {...paginationProps} />
        </CardContent>
      </Card>

      {/* Unified Drilldown Drawer */}
      <AccessAnalysisDrilldownDrawer
        open={!!drawer}
        onOpenChange={(open) => !open && setDrawer(null)}
        title={drawerProps?.title || ''}
        description={drawerProps?.description}
        metric={drawerProps?.metric}
        columns={drawerProps?.columns || []}
        data={drawerProps?.data || []}
        trendData={drawerProps?.trendData}
        trendLabel={drawerProps?.trendLabel}
      />
    </div>
  );
};
