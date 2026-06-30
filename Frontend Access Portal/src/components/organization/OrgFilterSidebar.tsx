
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterState {
  search: string;
  riskLevels: string[];
  hasStaleRoles: boolean;
  minUserCount: number;
  regions: string[];
}

interface OrgFilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  isOpen: boolean;
  onClose: () => void;
}

const OrgFilterSidebar = ({ filters, onFiltersChange, isOpen, onClose }: OrgFilterSidebarProps) => {
  if (!isOpen) return null;

  const handleRiskLevelToggle = (riskLevel: string) => {
    const newRiskLevels = filters.riskLevels.includes(riskLevel)
      ? filters.riskLevels.filter(r => r !== riskLevel)
      : [...filters.riskLevels, riskLevel];
    
    onFiltersChange({ ...filters, riskLevels: newRiskLevels });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      riskLevels: [],
      hasStaleRoles: false,
      minUserCount: 0,
      regions: []
    });
  };

  return (
    <div className="w-80 border-r bg-white overflow-y-auto">
      <Card className="border-0 rounded-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Organization</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Unit name, head, or ID..."
                value={filters.search}
                onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Risk Levels */}
          <div className="space-y-3">
            <Label>Risk Levels</Label>
            <div className="space-y-2">
              {['High', 'Medium', 'Low'].map((risk) => (
                <div key={risk} className="flex items-center space-x-2">
                  <Checkbox
                    id={`risk-${risk}`}
                    checked={filters.riskLevels.includes(risk)}
                    onCheckedChange={() => handleRiskLevelToggle(risk)}
                  />
                  <Label htmlFor={`risk-${risk}`} className="text-sm">
                    <Badge className={
                      risk === 'High' ? 'bg-red-100 text-red-800' :
                      risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }>
                      {risk} Risk
                    </Badge>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Minimum User Count */}
          <div className="space-y-2">
            <Label htmlFor="minUserCount">Minimum User Count</Label>
            <Input
              id="minUserCount"
              type="number"
              min="0"
              value={filters.minUserCount}
              onChange={(e) => onFiltersChange({ 
                ...filters, 
                minUserCount: parseInt(e.target.value) || 0 
              })}
              placeholder="0"
            />
          </div>

          {/* Stale Roles */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="stale-roles"
              checked={filters.hasStaleRoles}
              onCheckedChange={(checked) => 
                onFiltersChange({ ...filters, hasStaleRoles: checked as boolean })
              }
            />
            <Label htmlFor="stale-roles" className="text-sm">
              Has stale roles (12+ months)
            </Label>
          </div>

          {/* Clear Filters */}
          <Button variant="outline" onClick={clearFilters} className="w-full">
            Clear All Filters
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrgFilterSidebar;
