import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User } from '@/data/mock-users';
import { mockEntitlements } from '@/data/mock-entitlements';
import { Shield, UserCircle, Server, Clock, Ban, UserCheck, Search as SearchIcon, AlertTriangle, CheckCircle2 } from 'lucide-react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { cn } from '@/lib/utils';

type AccountWithUser = {
  id: string;
  appName: string;
  accountName: string;
  status: "Active" | "Disabled";
  lastSync: string;
  details?: {
    type: 'Permission' | 'Group' | 'Role';
    name: string;
    description: string;
  }[];
  user: User;
};

const DetailItem = ({ label, value, tooltip }: { label: string; value: React.ReactNode; tooltip?: string }) => (
  value ? (
    <div className="flex justify-between items-start py-2 border-b border-border/50 last:border-b-0">
      <dt className="text-xs text-muted-foreground flex items-center gap-1">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </dt>
      <dd className="text-sm font-medium text-right">{value}</dd>
    </div>
  ) : null
);

const riskBadgeClass: Record<string, string> = {
  High: 'bg-red-100 text-red-800 border-red-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Low: 'bg-blue-100 text-blue-800 border-blue-200',
};

const mockHistoricalActivity = [
  { date: '2025-01-26 09:30', event: 'Login Success', actor: 'System', detail: 'Corporate network' },
  { date: '2025-01-25 17:12', event: 'Access Requested', actor: 'User', detail: 'AWS Console ReadOnly' },
  { date: '2025-01-24 13:48', event: 'Entitlement Assigned', actor: 'Auto Rule', detail: 'Privileged Access Reviewer' },
  { date: '2025-01-20 14:33', event: 'Access Revoked', actor: 'Security Team', detail: 'GitHub Admin Access' },
  { date: '2025-01-15 10:00', event: 'Access Certified', actor: 'Jane Smith', detail: 'Quarterly review campaign' },
];

const ApplicationAccountDetail = ({ item }: { item: AccountWithUser }) => {
  const appEntitlementDisplayNames = new Set(
    mockEntitlements.filter(e => e.application === item.appName).map(e => e.displayName)
  );
  const assignedEntitlements = (item.user.access || [])
    .filter(a => a.type === 'Entitlement' && appEntitlementDisplayNames.has(a.name));
  const hasMemberships = item.details && item.details.length > 0;
  const hasAssignedEntitlements = assignedEntitlements.length > 0;
  const hasViolations = item.user.policyViolations && item.user.policyViolations.length > 0;

  return (
    <div className="p-5 bg-muted/30 space-y-4">
      {/* 3-Column Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Account Metadata */}
        <Card className="border-l-4 border-l-blue-400">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              {/* <Server className="h-4 w-4 text-blue-500" /> */}
               Account Metadata
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <dl>
              <DetailItem label="Account Name" value={<code className="text-xs bg-muted px-1.5 py-0.5 rounded">{item.accountName}</code>} />
              <DetailItem label="Status" value={
                <Badge className={cn(item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                  {item.status}
                </Badge>
              } />
              <DetailItem label="Privileged" value={
                item.user.isPrivileged
                  ? <Badge className="bg-orange-100 text-orange-800 border-orange-200">Yes</Badge>
                  : <span className="text-muted-foreground">No</span>
              } tooltip="Whether this account has elevated administrative privileges." />
              <DetailItem label="Last Sync" value={item.lastSync} />
            </dl>
          </CardContent>
        </Card>

        {/* Correlated Identity */}
        <Card className="border-l-4 border-l-emerald-400">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <UserCircle className="h-4 w-4 text-emerald-500" /> Correlated Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <dl>
              <DetailItem label="Name" value={item.user.name} />
              <DetailItem label="Department" value={item.user.department} />
              <DetailItem label="Manager" value={
                <span className="text-primary cursor-pointer hover:underline">{item.user.manager}</span>
              } />
              <DetailItem label="Identity Type" value={
                <Badge variant="outline">{item.user.type}</Badge>
              } />
              <DetailItem label="Identity Status" value={
                <Badge variant={item.user.status === 'Active' ? 'default' : 'secondary'} className={item.user.status === 'Active' ? 'bg-green-100 text-green-800' : ''}>
                  {item.user.status}
                </Badge>
              } />
            </dl>
          </CardContent>
        </Card>

        {/* Governance */}
        <Card className="border-l-4 border-l-purple-400">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-500" /> Governance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <dl>
              <DetailItem label="Risk Level" value={
                <Badge className={cn('font-semibold', riskBadgeClass[item.user.riskLevel] || '')}>
                  {item.user.riskLevel}
                </Badge>
              } tooltip="Composite risk score derived from entitlements, violations, peer analysis, and activity patterns." />
              <DetailItem label="AI Analysis" value={
                <Badge variant="outline" className="text-xs">{item.user.aiAnalysis}</Badge>
              } />
            </dl>
            <div className="flex flex-wrap gap-1.5 mt-4">
              <Button size="sm" variant="outline" className="h-7 text-xs">
                <Ban className="mr-1 h-3 w-3" /> Revoke
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                <UserCheck className="mr-1 h-3 w-3" /> Certify
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                <SearchIcon className="mr-1 h-3 w-3" /> Investigate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Memberships & Access */}
      {(hasMemberships || hasAssignedEntitlements) && (
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">Memberships & Access</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            {hasMemberships && (
              <div>
                <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Member Of — Direct Application Groups ({item.details!.length})
                </h4>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Type</TableHead>
                        <TableHead className="text-xs">Name</TableHead>
                        <TableHead className="text-xs">Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {item.details!.map((detail, index) => (
                        <TableRow key={index}>
                          <TableCell><Badge variant="outline" className="text-xs">{detail.type}</Badge></TableCell>
                          <TableCell className="font-medium text-sm">{detail.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{detail.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            {hasAssignedEntitlements && (
              <div>
                <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Assigned Entitlements from Identity ({assignedEntitlements.length})
                </h4>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Name</TableHead>
                        <TableHead className="text-xs">Description</TableHead>
                        <TableHead className="text-xs">Risk</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedEntitlements.map((ent) => (
                        <TableRow key={ent.id}>
                          <TableCell className="font-medium text-sm">{ent.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{ent.description}</TableCell>
                          <TableCell>
                            <Badge className={cn('text-xs', riskBadgeClass[ent.risk] || '')}>{ent.risk}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Policy Violations */}
      {hasViolations && (
        <Card className="border-red-200">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" /> Policy Violations ({item.user.policyViolations!.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Policy</TableHead>
                    <TableHead className="text-xs">Description</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {item.user.policyViolations!.map((violation) => (
                    <TableRow key={violation.id}>
                      <TableCell className="font-medium text-sm">{violation.policyName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{violation.description}</TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="text-xs">{violation.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-6 text-xs px-2">Remediate</Button>
                          <Button size="sm" variant="ghost" className="h-6 text-xs px-2">Accept</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Activity */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" /> Historical Activity
            <InfoTooltip text="Recent account events including logins, access changes, and review actions." />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-0">
            {mockHistoricalActivity.map((evt, i) => (
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-b-0">
                <div className="mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{evt.event}</p>
                    <span className="text-xs text-muted-foreground">{evt.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{evt.detail} • by {evt.actor}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationAccountDetail;
