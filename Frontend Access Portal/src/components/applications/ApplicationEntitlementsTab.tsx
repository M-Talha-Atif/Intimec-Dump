import React, { useMemo, useState } from 'react';
import { Application } from '@/data/mock-applications';
import { mockEntitlements, Entitlement } from '@/data/mock-entitlements';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Download, EyeOff, ShieldAlert, ChevronDown, ChevronRight, Scale, Tag, Archive, ShieldOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRiskBadgeClass } from '@/utils/getRiskColor';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { EntitlementDetailContent } from './EntitlementDetailContent';
import { Checkbox } from '@/components/ui/checkbox';
import { EntitlementComparisonDialog } from './EntitlementComparisonDialog';
import InfoTooltip from '@/components/dashboard/InfoTooltip';

type ApplicationEntitlementsTabProps = {
  application: Application;
};


const classificationColorMap: Record<string, string> = {
  'High Risk': 'bg-red-50 text-red-700 border-red-200',
  'SOX': 'bg-purple-50 text-purple-700 border-purple-200',
  'GDPR': 'bg-blue-50 text-blue-700 border-blue-200',
  'PII': 'bg-amber-50 text-amber-700 border-amber-200',
};

const EntitlementRow = ({ item, isSelected, onSelect }: { item: Entitlement; isSelected: boolean; onSelect: (checked: boolean) => void }) => {
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
              {item.displayName}
            </div>
          </TableCell>
          <TableCell><Badge variant="outline" className="text-xs">{item.type}</Badge></TableCell>
          <TableCell>
            <Badge className={cn('font-semibold text-xs', getRiskBadgeClass(item.risk))}>{item.risk}</Badge>
          </TableCell>
          <TableCell>
            <div className="flex flex-wrap gap-1">
              {item.classification.length > 0 ? item.classification.map(c => (
                <Badge key={c} variant="outline" className={cn('text-[10px] px-1.5', classificationColorMap[c] || '')}>{c}</Badge>
              )) : <span className="text-xs text-muted-foreground">—</span>}
            </div>
          </TableCell>
          <TableCell>
            {item.requestable
              ? <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Yes</Badge>
              : <span className="text-xs text-muted-foreground">No</span>
            }
          </TableCell>
          <TableCell className="text-sm">{item.owner || <Badge variant="destructive" className="text-xs">Unowned</Badge>}</TableCell>
          <TableCell className="text-sm text-muted-foreground">{item.assignedUsersCount ?? '—'}</TableCell>
          <TableCell onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Trigger Review</DropdownMenuItem>
                <DropdownMenuItem>Assign Owner</DropdownMenuItem>
                <DropdownMenuItem>Deprecate</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        <CollapsibleContent asChild>
          <TableRow>
            <TableCell colSpan={9} className="p-0">
              <EntitlementDetailContent entitlement={item} />
            </TableCell>
          </TableRow>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
};

const ApplicationEntitlementsTab = ({ application }: ApplicationEntitlementsTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<Entitlement[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const entitlements = useMemo(() => {
    return mockEntitlements.filter(e => e.application === application.name);
  }, [application.name]);

  const handleSelectItem = (item: Entitlement, checked: boolean) => {
    setSelectedItems(prev =>
      checked ? [...prev, item] : prev.filter(i => i.id !== item.id)
    );
  };

  // Summary counts
  const totalCount = entitlements.length;
  const highRiskCount = entitlements.filter(e => e.risk === 'High').length;
  const unownedCount = entitlements.filter(e => !e.owner).length;
  const deprecatedCount = entitlements.filter(e => e.lifecycle === 'Deprecated').length;
  const unclassifiedCount = entitlements.filter(e => e.classification.length === 0).length;

  const filteredEntitlements = useMemo(() => {
    return entitlements
      .filter(item => item.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(item => {
        if (activeFilters.length === 0) return true;
        return activeFilters.every(filter => {
          if (filter === 'orphan') return !item.owner;
          if (filter === 'high_risk') return item.risk === 'High';
          if (filter === 'unclassified') return item.classification.length === 0;
          if (filter === 'deprecated') return item.lifecycle === 'Deprecated';
          if (filter === 'no_cert') return !item.reviewHistory || item.reviewHistory.length === 0;
          return true;
        });
      });
  }, [entitlements, searchTerm, activeFilters]);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  if (entitlements.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">No entitlements found for this application.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="flex items-center gap-4 py-2 px-3 bg-muted/40 rounded-lg border text-xs">
        <span className="font-medium text-foreground">Summary:</span>
        <span><strong>{totalCount}</strong> Total</span>
        <span className="text-red-700"><strong>{highRiskCount}</strong> High Risk</span>
        <span className="text-amber-700"><strong>{unownedCount}</strong> Unowned</span>
        <span className="text-muted-foreground"><strong>{deprecatedCount}</strong> Deprecated</span>
        <span className="text-muted-foreground"><strong>{unclassifiedCount}</strong> Unclassified</span>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by display name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant={activeFilters.includes('orphan') ? 'secondary' : 'outline'} size="sm" onClick={() => toggleFilter('orphan')}>
            <EyeOff className="mr-1.5 h-3.5 w-3.5" /> Orphan
          </Button>
          <Button variant={activeFilters.includes('high_risk') ? 'secondary' : 'outline'} size="sm" onClick={() => toggleFilter('high_risk')}>
            <ShieldAlert className="mr-1.5 h-3.5 w-3.5" /> High Risk
          </Button>
          <Button variant={activeFilters.includes('unclassified') ? 'secondary' : 'outline'} size="sm" onClick={() => toggleFilter('unclassified')}>
            <Tag className="mr-1.5 h-3.5 w-3.5" /> Unclassified
          </Button>
          <Button variant={activeFilters.includes('deprecated') ? 'secondary' : 'outline'} size="sm" onClick={() => toggleFilter('deprecated')}>
            <Archive className="mr-1.5 h-3.5 w-3.5" /> Deprecated
          </Button>
          <Button variant={activeFilters.includes('no_cert') ? 'secondary' : 'outline'} size="sm" onClick={() => toggleFilter('no_cert')}>
            <ShieldOff className="mr-1.5 h-3.5 w-3.5" /> No Certification
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
                <div className="flex items-center gap-1">Display Name <InfoTooltip text="The business-friendly name of this entitlement." /></div>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">Risk <InfoTooltip text="Risk classification based on privilege level and data sensitivity." /></div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">Classification <InfoTooltip text="Regulatory and sensitivity classifications applied to this entitlement." /></div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">Requestable <InfoTooltip text="Whether users can self-request this entitlement through the access catalog." /></div>
              </TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Users</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntitlements.map((item) => (
              <EntitlementRow
                key={item.id}
                item={item}
                isSelected={selectedItems.some(s => s.id === item.id)}
                onSelect={(checked) => handleSelectItem(item, !!checked)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      {filteredEntitlements.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">No matching entitlements found.</div>
      )}
      <EntitlementComparisonDialog
        isOpen={isCompareOpen}
        onOpenChange={setIsCompareOpen}
        entitlements={selectedItems}
      />
    </div>
  );
};

export default ApplicationEntitlementsTab;
