
import React from 'react';
import { type User, type PolicyViolation } from '@/data/mock-users';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getIdentityProfile } from '@/data/mock-identity-profiles';

const severityConfig = {
  Critical: { color: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-500' },
  High: { color: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-500' },
  Medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-500' },
};

const IdentityPolicyViolationsTab = ({ user }: { user: User }) => {
  const profile = getIdentityProfile(user.id);
  
  const policyViolations = profile?.policies ? profile.policies.map(policy => ({
    id: policy.id,
    policyName: policy.policyName,
    description: policy.description,
    timestamp: policy.evaluationDate,
    status: policy.status === 'Compliant' ? 'Resolved' : 'Open',
    severity: policy.description.includes('Admin') ? 'Critical' : 'High' as 'Critical' | 'High' | 'Medium',
    affectedAccess: policy.policyName.includes('SoD') ? 'Budget Approval + Payment Processing' : 'Multiple entitlements'
  })).filter(p => p.status === 'Open') : (user.policyViolations || []).map(p => ({
    ...p,
    severity: 'High' as 'Critical' | 'High' | 'Medium',
    affectedAccess: 'See entitlement details'
  }));

  const totalPolicies = profile?.policies?.length || 5;
  const compliantCount = totalPolicies - policyViolations.length;
  const complianceRate = Math.round((compliantCount / totalPolicies) * 100);

  return (
    <div className="space-y-4 pt-4">
      {/* Compliance Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${complianceRate === 100 ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-xs text-slate-500">Compliance</span>
          </div>
          <p className="text-2xl font-bold mt-1">{complianceRate}%</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            <span className="text-xs text-slate-500">Compliant</span>
          </div>
          <p className="text-2xl font-bold mt-1 text-green-600">{compliantCount}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-3 w-3 text-red-500" />
            <span className="text-xs text-slate-500">Violations</span>
          </div>
          <p className="text-2xl font-bold mt-1 text-red-600">{policyViolations.length}</p>
        </Card>
      </div>

      {policyViolations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-md">
              <ShieldCheck className="w-6 h-6"/>
              <p className="font-medium">No policy violations detected. All policies compliant.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Active Violations</CardTitle>
            <CardDescription>Policy violations requiring attention with remediation actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severity</TableHead>
                  <TableHead>Policy</TableHead>
                  <TableHead>Affected Access</TableHead>
                  <TableHead>Detected</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policyViolations.map((violation) => {
                  const sev = severityConfig[violation.severity as keyof typeof severityConfig] || severityConfig.Medium;
                  return (
                    <TableRow key={violation.id} className="align-top">
                      <TableCell>
                        <Badge variant="outline" className={sev.color}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sev.dot} mr-1.5`} />
                          {violation.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{violation.policyName}</p>
                        <p className="text-xs text-slate-500">{violation.description}</p>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">{violation.affectedAccess}</TableCell>
                      <TableCell className="text-xs">{violation.timestamp}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="outline" className="h-7 text-xs">Remediate</Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-500">Exception</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IdentityPolicyViolationsTab;
