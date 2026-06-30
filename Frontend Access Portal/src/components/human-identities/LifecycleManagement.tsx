
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, UserMinus, Clock, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
import { KpiDrilldownModal, KpiDrilldownItem } from './modals/KpiDrilldownModal';
import { ChartDrilldownModal, ChartDrilldownItem } from './modals/ChartDrilldownModal';
import { LifecycleEventModal } from './modals/LifecycleEventModal';

const stageDistribution = [
  { stage: 'Pre-boarding', count: 12 },
  { stage: 'Onboarding', count: 8 },
  { stage: 'Probation', count: 23 },
  { stage: 'Active', count: 1247 },
  { stage: 'Transfer', count: 15 },
  { stage: 'Offboarding', count: 5 },
];

const jmlTrend = [
  { month: 'Sep', Joiners: 18, Movers: 12, Leavers: 8 },
  { month: 'Oct', Joiners: 22, Movers: 15, Leavers: 10 },
  { month: 'Nov', Joiners: 15, Movers: 18, Leavers: 12 },
  { month: 'Dec', Joiners: 10, Movers: 8, Leavers: 14 },
  { month: 'Jan', Joiners: 25, Movers: 20, Leavers: 9 },
  { month: 'Feb', Joiners: 20, Movers: 16, Leavers: 11 },
];

const upcomingEvents = [
  { name: 'Mike Chen', event: 'Probation Ending', due: '2024-03-01', department: 'Finance', status: 'Action Required' },
  { name: 'Sarah Johnson', event: 'Internal Transfer', due: '2024-02-15', department: 'Engineering', status: 'Scheduled' },
  { name: 'Emily Davis', event: 'Contract Renewal', due: '2024-02-20', department: 'Marketing', status: 'Pending' },
  { name: 'Tom Wilson', event: 'Offboarding', due: '2024-02-10', department: 'Sales', status: 'In Progress' },
  { name: 'Lisa Park', event: 'Promotion Review', due: '2024-02-25', department: 'Engineering', status: 'Scheduled' },
];

const kpiCards = [
  { title: 'Active Employees', value: '1,247', icon: Users, color: 'text-primary', trend: '+2.1%', trendDir: 'up' as const, tooltip: 'Total employees in active status across all departments.' },
  { title: 'In Onboarding', value: '20', icon: UserPlus, color: 'text-green-600', trend: '+15%', trendDir: 'up' as const, tooltip: 'Employees currently in pre-boarding or onboarding stages.' },
  { title: 'Pending Offboarding', value: '5', icon: UserMinus, color: 'text-destructive', trend: '-20%', trendDir: 'down' as const, tooltip: 'Employees in offboarding stage requiring access deprovisioning.' },
  { title: 'Avg Tenure', value: '28mo', icon: Clock, color: 'text-orange-600', trend: '+3mo', trendDir: 'up' as const, tooltip: 'Average employment duration. Helps forecast lifecycle event volumes.' },
];

const mockStageEmployees: Record<string, KpiDrilldownItem[]> = {
  'Pre-boarding': Array.from({ length: 12 }, (_, i) => ({ name: `New Hire ${i + 1}`, department: ['Engineering', 'Finance', 'Marketing'][i % 3], type: 'Employee', status: 'Pre-boarding' })),
  'Onboarding': Array.from({ length: 8 }, (_, i) => ({ name: `Onboardee ${i + 1}`, department: ['Engineering', 'Sales', 'HR'][i % 3], type: 'Employee', status: 'Onboarding' })),
  'Probation': Array.from({ length: 23 }, (_, i) => ({ name: `Probationer ${i + 1}`, department: ['Engineering', 'Finance', 'Marketing', 'Sales'][i % 4], type: 'Employee', status: 'Probation' })),
  'Active': Array.from({ length: 20 }, (_, i) => ({ name: `Employee ${i + 1}`, department: ['Engineering', 'Finance', 'Marketing', 'Sales', 'HR'][i % 5], type: 'Employee', status: 'Active' })),
  'Transfer': Array.from({ length: 15 }, (_, i) => ({ name: `Transferee ${i + 1}`, department: ['Engineering', 'Finance'][i % 2], type: 'Employee', status: 'Transfer' })),
  'Offboarding': Array.from({ length: 5 }, (_, i) => ({ name: `Leaver ${i + 1}`, department: ['Sales', 'Marketing', 'HR'][i % 3], type: 'Employee', status: 'Offboarding' })),
};

