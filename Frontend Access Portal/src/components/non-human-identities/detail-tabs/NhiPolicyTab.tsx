
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';

const severityConfig = {
  Critical: { color: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-500' },
  High: { color: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-500' },
  Medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-500' },
};

const defaultViolations = [
  { id: 'pv1', policy: 'Credential Rotation Policy', desc: 'Credentials must be rotated every 90 days', detectedOn: '2025-02-15', status: 'Open', severity: 'High' },
  { id: 'pv2', policy: 'Least Privilege Policy', desc: 'Service accounts should not have admin access unless justified', detectedOn: '2025-02-10', status: 'Open', severity: 'Medium' },
];

const NhiPolicyTab = ({ identity }: { identity: any }) => {
  const violations = identity.policyViolations || defaultViolations;
  const totalPolicies = violations.length + 3; // assume 3 compliant
  const compliantCount = totalPolicies - violations.length;
  const complianceRate = Math.round((compliantCount / totalPolicies) * 100);

  return (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${complianceRate === 100 ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-xs text-muted-foreground">Compliance</span>
          </div>
          <p className="text-2xl font-bold mt-1">{complianceRate}%</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /><span className="text-xs text-muted-foreground">Compliant</span></div>
          <p className="text-2xl font-bold mt-1 text-green-600">{compliantCount}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2"><AlertCircle className="h-3 w-3 text-red-500" /><span className="text-xs text-muted-foreground">Violations</span></div>
          <p className="text-2xl font-bold mt-1 text-red-600">{violations.length}</p>
        </Card>
      </div>

      {violations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-md">
              <ShieldCheck className="w-6 h-6" /><p className="font-medium">No policy violations detected. All policies compliant.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Active Violations</CardTitle>
            <CardDescription>Policy violations requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severity</TableHead>
                  <TableHead>Policy</TableHead>
                  <TableHead>Detected</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {violations.map((v: any) => {
                  const sev = severityConfig[v.severity as keyof typeof severityConfig] || severityConfig.Medium;
                  return (
                    <TableRow key={v.id}>
                      <TableCell>
                        <Badge variant="outline" className={sev.color}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sev.dot} mr-1.5`} />{v.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{v.policy}</p>
                        <p className="text-xs text-muted-foreground">{v.desc}</p>
                      </TableCell>
                      <TableCell className="text-xs">{v.detectedOn}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{v.status || 'Open'}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="outline" className="h-7 text-xs">Remediate</Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground">Exception</Button>
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

export default NhiPolicyTab;
