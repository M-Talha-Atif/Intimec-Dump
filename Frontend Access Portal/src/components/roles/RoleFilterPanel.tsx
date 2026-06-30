
import * as React from 'react';
import { Role, RoleFilterState } from '@/types/roles';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RoleFilterPanelProps {
  filters: RoleFilterState;
  onFiltersChange: (filters: RoleFilterState) => void;
}

const ROLE_TYPES: Role['type'][] = ['Functional Role', 'Business Role', 'Application Role', 'Technical Role'];
const STATUSES: Role['status'][] = ['enabled', 'disabled'];
const RISK_LEVELS: NonNullable<Role['risk']>['score'][] = ['Low', 'Medium', 'High'];
const CLASSIFICATIONS: Role['classification'][] = ['Admin Role', 'Privileged', 'Sensitive', 'Standard'];
const BUSINESS_UNITS: Role['businessUnit'][] = ['Finance', 'Human Resources', 'Engineering', 'Marketing'];

const FilterGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="py-4 border-b last:border-b-0">
    <h4 className="text-sm font-semibold mb-3 text-foreground">{title}</h4>
    <div className="space-y-3">{children}</div>
  </div>
);

const RoleFilterPanel = ({ filters, onFiltersChange }: RoleFilterPanelProps) => {
  
  const handleCheckboxChange = <K extends keyof RoleFilterState>(
    category: K, 
    value: RoleFilterState[K][number]
  ) => {
    const currentFilters = filters[category] as Array<RoleFilterState[K][number]>;

    const newFilterCategory = currentFilters.includes(value)
      ? currentFilters.filter((item) => item !== value)
      : [...currentFilters, value];
    
    onFiltersChange({
      ...filters,
      [category]: newFilterCategory,
    });
  };
  
  return (
    <ScrollArea className="flex-1 -mx-6 px-6">
      <FilterGroup title="Role Type">
        {ROLE_TYPES.map(type => (
          <div key={type} className="flex items-center space-x-2">
            <Checkbox 
              id={`type-${type}`} 
              checked={filters.types.includes(type)}
              onCheckedChange={() => handleCheckboxChange('types', type)}
            />
            <Label htmlFor={`type-${type}`} className="font-normal text-sm cursor-pointer">{type}</Label>
          </div>
        ))}
      </FilterGroup>
      
      <FilterGroup title="Status">
        {STATUSES.map(status => (
          <div key={status} className="flex items-center space-x-2">
            <Checkbox 
              id={`status-${status}`} 
              checked={filters.statuses.includes(status)}
              onCheckedChange={() => handleCheckboxChange('statuses', status)}
            />
            <Label htmlFor={`status-${status}`} className="font-normal text-sm cursor-pointer">{status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}</Label>
          </div>
        ))}
      </FilterGroup>

      <FilterGroup title="Classification">
        {CLASSIFICATIONS.map(cls => (
          <div key={cls} className="flex items-center space-x-2">
            <Checkbox 
              id={`cls-${cls}`} 
              checked={filters.classifications.includes(cls)}
              onCheckedChange={() => handleCheckboxChange('classifications', cls)}
            />
            <Label htmlFor={`cls-${cls}`} className="font-normal text-sm cursor-pointer">{cls}</Label>
          </div>
        ))}
      </FilterGroup>

      <FilterGroup title="Business Unit">
        {BUSINESS_UNITS.map(bu => (
          <div key={bu} className="flex items-center space-x-2">
            <Checkbox 
              id={`bu-${bu}`} 
              checked={filters.businessUnits.includes(bu)}
              onCheckedChange={() => handleCheckboxChange('businessUnits', bu)}
            />
            <Label htmlFor={`bu-${bu}`} className="font-normal text-sm cursor-pointer">{bu}</Label>
          </div>
        ))}
      </FilterGroup>
      
      <FilterGroup title="Risk Level">
        {RISK_LEVELS.map(risk => (
          <div key={risk} className="flex items-center space-x-2">
            <Checkbox 
              id={`risk-${risk}`} 
              checked={filters.risks.includes(risk)}
              onCheckedChange={() => handleCheckboxChange('risks', risk)}
            />
            <Label htmlFor={`risk-${risk}`} className="font-normal text-sm cursor-pointer">{risk}</Label>
          </div>
        ))}
      </FilterGroup>
    </ScrollArea>
  );
};

export default RoleFilterPanel;
