
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, Bot, Key, AlertTriangle, Clock, 
  TrendingUp, TrendingDown, RefreshCw, Eye, AlertCircle, XCircle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { NhiKpiDrilldownModal } from './modals/NhiKpiDrilldownModal';
import { NhiChartDrilldownModal } from './modals/NhiChartDrilldownModal';
import { NhiRiskInvestigationModal } from './modals/NhiRiskInvestigationModal';

const kpiData = [
  { label: "Total NHIs", value: "1,847", trend: "+127", color: "text-blue-600", icon: Bot, tooltip: "Total count of all non-human identities including service accounts, API keys, certificates, and OAuth tokens across all providers." },
  { label: "Dormant NHIs", value: "234", trend: "+18", color: "text-orange-600", icon: Clock, tooltip: "NHIs that haven't been used in over 30 days. These represent potential security risk and should be reviewed for decommissioning." },
  { label: "Long-lived Credentials", value: "89", trend: "-5", color: "text-red-600", icon: Key, tooltip: "Credentials that haven't been rotated within the defined rotation policy window (default: 90 days)." },
  { label: "Exposed Secrets", value: "12", trend: "-3", color: "text-red-600", icon: AlertTriangle, tooltip: "Secrets detected in code repositories, logs, or configuration files that need immediate remediation." },
  { label: "Orphaned NHIs", value: "67", trend: "+4", color: "text-yellow-600", icon: AlertCircle, tooltip: "NHIs whose designated owner has left the organization or the owning team has been dissolved." },
  { label: "Risk Score", value: "7.2", trend: "-0.3", color: "text-green-600", icon: Shield, tooltip: "Aggregate risk score (1-10) calculated from dormancy, privilege level, rotation compliance, and exposure factors." }
];

const typeDistribution = [
  { name: 'Service Accounts', value: 687, color: '#8884d8' },
  { name: 'API Keys', value: 423, color: '#82ca9d' },
  { name: 'Certificates', value: 298, color: '#ffc658' },
  { name: 'Secrets', value: 234, color: '#ff7300' },
  { name: 'OAuth Tokens', value: 205, color: '#8dd1e1' }
];

const providerDistribution = [
  { name: 'Azure AD', value: 567 },
  { name: 'AWS IAM', value: 423 },
  { name: 'GCP', value: 298 },
  { name: 'GitHub', value: 234 },
  { name: 'Kubernetes', value: 189 },
  { name: 'Other', value: 136 }
];

const riskTrendData = [
  { month: 'Jan', risk: 8.5, violations: 45 },
  { month: 'Feb', risk: 8.2, violations: 42 },
  { month: 'Mar', risk: 7.9, violations: 38 },
  { month: 'Apr', risk: 7.6, violations: 35 },
  { month: 'May', risk: 7.4, violations: 31 },
  { month: 'Jun', risk: 7.2, violations: 28 }
];

const lifecycleTrendData = [
  { month: 'Jan', created: 45, decommissioned: 23 },
  { month: 'Feb', created: 52, decommissioned: 28 },
  { month: 'Mar', created: 38, decommissioned: 31 },
  { month: 'Apr', created: 61, decommissioned: 25 },
  { month: 'May', created: 47, decommissioned: 34 },
  { month: 'Jun', created: 53, decommissioned: 29 }
];

const topRiskyNHIs = [
  { name: 'prod-db-service', type: 'Service Account', riskScore: 9.2, owner: 'Platform Team', lastUsed: '45 days ago' },
  { name: 'legacy-api-key', type: 'API Key', riskScore: 8.8, owner: 'Unassigned', lastUsed: '67 days ago' },
  { name: 'admin-token-prod', type: 'OAuth Token', riskScore: 8.5, owner: 'DevOps Team', lastUsed: '12 days ago' },
  { name: 'backup-service-cert', type: 'Certificate', riskScore: 8.1, owner: 'Infrastructure', lastUsed: '89 days ago' }
];

const violationsByType = [
  { type: 'Dormant Credentials', count: 234, severity: 'Medium' },
  { type: 'Overprivileged Access', count: 89, severity: 'High' },
  { type: 'Expired Certificates', count: 67, severity: 'Critical' },
  { type: 'Orphaned Accounts', count: 45, severity: 'Medium' },
  { type: 'Weak Secrets', count: 23, severity: 'High' }
];

