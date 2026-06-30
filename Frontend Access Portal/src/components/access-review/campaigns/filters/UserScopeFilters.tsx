import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Search } from 'lucide-react';
import { mockDepartments, mockLocations } from '@/data/mock-iga-entities';
import InfoTooltip from '@/components/dashboard/InfoTooltip';

interface UserScopeFiltersProps {
  filters: any;
  updateFilters: (filters: any) => void;
}

const UserScopeFilters = ({ filters, updateFilters }: UserScopeFiltersProps) => {
  const [deptSearch, setDeptSearch] = useState('');
  const [locSearch, setLocSearch] = useState('');

  const toggleArrayValue = (key: string, value: string) => {
    const current = filters[key] || [];
    const updated = current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value];
    updateFilters({ ...filters, [key]: updated });
  };

  const updateValue = (key: string, value: any) => {
    updateFilters({ ...filters, [key]: value });
  };

  const selectAll = (key: string, items: string[]) => updateFilters({ ...filters, [key]: [...items] });
  const clearAll = (key: string) => updateFilters({ ...filters, [key]: [] });

  const filteredDepts = mockDepartments.filter(d => d.toLowerCase().includes(deptSearch.toLowerCase()));
  const filteredLocs = mockLocations.slice(0, 8).filter(l => l.toLowerCase().includes(locSearch.toLowerCase()));
  const deptCount = (filters.departments || []).length;
  const locCount = (filters.locations || []).length;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Label>Departments</Label>
            <InfoTooltip text="Filter users by organizational department to narrow the review scope" />
            {deptCount > 0 && <Badge variant="secondary" className="text-xs">{deptCount} selected</Badge>}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => selectAll('departments', mockDepartments)}>All</Button>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => clearAll('departments')}>Clear</Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search departments..." value={deptSearch} onChange={e => setDeptSearch(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        <div className="flex flex-wrap gap-2">
          {filteredDepts.map(dept => (
            <Badge key={dept} variant={filters.departments?.includes(dept) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleArrayValue('departments', dept)}>{dept}</Badge>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Label>Locations</Label>
            <InfoTooltip text="Filter by office location or region" />
            {locCount > 0 && <Badge variant="secondary" className="text-xs">{locCount} selected</Badge>}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => selectAll('locations', mockLocations.slice(0, 8))}>All</Button>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => clearAll('locations')}>Clear</Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search locations..." value={locSearch} onChange={e => setLocSearch(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        <div className="flex flex-wrap gap-2">
          {filteredLocs.map(loc => (
            <Badge key={loc} variant={filters.locations?.includes(loc) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleArrayValue('locations', loc)}>{loc}</Badge>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label>Risk Score Range: {filters.riskScoreMin || 0} - {filters.riskScoreMax || 100}</Label>
          <InfoTooltip text="Include only users within this risk score range" />
        </div>
        <div className="px-2">
          <Slider value={[filters.riskScoreMin || 0, filters.riskScoreMax || 100]} onValueChange={(v) => updateFilters({ ...filters, riskScoreMin: v[0], riskScoreMax: v[1] })} min={0} max={100} step={5} className="w-full" />
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label>Access Patterns</Label>
          <InfoTooltip text="Include users matching specific access risk patterns" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="high-risk" checked={filters.includeHighRisk} onCheckedChange={(c) => updateValue('includeHighRisk', c)} />
            <Label htmlFor="high-risk" className="font-normal">Users with high-risk access</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="sod-violations" checked={filters.includeSoDViolations} onCheckedChange={(c) => updateValue('includeSoDViolations', c)} />
            <Label htmlFor="sod-violations" className="font-normal">Users with SoD violations</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="dormant" checked={filters.dormantDays !== undefined} onCheckedChange={(c) => updateValue('dormantDays', c ? 90 : undefined)} />
            <Label htmlFor="dormant" className="font-normal">
              Dormant accounts (no login in{' '}
              {filters.dormantDays !== undefined ? (
                <Input type="number" value={filters.dormantDays || 90} onChange={(e) => updateValue('dormantDays', parseInt(e.target.value))} className="inline-block w-16 mx-1" min={1} />
              ) : '90'} days)
            </Label>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label>Exclusions</Label>
          <InfoTooltip text="Exclude specific account types from the review scope" />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="exclude-service" checked={filters.excludeServiceAccounts} onCheckedChange={(c) => updateValue('excludeServiceAccounts', c)} />
          <Label htmlFor="exclude-service" className="font-normal">Exclude service accounts</Label>
        </div>
      </div>
    </div>
  );
};

export default UserScopeFilters;
