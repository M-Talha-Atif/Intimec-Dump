
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, AlertTriangle, CheckCircle, Clock, Mail, Eye, UserCheck, ArrowRight, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { NonEmployeeKpiDrilldownModal } from './modals/NonEmployeeKpiDrilldownModal';
import { SponsorDetailModal } from './modals/SponsorDetailModal';
import { toast } from "sonner";

const sponsorKpis = [
  { label: "Active Sponsors", value: "23", icon: Users, color: "text-blue-600", tooltip: "Sponsors actively managing non-employee identities with valid assignments." },
  { label: "Pending Reviews", value: "9", icon: Clock, color: "text-orange-600", tooltip: "Sponsor review actions pending completion within SLA window." },
  { label: "Overdue Actions", value: "5", icon: AlertTriangle, color: "text-red-600", tooltip: "Sponsor actions past their due date requiring escalation." },
  { label: "Avg Response Time", value: "2.3d", icon: CheckCircle, color: "text-green-600", tooltip: "Average time for sponsors to complete review actions." }
];

const sponsorPerformance = [
  { name: 'Jane Smith', sponsored: 12, pending: 3, overdue: 0 },
  { name: 'Bob Brown', sponsored: 8, pending: 1, overdue: 1 },
  { name: 'Carol Wilson', sponsored: 15, pending: 5, overdue: 3 },
  { name: 'John Doe', sponsored: 6, pending: 0, overdue: 0 }
];

const sponsorDistribution = [
  { name: 'Engineering', value: 35, color: '#8884d8' },
  { name: 'Marketing', value: 15, color: '#82ca9d' },
  { name: 'Finance', value: 20, color: '#ffc658' },
  { name: 'IT', value: 15, color: '#ff7300' }
];

const mockSponsorData = [
  { id: 'sp_1', name: 'Jane Smith', department: 'Engineering', role: 'Senior Manager', sponsoredCount: 12, pendingReviews: 3, expiringThisMonth: 2, status: 'Active', lastActivity: '2024-06-20', riskLevel: 'Low' },
  { id: 'sp_2', name: 'Bob Brown', department: 'Marketing', role: 'Director', sponsoredCount: 8, pendingReviews: 1, expiringThisMonth: 1, status: 'Active', lastActivity: '2024-06-19', riskLevel: 'Medium' },
  { id: 'sp_3', name: 'Carol Wilson', department: 'Finance', role: 'VP', sponsoredCount: 15, pendingReviews: 5, expiringThisMonth: 4, status: 'Overdue', lastActivity: '2024-06-10', riskLevel: 'High' }
];

const sponsorshipChains = [
  { nonEmployee: 'Alex Thompson', primarySponsor: 'Jane Smith', fallbackSponsor: 'John Doe', relationship: 'Direct Report', validUntil: '2024-12-31', status: 'Valid' },
  { nonEmployee: 'Maria Rodriguez', primarySponsor: 'Bob Brown', fallbackSponsor: 'Alice Johnson', relationship: 'Project Manager', validUntil: '2024-06-30', status: 'Expiring' },
  { nonEmployee: 'David Chen', primarySponsor: 'Carol Wilson', fallbackSponsor: 'N/A', relationship: 'Vendor Contact', validUntil: '2024-08-31', status: 'No Fallback' }
];

const governanceAlerts = [
  { severity: 'high', color: 'border-red-500 bg-red-50', icon: AlertTriangle, iconColor: 'text-red-500', title: 'High Priority', message: 'Carol Wilson has 5 pending sponsor reviews overdue by more than 7 days.', action: 'Take Action' },
  { severity: 'medium', color: 'border-orange-500 bg-orange-50', icon: Clock, iconColor: 'text-orange-500', title: 'Expiring Soon', message: '7 non-employee identities require sponsor renewal within the next 15 days.', action: 'Send Reminders' },
  { severity: 'low', color: 'border-blue-500 bg-blue-50', icon: UserCheck, iconColor: 'text-blue-500', title: 'Missing Fallback', message: "3 non-employees don't have a fallback sponsor assigned.", action: 'Assign Fallbacks' }
];

