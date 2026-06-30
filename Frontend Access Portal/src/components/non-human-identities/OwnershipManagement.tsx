
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, AlertTriangle, Shield, Eye, Edit } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { NhiKpiDrilldownModal } from './modals/NhiKpiDrilldownModal';
import { NhiChartDrilldownModal } from './modals/NhiChartDrilldownModal';
import { OwnerDetailModal } from './modals/OwnerDetailModal';

const ownershipData = [
  { team: 'Platform Team', count: 567, risk: 7.2 },
  { team: 'DevOps Team', count: 423, risk: 6.8 },
  { team: 'Infrastructure', count: 298, risk: 5.9 },
  { team: 'Security Team', count: 234, risk: 4.2 },
  { team: 'Unassigned', count: 325, risk: 9.1 }
];

const riskByOwner = [
  { name: 'Platform Team', value: 567, color: '#8884d8' },
  { name: 'DevOps Team', value: 423, color: '#82ca9d' },
  { name: 'Infrastructure', value: 298, color: '#ffc658' },
  { name: 'Security Team', value: 234, color: '#ff7300' },
  { name: 'Unassigned', value: 325, color: '#8dd1e1' }
];

const kpiCards = [
  { label: "Assigned Owners", value: "1,522", icon: UserCheck, color: "text-green-500", tooltip: "NHIs with a valid, active owner team assigned for accountability and review." },
  { label: "Unassigned", value: "325", icon: AlertTriangle, color: "text-orange-500", tooltip: "NHIs without an assigned owner. These represent governance gaps and should be assigned immediately." },
  { label: "Active Teams", value: "12", icon: Users, color: "text-blue-500", tooltip: "Number of teams actively managing NHIs across the organization." },
  { label: "Avg Risk Score", value: "6.8", icon: Shield, color: "text-purple-500", tooltip: "Average risk score across all owned NHIs. Target below 5.0 for healthy governance posture." }
];

export function OwnershipManagement() {
  const [kpiModal, setKpiModal] = useState<{ open: boolean; label: string; value: string }>({ open: false, label: '', value: '' });
  const [chartModal, setChartModal] = useState<{ open: boolean; title: string; name: string; value: number }>({ open: false, title: '', name: '', value: 0 });
  const [ownerModal, setOwnerModal] = useState<{ open: boolean; owner: any }>({ open: false, owner: null });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setKpiModal({ open: true, label: kpi.label, value: kpi.value })}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-slate-600">{kpi.label}</p>
                <InfoTooltip text={kpi.tooltip} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{kpi.value}</p>
                <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>NHI Distribution by Owner</CardTitle>
              <InfoTooltip text="Ownership breakdown across teams. Click segments to view team NHI portfolio." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={riskByOwner} cx="50%" cy="50%" labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80} dataKey="value"
                  onClick={(data) => data && setChartModal({ open: true, title: "NHI by Owner", name: data.name, value: data.value })}>
                  {riskByOwner.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} className="cursor-pointer" />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Risk Score by Owner</CardTitle>
              <InfoTooltip text="Team risk assessment. Higher scores indicate more unmanaged or risky NHIs under ownership." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ownershipData} onClick={(data) => {
                if (data?.activePayload?.[0]) {
                  const p = data.activePayload[0].payload;
                  setOwnerModal({ open: true, owner: p });
                }
              }}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="team" /><YAxis /><Tooltip />
                <Bar dataKey="risk" fill="#8884d8" name="Risk Score" className="cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Owner Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Owner Details</CardTitle>
            <InfoTooltip text="Detailed ownership accountability view. Click a team for full portfolio drill-down." />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Team/Owner</th>
                  <th className="text-left p-3">NHI Count</th>
                  <th className="text-left p-3">Risk Score</th>
                  <th className="text-left p-3">High Risk NHIs</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ownershipData.map((owner, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => setOwnerModal({ open: true, owner })}>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{owner.team}</span>
                      </div>
                    </td>
                    <td className="p-3">{owner.count}</td>
                    <td className="p-3">
                      <Badge variant={owner.risk > 8 ? 'destructive' : owner.risk > 6 ? 'secondary' : 'default'}>{owner.risk}</Badge>
                    </td>
                    <td className="p-3">{Math.floor(owner.count * (owner.risk / 10) * 0.1)}</td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setOwnerModal({ open: true, owner }); }}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <NhiKpiDrilldownModal open={kpiModal.open} onOpenChange={(o) => setKpiModal(p => ({ ...p, open: o }))} kpiLabel={kpiModal.label} kpiValue={kpiModal.value} />
      <NhiChartDrilldownModal open={chartModal.open} onOpenChange={(o) => setChartModal(p => ({ ...p, open: o }))} chartTitle={chartModal.title} segmentName={chartModal.name} segmentValue={chartModal.value} />
      <OwnerDetailModal open={ownerModal.open} onOpenChange={(o) => setOwnerModal(p => ({ ...p, open: o }))} owner={ownerModal.owner} />
    </div>
  );
}
