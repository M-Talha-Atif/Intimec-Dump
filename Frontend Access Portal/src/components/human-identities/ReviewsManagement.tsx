
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, AlertTriangle, Clock, Users, TrendingUp, TrendingDown, Zap, Eye } from 'lucide-react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { KpiDrilldownModal, KpiDrilldownItem } from './modals/KpiDrilldownModal';
import { ChartDrilldownModal, ChartDrilldownItem } from './modals/ChartDrilldownModal';
import { CampaignManageModal } from './modals/CampaignManageModal';

const campaignProgress = [
  { name: 'Employee Q1 Review', Complete: 68, InProgress: 20, NotStarted: 12 },
  { name: 'Employee Engineering', Complete: 0, InProgress: 0, NotStarted: 100 },
  { name: 'New Hire Probation', Complete: 35, InProgress: 40, NotStarted: 25 },
  { name: 'Employee SOX Compliance', Complete: 82, InProgress: 12, NotStarted: 6 },
  { name: 'Employee Privileged Access', Complete: 55, InProgress: 30, NotStarted: 15 },
];

const completionTrend = [
  { month: 'Sep', rate: 72 },
  { month: 'Oct', rate: 78 },
  { month: 'Nov', rate: 65 },
  { month: 'Dec', rate: 81 },
  { month: 'Jan', rate: 75 },
  { month: 'Feb', rate: 84 },
];

const campaigns = [
  { name: 'Q1 Employee Access Review', type: 'Quarterly', progress: 68, due: '2024-03-31', status: 'Active', employees: 1247 },
  { name: 'Employee SOX Compliance', type: 'Compliance', progress: 82, due: '2024-02-28', status: 'Active', employees: 340 },
  { name: 'Employee Privileged Access Cert', type: 'Privileged', progress: 55, due: '2024-03-15', status: 'Active', employees: 156 },
  { name: 'Employee Engineering Review', type: 'Ad-hoc', progress: 0, due: '2024-02-15', status: 'Pending', employees: 45 },
  { name: 'New Hire Probation Review', type: 'Probation', progress: 35, due: '2024-02-28', status: 'Active', employees: 23 },
];

const kpiCards = [
  { title: 'Active Campaigns', value: '5', icon: BarChart3, color: 'text-primary', trend: '+1', trendDir: 'up' as const, tooltip: 'Employee identity certification campaigns in progress. Click to see all.' },
  { title: 'Overdue Reviews', value: '12', icon: AlertTriangle, color: 'text-destructive', trend: '+3', trendDir: 'up' as const, tooltip: 'Employee review items past deadline. Click to see overdue list.' },
  { title: 'Avg Completion Rate', value: '76%', icon: Clock, color: 'text-green-600', trend: '+4%', trendDir: 'up' as const, tooltip: 'Average completion across employee campaigns.' },
  { title: 'Employees Reviewed', value: '1,189', icon: Users, color: 'text-purple-600', trend: '+156', trendDir: 'up' as const, tooltip: 'Total employees certified this cycle. Click for breakdown.' },
];

const mockOverdueItems: KpiDrilldownItem[] = Array.from({ length: 12 }, (_, i) => ({
  name: `Employee ${i + 1}`,
  department: ['Finance', 'Engineering', 'Sales', 'HR'][i % 4],
  detail: `${3 + i} days overdue`,
  type: ['Q1 Review', 'SOX Compliance', 'Privileged Access'][i % 3],
  risk: i < 4 ? 'High' : 'Medium',
}));

