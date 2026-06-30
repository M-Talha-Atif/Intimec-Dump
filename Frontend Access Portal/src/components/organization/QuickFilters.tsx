import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, CheckCircle, Clock, Building2, X } from 'lucide-react';

interface QuickFilter {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  filter: (node: any) => boolean;
}

const quickFilters: QuickFilter[] = [
  {
    id: 'high-risk',
    label: 'High Risk Units',
    icon: <AlertTriangle className="w-3 h-3" />,
    color: 'destructive',
    filter: (node) => node.riskLevel === 'High',
  },
  {
    id: 'non-compliant',
    label: 'Non-Compliant',
    icon: <Shield className="w-3 h-3" />,
    color: 'destructive',
    filter: (node) => node.complianceStatus === 'non-compliant',
  },
  {
    id: 'needs-review',
    label: 'Needs Review',
    icon: <Clock className="w-3 h-3" />,
    color: 'default',
    filter: (node) => {
      const reviewDate = node.nextReviewDate ? new Date(node.nextReviewDate) : null;
      return reviewDate && reviewDate < new Date();
    },
  },
  {
    id: 'stale-roles',
    label: 'Has Stale Roles',
    icon: <AlertTriangle className="w-3 h-3" />,
    color: 'default',
    filter: (node) => node.hasStaleRoles === true,
  },
  {
    id: 'large-units',
    label: 'Large Units (>500 users)',
    icon: <Building2 className="w-3 h-3" />,
    color: 'secondary',
    filter: (node) => node.userCount > 500,
  },
  {
    id: 'compliant',
    label: 'Fully Compliant',
    icon: <CheckCircle className="w-3 h-3" />,
    color: 'default',
    filter: (node) => node.complianceStatus === 'compliant',
  },
];

interface QuickFiltersProps {
  activeFilters: string[];
  onFilterToggle: (filterId: string) => void;
  onClearAll: () => void;
}

export function QuickFilters({ activeFilters, onFilterToggle, onClearAll }: QuickFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Quick Filters</h3>
        {activeFilters.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearAll} className="h-7 text-xs">
            <X className="w-3 h-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => {
          const isActive = activeFilters.includes(filter.id);
          return (
            <Badge
              key={filter.id}
              variant={isActive ? filter.color as any : 'outline'}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onFilterToggle(filter.id)}
            >
              {filter.icon}
              <span className="ml-1.5">{filter.label}</span>
            </Badge>
          );
        })}
      </div>
    </div>
  );
}

export { quickFilters };
