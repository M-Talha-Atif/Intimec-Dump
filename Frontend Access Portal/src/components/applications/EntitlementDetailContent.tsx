import React from 'react';
import { Entitlement } from '@/data/mock-entitlements';
import { mockUsers } from '@/data/mock-users';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Shield, GitBranch, AlertTriangle, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { cn } from '@/lib/utils';
import { getRiskBadgeClass } from '@/utils/getRiskColor';
import { getStatusBadgeClass } from '@/utils/getBadgeClass';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const DetailItem = ({ label, value, tooltip }: { label: string; value: React.ReactNode; tooltip?: string }) => (
  <div className="py-1.5">
    <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
      {label}
      {tooltip && <InfoTooltip text={tooltip} />}
    </p>
    <div className="text-sm mt-0.5">{value}</div>
  </div>
);


const classificationColorMap: Record<string, string> = {
  'High Risk': 'bg-red-50 text-red-700 border-red-200',
  'SOX': 'bg-purple-50 text-purple-700 border-purple-200',
  'GDPR': 'bg-blue-50 text-blue-700 border-blue-200',
  'PII': 'bg-amber-50 text-amber-700 border-amber-200',
};

const UsageTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-background p-2 shadow-sm">
      <p className="text-xs font-medium">{payload[0].payload.month}: <strong>{payload[0].value}</strong> uses</p>
    </div>
  );
};

export const EntitlementDetailContent = ({ entitlement }: { entitlement: Entitlement }) => {
  const assignedUsers = mockUsers.filter(user => entitlement.assignedUsers?.includes(user.id));
  const isOrphaned = !entitlement.owner || (assignedUsers.length === 0 && entitlement.lifecycle === 'Active');

  return (
    <div className="p-5 bg-muted/30 space-y-4">
      {/* 3-Column Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Core Metadata */}
        <Card className="border-l-4 border-l-blue-400">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <GitBranch className="h-4 w-4 text-blue-500" /> Core Metadata
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-1">
            <DetailItem label="Technical Name" value={<code className="text-xs bg-muted px-1.5 py-0.5 rounded">{entitlement.attribute}</code>} />
            <DetailItem label="Type" value={<Badge variant="outline" className="text-xs">{entitlement.type}</Badge>} />
            <DetailItem label="Requestable" value={
              entitlement.requestable
                ? <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Yes</Badge>
                : <span className="text-muted-foreground text-sm">No</span>
            } tooltip="Whether users can self-request this entitlement through the access catalog." />
            <DetailItem label="Privilege Level" value={
              entitlement.privilegeLevel
                ? <Badge variant="outline" className={cn('text-xs',
                    entitlement.privilegeLevel === 'Admin' ? 'bg-red-50 text-red-700 border-red-200' :
                    entitlement.privilegeLevel === 'Write' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-blue-50 text-blue-700 border-blue-200'
                  )}>{entitlement.privilegeLevel}</Badge>
                : '—'
            } />
            <div className="pt-1">
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                Classification
                <InfoTooltip text="Regulatory and sensitivity tags applied to this entitlement for compliance tracking." />
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {entitlement.classification.length > 0 ? entitlement.classification.map((c) => (
                  <Badge key={c} variant="outline" className={cn('text-[10px]', classificationColorMap[c] || '')}>{c}</Badge>
                )) : <span className="text-xs text-muted-foreground">Unclassified</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk & Description */}
        <Card className="border-l-4 border-l-amber-400">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Description & Risk
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-1">
            <DetailItem label="Risk Level" value={
              <Badge className={cn('font-semibold text-xs', getRiskBadgeClass(entitlement.risk))}>
                {entitlement.risk}
              </Badge>
            } tooltip="Risk score based on privilege level, data sensitivity, and blast radius." />
            {entitlement.riskReason && (
              <DetailItem label="Risk Explanation" value={
                <span className="text-xs text-muted-foreground leading-relaxed">{entitlement.riskReason}</span>
              } />
            )}
            <DetailItem label="Description" value={
              <span className="text-xs text-muted-foreground leading-relaxed">{entitlement.description}</span>
            } />
            {entitlement.lifecycle && (
              <DetailItem label="Lifecycle" value={
                <Badge variant="outline" className={cn('text-xs',
                  entitlement.lifecycle === 'Deprecated' ? 'bg-muted text-muted-foreground' :
                  entitlement.lifecycle === 'Orphaned' ? 'bg-red-50 text-red-700' :
                  'bg-green-50 text-green-700'
                )}>{entitlement.lifecycle}</Badge>
              } />
            )}
          </CardContent>
        </Card>

        {/* Governance */}
        <Card className="border-l-4 border-l-purple-400">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-purple-500" /> Governance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-1">
              <DetailItem label="Owner" value={entitlement.owner || <Badge variant="destructive" className="text-xs">Unowned</Badge>} />
              {isOrphaned && <DetailItem label="Status" value={<Badge variant="secondary" className="text-xs">Orphaned</Badge>} />}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-4">
              <Button size="sm" variant="outline" className="h-7 text-xs">Initiate Review</Button>
              <Button size="sm" variant="outline" className="h-7 text-xs">Assign Owner</Button>
              <Button size="sm" variant="outline" className="h-7 text-xs">Deprecate</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trend + Membership Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Usage Trend */}
        {entitlement.usageHistory && entitlement.usageHistory.length > 0 && (
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-muted-foreground" /> Usage Trend (6 Months)
                <InfoTooltip text="Monthly usage count showing how frequently this entitlement is exercised." />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0" style={{ height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={entitlement.usageHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <RechartsTooltip content={<UsageTooltip />} />
                  <Area type="monotone" dataKey="usageCount" stroke="#4F8EF7" fill="#4F8EF7" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Certification History */}
        {entitlement.reviewHistory && entitlement.reviewHistory.length > 0 && (
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" /> Certification History
                <InfoTooltip text="Past access review campaigns and their outcomes for this entitlement." />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Campaign</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Reviewer</TableHead>
                      <TableHead className="text-xs">Outcome</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entitlement.reviewHistory.map((review, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-xs font-medium">{review.campaign}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{review.date}</TableCell>
                        <TableCell className="text-xs">{review.reviewer}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px]">{review.outcome}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Membership */}
      {assignedUsers.length > 0 && (
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" /> Membership ({assignedUsers.length} Users)
              <InfoTooltip text="Identities currently holding this entitlement and their associated risk levels." />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="border rounded-md max-h-52 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/80">
                  <TableRow>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Department</TableHead>
                    <TableHead className="text-xs">Risk Level</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-sm">{user.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{user.department}</TableCell>
                      <TableCell>
                        <Badge className={cn('text-xs', getRiskBadgeClass(user.riskLevel))}>{user.riskLevel}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'Active' ? 'default' : 'secondary'} className={cn('text-xs', user.status === 'Active' ? getStatusBadgeClass('active') : '')}>
                          {user.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EntitlementDetailContent;
