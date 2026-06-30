import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccessAnalysis } from '@/contexts/AccessAnalysisContext';
import { Filter, Save } from 'lucide-react';
import { toast } from 'sonner';

interface AdvancedFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdvancedFiltersModal = ({ open, onOpenChange }: AdvancedFiltersModalProps) => {
  const { activeFilters, updateFilters } = useAccessAnalysis();
  const [departments, setDepartments] = useState<string[]>(activeFilters.departments);
  const [riskLevels, setRiskLevels] = useState<string[]>(activeFilters.riskLevels);
  const [searchQuery, setSearchQuery] = useState(activeFilters.searchQuery);

  const handleApply = () => {
    updateFilters({
      departments,
      riskLevels: riskLevels as any,
      searchQuery,
    });
    toast.success('Filters applied successfully');
    onOpenChange(false);
  };

  const handleSavePreset = () => {
    toast.success('Filter preset saved');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
          </DialogTitle>
          <DialogDescription>
            Configure multiple filters to narrow down your analysis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Department Filter */}
          <div className="space-y-3">
            <Label className="text-base">Departments</Label>
            <div className="grid grid-cols-2 gap-3">
              {['Engineering', 'Finance', 'HR', 'Sales', 'Marketing', 'Operations'].map(dept => (
                <div key={dept} className="flex items-center space-x-2">
                  <Checkbox
                    id={dept}
                    checked={departments.includes(dept)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setDepartments([...departments, dept]);
                      } else {
                        setDepartments(departments.filter(d => d !== dept));
                      }
                    }}
                  />
                  <label htmlFor={dept} className="text-sm cursor-pointer">{dept}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Level Filter */}
          <div className="space-y-3">
            <Label className="text-base">Risk Levels</Label>
            <div className="grid grid-cols-2 gap-3">
              {['critical', 'high', 'medium', 'low'].map(level => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={level}
                    checked={riskLevels.includes(level)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setRiskLevels([...riskLevels, level]);
                      } else {
                        setRiskLevels(riskLevels.filter(l => l !== level));
                      }
                    }}
                  />
                  <label htmlFor={level} className="text-sm cursor-pointer capitalize">{level}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="space-y-3">
            <Label htmlFor="search">Search Query</Label>
            <Input
              id="search"
              placeholder="Search users, roles, entitlements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <Label>Date Range</Label>
            <Select defaultValue="30d">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleSavePreset}>
            <Save className="h-4 w-4 mr-2" />
            Save Preset
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
