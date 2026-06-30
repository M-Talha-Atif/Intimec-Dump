
import React from 'react';
import { type User, type Account } from '@/data/mock-users';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AppWindow, CheckCircle2, XCircle, ChevronDown, ChevronRight, Shield, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getIdentityProfile } from '@/data/mock-identity-profiles';
import { getAccountDetail } from '@/data/mock-account-details';
import AccountDetailRow from '../accounts/AccountDetailRow';

const AccountRow = ({ account, isExpanded, onToggle }: { 
  account: Account; 
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const accountDetail = getAccountDetail(account.id);
  const isPrivileged = account.appName.includes('SAP') || account.appName.includes('AWS');

  return (
    <Collapsible asChild open={isExpanded} onOpenChange={onToggle}>
      <>
        <TableRow 
          className="cursor-pointer hover:bg-slate-50/50 transition-colors"
          onClick={onToggle}
        >
          <TableCell className="font-medium">
            <div className="flex items-center">
              <CollapsibleTrigger asChild>
                <button className="mr-2 p-1" title="Click to view detailed account info">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              </CollapsibleTrigger>
              <AppWindow className="h-4 w-4 mr-2 text-slate-500" />
              {account.appName}
            </div>
          </TableCell>
          <TableCell>{account.accountName}</TableCell>
          <TableCell>
            <Badge variant={account.status === 'Active' ? 'default' : 'secondary'} className={cn(account.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800')}>
              {account.status === 'Active' ? <CheckCircle2 className="h-3 w-3 mr-1.5" /> : <XCircle className="h-3 w-3 mr-1.5" />}
              {account.status}
            </Badge>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-1.5">
              {isPrivileged && (
                <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700 bg-amber-50">
                  <Shield className="h-2.5 w-2.5 mr-0.5" />Privileged
                </Badge>
              )}
            </div>
          </TableCell>
          <TableCell className="text-xs text-slate-500">{account.lastSync}</TableCell>
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
              <Button size="sm" variant="outline" className="h-7 text-xs">Review</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500 hover:text-red-700">Revoke</Button>
            </div>
          </TableCell>
        </TableRow>
        {accountDetail && (
          <CollapsibleContent asChild>
            <TableRow>
              <TableCell colSpan={6} className="p-0">
                <AccountDetailRow accountDetail={accountDetail} />
              </TableCell>
            </TableRow>
          </CollapsibleContent>
        )}
      </>
    </Collapsible>
  )
}

const IdentityAccountsTab = ({ user }: { user: User }) => {
  const [expandedAccountId, setExpandedAccountId] = React.useState<string | null>(null);
  
  const profile = getIdentityProfile(user.id);
  
  const accounts = profile?.accounts ? profile.accounts.map(acc => ({
    id: acc.id,
    appName: acc.application,
    accountName: acc.accountId,
    status: acc.status === 'Suspended' ? 'Disabled' : acc.status as 'Active' | 'Disabled',
    lastSync: acc.lastSynced,
    details: []
  })) : user.accounts || [];

  const activeCount = accounts.filter(a => a.status === 'Active').length;
  const disabledCount = accounts.filter(a => a.status === 'Disabled').length;
  const privilegedCount = accounts.filter(a => a.appName.includes('SAP') || a.appName.includes('AWS')).length;

  const handleToggle = (accountId: string) => {
    setExpandedAccountId(prev => prev === accountId ? null : accountId);
  };

  if (accounts.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader><CardTitle>Linked Accounts</CardTitle></CardHeader>
        <CardContent><p className="text-slate-500">No linked accounts found.</p></CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 pt-4">
      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-xl font-bold">{accounts.length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-slate-500">Active</p>
          <p className="text-xl font-bold text-green-600">{activeCount}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-slate-500">Disabled</p>
          <p className="text-xl font-bold text-slate-500">{disabledCount}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-slate-500">Privileged</p>
          <p className="text-xl font-bold text-amber-600">{privilegedCount}</p>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Linked Accounts</CardTitle>
          <CardDescription>Click any row for detailed account information</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account: Account) => (
                <AccountRow 
                  key={account.id} 
                  account={account}
                  isExpanded={expandedAccountId === account.id}
                  onToggle={() => handleToggle(account.id)}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default IdentityAccountsTab;