export function LifecycleManagement() {
  const [kpiModal, setKpiModal] = useState<{ open: boolean; title: string; description: string; items: KpiDrilldownItem[] }>({ open: false, title: '', description: '', items: [] });
  const [chartModal, setChartModal] = useState<{ open: boolean; title: string; segmentLabel: string; segmentValue: number; items: ChartDrilldownItem[] }>({ open: false, title: '', segmentLabel: '', segmentValue: 0, items: [] });
  const [eventModal, setEventModal] = useState<{ open: boolean; event: typeof upcomingEvents[0] | null }>({ open: false, event: null });

  const handleKpiClick = (title: string) => {
    let items: KpiDrilldownItem[] = [];
    let description = '';
    if (title === 'Active Employees') {
      items = mockStageEmployees['Active'];
      description = 'Employees in active status';
    } else if (title === 'In Onboarding') {
      items = [...mockStageEmployees['Pre-boarding'], ...mockStageEmployees['Onboarding']];
      description = 'Employees in pre-boarding or onboarding';
    } else if (title === 'Pending Offboarding') {
      items = mockStageEmployees['Offboarding'];
      description = 'Employees pending offboarding';
    } else if (title === 'Avg Tenure') {
      items = mockStageEmployees['Active'].slice(0, 10).map((e, i) => ({ ...e, detail: `${20 + i * 3} months` }));
      description = 'Tenure breakdown (sample)';
    }
    setKpiModal({ open: true, title, description, items });
  };

  const handleBarClick = (data: any) => {
    if (!data?.activePayload?.[0]) return;
    const stage = data.activePayload[0].payload.stage;
    const count = data.activePayload[0].payload.count;
    const items = (mockStageEmployees[stage] || []).map(e => ({ ...e } as ChartDrilldownItem));
    setChartModal({ open: true, title: `Lifecycle Stage — ${stage}`, segmentLabel: stage, segmentValue: count, items });
  };

  const handleAreaClick = (data: any) => {
    if (!data?.activePayload?.[0]) return;
    const month = data.activePayload[0].payload.month;
    const payload = data.activePayload[0].payload;
    const items: ChartDrilldownItem[] = [
      ...Array.from({ length: payload.Joiners }, (_, i) => ({ name: `Joiner ${i + 1}`, type: 'Joiner', department: ['Engineering', 'Sales'][i % 2], status: 'Joined' } as ChartDrilldownItem)),
      ...Array.from({ length: payload.Movers }, (_, i) => ({ name: `Mover ${i + 1}`, type: 'Mover', department: ['Finance', 'HR'][i % 2], status: 'Transferred' } as ChartDrilldownItem)),
      ...Array.from({ length: payload.Leavers }, (_, i) => ({ name: `Leaver ${i + 1}`, type: 'Leaver', department: ['Marketing', 'Sales'][i % 2], status: 'Left' } as ChartDrilldownItem)),
    ];
    setChartModal({ open: true, title: `JML Events — ${month}`, segmentLabel: month, segmentValue: items.length, items });
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trendDir === 'up' ? TrendingUp : TrendingDown;
          const isPositive = kpi.title === 'Pending Offboarding' ? kpi.trendDir === 'down' : kpi.trendDir === 'up';
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
                <div className="flex items-center gap-1 mt-1">
                  <TrendIcon className={`h-3 w-3 ${isPositive ? 'text-green-600' : 'text-destructive'}`} />
                  <span className={`text-xs ${isPositive ? 'text-green-600' : 'text-destructive'}`}>{kpi.trend}</span>
                  <span className="text-xs text-muted-foreground">vs last period</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              Lifecycle Stage Distribution
              <InfoTooltip text="Click a bar to see employees in that stage." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stageDistribution} margin={{ left: 10 }} onClick={handleBarClick}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} className="cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              Joiner / Mover / Leaver Trend
              <InfoTooltip text="Click a data point to drill down into that month's JML events." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={jmlTrend} onClick={handleAreaClick}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="Joiners" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.15} strokeWidth={2} className="cursor-pointer" />
                <Area type="monotone" dataKey="Movers" stroke="hsl(221, 83%, 53%)" fill="hsl(221, 83%, 53%)" fillOpacity={0.15} strokeWidth={2} className="cursor-pointer" />
                <Area type="monotone" dataKey="Leavers" stroke="hsl(0, 84%, 60%)" fill="hsl(0, 84%, 60%)" fillOpacity={0.15} strokeWidth={2} className="cursor-pointer" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-1">
            Upcoming Lifecycle Events
            <InfoTooltip text="Lifecycle transitions requiring governance action. Click Review to manage." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Employee</th>
                  <th className="pb-2 font-medium">Event</th>
                  <th className="pb-2 font-medium">Department</th>
                  <th className="pb-2 font-medium">Due Date</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {upcomingEvents.map((evt, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3 font-medium">{evt.name}</td>
                    <td className="py-3"><Badge variant="outline" className="text-xs">{evt.event}</Badge></td>
                    <td className="py-3 text-muted-foreground">{evt.department}</td>
                    <td className="py-3 text-muted-foreground">{evt.due}</td>
                    <td className="py-3">
                      <Badge className={
                        evt.status === 'Action Required' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                        evt.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        'bg-muted text-muted-foreground'
                      }>{evt.status}</Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => setEventModal({ open: true, event: evt })}><Eye className="h-3 w-3 mr-1" />Review</Button>
                    </td>
                  </tr>
                ))}
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
        columns={[{ key: 'name', label: 'Name' }, { key: 'department', label: 'Department' }, { key: 'type', label: 'Type' }, { key: 'status', label: 'Status' }]}
      />
      <ChartDrilldownModal
        open={chartModal.open}
        onOpenChange={(v) => setChartModal(prev => ({ ...prev, open: v }))}
        title={chartModal.title}
        segmentLabel={chartModal.segmentLabel}
        segmentValue={chartModal.segmentValue}
        items={chartModal.items}
        columns={[{ key: 'name', label: 'Name' }, { key: 'department', label: 'Department' }, { key: 'type', label: 'Type' }, { key: 'status', label: 'Status' }]}
      />
      <LifecycleEventModal
        open={eventModal.open}
        onOpenChange={(v) => setEventModal(prev => ({ ...prev, open: v }))}
        event={eventModal.event}
      />
    </div>
  );
}