export function ReviewsManagement() {
  const [kpiModal, setKpiModal] = useState<{ open: boolean; title: string; items: KpiDrilldownItem[] }>({ open: false, title: '', items: [] });
  const [chartModal, setChartModal] = useState<{ open: boolean; title: string; segmentLabel: string; segmentValue: number; items: ChartDrilldownItem[] }>({ open: false, title: '', segmentLabel: '', segmentValue: 0, items: [] });
  const [campaignModal, setCampaignModal] = useState<{ open: boolean; campaign: typeof campaigns[0] | null }>({ open: false, campaign: null });

  const handleKpiClick = (title: string) => {
    let items: KpiDrilldownItem[] = [];
    if (title === 'Active Campaigns') {
      items = campaigns.map(c => ({ name: c.name, type: c.type, detail: `${c.progress}% complete`, status: c.status }));
    } else if (title === 'Overdue Reviews') {
      items = mockOverdueItems;
    } else if (title === 'Avg Completion Rate') {
      items = campaigns.map(c => ({ name: c.name, detail: `${c.progress}%`, type: c.type, status: c.status }));
    } else if (title === 'Employees Reviewed') {
      items = Array.from({ length: 20 }, (_, i) => ({ name: `Reviewed Employee ${i + 1}`, department: ['Finance', 'Engineering', 'Sales', 'HR', 'Marketing'][i % 5], type: 'Employee', status: 'Certified' }));
    }
    setKpiModal({ open: true, title, items });
  };

  const handleBarClick = (data: any) => {
    if (!data?.activePayload?.[0]) return;
    const campaignName = data.activePayload[0].payload.name;
    const match = campaigns.find(c => c.name.includes(campaignName.replace('Employee ', '')));
    if (match) setCampaignModal({ open: true, campaign: match });
  };

  const handleLineClick = (data: any) => {
    if (!data?.activePayload?.[0]) return;
    const month = data.activePayload[0].payload.month;
    const rate = data.activePayload[0].payload.rate;
    const items: ChartDrilldownItem[] = Array.from({ length: 10 }, (_, i) => ({
      name: `Decision ${i + 1}`, type: i % 3 === 0 ? 'Revoked' : 'Approved', department: ['Finance', 'Engineering'][i % 2], status: 'Completed',
    }));
    setChartModal({ open: true, title: `Review Decisions — ${month}`, segmentLabel: `${month} (${rate}%)`, segmentValue: items.length, items });
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trendDir === 'up' ? TrendingUp : TrendingDown;
          const isNegative = kpi.title === 'Overdue Reviews' && kpi.trendDir === 'up';
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
                  <TrendIcon className={`h-3 w-3 ${isNegative ? 'text-destructive' : 'text-green-600'}`} />
                  <span className={`text-xs ${isNegative ? 'text-destructive' : 'text-green-600'}`}>{kpi.trend}</span>
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
              Employee Campaign Progress
              <InfoTooltip text="Click a campaign bar to manage it." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignProgress} layout="vertical" margin={{ left: 20 }} onClick={handleBarClick}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={130} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Complete" stackId="a" fill="hsl(142, 71%, 45%)" className="cursor-pointer" />
                <Bar dataKey="InProgress" stackId="a" fill="hsl(221, 83%, 53%)" className="cursor-pointer" />
                <Bar dataKey="NotStarted" stackId="a" fill="hsl(0, 84%, 60%)" radius={[0, 4, 4, 0]} className="cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              Review Completion Trend
              <InfoTooltip text="Click a data point to see that month's review decisions." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={completionTrend} onClick={handleLineClick}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Line type="monotone" dataKey="rate" stroke="hsl(221, 83%, 53%)" strokeWidth={2} dot={{ r: 4 }} name="Completion Rate" className="cursor-pointer" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              Employee Access Review Campaigns
              <InfoTooltip text="Employee identity certification campaigns only. Click Manage for campaign details." />
            </CardTitle>
            <Button size="sm"><Zap className="h-3 w-3 mr-1" />Create Campaign</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Campaign</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Progress</th>
                  <th className="pb-2 font-medium">Due</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.employees} employees</div>
                    </td>
                    <td className="py-3"><Badge variant="outline" className="text-xs">{c.type}</Badge></td>
                    <td className="py-3 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <Progress value={c.progress} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground w-8">{c.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground">{c.due}</td>
                    <td className="py-3">
                      <Badge className={c.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => setCampaignModal({ open: true, campaign: c })}><Eye className="h-3 w-3 mr-1" />Manage</Button>
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
        description={`Employee certification ${kpiModal.title.toLowerCase()}`}
        items={kpiModal.items}
        columns={[{ key: 'name', label: 'Name' }, { key: 'type', label: 'Type' }, { key: 'detail', label: 'Detail' }, { key: 'status', label: 'Status' }]}
      />
      <ChartDrilldownModal
        open={chartModal.open}
        onOpenChange={(v) => setChartModal(prev => ({ ...prev, open: v }))}
        title={chartModal.title}
        segmentLabel={chartModal.segmentLabel}
        segmentValue={chartModal.segmentValue}
        items={chartModal.items}
        columns={[{ key: 'name', label: 'Name' }, { key: 'type', label: 'Decision' }, { key: 'department', label: 'Department' }, { key: 'status', label: 'Status' }]}
      />
      <CampaignManageModal
        open={campaignModal.open}
        onOpenChange={(v) => setCampaignModal(prev => ({ ...prev, open: v }))}
        campaign={campaignModal.campaign}
      />
    </div>
  );
}
