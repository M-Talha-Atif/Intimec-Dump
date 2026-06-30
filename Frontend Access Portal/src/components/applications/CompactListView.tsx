
import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ChevronDown, Shield, ShieldOff, Search, AppWindow, ArrowUp, ArrowDown, View, Edit, Activity, CheckCircle2, CircleDot } from 'lucide-react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { mockApplications, Application } from "@/data/mock-applications";
import { Input } from "../ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getStatusBadgeClass, getSeverityBadgeClass } from '@/utils/getBadgeClass';
import { cn } from '@/lib/utils';

function getRiskLevel(app: Application): 'High' | 'Medium' | 'Low' {
  if (app.riskyCount > 20) return 'High';
  if (app.riskyCount > 0) return 'Medium';
  return 'Low';
}

// Risk and status colors now come from centralized getBadgeClass utilities

const CompactListView = ({ onEdit, onViewDetails }: { onEdit: (app: Application) => void; onViewDetails: (app: Application) => void; }) => {
  const [columns, setColumns] = useState({
    users: true,
    orphan: true,
    risky: true,
    source: true,
    flows: true,
    lastSync: true,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Application, direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });

  const requestSort = (key: keyof Application) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredApplications = useMemo(() => {
    const filtered = mockApplications.filter(app =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    let sortableItems = [...filtered];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [searchTerm, sortConfig]);

  const SortableHeader = ({
    columnKey,
    children,
    className
  }: {
    columnKey: keyof Application;
    children: React.ReactNode;
    className?: string;
  }) => (
    <TableHead className={className}>
      <Button variant="ghost" onClick={() => requestSort(columnKey)} className="-ml-4 hover:bg-muted">
        {children}
        {sortConfig.key === columnKey ? (
          sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
        ) : <div className="ml-2 h-4 w-4"/>}
      </Button>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="search"
            placeholder="Search applications..."
            className="bg-background rounded-md pl-10 pr-4 py-2 w-full sm:w-80 border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem checked={columns.users} onCheckedChange={(checked) => setColumns(prev => ({ ...prev, users: !!checked }))}>Users</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={columns.orphan} onCheckedChange={(checked) => setColumns(prev => ({ ...prev, orphan: !!checked }))}>Orphan</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={columns.risky} onCheckedChange={(checked) => setColumns(prev => ({ ...prev, risky: !!checked }))}>Risky</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={columns.source} onCheckedChange={(checked) => setColumns(prev => ({ ...prev, source: !!checked }))}>Source</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={columns.flows} onCheckedChange={(checked) => setColumns(prev => ({ ...prev, flows: !!checked }))}>Flows</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={columns.lastSync} onCheckedChange={(checked) => setColumns(prev => ({ ...prev, lastSync: !!checked }))}>Last Sync</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary Bar */}
      <div className="flex items-center gap-4 px-4 py-2.5 bg-muted/50 rounded-lg border text-sm text-muted-foreground">
        <span>Total: <strong className="text-foreground">{mockApplications.length}</strong></span>
        <span>Connected: <strong className="text-foreground">{mockApplications.filter(a => a.status === 'Connected').length}</strong></span>
        <span>Authoritative: <strong className="text-foreground">{mockApplications.filter(a => a.source === 'authoritative').length}</strong></span>
        <span>At Risk: <strong className="text-foreground">{mockApplications.filter(a => a.riskyCount > 20).length}</strong></span>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox />
              </TableHead>
              <SortableHeader columnKey="name">App</SortableHeader>
              {columns.users && <SortableHeader columnKey="users"><div className="flex items-center gap-1">Users <InfoTooltip text="Total number of identities with active access to this application." /></div></SortableHeader>}
              {columns.orphan && <SortableHeader columnKey="orphanCount"><div className="flex items-center gap-1">Orphan <InfoTooltip text="Accounts in this application with no matching identity in the identity store. Orphan accounts are a security risk and should be deactivated." /></div></SortableHeader>}
              {columns.risky && <SortableHeader columnKey="riskyCount"><div className="flex items-center gap-1">Risky <InfoTooltip text="Users with access anomalies such as excessive permissions, SoD violations, or unreviewed entitlements." /></div></SortableHeader>}
              <TableHead><div className="flex items-center gap-1">Risk Level <InfoTooltip text="Aggregate risk assessment based on orphan accounts, risky users, and governance coverage. High-risk apps need priority remediation." /></div></TableHead>
              {columns.source && <SortableHeader columnKey="source"><div className="flex items-center gap-1">Source <InfoTooltip text="Authoritative sources are the system of record for identity data. Non-authoritative apps receive identity data from upstream sources." /></div></SortableHeader>}
              {columns.flows && <SortableHeader columnKey="flows"><div className="flex items-center gap-1">Flows <InfoTooltip text="Number of provisioning and deprovisioning workflows configured. Apps without flows require manual access management." /></div></SortableHeader>}
              {columns.lastSync && <SortableHeader columnKey="lastSync"><div className="flex items-center gap-1">Last Sync <InfoTooltip text="When the connector last synchronized identity and access data. Stale syncs may indicate connector issues." /></div></SortableHeader>}
              <SortableHeader columnKey="status"><div className="flex items-center gap-1">Status <InfoTooltip text="Current connector health. Connection problems may cause provisioning delays or data inconsistencies." /></div></SortableHeader>
              <TableHead><div className="flex items-center gap-1">Governance <InfoTooltip text="Governance readiness indicators: owner assignment, workflow configuration, and certification coverage." /></div></TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredApplications.map((app: Application) => {
              const riskLevel = getRiskLevel(app);
              const hasOwner = app.source === 'authoritative' || app.id % 3 !== 0;
              const hasWorkflows = app.flows > 0;
              const hasCert = app.id % 3 !== 2;
              return (
              <TableRow 
                key={app.id} 
                className={`cursor-pointer ${getRiskLevel(app) === 'High' ? "bg-destructive/5 hover:bg-destructive/10" : ""}`}
                onClick={() => onViewDetails(app)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 bg-muted rounded-md p-2">
                      <AppWindow className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{app.name}</div>
                      <div className="text-sm text-muted-foreground">{app.category}</div>
                    </div>
                  </div>
                </TableCell>
                {columns.users && <TableCell>{app.users}</TableCell>}
                {columns.orphan && <TableCell>{app.orphanCount}</TableCell>}
                {columns.risky && <TableCell>{app.riskyCount}</TableCell>}
                <TableCell>
                  <Badge className={cn(getSeverityBadgeClass(riskLevel), "border text-xs")}>{riskLevel}</Badge>
                </TableCell>
                {columns.source && (
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          {app.source === 'authoritative' ? <Shield className="h-5 w-5 text-green-600" /> : <ShieldOff className="h-5 w-5 text-muted-foreground" />}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{app.source === 'authoritative' ? 'Authoritative' : 'Non-Authoritative'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                )}
                {columns.flows && (
                  <TableCell>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                      <span>{app.flows}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
                {columns.lastSync && <TableCell>{app.lastSync}</TableCell>}
                <TableCell>
                  <Badge className={cn(getStatusBadgeClass(app.status), "border text-xs")}>
                    {app.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CheckCircle2 className={`h-3.5 w-3.5 ${hasOwner ? 'text-green-600' : 'text-muted-foreground/30'}`} />
                      </TooltipTrigger>
                      <TooltipContent><p>Owner {hasOwner ? 'Assigned' : 'Missing'}</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CircleDot className={`h-3.5 w-3.5 ${hasWorkflows ? 'text-green-600' : 'text-muted-foreground/30'}`} />
                      </TooltipTrigger>
                      <TooltipContent><p>Workflows {hasWorkflows ? 'Configured' : 'Not Configured'}</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Shield className={`h-3.5 w-3.5 ${hasCert ? 'text-green-600' : 'text-muted-foreground/30'}`} />
                      </TooltipTrigger>
                      <TooltipContent><p>Certification {hasCert ? 'Active' : 'Inactive'}</p></TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => onViewDetails(app)}>
                        <View className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onEdit(app)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Activity className="mr-2 h-4 w-4" />
                        Audit Logs
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              );
            })}

          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CompactListView;
