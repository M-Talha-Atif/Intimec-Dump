
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, Clock, RefreshCw, AlertTriangle, CheckCircle, Calendar, Eye, RotateCcw, Trash2, Archive
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { NhiKpiDrilldownModal } from './modals/NhiKpiDrilldownModal';
import { NhiChartDrilldownModal } from './modals/NhiChartDrilldownModal';
import { toast } from "sonner";

const lifecycleStages = [
  { stage: 'Created', count: 234, color: '#3b82f6', description: 'Recently provisioned', tooltip: 'NHIs provisioned within the last 30 days awaiting activation or assignment.' },
  { stage: 'Active', count: 1456, color: '#10b981', description: 'In regular use', tooltip: 'NHIs with usage activity within the defined dormancy threshold (30 days).' },
  { stage: 'Dormant', count: 187, color: '#f59e0b', description: 'Unused for 30+ days', tooltip: 'NHIs with no recorded activity for over 30 days. Candidates for review or decommissioning.' },
  { stage: 'Orphaned', count: 45, color: '#ef4444', description: 'Owner departed', tooltip: 'NHIs whose designated owner has left the organization. Require immediate reassignment.' },
  { stage: 'Decommissioned', count: 123, color: '#6b7280', description: 'Scheduled for removal', tooltip: 'NHIs marked for deletion pending final access review and cleanup.' }
];

const rotationData = [
  { month: 'Jan', successful: 245, failed: 12, overdue: 23 },
  { month: 'Feb', successful: 267, failed: 8, overdue: 31 },
  { month: 'Mar', successful: 289, failed: 15, overdue: 28 },
  { month: 'Apr', successful: 234, failed: 9, overdue: 35 },
  { month: 'May', successful: 312, failed: 11, overdue: 24 },
  { month: 'Jun', successful: 298, failed: 7, overdue: 29 }
];

const expiringNHIs = [
  { id: 'nhi_001', name: 'prod-db-service', type: 'Service Account', daysLeft: 7, owner: 'Platform Team', riskLevel: 'High' },
  { id: 'nhi_002', name: 'github-deploy-key', type: 'SSH Key', daysLeft: 14, owner: 'DevOps Team', riskLevel: 'Medium' },
  { id: 'nhi_003', name: 'azure-app-cert', type: 'Certificate', daysLeft: 21, owner: 'Security Team', riskLevel: 'Low' },
  { id: 'nhi_004', name: 'backup-s3-token', type: 'API Token', daysLeft: 3, owner: 'Infrastructure Team', riskLevel: 'Critical' }
];

const dormantNHIs = [
  { id: 'nhi_005', name: 'old-monitoring-sa', type: 'Service Account', lastUsed: '89 days ago', owner: 'Former Employee', action: 'Decommission' },
  { id: 'nhi_006', name: 'staging-api-key', type: 'API Key', lastUsed: '156 days ago', owner: 'QA Team', action: 'Review' },
  { id: 'nhi_007', name: 'temp-cert-dev', type: 'Certificate', lastUsed: '234 days ago', owner: 'Unknown', action: 'Immediate Review' }
];

export function LifecycleManagement() {
  const [kpiModal, setKpiModal] = useState<{ open: boolean; label: string; value: string }>({ open: false, label: '', value: '' });
  const [chartModal, setChartModal] = useState<{ open: boolean; title: string; name: string; value: number }>({ open: false, title: '', name: '', value: 0 });

  return (
    <div className="space-y-6">
      {/* Lifecycle Stage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {lifecycleStages.map((stage, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setKpiModal({ open: true, label: stage.stage, value: String(stage.count) })}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-slate-600">{stage.stage}</p>
                <InfoTooltip text={stage.tooltip} />
              </div>
              <p className="text-2xl font-bold" style={{ color: stage.color }}>{stage.count}</p>
              <p className="text-xs text-slate-500 mt-1">{stage.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Flattened: Lifecycle Distribution + Rotation Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Lifecycle Distribution</CardTitle>
              <InfoTooltip text="Current state distribution of all NHIs. Click segments for drill-down." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={lifecycleStages} cx="50%" cy="50%" outerRadius={80} dataKey="count"
                  label={({ stage, count }) => `${stage}: ${count}`}
                  onClick={(data) => data && setChartModal({ open: true, title: "Lifecycle Distribution", name: data.stage, value: data.count })}>
                  {lifecycleStages.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} className="cursor-pointer" />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Credential Rotation Trends</CardTitle>
              <InfoTooltip text="Monthly credential rotation performance. Track success, failures, and overdue rotations." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rotationData}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend />
                <Bar dataKey="successful" fill="#10b981" name="Successful" />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                <Bar dataKey="overdue" fill="#f59e0b" name="Overdue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Expiry Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>Expiry Alerts</span>
            </CardTitle>
            <InfoTooltip text="NHIs approaching expiration dates requiring rotation or renewal." />
          </div>
          <CardDescription>{expiringNHIs.length} NHIs approaching expiration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expiringNHIs.map((nhi) => (
              <div key={nhi.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    nhi.riskLevel === 'Critical' ? 'bg-red-500' : nhi.riskLevel === 'High' ? 'bg-orange-500' : nhi.riskLevel === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <p className="font-medium">{nhi.name}</p>
                    <p className="text-sm text-slate-600">{nhi.type} • {nhi.owner}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium">{nhi.daysLeft} days left</p>
                    <Badge variant={nhi.riskLevel === 'Critical' ? 'destructive' : 'secondary'}>{nhi.riskLevel}</Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => toast.success(`Rotation initiated for ${nhi.name}`)}><RotateCcw className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => toast.info(`Expiry extended for ${nhi.name}`)}><Calendar className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dormant NHIs */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <span>Dormant & Orphaned NHIs</span>
            </CardTitle>
            <InfoTooltip text="Unused credentials requiring attention. Consider archiving or decommissioning." />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dormantNHIs.map((nhi) => (
              <div key={nhi.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center space-x-4">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">{nhi.name}</p>
                    <p className="text-sm text-slate-600">{nhi.type} • {nhi.owner}</p>
                    <p className="text-xs text-slate-500">Last used: {nhi.lastUsed}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">{nhi.action}</Badge>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => toast.info(`Review opened for ${nhi.name}`)}><Eye className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => toast.success(`${nhi.name} archived`)}><Archive className="h-4 w-4" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => toast.success(`${nhi.name} decommissioned`)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <NhiKpiDrilldownModal open={kpiModal.open} onOpenChange={(o) => setKpiModal(p => ({ ...p, open: o }))} kpiLabel={kpiModal.label} kpiValue={kpiModal.value} />
      <NhiChartDrilldownModal open={chartModal.open} onOpenChange={(o) => setChartModal(p => ({ ...p, open: o }))} chartTitle={chartModal.title} segmentName={chartModal.name} segmentValue={chartModal.value} />
    </div>
  );
}
