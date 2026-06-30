
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, XCircle, Clock, Shield, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { KpiDrilldownModal, KpiDrilldownItem } from './modals/KpiDrilldownModal';
import { ChartDrilldownModal, ChartDrilldownItem } from './modals/ChartDrilldownModal';
import { RiskInvestigationModal } from './modals/RiskInvestigationModal';

const riskBySeverity = [
  { name: 'Critical', value: 8 },
  { name: 'High', value: 15 },
  { name: 'Medium', value: 34 },
  { name: 'Low', value: 89 },
];
const SEVERITY_COLORS = ['hsl(0, 84%, 45%)', 'hsl(0, 84%, 60%)', 'hsl(38, 92%, 50%)', 'hsl(142, 71%, 45%)'];

const accessTypeBreakdown = [
  { name: 'Privileged', value: 156 },
  { name: 'Standard', value: 892 },
  { name: 'Dormant', value: 89 },
];
const ACCESS_COLORS = ['hsl(262, 83%, 58%)', 'hsl(221, 83%, 53%)', 'hsl(38, 92%, 50%)'];

const riskItems = [
  { identity: 'John Doe', type: 'SoD Violation', detail: 'Create + Approve Purchase Order', severity: 'High', department: 'Finance' },
  { identity: 'Charlie Davis', type: 'Anomaly', detail: 'Off-hours admin activity at 2:30 AM', severity: 'Critical', department: 'Sales' },
  { identity: 'Sarah Johnson', type: 'SoD Violation', detail: 'User Management + Security Admin', severity: 'Medium', department: 'Engineering' },
  { identity: 'Diana Prince', type: 'Anomaly', detail: 'Unusual location access (London vs New York)', severity: 'Medium', department: 'HR' },
  { identity: 'Orphaned Account', type: 'Excessive Access', detail: 'Active admin on legacy server, no owner', severity: 'Critical', department: 'Unknown' },
];

const kpiCards = [
  { title: 'High Risk Identities', value: '23', icon: AlertTriangle, color: 'text-destructive', trend: '+4', trendDir: 'up' as const, tooltip: 'Identities with elevated risk scores. Click to drill down.' },
  { title: 'SoD Violations', value: '15', icon: XCircle, color: 'text-orange-600', trend: '+2', trendDir: 'up' as const, tooltip: 'Active Segregation of Duty conflicts. Click to see all violations.' },
  { title: 'Dormant Access', value: '89', icon: Clock, color: 'text-yellow-600', trend: '-12', trendDir: 'down' as const, tooltip: 'Entitlements not used in 90+ days. Click to review.' },
  { title: 'Privileged Users', value: '156', icon: Shield, color: 'text-purple-600', trend: '+8', trendDir: 'up' as const, tooltip: 'Users with admin privileges. Click to see list.' },
];

const mockKpiData: Record<string, KpiDrilldownItem[]> = {
  'High Risk Identities': Array.from({ length: 23 }, (_, i) => ({ name: `Risk User ${i + 1}`, department: ['Finance', 'Engineering', 'Sales', 'HR'][i % 4], risk: i < 8 ? 'Critical' : 'High', type: 'Employee' })),
  'SoD Violations': Array.from({ length: 15 }, (_, i) => ({ name: `SoD User ${i + 1}`, department: ['Finance', 'Engineering'][i % 2], risk: i < 5 ? 'High' : 'Medium', detail: 'Conflicting permissions detected', type: 'SoD Violation' })),
  'Dormant Access': Array.from({ length: 20 }, (_, i) => ({ name: `Dormant Account ${i + 1}`, department: ['Engineering', 'Marketing', 'Sales'][i % 3], risk: 'Low', detail: `Last used ${90 + i * 5} days ago`, type: 'Employee' })),
  'Privileged Users': Array.from({ length: 20 }, (_, i) => ({ name: `Priv User ${i + 1}`, department: ['IT', 'Engineering', 'Security'][i % 3], risk: i < 5 ? 'High' : 'Medium', type: 'Employee' })),
};

