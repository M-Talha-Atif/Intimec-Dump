import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Search } from 'lucide-react';
import { mockEntitlements } from '@/data/mock-iga-entities';
import InfoTooltip from '@/components/dashboard/InfoTooltip';

interface EntitlementScopeFiltersProps {
  filters: any;
  updateFilters: (filters: any) => void;
}

const EntitlementScopeFilters = ({ filters, updateFilters }: EntitlementScopeFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const toggleArrayValue = (key: string, value: string) => {
    const current = filters[key] || [];
    const updated = current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value];
    updateFilters({ ...filters, [key]: updated });
  };

  const updateValue = (key: string, value: any) => updateFilters({ ...filters, [key]: value });

  const filteredEnts = mockEntitlements.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const selectedCount = (filters.entitlementIds || []).length;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Label>Select Entitlements</Label>
            <InfoTooltip text="Choose specific entitlements (permissions, privileges) to review" />
            {selectedCount > 0 && <Badge variant="secondary" className="text-xs">{selectedCount} selected</Badge>}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => updateFilters({ ...filters, entitlementIds: mockEntitlements.map(e => e.id) })}>All</Button>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => updateFilters({ ...filters, entitlementIds: [] })}>Clear</Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search entitlements..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          {filteredEnts.map(ent => (
            <div key={ent.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center space-x-2">
                <Checkbox id={ent.id} checked={filters.entitlementIds?.includes(ent.id)} onCheckedChange={() => toggleArrayValue('entitlementIds', ent.id)} />
                <div>
                  <Label htmlFor={ent.id} className="font-normal text-sm">{ent.name}</Label>
                  <p className="text-xs text-muted-foreground">{ent.app} • {ent.users} users</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">{ent.type}</Badge>
                <Badge variant={ent.riskLevel === 'critical' || ent.riskLevel === 'high' ? 'destructive' : 'secondary'} className="text-xs">{ent.riskLevel}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label>Risk Levels</Label>
          <InfoTooltip text="Filter entitlements by risk classification" />
        </div>
        <div className="flex flex-wrap gap-2">
          {['critical', 'high', 'medium', 'low'].map(level => (
            <Badge key={level} variant={filters.riskLevels?.includes(level) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleArrayValue('riskLevels', level)}>{level}</Badge>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label>Additional Filters</Label>
          <InfoTooltip text="Include entitlements with elevated privilege levels" />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="privileged-only" checked={filters.privilegedOnly} onCheckedChange={(c) => updateValue('privilegedOnly', c)} />
          <Label htmlFor="privileged-only" className="font-normal">Privileged entitlements only</Label>
        </div>
      </div>
    </div>
  );
};

export default EntitlementScopeFilters;
