import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Filter, Plus, X, Save } from 'lucide-react';
import { FilterGroup, FilterCondition } from '@/services/reportService';
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdvancedFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters?: FilterGroup;
  availableFields: string[];
  onSave?: (filters: FilterGroup) => void;
}

export const AdvancedFilterModal = ({
  open,
  onOpenChange,
  filters,
  availableFields,
  onSave
}: AdvancedFilterModalProps) => {
  const [filterGroup, setFilterGroup] = useState<FilterGroup>(
    filters || { operator: 'AND', conditions: [] }
  );
  const [presetName, setPresetName] = useState('');

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' },
    { value: 'gt', label: 'Greater Than' },
    { value: 'lt', label: 'Less Than' },
    { value: 'gte', label: 'Greater or Equal' },
    { value: 'lte', label: 'Less or Equal' },
    { value: 'in', label: 'In List' },
    { value: 'notIn', label: 'Not In List' },
    { value: 'isNull', label: 'Is Null' },
    { value: 'isNotNull', label: 'Is Not Null' },
    { value: 'regex', label: 'Regex Match' },
  ];

  const addCondition = () => {
    setFilterGroup(prev => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        { field: availableFields[0] || '', operator: 'equals', value: '' }
      ]
    }));
  };

  const removeCondition = (index: number) => {
    setFilterGroup(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const updateCondition = (index: number, updates: Partial<FilterCondition>) => {
    setFilterGroup(prev => ({
      ...prev,
      conditions: prev.conditions.map((cond, i) =>
        i === index ? { ...cond, ...updates } : cond
      )
    }));
  };

  const handleSave = () => {
    onSave?.(filterGroup);
    onOpenChange(false);
  };

  const saveAsPreset = () => {
    if (presetName) {
      const presets = JSON.parse(localStorage.getItem('filter_presets') || '[]');
      presets.push({
        id: crypto.randomUUID(),
        name: presetName,
        filters: filterGroup,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('filter_presets', JSON.stringify(presets));
      setPresetName('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Advanced Filters</span>
            <Badge variant="secondary">{filterGroup.conditions.length} conditions</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Label>Combine with:</Label>
            <Select
              value={filterGroup.operator}
              onValueChange={(value: 'AND' | 'OR') =>
                setFilterGroup(prev => ({ ...prev, operator: value }))
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">AND</SelectItem>
                <SelectItem value="OR">OR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {filterGroup.conditions.map((condition, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/50">
                  <Select
                    value={condition.field}
                    onValueChange={(value) => updateCondition(index, { field: value })}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFields.map((field) => (
                        <SelectItem key={field} value={field}>
                          {field}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={condition.operator}
                    onValueChange={(value: any) => updateCondition(index, { operator: value })}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {!['isNull', 'isNotNull'].includes(condition.operator) && (
                    <Input
                      value={condition.value}
                      onChange={(e) => updateCondition(index, { value: e.target.value })}
                      placeholder="Value"
                      className="flex-1"
                    />
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCondition(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {filterGroup.conditions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No filters applied. Click "Add Condition" to start.
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={addCondition}>
              <Plus className="h-4 w-4 mr-2" />
              Add Condition
            </Button>
            
            <div className="flex-1" />
            
            <Input
              placeholder="Preset name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="w-48"
            />
            <Button variant="outline" onClick={saveAsPreset} disabled={!presetName}>
              <Save className="h-4 w-4 mr-2" />
              Save Preset
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
