
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ShieldAlert, Target, Network, TrendingUp, TrendingDown, Eye, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { OrganizationChart } from './OrganizationChart';
import { ExportInsightsModal } from './ExportInsightsModal';
import { KpiDrilldownModal, KpiDrilldownItem } from './modals/KpiDrilldownModal';
import { ChartDrilldownModal, ChartDrilldownItem } from './modals/ChartDrilldownModal';
import { ManagerDetailModal } from './modals/ManagerDetailModal';

const managerRiskData = [
  { name: 'Bob Brown', risk: 78 },
  { name: 'David Kim', risk: 65 },
  { name: 'Jane Smith', risk: 52 },
  { name: 'Lisa Rodriguez', risk: 45 },
  { name: 'Mark Taylor', risk: 38 },
];

const certCoverageData = [
  { name: 'Bob Brown', certified: 62, total: 100 },
  { name: 'David Kim', certified: 85, total: 100 },
  { name: 'Jane Smith', certified: 91, total: 100 },
  { name: 'Lisa Rodriguez', certified: 78, total: 100 },
  { name: 'Mark Taylor', certified: 95, total: 100 },
];

const managerTable = [
  { name: 'Bob Brown', reports: 14, risk: 78, pendingReviews: 8, certPct: 62 },
  { name: 'David Kim', reports: 11, risk: 65, pendingReviews: 3, certPct: 85 },
  { name: 'Jane Smith', reports: 9, risk: 52, pendingReviews: 2, certPct: 91 },
  { name: 'Lisa Rodriguez', reports: 7, risk: 45, pendingReviews: 5, certPct: 78 },
  { name: 'Mark Taylor', reports: 6, risk: 38, pendingReviews: 1, certPct: 95 },
];

const kpiCards = [
  { title: 'Total Managers', value: '18', icon: Users, color: 'text-primary', trend: '+2', trendDir: 'up' as const, tooltip: 'Number of managers with direct reports. Click to drill down.' },
  { title: 'Avg Span of Control', value: '9.4', icon: Users, color: 'text-orange-600', trend: '+0.8', trendDir: 'up' as const, tooltip: 'Average direct reports per manager. Click for breakdown.' },
  { title: 'Uncertified Teams', value: '4', icon: ShieldAlert, color: 'text-destructive', trend: '-2', trendDir: 'down' as const, tooltip: 'Teams with incomplete certifications. Click to see list.' },
  { title: 'Avg Manager Risk', value: '56', icon: Target, color: 'text-yellow-600', trend: '-4pts', trendDir: 'down' as const, tooltip: 'Average team risk score. Click for risk distribution.' },
];

const mockUncertifiedTeams: KpiDrilldownItem[] = [
  { name: 'Bob Brown', department: 'Sales', detail: '62% certified, 8 pending', risk: 'High' },
  { name: 'Lisa Rodriguez', department: 'Marketing', detail: '78% certified, 5 pending', risk: 'Medium' },
  { name: 'Tom Jackson', department: 'Finance', detail: '55% certified, 12 pending', risk: 'High' },
  { name: 'Amy Chen', department: 'HR', detail: '70% certified, 4 pending', risk: 'Medium' },
];