export function AccessRiskManagement() {
  const [kpiModal, setKpiModal] = useState<{ open: boolean; title: string; items: KpiDrilldownItem[] }>({ open: false, title: '', items: [] });
  const [chartModal, setChartModal] = useState<{ open: boolean; title: string; segmentLabel: string; segmentValue: number; items: ChartDrilldownItem[] }>({ open: false, title: '', segmentLabel: '', segmentValue: 0, items: [] });
  const [riskModal, setRiskModal] = useState<{ open: boolean; item: typeof riskItems[0] | null }>({ open: false, item: null });

  const handleKpiClick = (title: string) => {
    setKpiModal({ open: true, title, items: mockKpiData[title] || [] });
  };

  const handleSeverityPieClick = (_: any, index: number) => {
    const seg = riskBySeverity[index];
    if (!seg) return;
    const items: ChartDrilldownItem[] = Array.from({ length: seg.value }, (_, i) => ({
      name: `${seg.name} Risk ${i + 1}`, department: ['Finance', 'Engineering', 'Sales', 'HR'][i % 4], risk: seg.name, type: 'Employee',
    }));
    setChartModal({ open: true, title: `Risk Distribution — ${seg.name}`, segmentLabel: seg.name, segmentValue: seg.value, items });
  };

  const handleAccessPieClick = (_: any, index: number) => {
    const seg = accessTypeBreakdown[index];
    if (!seg) return;
    const items: ChartDrilldownItem[] = Array.from({ length: Math.min(seg.value, 20) }, (_, i) => ({
      name: `${seg.name} User ${i + 1}`, department: ['IT', 'Engineering', 'Finance'][i % 3], type: seg.name, risk: seg.name === 'Privileged' ? 'High' : seg.name === 'Dormant' ? 'Medium' : 'Low',
    }));
    setChartModal({ open: true, title: `Access Type — ${seg.name}`, segmentLabel: seg.name, segmentValue: seg.value, items });
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trendDir === 'up' ? TrendingUp : TrendingDown;
          const isNegative = (kpi.title === 'High Risk Identities' || kpi.title === 'SoD Violations' || kpi.title === 'Privileged Users') ? kpi.trendDir === 'up' : kpi.trendDir === 'down';
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
              Risk Distribution by Severity
              <InfoTooltip text="Click a segment to drill down into identities at that severity level." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={riskBySeverity} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}
                  onClick={handleSeverityPieClick} className="cursor-pointer">
                  {riskBySeverity.map((_, i) => <Cell key={i} fill={SEVERITY_COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              Access Type Breakdown
              <InfoTooltip text="Click a segment to see accounts of that access type." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={accessTypeBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}
                  onClick={handleAccessPieClick} className="cursor-pointer">
                  {accessTypeBreakdown.map((_, i) => <Cell key={i} fill={ACCESS_COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Risk Items Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-1">
            Top Risk Items
            <InfoTooltip text="Click Investigate to open the risk investigation panel with remediation actions." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Identity</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Detail</th>
                  <th className="pb-2 font-medium">Severity</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {riskItems.map((item, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3 font-medium">{item.identity}</td>
                    <td className="py-3"><Badge variant="outline" className="text-xs">{item.type}</Badge></td>
                    <td className="py-3 text-muted-foreground text-xs max-w-[250px] truncate">{item.detail}</td>
                    <td className="py-3">
                      <Badge className={
                        item.severity === 'Critical' ? 'bg-red-900/10 text-red-900 border-red-900/20' :
                        item.severity === 'High' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                        'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }>{item.severity}</Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => setRiskModal({ open: true, item })}><Eye className="h-3 w-3 mr-1" />Investigate</Button>
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
        description={`All ${kpiModal.title.toLowerCase()}`}
        items={kpiModal.items}
      />
      <ChartDrilldownModal
        open={chartModal.open}
        onOpenChange={(v) => setChartModal(prev => ({ ...prev, open: v }))}
        title={chartModal.title}
        segmentLabel={chartModal.segmentLabel}
        segmentValue={chartModal.segmentValue}
        items={chartModal.items}
      />
      <RiskInvestigationModal
        open={riskModal.open}
        onOpenChange={(v) => setRiskModal(prev => ({ ...prev, open: v }))}
        item={riskModal.item}
      />
    </div>
  );
}
