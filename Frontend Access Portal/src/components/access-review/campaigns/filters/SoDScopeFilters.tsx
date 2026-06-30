import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Search } from 'lucide-react';
import { mockSoDPolicies } from '@/data/mock-iga-entities';
import InfoTooltip from '@/components/dashboard/InfoTooltip';

interface SoDScopeFiltersProps {
  filters: any;
  updateFilters: (filters: any) => void;
}

const SoDScopeFilters = ({ filters, updateFilters }: SoDScopeFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const toggleArrayValue = (key: string, value: string) => {
    const current = filters[key] || [];
    const updated = current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value];
    updateFilters({ ...filters, [key]: updated });
  };

  const filteredPolicies = mockSoDPolicies.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const selectedCount = (filters.policyIds || []).length;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Label>Select SoD Policies</Label>
            <InfoTooltip text="Choose Segregation of Duties policies to review for active violations" />
            {selectedCount > 0 && <Badge variant="secondary" className="text-xs">{selectedCount} selected</Badge>}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => updateFilters({ ...filters, policyIds: mockSoDPolicies.map(p => p.id) })}>All</Button>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => updateFilters({ ...filters, policyIds: [] })}>Clear</Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search policies..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        <div className="space-y-1.5">
          {filteredPolicies.map(policy => (
            <div key={policy.id} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-2">
                <Checkbox id={policy.id} checked={filters.policyIds?.includes(policy.id)} onCheckedChange={() => toggleArrayValue('policyIds', policy.id)} />
                <div>
                  <Label htmlFor={policy.id} className="font-normal">{policy.name}</Label>
                  <p className="text-xs text-muted-foreground">{policy.violators} current violators</p>
                </div>
              </div>
              <Badge variant={policy.severity === 'critical' || policy.severity === 'high' ? 'destructive' : 'secondary'}>{policy.severity}</Badge>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label>Severity Levels</Label>
          <InfoTooltip text="Filter SoD policies by violation severity" />
        </div>
        <div className="flex flex-wrap gap-2">
          {['critical', 'high', 'medium', 'low'].map(severity => (
            <Badge key={severity} variant={filters.severities?.includes(severity) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleArrayValue('severities', severity)}>{severity}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SoDScopeFilters;