export function ManagerDashboard() {
  const [showOrgChart, setShowOrgChart] = useState(false);
  const [kpiModal, setKpiModal] = useState<{ open: boolean; title: string; items: KpiDrilldownItem[] }>({ open: false, title: '', items: [] });
  const [chartModal, setChartModal] = useState<{ open: boolean; title: string; segmentLabel: string; segmentValue: number; items: ChartDrilldownItem[] }>({ open: false, title: '', segmentLabel: '', segmentValue: 0, items: [] });
  const [mgrModal, setMgrModal] = useState<{ open: boolean; manager: typeof managerTable[0] | null }>({ open: false, manager: null });

  const handleKpiClick = (title: string) => {
    let items: KpiDrilldownItem[] = [];
    if (title === 'Total Managers') {
      items = managerTable.map(m => ({ name: m.name, department: 'Various', detail: `${m.reports} reports, ${m.certPct}% certified`, risk: m.risk >= 70 ? 'High' : m.risk >= 50 ? 'Medium' : 'Low' }));
    } else if (title === 'Uncertified Teams') {
      items = mockUncertifiedTeams;
    } else if (title === 'Avg Span of Control') {
      items = managerTable.map(m => ({ name: m.name, detail: `${m.reports} direct reports`, risk: m.reports > 10 ? 'High' : 'Low' }));
    } else if (title === 'Avg Manager Risk') {
      items = managerTable.map(m => ({ name: m.name, detail: `Score: ${m.risk}`, risk: m.risk >= 70 ? 'High' : m.risk >= 50 ? 'Medium' : 'Low' }));
    }
    setKpiModal({ open: true, title, items });
  };

  const handleRiskBarClick = (data: any) => {
    if (!data?.activePayload?.[0]) return;
    const mgr = data.activePayload[0].payload;
    const match = managerTable.find(m => m.name === mgr.name);
    if (match) setMgrModal({ open: true, manager: match });
  };

  const handleCertBarClick = (data: any) => {
    if (!data?.activePayload?.[0]) return;
    const mgr = data.activePayload[0].payload;
    const items: ChartDrilldownItem[] = Array.from({ length: 5 }, (_, i) => ({
      name: `Team Member ${i + 1}`, department: 'Various', type: i < Math.round(mgr.certified / 20) ? 'Certified' : 'Uncertified',
      risk: i < Math.round(mgr.certified / 20) ? 'Low' : 'Medium',
    }));
    setChartModal({ open: true, title: `Certification — ${mgr.name}`, segmentLabel: mgr.name, segmentValue: mgr.certified, items });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => setShowOrgChart(true)}>
          <Network className="h-4 w-4 mr-1" />View Org Chart
        </Button>
        <ExportInsightsModal>
          <Button variant="outline"><Download className="h-4 w-4 mr-1" />Export</Button>
        </ExportInsightsModal>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trendDir === 'up' ? TrendingUp : TrendingDown;
          const isPositive = (kpi.title === 'Uncertified Teams' || kpi.title === 'Avg Manager Risk') ? kpi.trendDir === 'down' : kpi.trendDir === 'up';
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
              Manager Risk Ranking
              <InfoTooltip text="Click a bar to see manager team details." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={managerRiskData} layout="vertical" margin={{ left: 20 }} onClick={handleRiskBarClick}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip />
                <Bar dataKey="risk" fill="hsl(0, 84%, 60%)" radius={[0, 4, 4, 0]} className="cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              Certification Coverage by Manager
              <InfoTooltip text="Click a bar to see certification details for that team." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={certCoverageData} layout="vertical" margin={{ left: 20 }} onClick={handleCertBarClick}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="certified" fill="hsl(142, 71%, 45%)" radius={[0, 4, 4, 0]} className="cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Manager Accountability Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-1">
            Manager Accountability
            <InfoTooltip text="Click Details to see team members and governance actions." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Manager</th>
                  <th className="pb-2 font-medium">Direct Reports</th>
                  <th className="pb-2 font-medium">Risk Score</th>
                  <th className="pb-2 font-medium">Pending Reviews</th>
                  <th className="pb-2 font-medium">Cert. Coverage</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {managerTable.map((mgr) => (
                  <tr key={mgr.name} className="border-b last:border-0">
                    <td className="py-3 font-medium">{mgr.name}</td>
                    <td className="py-3 text-muted-foreground">{mgr.reports}</td>
                    <td className="py-3">
                      <Badge className={
                        mgr.risk >= 70 ? 'bg-destructive/10 text-destructive border-destructive/20' :
                          mgr.risk >= 50 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            'bg-green-100 text-green-800 border-green-200'
                      }>{mgr.risk}</Badge>
                    </td>
                    <td className="py-3">
                      <span className={mgr.pendingReviews > 5 ? 'text-destructive font-medium' : 'text-muted-foreground'}>{mgr.pendingReviews}</span>
                    </td>
                    <td className="py-3">
                      <span className={mgr.certPct < 75 ? 'text-destructive font-medium' : 'text-green-600'}>{mgr.certPct}%</span>
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => setMgrModal({ open: true, manager: mgr })}><Eye className="h-3 w-3 mr-1" />Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={showOrgChart} onOpenChange={setShowOrgChart}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Organization Chart</DialogTitle>
            <DialogDescription>
              Visualize reporting relationships, organizational hierarchy, and role structure across the organization.
            </DialogDescription>
          </DialogHeader>
          <OrganizationChart />
        </DialogContent>
      </Dialog>

      <KpiDrilldownModal
        open={kpiModal.open}
        onOpenChange={(v) => setKpiModal(prev => ({ ...prev, open: v }))}
        title={kpiModal.title}
        description={`Drill-down for ${kpiModal.title}`}
        items={kpiModal.items}
        columns={[{ key: 'name', label: 'Manager' }, { key: 'detail', label: 'Detail' }, { key: 'risk', label: 'Risk' }]}
      />
      <ChartDrilldownModal
        open={chartModal.open}
        onOpenChange={(v) => setChartModal(prev => ({ ...prev, open: v }))}
        title={chartModal.title}
        segmentLabel={chartModal.segmentLabel}
        segmentValue={chartModal.segmentValue}
        items={chartModal.items}
      />
      <ManagerDetailModal
        open={mgrModal.open}
        onOpenChange={(v) => setMgrModal(prev => ({ ...prev, open: v }))}
        manager={mgrModal.manager}
      />
    </div>
  );
}
