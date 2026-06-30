import React, { useMemo, useState } from 'react';
import { Application } from '@/data/mock-applications';
import { mockUsers, User, Account } from '@/data/mock-users';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Download, UserX, UserCog, ChevronDown, ChevronRight, Scale, ShieldAlert, Clock, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import ApplicationAccountDetail from './ApplicationAccountDetail';
import { Checkbox } from '@/components/ui/checkbox';
import { AccountComparisonDialog } from './AccountComparisonDialog';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { getStatusBadgeClass, getSeverityBadgeClass } from '@/utils/getBadgeClass';

type ApplicationAccountsTabProps = {
  application: Application;
};

type AccountWithUser = {
  id: string;
  appName: string;
  accountName: string;
  status: "Active" | "Disabled";
  lastSync: string;
  details?: Account['details'];
  user: User;
};

const riskBadge = (level: string) => {
  return <Badge className={cn(getSeverityBadgeClass(level), "border text-xs font-semibold")}>{level}</Badge>;
};

const AccountRow = ({ item, isSelected, onSelect }: { item: AccountWithUser; isSelected: boolean; onSelect: (checked: boolean) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible asChild open={isOpen} onOpenChange={setIsOpen}>
      <>
        <TableRow className="group">
          <TableCell onClick={(e) => e.stopPropagation()} className="w-10">
            <Checkbox checked={isSelected} onCheckedChange={onSelect} aria-label="Select row" />
          </TableCell>
          <TableCell className="font-medium">
            <div className="flex items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
              <span className="p-1">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </span>
              {item.accountName}
            </div>
          </TableCell>
          <TableCell>{item.user.name}</TableCell>
          <TableCell>
            <Badge className={cn(getStatusBadgeClass(item.status), "border text-xs")}>
              {item.status}
            </Badge>
          </TableCell>
          <TableCell>{riskBadge(item.user.riskLevel)}</TableCell>
          <TableCell>
            {item.user.isPrivileged ? <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">Yes</Badge> : <span className="text-muted-foreground">No</span>}
          </TableCell>
          <TableCell className="text-muted-foreground text-xs">{item.lastSync}</TableCell>
          <TableCell onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Correlate</DropdownMenuItem>
                <DropdownMenuItem>Certify Access</DropdownMenuItem>
                <DropdownMenuItem>Disable</DropdownMenuItem>
                <DropdownMenuItem>Investigate</DropdownMenuItem>
                <DropdownMenuItem>View JSON</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        <CollapsibleContent asChild>
          <TableRow>
            <TableCell colSpan={8} className="p-0">
              <ApplicationAccountDetail item={item} />
            </TableCell>
          </TableRow>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
};

const ApplicationAccountsTab = ({ application }: ApplicationAccountsTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<AccountWithUser[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const accountsWithUsers: AccountWithUser[] = useMemo(() => {
    return mockUsers.flatMap(user =>
      (user.accounts || [])
        .filter(acc => acc.appName === application.name)
        .map(account => ({ ...account, user }))
    );
  }, [application.name]);

  const handleSelectItem = (item: AccountWithUser, checked: boolean) => {
    setSelectedItems(prev =>
      checked ? [...prev, item] : prev.filter(i => i.id !== item.id)
    );
  };

  // Summary counts
  const totalCount = accountsWithUsers.length;
  const activeCount = accountsWithUsers.filter(a => a.status === 'Active').length;
  const disabledCount = accountsWithUsers.filter(a => a.status === 'Disabled').length;
  const orphanCount = accountsWithUsers.filter(a => a.user.isOrphan).length;
  const privilegedCount = accountsWithUsers.filter(a => a.user.isPrivileged).length;
  const staleCount = accountsWithUsers.filter(a => a.user.status === 'Stale').length;

  const filteredAccounts = useMemo(() => {
    return accountsWithUsers
      .filter(item =>
        item.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(item => {
        if (activeFilters.length === 0) return true;
        return activeFilters.every(filter => {
          if (filter === 'uncorrelated') return item.user.isOrphan;
          if (filter === 'disabled') return item.status === 'Disabled';
          if (filter === 'privileged') return item.user.isPrivileged;
          if (filter === 'stale') return item.user.status === 'Stale';
          if (filter === 'violations') return (item.user.policyViolations?.length ?? 0) > 0;
          return true;
        });
      });
  }, [accountsWithUsers, searchTerm, activeFilters]);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  if (accountsWithUsers.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">No accounts found for this application.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="flex items-center gap-4 py-2 px-3 bg-muted/40 rounded-lg border text-xs">
        <span className="font-medium text-foreground">Summary:</span>
        <span><strong>{totalCount}</strong> Total</span>
        <span className="text-green-700"><strong>{activeCount}</strong> Active</span>
        <span className="text-red-700"><strong>{disabledCount}</strong> Disabled</span>
        <span className="text-amber-700"><strong>{orphanCount}</strong> Orphan</span>
        <span className="text-orange-700"><strong>{privilegedCount}</strong> Privileged</span>
        <span className="text-muted-foreground"><strong>{staleCount}</strong> Stale</span>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by account or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant={activeFilters.includes('uncorrelated') ? 'secondary' : 'outline'} size="sm" onClick={() => toggleFilter('uncorrelated')}>
            <UserX className="mr-1.5 h-3.5 w-3.5" /> Uncorrelated
          </Button>
          <Button variant={activeFilters.includes('disabled') ? 'secondary' : 'outline'} size="sm" onClick={() => toggleFilter('disabled')}>
            <UserCog className="mr-1.5 h-3.5 w-3.5" /> Disabled
          </Button>
          <Button variant={activeFilters.includes('privileged') ? 'secondary' : 'outline'} size="sm" onClick={() => toggleFilter('privileged')}>
            <ShieldAlert className="mr-1.5 h-3.5 w-3.5" /> Privileged
          </Button>
          <Button variant={activeFilters.includes('stale') ? 'secondary' : 'outline'} size="sm" onClick={() => toggleFilter('stale')}>
            <Clock className="mr-1.5 h-3.5 w-3.5" /> Stale
          </Button>
          <Button variant={activeFilters.includes('violations') ? 'secondary' : 'outline'} size="sm" onClick={() => toggleFilter('violations')}>
            <AlertTriangle className="mr-1.5 h-3.5 w-3.5" /> Violations
          </Button>
          <div className="w-px h-6 bg-border" />
          <Button variant="outline" size="sm" disabled={selectedItems.length < 2} onClick={() => setIsCompareOpen(true)}>
            <Scale className="mr-1.5 h-3.5 w-3.5" /> Compare ({selectedItems.length})
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-1.5 h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>
                <div className="flex items-center gap-1">Account Name <InfoTooltip text="The unique account identifier within this application." /></div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">Correlated Identity <InfoTooltip text="The human identity linked to this account through correlation." /></div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">Risk <InfoTooltip text="Composite risk score based on entitlements, violations, and activity patterns." /></div>
              </TableHead>
              <TableHead>Privileged</TableHead>
              <TableHead>Last Sync</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccounts.map((item) => (
              <AccountRow
                key={item.id}
                item={item}
                isSelected={selectedItems.some(s => s.id === item.id)}
                onSelect={(checked) => handleSelectItem(item, !!checked)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      {filteredAccounts.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">No matching accounts found.</div>
      )}
      <AccountComparisonDialog
        isOpen={isCompareOpen}
        onOpenChange={setIsCompareOpen}
        accounts={selectedItems}
      />
    </div>
  );
};

export default ApplicationAccountsTab;
