
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockNhiAccounts = [
  { id: 'nhi_acc_1', application: 'AWS IAM', accountId: 'svc-prod-db-001', status: 'Active', authType: 'Access Key', lastSynced: '2025-02-26 08:00 AM', lastUsed: '2025-02-26 07:55 AM' },
  { id: 'nhi_acc_2', application: 'Azure AD', accountId: 'sp-database-service', status: 'Active', authType: 'Certificate', lastSynced: '2025-02-25 10:00 PM', lastUsed: '2025-02-25 09:45 PM' },
  { id: 'nhi_acc_3', application: 'GitHub Actions', accountId: 'github-ci-runner', status: 'Active', authType: 'OAuth Token', lastSynced: '2025-02-26 06:30 AM', lastUsed: '2025-02-26 06:15 AM' },
  { id: 'nhi_acc_4', application: 'Vault', accountId: 'vault-approle-db', status: 'Disabled', authType: 'AppRole', lastSynced: '2025-02-20 12:00 PM', lastUsed: '2025-02-15 04:00 PM' },
];

const NhiAccountsTab = ({ identity }: { identity: any }) => {
  const accounts = identity.accounts?.length ? identity.accounts : mockNhiAccounts;
  const activeCount = accounts.filter((a: any) => a.status === 'Active').length;
  const disabledCount = accounts.filter((a: any) => a.status === 'Disabled' || a.status === 'Inactive').length;

  return (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-bold">{accounts.length}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Active</p><p className="text-xl font-bold text-green-600">{activeCount}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Disabled</p><p className="text-xl font-bold text-slate-500">{disabledCount}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Credentials</p><p className="text-xl font-bold text-amber-600">{accounts.length}</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Linked Accounts & Credentials</CardTitle>
          <CardDescription>Service accounts and credentials linked to this identity</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application</TableHead>
                <TableHead>Account ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Auth Type</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account: any) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.application}</TableCell>
                  <TableCell className="font-mono text-xs">{account.accountId}</TableCell>
                  <TableCell>
                    <Badge variant={account.status === 'Active' ? 'default' : 'secondary'} className={cn(account.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800')}>
                      {account.status === 'Active' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                      {account.status}
                    </Badge>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{account.authType || 'API Key'}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{account.lastSynced || '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="outline" className="h-7 text-xs">Rotate</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500">Revoke</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default NhiAccountsTab;
