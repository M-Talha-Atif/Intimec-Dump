import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Search } from 'lucide-react';
import { mockRoles } from '@/data/mock-iga-entities';
import InfoTooltip from '@/components/dashboard/InfoTooltip';

interface RoleScopeFiltersProps {
  filters: any;
  updateFilters: (filters: any) => void;
}

const RoleScopeFilters = ({ filters, updateFilters }: RoleScopeFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const toggleArrayValue = (key: string, value: string) => {
    const current = filters[key] || [];
    const updated = current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value];
    updateFilters({ ...filters, [key]: updated });
  };

  const updateValue = (key: string, value: any) => updateFilters({ ...filters, [key]: value });

  const filteredRoles = mockRoles.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const selectedCount = (filters.roleIds || []).length;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Label>Select Roles</Label>
            <InfoTooltip text="Choose specific roles to include in the review scope" />
            {selectedCount > 0 && <Badge variant="secondary" className="text-xs">{selectedCount} selected</Badge>}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => updateFilters({ ...filters, roleIds: mockRoles.map(r => r.id) })}>All</Button>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => updateFilters({ ...filters, roleIds: [] })}>Clear</Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search roles..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          {filteredRoles.map(role => (
            <div key={role.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center space-x-2">
                <Checkbox id={role.id} checked={filters.roleIds?.includes(role.id)} onCheckedChange={() => toggleArrayValue('roleIds', role.id)} />
                <div>
                  <Label htmlFor={role.id} className="font-normal text-sm">{role.name}</Label>
                  <p className="text-xs text-muted-foreground">{role.members} members</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">{role.type}</Badge>
                <Badge variant={role.riskLevel === 'critical' || role.riskLevel === 'high' ? 'destructive' : 'secondary'} className="text-xs">{role.riskLevel}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label>Risk Levels</Label>
          <InfoTooltip text="Filter roles by their assigned risk classification" />
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
          <InfoTooltip text="Include roles with specific governance concerns" />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="sod-conflicts" checked={filters.includeSoDConflicts} onCheckedChange={(c) => updateValue('includeSoDConflicts', c)} />
          <Label htmlFor="sod-conflicts" className="font-normal">Roles with SoD conflicts</Label>
        </div>
      </div>
    </div>
  );
};

export default RoleScopeFilters;
