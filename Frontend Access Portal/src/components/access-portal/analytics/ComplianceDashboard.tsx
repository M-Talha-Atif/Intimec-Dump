import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccessRequest } from '@/data/mock-access-portal';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ComplianceDashboardProps {
  requests: AccessRequest[];
}

const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({ requests }) => {
  const totalViolations = requests.reduce((acc, r) => acc + r.sodConflicts.length + r.complianceIssues.length, 0);
  const activeViolations = requests.filter(r => 
    (r.status === 'approved' || r.status === 'provisioned') && 
    (r.sodConflicts.length > 0 || r.complianceIssues.length > 0)
  ).length;

  const violationData = [
    { month: 'Jan', violations: 2 },
    { month: 'Feb', violations: 1 },
    { month: 'Mar', violations: 3 },
    { month: 'Apr', violations: 1 },
    { month: 'May', violations: 2 },
    { month: 'Jun', violations: activeViolations },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Compliance Dashboard</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              Total Checks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requests reviewed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Passed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length - totalViolations}</div>
            <Badge variant="default" className="mt-1">
              {Math.round(((requests.length - totalViolations) / requests.length) * 100)}% Clean
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Active Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeViolations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              SoD Conflicts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.reduce((acc, r) => acc + r.sodConflicts.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total conflicts
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Violations Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={violationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="violations" fill="hsl(var(--destructive))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Compliance Frameworks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['SOX', 'GDPR', 'HIPAA', 'PCI-DSS'].map((framework) => {
              const compliant = Math.random() > 0.2;
              return (
                <div key={framework} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    {compliant ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    )}
                    <span className="font-medium">{framework}</span>
                  </div>
                  <Badge variant={compliant ? 'default' : 'secondary'}>
                    {compliant ? 'Compliant' : 'Review Needed'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceDashboard;
