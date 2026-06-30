
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, AlertTriangle, UserX, Clock, TrendingUp, TrendingDown, Eye, Loader2 } from 'lucide-react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useIdentityDetail } from '@/contexts/IdentityDetailContext';
import { KpiDrilldownModal, KpiDrilldownItem } from './modals/KpiDrilldownModal';
import { ChartDrilldownModal, ChartDrilldownItem } from './modals/ChartDrilldownModal';
import useIdentityTypeStatistics from '@/hooks/identities/useIdentityTypeStatistics';
import useIdentities from '@/hooks/identities/useIdentities';
import { attr, displayName as idDisplayName, toDateString } from '@/types/identity';

const RISK_COLORS = {
  High: 'hsl(0, 84%, 60%)',
  Medium: 'hsl(38, 92%, 50%)',
  Low: 'hsl(142, 71%, 45%)',
};

const TYPE_COLORS = ['hsl(221, 83%, 53%)', 'hsl(262, 83%, 58%)', 'hsl(142, 71%, 45%)'];

export function IdentityCenter() {
  const { setSelectedUser } = useIdentityDetail();

  // Real backend data
  const { data: stats, isLoading: statsLoading } = useIdentityTypeStatistics('employee');
  const { data: identities, isLoading: listLoading } = useIdentities('employee');

  const [kpiModal, setKpiModal] = useState<{ open: boolean; title: string; description: string; items: KpiDrilldownItem[] }>({ open: false, title: '', description: '', items: [] });
  const [chartModal, setChartModal] = useState<{ open: boolean; title: string; segmentLabel: string; segmentValue: number; items: ChartDrilldownItem[] }>({ open: false, title: '', segmentLabel: '', segmentValue: 0, items: [] });

  const kpis = useMemo(() => {
    if (stats) {
      return {
        total: stats.totalCount,
        active: stats.activeCount,
        inactive: stats.inactiveCount,
        suspended: stats.suspendedCount,
      };
    }
    return { total: 0, active: 0, inactive: 0, suspended: 0 };
  }, [stats]);

  const deptData = useMemo(() => {
    const deptMap: Record<string, number> = {};
    identities.forEach(i => {
      const dept = attr(i, 'department') || 'Unknown';
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });
    return Object.entries(deptMap).map(([dept, count]) => ({ department: dept, count }));
  }, [identities]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    identities.forEach(i => { counts[i.status] = (counts[i.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [identities]);

  const recentIdentities = useMemo(() => {
    return [...identities]
      .sort((a, b) => {
        const ta = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt || 0).getTime();
        const tb = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt || 0).getTime();
        return tb - ta;
      })
      .slice(0, 5);
  }, [identities]);

  const handleKpiClick = (title: string) => {
    let items: KpiDrilldownItem[] = [];
    let description = '';
    const toItem = (i: typeof identities[number]) => ({
      name: idDisplayName(i),
      department: attr(i, 'department') || '',
      type: 'Employee',
      risk: 'Low' as const,
    });
    if (title === 'Total Employees') {
      items = identities.map(toItem);
      description = 'All managed employee identities';
    } else if (title === 'Active') {
      items = identities.filter(i => i.status === 'ACTIVE').map(toItem);
      description = 'Currently active employee identities';
    } else if (title === 'Inactive') {
      items = identities.filter(i => i.status === 'INACTIVE').map(toItem);
      description = 'Inactive employee identities requiring review';
    } else if (title === 'Suspended') {
      items = identities.filter(i => i.status === 'SUSPENDED').map(toItem);
      description = 'Suspended employee identities';
    }
    setKpiModal({ open: true, title, description, items });
  };

  const handleBarClick = (data: any) => {
    if (!data?.activePayload?.[0]) return;
    const dept = data.activePayload[0].payload.department;
    const users = identities.filter(i => attr(i, 'department') === dept);
    setChartModal({
      open: true,
      title: `Department — ${dept}`,
      segmentLabel: dept,
      segmentValue: users.length,
      items: users.map(i => ({ name: idDisplayName(i), department: dept, type: 'Employee', risk: 'Low' as const })),
    });
  };

  const handlePieClick = (_: any, index: number) => {
    const segment = statusData[index];
    if (!segment) return;
    const users = identities.filter(i => i.status === segment.name);
    setChartModal({
      open: true,
      title: `Status — ${segment.name}`,
      segmentLabel: segment.name,
      segmentValue: users.length,
      items: users.map(i => ({ name: idDisplayName(i), department: attr(i, 'department') || '', type: 'Employee', risk: 'Low' as const })),
    });
  };

  const handleReview = (identity: typeof identities[number]) => {
    setSelectedUser({
      id: identity.id,
      name: idDisplayName(identity),
      type: 'Employee',
      department: attr(identity, 'department') || '',
      status: identity.status === 'ACTIVE' ? 'Active' : identity.status === 'SUSPENDED' ? 'Suspended' : 'Inactive',
      team: 0,
      manager: attr(identity, 'managerRef') || '',
      riskLevel: 'Low',
      lastUpdated: identity.updatedAt || '',
      aiAnalysis: 'Pending Review',
    });
  };

  const kpiCards = [
    { title: 'Total Employees', value: kpis.total, icon: Users, color: 'text-primary', trend: '', trendDir: 'up' as const, tooltip: 'Total employee identities managed in this tenant' },
    { title: 'Active', value: kpis.active, icon: Users, color: 'text-green-600', trend: '', trendDir: 'up' as const, tooltip: 'Employee identities in ACTIVE status' },
    { title: 'Inactive', value: kpis.inactive, icon: UserX, color: 'text-orange-600', trend: '', trendDir: 'down' as const, tooltip: 'Employee identities in INACTIVE status, may require review or cleanup' },
    { title: 'Suspended', value: kpis.suspended, icon: Clock, color: 'text-yellow-600', trend: '', trendDir: 'up' as const, tooltip: 'Employee identities that have been suspended pending investigation or review' },
  ];

  if (statsLoading || listLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading employee analytics…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleKpiClick(kpi.title)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-muted-foreground">{kpi.title}</span>
                    <InfoTooltip text={kpi.tooltip} />
                  </div>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              Employees by Department
              <InfoTooltip text="Shows how employees are distributed across departments. Click a bar to drill down." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptData} layout="vertical" margin={{ left: 20 }} onClick={handleBarClick}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="department" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill={TYPE_COLORS[0]} radius={[0, 4, 4, 0]} className="cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              Status Distribution
              <InfoTooltip text="Click a segment to drill down into identities with that status." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}
                  onClick={handlePieClick} className="cursor-pointer">
                  {statusData.map((_, i) => <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Identities Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-1">
            Recently Created Employees
            <InfoTooltip text="Most recently onboarded employee identities." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Identity</th>
                  <th className="pb-2 font-medium">Department</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Created</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentIdentities.map(identity => (
                  <tr key={identity.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{idDisplayName(identity)}</td>
                    <td className="py-3 text-muted-foreground">{attr(identity, 'department') || '—'}</td>
                    <td className="py-3">
                      <Badge variant="outline" className="text-xs">{identity.status}</Badge>
                    </td>
                    <td className="py-3 text-muted-foreground text-xs">
                      {toDateString(identity.createdAt) || '—'}
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => handleReview(identity)}><Eye className="h-3 w-3 mr-1" />Review</Button>
                    </td>
                  </tr>
                ))}
                {recentIdentities.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No employee identities found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <KpiDrilldownModal
        open={kpiModal.open}
        onOpenChange={(v) => setKpiModal(prev => ({ ...prev, open: v }))}
        title={kpiModal.title}
        description={kpiModal.description}
        items={kpiModal.items}
        onViewItem={(item) => {
          const identity = identities.find(i => idDisplayName(i) === item.name);
          if (identity) { handleReview(identity); setKpiModal(prev => ({ ...prev, open: false })); }
        }}
      />
      <ChartDrilldownModal
        open={chartModal.open}
        onOpenChange={(v) => setChartModal(prev => ({ ...prev, open: v }))}
        title={chartModal.title}
        segmentLabel={chartModal.segmentLabel}
        segmentValue={chartModal.segmentValue}
        items={chartModal.items}
        onViewItem={(item) => {
          const identity = identities.find(i => idDisplayName(i) === item.name);
          if (identity) { handleReview(identity); setChartModal(prev => ({ ...prev, open: false })); }
        }}
      />
    </div>
  );
}