export function IdentityCenter() {
  const [timeRange, setTimeRange] = useState('6m');
  const [kpiModal, setKpiModal] = useState<{ open: boolean; label: string; value: string }>({ open: false, label: '', value: '' });
  const [chartModal, setChartModal] = useState<{ open: boolean; title: string; name: string; value: number }>({ open: false, title: '', name: '', value: 0 });
  const [riskModal, setRiskModal] = useState<{ open: boolean; item: any }>({ open: false, item: null });

  const handlePieClick = (data: any, chartTitle: string) => {
    if (data) setChartModal({ open: true, title: chartTitle, name: data.name, value: data.value });
  };

  const handleBarClick = (data: any, chartTitle: string) => {
    if (data?.activePayload?.[0]) {
      const payload = data.activePayload[0].payload;
      setChartModal({ open: true, title: chartTitle, name: payload.name || payload.month, value: payload.value || payload.created || 0 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Non-Human Identity Center</h2>
          <p className="text-slate-600">Comprehensive view of service accounts, APIs, and machine identities</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-1" />Refresh</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setKpiModal({ open: true, label: kpi.label, value: kpi.value })}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-slate-600">{kpi.label}</p>
                <InfoTooltip text={kpi.tooltip} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
                <div className="flex flex-col items-center space-y-1">
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  <Badge variant="secondary" className={`text-xs ${kpi.color}`}>{kpi.trend}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>NHI Distribution by Type</CardTitle>
              <InfoTooltip text="Breakdown of non-human identities by category. Click a segment to drill down." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={typeDistribution} cx="50%" cy="50%" labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80} dataKey="value"
                  onClick={(data) => handlePieClick(data, "NHI Distribution by Type")}>
                  {typeDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} className="cursor-pointer" />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>NHI Distribution by Provider</CardTitle>
              <InfoTooltip text="Identity distribution across cloud platforms and tools. Click a bar to see identities from that provider." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={providerDistribution} onClick={(data) => handleBarClick(data, "NHI Distribution by Provider")}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" /><YAxis /><Tooltip />
                <Bar dataKey="value" fill="#8884d8" className="cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Risk Burndown Over Time</CardTitle>
              <InfoTooltip text="Track the aggregate risk score and violation count trend over time." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={riskTrendData} onClick={(data) => handleBarClick(data, "Risk Burndown")}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend />
                <Line type="monotone" dataKey="risk" stroke="#8884d8" name="Risk Score" />
                <Line type="monotone" dataKey="violations" stroke="#82ca9d" name="Violations" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>NHI Lifecycle Trends</CardTitle>
              <InfoTooltip text="Creation vs decommissioning patterns to identify NHI sprawl." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lifecycleTrendData} onClick={(data) => handleBarClick(data, "Lifecycle Trends")}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend />
                <Bar dataKey="created" fill="#82ca9d" name="Created" className="cursor-pointer" />
                <Bar dataKey="decommissioned" fill="#ffc658" name="Decommissioned" className="cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Risk & Violations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Top Identities at Risk</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topRiskyNHIs.map((nhi, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{nhi.name}</span>
                      <Badge variant="outline">{nhi.type}</Badge>
                    </div>
                    <div className="text-sm text-slate-600 mt-1">Owner: {nhi.owner} • Last used: {nhi.lastUsed}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="destructive">{nhi.riskScore}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => setRiskModal({ open: true, item: { name: nhi.name, type: nhi.type, owner: nhi.owner, severity: nhi.riskScore >= 9 ? 'Critical' : 'High' } })}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-orange-500" />
              <span>Unresolved Violations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {violationsByType.map((violation, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => setRiskModal({ open: true, item: { name: violation.type, type: 'Policy Violation', severity: violation.severity, violation: `${violation.count} ${violation.type.toLowerCase()} violations detected`, owner: 'Multiple Teams' } })}>
                  <div>
                    <span className="font-medium">{violation.type}</span>
                    <div className="text-sm text-slate-600">{violation.count} violations</div>
                  </div>
                  <Badge variant={violation.severity === 'Critical' || violation.severity === 'High' ? 'destructive' : 'secondary'}>
                    {violation.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <NhiKpiDrilldownModal open={kpiModal.open} onOpenChange={(o) => setKpiModal(p => ({ ...p, open: o }))} kpiLabel={kpiModal.label} kpiValue={kpiModal.value} />
      <NhiChartDrilldownModal open={chartModal.open} onOpenChange={(o) => setChartModal(p => ({ ...p, open: o }))} chartTitle={chartModal.title} segmentName={chartModal.name} segmentValue={chartModal.value} />
      <NhiRiskInvestigationModal open={riskModal.open} onOpenChange={(o) => setRiskModal(p => ({ ...p, open: o }))} item={riskModal.item} />
    </div>
  );
}
