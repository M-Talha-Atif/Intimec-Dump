
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Eye, Ban, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { NonEmployeeKpiDrilldownModal } from './modals/NonEmployeeKpiDrilldownModal';
import { NonEmployeeChartDrilldownModal } from './modals/NonEmployeeChartDrilldownModal';
import { NonEmployeeRiskModal } from './modals/NonEmployeeRiskModal';
import { toast } from "sonner";

const riskMetrics = [
  { label: 'High Risk Identities', value: 7, trend: '+2', color: 'text-red-600', tooltip: 'Non-employees with risk score above 70, requiring immediate governance action.' },
  { label: 'SoD Violations', value: 3, trend: '-1', color: 'text-orange-600', tooltip: 'Conflicting access that violates segregation of duties policies for non-employees.' },
  { label: 'Privileged Access', value: 15, trend: '+5', color: 'text-purple-600', tooltip: 'Non-employees with elevated or administrative access to sensitive systems.' },
  { label: 'Auto-Expiring Access', value: 42, trend: '+8', color: 'text-blue-600', tooltip: 'Access grants with time-bound policies that will auto-expire per policy.' }
];

const riskDistribution = [
  { name: 'Critical', value: 7, color: '#ef4444' },
  { name: 'High', value: 15, color: '#f97316' },
  { name: 'Medium', value: 28, color: '#f59e0b' },
  { name: 'Low', value: 35, color: '#10b981' }
];

const riskByType = [
  { type: 'Contractor', high: 5, medium: 12, low: 18 },
  { type: 'Consultant', high: 3, medium: 8, low: 15 },
  { type: 'Vendor', high: 6, medium: 10, low: 8 },
  { type: 'Intern', high: 1, medium: 3, low: 12 }
];

const accessPolicies = [
  { id: 'pol_1', name: 'Contractor Access Limits', description: 'Contractors cannot request privileged system access', appliesTo: ['Contractor'], violations: 2, status: 'Active' },
  { id: 'pol_2', name: 'Vendor Time Restrictions', description: 'Vendor access expires automatically after 6 months', appliesTo: ['Vendor'], violations: 0, status: 'Active' },
  { id: 'pol_3', name: 'Intern Limited Scope', description: 'Interns restricted to non-production environments', appliesTo: ['Intern'], violations: 1, status: 'Active' }
];

const riskProfiles = [
  { identity: 'David Chen', type: 'Vendor', riskScore: 85, factors: ['Privileged Access', 'Multiple Applications', 'Long Duration'], violations: [{ type: 'SoD', description: 'Has both Create and Approve permissions in Finance system' }], sponsor: 'Carol Wilson' },
  { identity: 'Alex Thompson', type: 'Contractor', riskScore: 72, factors: ['Admin Rights', 'Production Access', 'Remote Location'], violations: [], sponsor: 'Jane Smith' },
  { identity: 'Sarah Kim', type: 'Consultant', riskScore: 68, factors: ['Cross-Department Access', 'Sensitive Data'], violations: [{ type: 'Policy', description: 'Access to HR data without explicit approval' }], sponsor: 'Bob Brown' }
];

export function AccessRiskManagement() {
  const [kpiModal, setKpiModal] = useState<{ open: boolean; label: string; value: string | number }>({ open: false, label: '', value: '' });
  const [chartModal, setChartModal] = useState<{ open: boolean; title: string; name: string; value: number }>({ open: false, title: '', name: '', value: 0 });
  const [riskModal, setRiskModal] = useState<{ open: boolean; item: any }>({ open: false, item: null });

  return (
    <div className="space-y-6">
      {/* Risk KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {riskMetrics.map((metric, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setKpiModal({ open: true, label: metric.label, value: metric.value })}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <InfoTooltip text={metric.tooltip} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{metric.value}</p>
                <div className="flex flex-col items-center">
                  <Shield className={`h-6 w-6 ${metric.color}`} />
                  <Badge variant="secondary" className={metric.color}>{metric.trend}</Badge>
                </div>
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
              <CardTitle>Risk Distribution</CardTitle>
              <InfoTooltip text="Non-employee risk severity distribution. Click segments to drill down." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={riskDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  onClick={(data) => data && setChartModal({ open: true, title: "Risk Distribution", name: data.name, value: data.value })}>
                  {riskDistribution.map((entry, index) => (<Cell key={index} fill={entry.color} className="cursor-pointer" />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Risk by Identity Type</CardTitle>
              <InfoTooltip text="Risk breakdown by non-employee type showing governance gaps per category." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={riskByType}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="type" /><YAxis /><Tooltip /><Legend />
                <Bar dataKey="high" fill="#ef4444" name="High" />
                <Bar dataKey="medium" fill="#f59e0b" name="Medium" />
                <Bar dataKey="low" fill="#10b981" name="Low" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* High Risk Profiles */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>High Risk Profiles</span>
            </CardTitle>
            <InfoTooltip text="Non-employees with elevated risk requiring investigation or remediation." />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskProfiles.map((profile, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-muted/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium">{profile.identity}</div>
                      <div className="text-sm text-muted-foreground">{profile.type} • Sponsor: {profile.sponsor}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-center"><div className="text-lg font-bold text-red-600">{profile.riskScore}</div><div className="text-xs text-muted-foreground">Risk Score</div></div>
                    <Button variant="outline" size="sm" onClick={() => setRiskModal({ open: true, item: profile })}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {profile.factors.map((factor, i) => (<Badge key={i} variant="secondary" className="text-xs">{factor}</Badge>))}
                </div>
                {profile.violations.length > 0 && profile.violations.map((v, i) => (
                  <div key={i} className="text-xs text-red-600 bg-red-50 p-2 rounded"><strong>{v.type}:</strong> {v.description}</div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Access Policies */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Access Control Policies</CardTitle>
            <InfoTooltip text="Active access policies governing non-employee permissions and constraints." />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accessPolicies.map((policy) => (
              <div key={policy.id} className="border rounded-lg p-4 hover:bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <div><div className="font-medium">{policy.name}</div><div className="text-sm text-muted-foreground">{policy.description}</div></div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={policy.violations > 0 ? 'destructive' : 'default'}>{policy.violations} violations</Badge>
                    <Badge variant="default">{policy.status}</Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Applies to:</span>
                  {policy.appliesTo.map((type, i) => (<Badge key={i} variant="outline" className="text-xs">{type}</Badge>))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <NonEmployeeKpiDrilldownModal open={kpiModal.open} onOpenChange={(o) => setKpiModal(p => ({ ...p, open: o }))} kpiLabel={kpiModal.label} kpiValue={kpiModal.value} />
      <NonEmployeeChartDrilldownModal open={chartModal.open} onOpenChange={(o) => setChartModal(p => ({ ...p, open: o }))} chartTitle={chartModal.title} segmentName={chartModal.name} segmentValue={chartModal.value} />
      <NonEmployeeRiskModal open={riskModal.open} onOpenChange={(o) => setRiskModal(p => ({ ...p, open: o }))} item={riskModal.item} />
    </div>
  );
}
