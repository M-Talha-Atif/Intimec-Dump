import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Eye, Edit, Copy, Trash2, CheckCircle, XCircle, Users, Bot, Shield } from 'lucide-react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { IdentityGroup } from '@/services/groups';
import { format } from 'date-fns';
import { usePagination, StandardPagination } from '@/components/shared/StandardPagination';
import { getRiskBadgeClass } from '@/utils/getRiskColor';

interface GroupsDirectoryTableProps {
  groups: IdentityGroup[];
  onViewDetails: (groupId: string) => void;
  onViewMembers: (group: IdentityGroup) => void;
  onEdit: (group: IdentityGroup) => void;
  onClone: (groupId: string) => void;
  onDelete: (group: IdentityGroup) => void;
}

export default function GroupsDirectoryTable({ groups, onViewDetails, onViewMembers, onEdit, onClone, onDelete }: GroupsDirectoryTableProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'static' | 'dynamic'>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filtered = useMemo(() => {
    let result = [...groups];
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(g => g.name.toLowerCase().includes(term) || g.description.toLowerCase().includes(term));
    }
    if (typeFilter !== 'all') result = result.filter(g => g.type === typeFilter);
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'memberCount') cmp = a.memberCount - b.memberCount;
      else if (sortBy === 'riskLevel') { const order = { high: 3, medium: 2, low: 1 }; cmp = order[a.riskLevel] - order[b.riskLevel]; }
      else if (sortBy === 'createdAt') cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [groups, search, typeFilter, sortBy, sortOrder]);

  const { paginatedData: paginatedGroups, paginationProps } = usePagination(filtered, 10);

  const atRisk = groups.filter(g => g.riskLevel === 'high').length;
  const unowned = groups.filter(g => g.owners.length === 0).length;
  const staticCount = groups.filter(g => g.type === 'static').length;
  const dynamicCount = groups.filter(g => g.type === 'dynamic').length;

  const handleSort = (col: string) => {
    if (sortBy === col) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortOrder('asc'); }
  };

  const SortHead = ({ col, children }: { col: string; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer select-none hover:text-foreground" onClick={() => handleSort(col)}>
      <div className="flex items-center gap-1">
        {children}
        {sortBy === col && <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="flex flex-wrap gap-3 text-sm pt-4">
        <Badge variant="outline" className="font-normal">Total: {groups.length}</Badge>
        <Badge variant="outline" className="font-normal">Static: {staticCount}</Badge>
        <Badge variant="outline" className="font-normal">Dynamic: {dynamicCount}</Badge>
        <Badge variant="destructive" className="font-normal">At Risk: {atRisk}</Badge>
        <Badge variant="warning" className="font-normal">Unowned: {unowned}</Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search groups..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['all', 'static', 'dynamic'] as const).map(t => (
            <Button key={t} variant={typeFilter === t ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter(t)} className="capitalize">
              {t}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <SortHead col="name">Group Name</SortHead>
                <TableHead>Type</TableHead>
                <TableHead><div className="flex items-center gap-1">Owner <InfoTooltip text="The person accountable for this group's membership accuracy and governance compliance." /></div></TableHead>
                <SortHead col="memberCount">Members</SortHead>
                <SortHead col="riskLevel"><div className="flex items-center gap-1">Risk Level <InfoTooltip text="Calculated based on membership size, privilege level, ownership status, and certification recency. High-risk groups require priority review." /></div></SortHead>
                <TableHead><div className="flex items-center gap-1">Used In <InfoTooltip text="Applications where this group is used for access provisioning. Groups not linked to any application may be orphaned." /></div></TableHead>
                <TableHead><div className="flex items-center gap-1">Last Reviewed <InfoTooltip text="Date of the most recent membership review or certification. Groups not reviewed in 90+ days are flagged for compliance risk." /></div></TableHead>
                <SortHead col="createdAt">Created</SortHead>
                <TableHead><div className="flex items-center gap-1">Governance <InfoTooltip text="Visual indicators for governance controls: owner assignment and certification status. All indicators should be green for full compliance." /></div></TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedGroups.map(g => {
                const hasCert = !!(g.updatedAt && (Date.now() - new Date(g.updatedAt).getTime()) < 90 * 24 * 60 * 60 * 1000);
                return (
                  <TableRow key={g.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onViewDetails(g.id)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {g.type === 'dynamic' ? <Bot className="h-4 w-4 text-primary" /> : <Users className="h-4 w-4 text-muted-foreground" />}
                        <span className="font-medium">{g.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={g.type === 'dynamic' ? 'default' : 'secondary'} className="text-xs">{g.type}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{g.owners.length > 0 ? g.owners[0] : <span className="italic">Unassigned</span>}</TableCell>
                    <TableCell>{g.memberCount}</TableCell>
                    <TableCell>
                      <Badge className={getRiskBadgeClass(g.riskLevel)}>
                        {g.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {g.usedIn.length > 0 ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm">{g.usedIn[0]}{g.usedIn.length > 1 && <span className="text-muted-foreground ml-1">+{g.usedIn.length - 1}</span>}</span>
                            </TooltipTrigger>
                            <TooltipContent><p className="text-xs">{g.usedIn.join(', ')}</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : <span className="text-xs text-muted-foreground">None</span>}
                    </TableCell>
                    <TableCell className="text-sm">{g.updatedAt ? format(new Date(g.updatedAt), 'MMM d, yyyy') : <span className="text-muted-foreground">Never</span>}</TableCell>
                    <TableCell className="text-sm">{format(new Date(g.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <TooltipProvider><Tooltip><TooltipTrigger asChild>
                          {g.owners.length > 0 ? <CheckCircle className="h-3.5 w-3.5 text-green-600" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />}
                        </TooltipTrigger><TooltipContent><p className="text-xs">Owner: {g.owners.length > 0 ? 'Assigned' : 'Missing'}</p></TooltipContent></Tooltip></TooltipProvider>
                        <TooltipProvider><Tooltip><TooltipTrigger asChild>
                          {hasCert ? <Shield className="h-3.5 w-3.5 text-green-600" /> : <Shield className="h-3.5 w-3.5 text-muted-foreground" />}
                        </TooltipTrigger><TooltipContent><p className="text-xs">Certification: {hasCert ? 'Current' : 'Overdue'}</p></TooltipContent></Tooltip></TooltipProvider>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); onViewMembers(g); }}><Eye className="h-4 w-4 mr-2" />View Members</DropdownMenuItem>
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); onEdit(g); }}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); onClone(g.id); }}><Copy className="h-4 w-4 mr-2" />Clone</DropdownMenuItem>
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); onDelete(g); }} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8">No groups found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <StandardPagination {...paginationProps} />
        </CardContent>
      </Card>
    </div>
  );
}
