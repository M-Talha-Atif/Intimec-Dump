
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  Calendar
} from 'lucide-react';

type NonEmployeePolicyTabProps = {
  nonEmployee: any;
};

const defaultPolicies = [
  { id: 'dp1', policy: 'Time-bound Access Control', status: 'Compliant', description: 'Access aligned with contract duration', lastEvaluated: '2024-06-21', severity: 'Low' },
  { id: 'dp2', policy: 'Sponsor Approval Required', status: 'Compliant', description: 'All access changes have sponsor approval', lastEvaluated: '2024-06-20', severity: 'Low' },
  { id: 'dp3', policy: 'Segregation of Duties', status: 'Violation', description: 'Has conflicting access to financial data', lastEvaluated: '2024-06-19', severity: 'High' },
  { id: 'dp4', policy: 'Regular Access Review', status: 'Warning', description: 'Review due in 10 days', lastEvaluated: '2024-06-21', severity: 'Medium' },
  { id: 'dp5', policy: 'Minimum Access Principle', status: 'Warning', description: 'Elevated access may not be required', lastEvaluated: '2024-06-18', severity: 'Medium' }
];

export function NonEmployeePolicyTab({ nonEmployee }: NonEmployeePolicyTabProps) {
  const policies = nonEmployee.policyViolations?.length ? nonEmployee.policyViolations : defaultPolicies;

  const compliantCount = policies.filter((p: any) => p.status === 'Compliant').length;
  const violationCount = policies.filter((p: any) => p.status === 'Violation').length;
  const warningCount = policies.filter((p: any) => p.status === 'Warning').length;
  const totalCount = policies.length;
  const compliancePercent = totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Compliant': return 'bg-green-100 text-green-800';
      case 'Violation': return 'bg-red-100 text-red-800';
      case 'Warning': return 'bg-yellow-100 text-yellow-800';
      case 'Pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Compliant': return CheckCircle;
      case 'Violation': return AlertTriangle;
      case 'Warning': return AlertTriangle;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Compliance Score Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Policy Compliance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${compliancePercent >= 80 ? 'text-green-600' : compliancePercent >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {compliancePercent}%
              </div>
              <div className="text-sm text-slate-600 mb-4">Overall Compliance</div>
              <Progress value={compliancePercent} className="w-full" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Compliant</span>
                <Badge className="bg-green-100 text-green-800">{compliantCount}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Violations</span>
                <Badge variant="destructive">{violationCount}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Warnings</span>
                <Badge className="bg-yellow-100 text-yellow-800">{warningCount}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policy Evaluations */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Evaluations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {policies.map((policy: any) => {
              const StatusIcon = getStatusIcon(policy.status);
              
              return (
                <div key={policy.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mt-0.5">
                        <StatusIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-slate-900">{policy.policy}</h3>
                          <Badge className={getStatusColor(policy.status)}>
                            {policy.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{policy.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Evaluated: {policy.lastEvaluated}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {policy.status === 'Violation' && (
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Remediate
                        </Button>
                      )}
                      {(policy.status === 'Violation' || policy.status === 'Warning') && (
                        <Button size="sm" variant="ghost">
                          Accept Risk
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
