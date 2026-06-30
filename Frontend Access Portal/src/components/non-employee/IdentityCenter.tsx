
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, Clock, Users, UserX, Shield, Calendar, Search, Filter, TrendingUp, Activity
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { NonEmployeeKpiDrilldownModal } from './modals/NonEmployeeKpiDrilldownModal';
import { NonEmployeeChartDrilldownModal } from './modals/NonEmployeeChartDrilldownModal';
import { NonEmployeeRiskModal } from './modals/NonEmployeeRiskModal';
import { toast } from "sonner";

const riskCategories = [
  { id: 'expiring', name: 'Expiring Soon', count: 23, color: 'bg-orange-100 text-orange-800', icon: Clock, tooltip: 'Non-employees whose contracts expire within the next 30 days. Requires renewal or offboarding decision.' },
  { id: 'orphaned', name: 'Orphaned', count: 7, color: 'bg-red-100 text-red-800', icon: UserX, tooltip: 'Non-employees whose sponsor has left the organization. Need immediate sponsor reassignment.' },
  { id: 'no-sponsor', name: 'No Sponsor', count: 3, color: 'bg-purple-100 text-purple-800', icon: Users, tooltip: 'Non-employees without a designated sponsor. Critical governance gap requiring immediate resolution.' },
  { id: 'no-end-date', name: 'No End Date', count: 12, color: 'bg-yellow-100 text-yellow-800', icon: Calendar, tooltip: 'Non-employees without a contract end date. Violates time-bound access policy.' },
  { id: 'excessive-access', name: 'Excessive Access', count: 5, color: 'bg-red-100 text-red-800', icon: Shield, tooltip: 'Non-employees with access exceeding their role requirements or peer group baseline.' },
  { id: 'shared-accounts', name: 'Shared Accounts', count: 2, color: 'bg-gray-100 text-gray-800', icon: Users, tooltip: 'Non-employees sharing credentials — violates individual accountability requirements.' }
];

const riskDistribution = [
  { name: 'Critical', value: 7, color: '#ef4444' },
  { name: 'High', value: 15, color: '#f97316' },
  { name: 'Medium', value: 28, color: '#f59e0b' },
  { name: 'Low', value: 50, color: '#10b981' }
];

const riskTrend = [
  { month: 'Jan', risk: 6.2, identities: 78 },
  { month: 'Feb', risk: 5.8, identities: 82 },
  { month: 'Mar', risk: 5.5, identities: 85 },
  { month: 'Apr', risk: 5.9, identities: 83 },
  { month: 'May', risk: 5.3, identities: 87 },
  { month: 'Jun', risk: 5.1, identities: 85 }
];

const mockRiskyIdentities = [
  { id: 'ri_1', name: 'John Peterson', type: 'Contractor', sponsor: 'N/A', lastLogin: '45 days ago', riskFactors: ['No End Date', 'Excessive Access'], riskScore: 95, status: 'Critical' },
  { id: 'ri_2', name: 'Lisa Wang', type: 'Vendor', sponsor: 'Former Employee', lastLogin: '2 days ago', riskFactors: ['Orphaned'], riskScore: 78, status: 'High' },
  { id: 'ri_3', name: 'Mike Davis', type: 'Intern', sponsor: 'Jane Smith', lastLogin: 'Never', riskFactors: ['Shared Account', 'No Login'], riskScore: 82, status: 'High' }
];

export function IdentityCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sponsorFilter, setSponsorFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [kpiModal, setKpiModal] = useState<{ open: boolean; label: string; value: string | number }>({ open: false, label: '', value: '' });
  const [chartModal, setChartModal] = useState<{ open: boolean; title: string; name: string; value: number }>({ open: false, title: '', name: '', value: 0 });
  const [riskModal, setRiskModal] = useState<{ open: boolean; item: any }>({ open: false, item: null });

  return (
    <div className="space-y-6">
      {/* Risk Category KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {riskCategories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Card key={category.id} className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => setKpiModal({ open: true, label: category.name, value: category.count })}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className="h-5 w-5 text-muted-foreground" />
                  <InfoTooltip text={category.tooltip} />
                </div>
                <span className="text-2xl font-bold">{category.count}</span>
                <div className="text-sm font-medium text-muted-foreground mt-1">{category.name}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts — added to match Employee/NHI pattern */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Risk Distribution</CardTitle>
              <InfoTooltip text="Distribution of non-employees by risk severity. Click segments to drill down." />
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
              <CardTitle>Risk Trend</CardTitle>
              <InfoTooltip text="Monthly risk score and active identity count trend for non-employees." />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={riskTrend}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend />
                <Line type="monotone" dataKey="risk" stroke="#8884d8" name="Risk Score" />
                <Line type="monotone" dataKey="identities" stroke="#82ca9d" name="Active Count" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Advanced Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search identities..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={sponsorFilter} onValueChange={setSponsorFilter}>
              <SelectTrigger><SelectValue placeholder="Filter by sponsor" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sponsors</SelectItem>
                <SelectItem value="active">Active Sponsors</SelectItem>
                <SelectItem value="inactive">Inactive Sponsors</SelectItem>
                <SelectItem value="missing">No Sponsor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger><SelectValue placeholder="Filter by department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger><SelectValue placeholder="Contract duration" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="short">&lt; 30 days</SelectItem>
                <SelectItem value="medium">30-90 days</SelectItem>
                <SelectItem value="long">90+ days</SelectItem>
                <SelectItem value="indefinite">No end date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* High Risk Identities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>High-Risk Identities Requiring Attention</span>
            </div>
            <Badge variant="destructive">{mockRiskyIdentities.length} Critical</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRiskyIdentities.map((identity) => (
              <div key={identity.id} className="border rounded-lg p-4 bg-red-50 border-red-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div>
                      <div className="font-medium">{identity.name}</div>
                      <div className="text-sm text-muted-foreground">{identity.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{identity.riskScore}</div>
                      <div className="text-xs text-muted-foreground">Risk Score</div>
                    </div>
                    <Badge variant="destructive">{identity.status}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div><span className="font-medium">Sponsor: </span><span className={identity.sponsor === 'N/A' || identity.sponsor === 'Former Employee' ? 'text-red-600' : ''}>{identity.sponsor}</span></div>
                  <div><span className="font-medium">Last Login: </span><span>{identity.lastLogin}</span></div>
                  <div><span className="font-medium">Risk Factors: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {identity.riskFactors.map((factor, i) => (<Badge key={i} variant="outline" className="text-xs bg-red-100 text-red-800 border-red-300">{factor}</Badge>))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => setRiskModal({ open: true, item: { ...identity, identity: identity.name, factors: identity.riskFactors, violations: [] } })}>Review</Button>
                  <Button size="sm" variant="destructive" onClick={() => toast.success(`Action taken on ${identity.name}`)}>Take Action</Button>
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
