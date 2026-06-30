import React from 'react';
import { type User } from '@/data/mock-users';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Key, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type ComparisonViewProps = {
  users: User[];
};

const statusColors: { [key: string]: string } = {
  Active: "bg-green-100 text-green-800 border-green-200",
  Inactive: "bg-slate-100 text-slate-800 border-slate-200",
  Suspended: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Stale: "bg-orange-100 text-orange-800 border-orange-200",
};

const riskColors: { [key: string]: string } = {
  Low: "text-blue-600 border-blue-300",
  Medium: "text-amber-600 border-amber-300",
  High: "text-red-600 border-red-300",
};

const UserSummaryCard = ({ user }: { user: User }) => {
  const privilegedRoles = user.access?.filter(a => a.type === 'Role' && a.risk === 'High').length || 0;
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="text-xl">{user.name}</CardTitle>
        <CardDescription>{user.department} • {user.manager ? `Managed by ${user.manager}` : 'No manager'}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Status</span>
          <Badge className={statusColors[user.status]}>{user.status}</Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Risk Score</span>
          <Badge variant="outline" className={riskColors[user.riskLevel]}>{user.riskLevel}</Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Privileged</span>
          {user.isPrivileged ? <Badge variant="outline" className="text-amber-600 border-amber-300"><Key className="mr-1.5 h-3 w-3" />Yes</Badge> : <span>No</span>}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Apps</span>
          <span className="font-medium">{user.accounts?.length || 0}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Roles</span>
          <span className="font-medium">{user.access?.filter(a => a.type === 'Role').length || 0} ({privilegedRoles} priv.)</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Entitlements</span>
          <span className="font-medium">{user.access?.filter(a => a.type === 'Entitlement').length || 0}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const findDifference = (arrA: string[], arrB: string[]) => {
    const setA = new Set(arrA);
    const setB = new Set(arrB);
    const uniqueToA = arrA.filter(x => !setB.has(x));
    const uniqueToB = arrB.filter(x => !setA.has(x));
    const common = arrA.filter(x => setB.has(x));
    return { uniqueToA, uniqueToB, common };
};

const GovernanceHighlightCard = ({ users }: { users: User[] }) => {
  if (users.length < 2) return null;

  const [userA, userB] = users;
  
  const rolesA = userA.access?.filter(a => a.type === 'Role').map(r => r.name) || [];
  const rolesB = userB.access?.filter(a => a.type === 'Role').map(r => r.name) || [];
  const roleDiff = Math.abs(rolesA.length - rolesB.length);

  const appsA = userA.accounts?.map(acc => acc.appName) || [];
  const appsB = userB.accounts?.map(acc => acc.appName) || [];
  const appDiff = findDifference(appsA, appsB);

  let insight: React.ReactNode = null;

  if (userA.department === userB.department && (appDiff.uniqueToA.length > 0 || appDiff.uniqueToB.length > 0)) {
      const uniqueApps = [...appDiff.uniqueToA, ...appDiff.uniqueToB];
      insight = <span><strong>Access Drift Detected:</strong> Inconsistent application access found for <strong>{uniqueApps.join(', ')}</strong> between users in the same department.</span>;
  } else if (roleDiff > 2) {
      const overprovisionedUser = rolesA.length > rolesB.length ? userA : userB;
      const underprovisionedUser = rolesA.length > rolesB.length ? userB : userA;
      insight = <span><strong>Potential Over-provisioning:</strong> {overprovisionedUser.name} has <strong>{roleDiff} more roles</strong> than {underprovisionedUser.name}, which may indicate excessive permissions.</span>;
  } else if (userA.riskLevel === 'High' && userB.riskLevel !== 'High') {
      insight = <span><strong>Risk Discrepancy:</strong> {userA.name}'s high risk score warrants a review, especially when compared to {userB.name}'s lower risk profile.</span>;
  }

  if (!insight) return null;

  return (
    <Alert className="mb-6 bg-blue-50 border-blue-200">
      <Lightbulb className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-800">AI-Powered Insight</AlertTitle>
      <AlertDescription className="text-blue-700">
        {insight}
      </AlertDescription>
    </Alert>
  );
};

const ComparisonMatrix = ({ users }: { users: User[] }) => {
  const getComparisonRow = (
    category: string, 
    valueExtractor: (user: User) => { value: string | number; details?: string; raw: any }, 
    insightGenerator: (users: User[], values: { value: string | number; details?: string; raw: any }[]) => React.ReactNode,
    actionSuggestion: string
  ) => {
    const extractedValues = users.map(valueExtractor);
    return (
      <TableRow className="align-top">
        <TableHead className="font-semibold text-slate-700 w-[200px] pt-4">{category}</TableHead>
        {users.map((user, index) => (
          <TableCell key={user.id}>
            <div className="font-medium">{extractedValues[index].value}</div>
            {extractedValues[index].details && <div className="text-xs text-slate-500">{extractedValues[index].details}</div>}
          </TableCell>
        ))}
        {users.length > 1 && <TableCell className="text-slate-500 italic text-xs w-[35%]">{insightGenerator(users, extractedValues)}</TableCell>}
        {users.length > 1 && (
            <TableCell className="w-[200px]">
                <Button variant="link" size="sm" className="text-xs h-auto p-0">{actionSuggestion}</Button>
            </TableCell>
        )}
      </TableRow>
    );
  };
  
  const generateDiffInsight = (userA: User, userB: User, diff: { uniqueToA: string[], uniqueToB: string[] }, itemType: string) => {
    if (diff.uniqueToA.length === 0 && diff.uniqueToB.length === 0) return `Consistent ${itemType} access.`;
    return (
      <ul className="list-disc pl-4 space-y-1">
        {diff.uniqueToA.length > 0 && <li><strong>{userA.name}</strong> has unique access to: <span className="font-medium">{diff.uniqueToA.join(', ')}</span></li>}
        {diff.uniqueToB.length > 0 && <li><strong>{userB.name}</strong> has unique access to: <span className="font-medium">{diff.uniqueToB.join(', ')}</span></li>}
      </ul>
    );
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Comparison Matrix</CardTitle>
        <CardDescription>Side-by-side comparison with AI-powered insights and recommended actions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Category</TableHead>
              {users.map(user => <TableHead key={user.id}>{user.name}</TableHead>)}
              {users.length > 1 && <TableHead className="w-[35%]">Difference / Insight</TableHead>}
              {users.length > 1 && <TableHead className="w-[200px]">Suggested Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {getComparisonRow(
              "Roles", 
              (u) => {
                const roles = u.access?.filter(a => a.type === 'Role') || [];
                const priv = roles.filter(r => r.risk === 'High').length;
                return { value: roles.length, details: `${priv} privileged`, raw: roles.map(r => r.name) };
              },
              (u, vals) => generateDiffInsight(u[0], u[1], findDifference(vals[0].raw, vals[1].raw), 'role'),
              "Standardize Roles"
            )}
            {getComparisonRow(
              "Entitlements", 
              (u) => {
                const entitlements = u.access?.filter(a => a.type === 'Entitlement') || [];
                return { value: entitlements.length, raw: entitlements.map(e => e.name) };
              },
              (u, vals) => generateDiffInsight(u[0], u[1], findDifference(vals[0].raw, vals[1].raw), 'entitlement'),
              "Review Entitlements"
            )}
            {getComparisonRow(
              "Application Accounts", 
              (u) => {
                const apps = u.accounts || [];
                return { value: apps.length, raw: apps.map(app => app.appName) };
              },
              (u, vals) => generateDiffInsight(u[0], u[1], findDifference(vals[0].raw, vals[1].raw), 'application'),
              "Standardize App Access"
            )}
            {getComparisonRow(
              "Risk Contributors", 
              (u) => {
                const contributors = u.riskContributors || [];
                return { value: contributors.length, raw: contributors };
              }, 
              (u, vals) => {
                const diff = findDifference(vals[0].raw, vals[1].raw);
                if (diff.uniqueToA.length === 0 && diff.uniqueToB.length === 0 && diff.common.length === 0) return 'No risk contributors.';
                if (diff.uniqueToA.length === 0 && diff.uniqueToB.length === 0) return 'Same risk contributors.';
                return generateDiffInsight(u[0], u[1], diff, 'risk');
              },
              "Mitigate Risks"
            )}
            {getComparisonRow(
              "Last Access Review", 
              (u) => ({ value: u.activity?.find(a => a.type === 'Review')?.timestamp || 'Never', raw: '' }),
              (u, vals) => {
                 if (vals[0].value === vals[1].value) return 'Review status is consistent.';
                 if (vals.some(v => v.value === 'Never')) return 'One or more users have never been reviewed.';
                 return 'Users reviewed at different times.';
              },
              "Trigger Ad-Hoc Review"
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

const ComparisonView = ({ users }: ComparisonViewProps) => {
  if (users.length === 0) {
    return <div className="text-center p-8 text-slate-500">Select users to begin comparison.</div>;
  }
  
  return (
    <ScrollArea className="h-full">
      <div className="p-1">
        <div className="flex gap-6 mb-6">
          {users.map(user => (
            <UserSummaryCard key={user.id} user={user} />
          ))}
          {Array.from({ length: 3 - users.length }).map((_, i) => (
              <div key={`placeholder-${i}`} className="flex-1 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50" />
          ))}
        </div>
        {users.length > 1 && <GovernanceHighlightCard users={users} />}
        {users.length > 1 && <ComparisonMatrix users={users} />}
      </div>
    </ScrollArea>
  );
};

export default ComparisonView;
