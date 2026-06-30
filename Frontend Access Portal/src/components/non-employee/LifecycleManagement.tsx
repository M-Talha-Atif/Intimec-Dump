
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { mockUsers } from '@/data/mock-users';
import { transformUserToLifecycle, type LifecycleData } from '@/utils/identityDataTransforms';
import { Play, Pause, CheckCircle, Clock, AlertTriangle, ArrowRight, UserPlus, Shield, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { NonEmployeeKpiDrilldownModal } from './modals/NonEmployeeKpiDrilldownModal';
import { NonEmployeeChartDrilldownModal } from './modals/NonEmployeeChartDrilldownModal';
import { toast } from "sonner";

const lifecycleStages = [
  { id: 'invite', name: 'Invite', icon: UserPlus, color: 'bg-blue-500', tooltip: 'Non-employees invited but not yet onboarded.' },
  { id: 'approved', name: 'Approved', icon: CheckCircle, color: 'bg-green-500', tooltip: 'Sponsor-approved non-employees pending provisioning.' },
  { id: 'provisioned', name: 'Provisioned', icon: Shield, color: 'bg-purple-500', tooltip: 'Access provisioned, pending first login.' },
  { id: 'active', name: 'Active', icon: Play, color: 'bg-emerald-500', tooltip: 'Non-employees with recent activity within contract period.' },
  { id: 'expiring', name: 'Expiring', icon: Clock, color: 'bg-orange-500', tooltip: 'Contracts expiring within 30 days. Requires renewal decision.' },
  { id: 'disabled', name: 'Disabled', icon: Pause, color: 'bg-gray-500', tooltip: 'Access suspended pending review or contract renewal.' },
  { id: 'terminated', name: 'Terminated', icon: XCircle, color: 'bg-red-500', tooltip: 'Fully offboarded. Access removed and audit trail closed.' }
];

const stageDistribution = [
  { name: 'Invite', value: 5, color: '#3b82f6' },
  { name: 'Approved', value: 8, color: '#10b981' },
  { name: 'Provisioned', value: 3, color: '#8b5cf6' },
  { name: 'Active', value: 45, color: '#059669' },
  { name: 'Expiring', value: 12, color: '#f97316' },
  { name: 'Disabled', value: 4, color: '#6b7280' },
  { name: 'Terminated', value: 8, color: '#ef4444' }
];

const trendData = [
  { month: 'Jan', onboarded: 8, offboarded: 3, active: 72 },
  { month: 'Feb', onboarded: 12, offboarded: 5, active: 79 },
  { month: 'Mar', onboarded: 6, offboarded: 8, active: 77 },
  { month: 'Apr', onboarded: 15, offboarded: 4, active: 88 },
  { month: 'May', onboarded: 9, offboarded: 7, active: 85 },
  { month: 'Jun', onboarded: 11, offboarded: 6, active: 85 }
];

export function LifecycleManagement() {
  const [kpiModal, setKpiModal] = useState<{ open: boolean; label: string; value: string | number }>({ open: false, label: '', value: '' });
  const [chartModal, setChartModal] = useState<{ open: boolean; title: string; name: string; value: number }>({ open: false, title: '', name: '', value: 0 });

  const lifecycleIdentities = useMemo(() => {
    const nonEmployeeUsers = mockUsers.filter(user => 
      user.type === 'Contractor' || user.type === 'Partner' || user.type === 'Service Account'
    );
    return nonEmployeeUsers.map(transformUserToLifecycle);
  }, []);

  const stageStats = useMemo(() => {
    const stageCounts = lifecycleStages.reduce((acc, stage) => {
      acc[stage.id] = lifecycleIdentities.filter(identity => identity.currentStage === stage.id).length;
      return acc;
    }, {} as Record<string, number>);
    return lifecycleStages.map(stage => ({ ...stage, count: stageCounts[stage.id] || 0 }));
  }, [lifecycleIdentities]);

  const getStageInfo = (stageId: string) => lifecycleStages.find(s => s.id === stageId) || lifecycleStages[0];

  return (
    <div className="space-y-6">
      {/* Stage Cards */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
        {stageStats.map((stage) => (
          <Card key={stage.id} className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setKpiModal({ open: true, label: stage.name, value: stage.count })}>
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-between mb-1">
                <div className={`w-8 h-8 ${stage.color} rounded-full flex items-center justify-center`}>
                  <stage.icon className="h-4 w-4 text-white" />
                </div>
                <InfoTooltip text={stage.tooltip} />
              </div>
              <div className="text-sm font-medium">{stage.name}</div>
              <div className="text-xs text-muted-foreground">{stage.count} identities</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Stage Distribution</CardTitle>
              <InfoTooltip text="Current lifecycle stage distribution. Click segments for drill-down." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={stageDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  onClick={(data) => data && setChartModal({ open: true, title: "Stage Distribution", name: data.name, value: data.value })}>
                  {stageDistribution.map((entry, index) => (<Cell key={index} fill={entry.color} className="cursor-pointer" />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Lifecycle Trend</CardTitle>
              <InfoTooltip text="Monthly onboarding, offboarding, and active non-employee counts." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend />
                <Bar dataKey="onboarded" fill="#10b981" name="Onboarded" />
                <Bar dataKey="offboarded" fill="#ef4444" name="Offboarded" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Active Lifecycle Tracking */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Active Lifecycle Tracking</CardTitle>
            <InfoTooltip text="Non-employees with active lifecycle events. Click to review progress." />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lifecycleIdentities.slice(0, 5).map((item) => {
              const stageInfo = getStageInfo(item.currentStage);
              return (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-muted/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${stageInfo.color} rounded-full flex items-center justify-center`}>
                        <stageInfo.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{stageInfo.name}</Badge>
                      {item.automationEnabled && <Badge className="bg-green-100 text-green-800">Automated</Badge>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span><span>{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Next: {item.nextAction}</div>
                        <div className="text-xs text-muted-foreground">{item.daysInStage} days in stage</div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => toast.info(`Advancing ${item.name}`)}>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <NonEmployeeKpiDrilldownModal open={kpiModal.open} onOpenChange={(o) => setKpiModal(p => ({ ...p, open: o }))} kpiLabel={kpiModal.label} kpiValue={kpiModal.value} />
      <NonEmployeeChartDrilldownModal open={chartModal.open} onOpenChange={(o) => setChartModal(p => ({ ...p, open: o }))} chartTitle={chartModal.title} segmentName={chartModal.name} segmentValue={chartModal.value} />
    </div>
  );
}
