
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

export const SoDDashboard = () => {
  const violationTrends = [
    { month: 'Jan', violations: 12, exceptions: 3 },
    { month: 'Feb', violations: 8, exceptions: 2 },
    { month: 'Mar', violations: 15, exceptions: 5 },
    { month: 'Apr', violations: 6, exceptions: 1 },
    { month: 'May', violations: 9, exceptions: 2 },
    { month: 'Jun', violations: 7, exceptions: 3 },
  ];

  const topConflictedRoles = [
    { role: 'Finance Manager', conflicts: 12, severity: 'High' },
    { role: 'IT Administrator', conflicts: 8, severity: 'Medium' },
    { role: 'HR Business Partner', conflicts: 6, severity: 'Medium' },
    { role: 'Sales Director', conflicts: 4, severity: 'Low' },
    { role: 'Marketing Analyst', conflicts: 3, severity: 'Low' },
  ];

  const complianceRisks = [
    { name: 'SOX Compliance', value: 65, color: '#ef4444' },
    { name: 'GDPR Compliance', value: 85, color: '#22c55e' },
    { name: 'Internal Audit', value: 75, color: '#f59e0b' },
    { name: 'Operational Risk', value: 70, color: '#3b82f6' },
  ];

  const policyEffectiveness = [
    { name: 'Effective', value: 78, color: '#22c55e' },
    { name: 'Needs Review', value: 15, color: '#f59e0b' },
    { name: 'Stale', value: 7, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolution Time</p>
                <p className="text-2xl font-bold text-green-600">2.3 days</p>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  <span>-15% from last month</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mitigation Rate</p>
                <p className="text-2xl font-bold text-blue-600">94.2%</p>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>+3% improvement</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Policy Drift Alerts</p>
                <p className="text-2xl font-bold text-orange-600">3</p>
                <Badge variant="secondary" className="mt-1">Review Needed</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Exposure</p>
                <p className="text-2xl font-bold text-red-600">Medium</p>
                <Badge variant="destructive" className="mt-1">SOX Risk</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Violation Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={violationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="violations" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="exceptions" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Policy Effectiveness</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={policyEffectiveness}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {policyEffectiveness.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Conflicted Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topConflictedRoles.map((role, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{role.role}</p>
                    <p className="text-sm text-gray-600">{role.conflicts} active conflicts</p>
                  </div>
                  <Badge variant={
                    role.severity === 'High' ? 'destructive' : 
                    role.severity === 'Medium' ? 'secondary' : 'outline'
                  }>
                    {role.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceRisks.map((risk, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{risk.name}</span>
                    <span className="text-sm">{risk.value}%</span>
                  </div>
                  <Progress value={risk.value} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
