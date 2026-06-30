
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Eye, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { NhiKpiDrilldownModal } from './modals/NhiKpiDrilldownModal';
import { NhiChartDrilldownModal } from './modals/NhiChartDrilldownModal';
import { NhiRiskInvestigationModal } from './modals/NhiRiskInvestigationModal';

const riskSummary = [
  { category: 'High Privilege', count: 89, trend: '+12', color: '#ef4444', tooltip: 'NHIs with admin or owner-level permissions exceeding least-privilege requirements.' },
  { category: 'SoD Violations', count: 23, trend: '-5', color: '#f59e0b', tooltip: 'NHIs with conflicting access that violates separation of duties policies.' },
  { category: 'Overused', count: 156, trend: '+8', color: '#8b5cf6', tooltip: 'NHIs accessed by more users/services than their intended scope allows.' },
  { category: 'Unrotated', count: 67, trend: '+15', color: '#f97316', tooltip: 'Credentials past their rotation deadline without being refreshed.' }
];

const sodViolations = [
  { id: 'sod_001', nhi: 'multi-env-service', type: 'Service Account', violation: 'Dev + Prod Access', severity: 'Critical', owner: 'Platform Team', environments: ['Development', 'Production'] },
  { id: 'sod_002', nhi: 'admin-token', type: 'API Token', violation: 'Admin + Finance Access', severity: 'High', owner: 'Finance Team', environments: ['Admin', 'Financial Systems'] },
  { id: 'sod_003', nhi: 'backup-cert', type: 'Certificate', violation: 'Backup + Security Access', severity: 'Medium', owner: 'Backup Team', environments: ['Backup Systems', 'Security Tools'] }
];

const privilegeData = [
  { privilege: 'Read', count: 1245, color: '#3b82f6' },
  { privilege: 'Write', count: 678, color: '#10b981' },
  { privilege: 'Admin', count: 234, color: '#f59e0b' },
  { privilege: 'Owner', count: 89, color: '#ef4444' }
];

const riskByOwner = [
  { owner: 'Platform Team', high: 12, medium: 23, low: 45 },
  { owner: 'DevOps Team', high: 8, medium: 19, low: 67 },
  { owner: 'Security Team', high: 3, medium: 15, low: 89 },
  { owner: 'Finance Team', high: 15, medium: 12, low: 23 }
];

export function AccessRiskManagement() {
  const [kpiModal, setKpiModal] = useState<{ open: boolean; label: string; value: string }>({ open: false, label: '', value: '' });
  const [chartModal, setChartModal] = useState<{ open: boolean; title: string; name: string; value: number }>({ open: false, title: '', name: '', value: 0 });
  const [riskModal, setRiskModal] = useState<{ open: boolean; item: any }>({ open: false, item: null });

  return (
    <div className="space-y-6">
      {/* Risk Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {riskSummary.map((risk, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setKpiModal({ open: true, label: risk.category, value: String(risk.count) })}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-slate-600">{risk.category}</p>
                <InfoTooltip text={risk.tooltip} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold" style={{ color: risk.color }}>{risk.count}</p>
                <div className="flex flex-col items-center space-y-1">
                  <Shield className="h-6 w-6" style={{ color: risk.color }} />
                  <Badge variant="secondary" className="text-xs">{risk.trend}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts — flattened from tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Privilege Distribution</CardTitle>
              <InfoTooltip text="NHI access levels. Click segments to see identities at each privilege level." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={privilegeData} cx="50%" cy="50%" outerRadius={80} dataKey="count"
                  label={({ privilege, count }) => `${privilege}: ${count}`}
                  onClick={(data) => data && setChartModal({ open: true, title: "Privilege Distribution", name: data.privilege, value: data.count })}>
                  {privilegeData.map((entry, index) => (<Cell key={index} fill={entry.color} className="cursor-pointer" />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Risk by Owner Team</CardTitle>
              <InfoTooltip text="Risk distribution across ownership. Click bars to investigate team risk profile." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskByOwner} onClick={(data) => {
                if (data?.activePayload?.[0]) {
                  const p = data.activePayload[0].payload;
                  setChartModal({ open: true, title: "Risk by Owner", name: p.owner, value: p.high + p.medium + p.low });
                }
              }}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="owner" /><YAxis /><Tooltip /><Legend />
                <Bar dataKey="high" fill="#ef4444" name="High Risk" className="cursor-pointer" />
                <Bar dataKey="medium" fill="#f59e0b" name="Medium Risk" />
                <Bar dataKey="low" fill="#10b981" name="Low Risk" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* SoD Violations — inline */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>Segregation of Duties Violations</span>
            </CardTitle>
            <InfoTooltip text="NHIs with conflicting access permissions that violate SoD policies." />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sodViolations.map((violation) => (
              <div key={violation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    violation.severity === 'Critical' ? 'bg-red-500' : violation.severity === 'High' ? 'bg-orange-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <p className="font-medium">{violation.nhi}</p>
                    <p className="text-sm text-slate-600">{violation.type} • {violation.owner}</p>
                    <p className="text-xs text-slate-500">{violation.violation}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <Badge variant={violation.severity === 'Critical' ? 'destructive' : 'secondary'}>{violation.severity}</Badge>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {violation.environments.map((env, i) => (<Badge key={i} variant="outline" className="text-xs">{env}</Badge>))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setRiskModal({ open: true, item: violation })}><Eye className="h-4 w-4" /></Button>
                    <Button size="sm" onClick={() => setRiskModal({ open: true, item: violation })}><Target className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <NhiKpiDrilldownModal open={kpiModal.open} onOpenChange={(o) => setKpiModal(p => ({ ...p, open: o }))} kpiLabel={kpiModal.label} kpiValue={kpiModal.value} />
      <NhiChartDrilldownModal open={chartModal.open} onOpenChange={(o) => setChartModal(p => ({ ...p, open: o }))} chartTitle={chartModal.title} segmentName={chartModal.name} segmentValue={chartModal.value} />
      <NhiRiskInvestigationModal open={riskModal.open} onOpenChange={(o) => setRiskModal(p => ({ ...p, open: o }))} item={riskModal.item} />
    </div>
  );
}