export function SponsorGovernance() {
  const [kpiModal, setKpiModal] = useState<{ open: boolean; label: string; value: string | number }>({ open: false, label: '', value: '' });
  const [sponsorModal, setSponsorModal] = useState<{ open: boolean; sponsor: any }>({ open: false, sponsor: null });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {sponsorKpis.map((kpi, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setKpiModal({ open: true, label: kpi.label, value: kpi.value })}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
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
              <CardTitle>Sponsorship by Department</CardTitle>
              <InfoTooltip text="Distribution of sponsored non-employees across departments." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={sponsorDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {sponsorDistribution.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Sponsor Workload</CardTitle>
              <InfoTooltip text="Sponsored identities and pending actions per sponsor. Click bars for detail." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={sponsorPerformance}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend />
                <Bar dataKey="sponsored" fill="#8884d8" name="Sponsored" />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                <Bar dataKey="overdue" fill="#ef4444" name="Overdue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sponsor Directory */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Sponsor Directory</CardTitle>
            <InfoTooltip text="All active sponsors with their accountability metrics. Click for drill-down." />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockSponsorData.map((sponsor) => (
              <div key={sponsor.id} className="border rounded-lg p-4 hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar><AvatarFallback>{sponsor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                    <div>
                      <div className="font-medium">{sponsor.name}</div>
                      <div className="text-sm text-muted-foreground">{sponsor.role} • {sponsor.department}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center"><div className="text-lg font-bold">{sponsor.sponsoredCount}</div><div className="text-xs text-muted-foreground">Sponsored</div></div>
                    <div className="text-center"><div className="text-lg font-bold text-orange-600">{sponsor.pendingReviews}</div><div className="text-xs text-muted-foreground">Pending</div></div>
                    <div className="text-center"><div className="text-lg font-bold text-red-600">{sponsor.expiringThisMonth}</div><div className="text-xs text-muted-foreground">Expiring</div></div>
                    <Badge className={sponsor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{sponsor.status}</Badge>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Last activity: {sponsor.lastActivity}</div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => toast.success(`Reminder sent to ${sponsor.name}`)}>
                      <Mail className="h-4 w-4 mr-1" /> Notify
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSponsorModal({ open: true, sponsor })}>
                      <Eye className="h-4 w-4 mr-1" /> View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ownership Chains */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Sponsorship Chains</CardTitle>
            <InfoTooltip text="Primary and fallback sponsor assignments. Red flags indicate missing fallback sponsors." />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sponsorshipChains.map((chain, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-muted/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-medium">{chain.nonEmployee}</div>
                  <Badge className={chain.status === 'Valid' ? 'bg-green-100 text-green-800' : chain.status === 'Expiring' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}>{chain.status}</Badge>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2"><UserCheck className="h-4 w-4 text-blue-500" /><span className="text-sm">{chain.primarySponsor}</span></div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center space-x-2"><Shield className="h-4 w-4 text-green-500" /><span className="text-sm">{chain.fallbackSponsor || 'No Fallback'}</span></div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">Relationship: {chain.relationship} • Valid until: {chain.validUntil}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Governance Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Governance Alerts</CardTitle>
            <InfoTooltip text="Active sponsor governance alerts requiring attention." />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {governanceAlerts.map((alert, i) => (
              <div key={i} className={`border-l-4 ${alert.color} p-4 rounded`}>
                <div className="flex items-center space-x-2">
                  <alert.icon className={`h-5 w-5 ${alert.iconColor}`} />
                  <span className="font-medium">{alert.title}</span>
                </div>
                <p className="text-sm mt-1">{alert.message}</p>
                <Button size="sm" variant={alert.severity === 'high' ? 'default' : 'outline'} className="mt-2" onClick={() => toast.success(alert.action + " completed")}>
                  {alert.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <NonEmployeeKpiDrilldownModal open={kpiModal.open} onOpenChange={(o) => setKpiModal(p => ({ ...p, open: o }))} kpiLabel={kpiModal.label} kpiValue={kpiModal.value} />
      <SponsorDetailModal open={sponsorModal.open} onOpenChange={(o) => setSponsorModal(p => ({ ...p, open: o }))} sponsor={sponsorModal.sponsor} />
    </div>
  );
}
