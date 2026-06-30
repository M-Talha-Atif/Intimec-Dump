import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Search } from 'lucide-react';
import { mockApplications } from '@/data/mock-iga-entities';
import InfoTooltip from '@/components/dashboard/InfoTooltip';

interface ApplicationScopeFiltersProps {
  filters: any;
  updateFilters: (filters: any) => void;
}

const ApplicationScopeFilters = ({ filters, updateFilters }: ApplicationScopeFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const toggleArrayValue = (key: string, value: string) => {
    const current = filters[key] || [];
    const updated = current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value];
    updateFilters({ ...filters, [key]: updated });
  };

  const filteredApps = mockApplications.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const selectedCount = (filters.applicationIds || []).length;
  const categories = [...new Set(mockApplications.map(app => app.category))];

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Label>Select Applications</Label>
            <InfoTooltip text="Choose specific applications whose user access will be reviewed" />
            {selectedCount > 0 && <Badge variant="secondary" className="text-xs">{selectedCount} selected</Badge>}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => updateFilters({ ...filters, applicationIds: mockApplications.map(a => a.id) })}>All</Button>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => updateFilters({ ...filters, applicationIds: [] })}>Clear</Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search applications..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          {filteredApps.map(app => (
            <div key={app.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center space-x-2">
                <Checkbox id={app.id} checked={filters.applicationIds?.includes(app.id)} onCheckedChange={() => toggleArrayValue('applicationIds', app.id)} />
                <div>
                  <Label htmlFor={app.id} className="font-normal text-sm">{app.name}</Label>
                  <p className="text-xs text-muted-foreground">{app.users} users</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">{app.category}</Badge>
                <Badge variant={app.criticality === 'critical' || app.criticality === 'high' ? 'destructive' : 'secondary'} className="text-xs">{app.criticality}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label>Categories</Label>
          <InfoTooltip text="Filter applications by business function category" />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Badge key={cat} variant={filters.categories?.includes(cat) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleArrayValue('categories', cat)}>{cat}</Badge>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label>Criticality</Label>
          <InfoTooltip text="Filter by application criticality classification" />
        </div>
        <div className="flex flex-wrap gap-2">
          {['critical', 'high', 'medium', 'low'].map(level => (
            <Badge key={level} variant={filters.criticalities?.includes(level) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleArrayValue('criticalities', level)}>{level}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApplicationScopeFilters;
