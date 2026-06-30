import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { FilterRule } from '@/types/access-portal';

interface VisualFilterBuilderProps {
  rules: FilterRule[];
  onChange: (rules: FilterRule[]) => void;
}

const FILTER_FIELDS = [
  { value: 'department', label: 'Department' },
  { value: 'riskLevel', label: 'Risk Level' },
  { value: 'location', label: 'Location' },

  { value: 'displayName', label: 'Display Name' },
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'email', label: 'Email' },

  { value: 'userName', label: 'Username' },
  { value: 'jobTitle', label: 'Job Title' },
  { value: 'employmentType', label: 'Employment Type' },

  { value: 'vendorName', label: 'Vendor Name' },
  { value: 'contractEndDate', label: 'Contract End Date' },
];


const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'notEquals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'in', label: 'In List' },
  { value: 'notIn', label: 'Not In List' },
  { value: 'greaterThan', label: 'Greater Than' },
  { value: 'lessThan', label: 'Less Than' },
];

const VisualFilterBuilder: React.FC<VisualFilterBuilderProps> = ({ rules, onChange }) => {
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // Memoize callbacks to prevent recreating on every render
  const addRule = useCallback(() => {
    const newRule: FilterRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      field: 'riskLevel',
      operator: 'equals',
      value: '',
      logicalOperator: rules.length > 0 ? 'AND' : undefined,
    };

    onChange([...rules, newRule]);
    setEditingRuleId(newRule.id);
  }, [rules, onChange]);

  const updateRule = useCallback((id: string, updates: Partial<FilterRule>) => {
    const updatedRules = rules.map(rule =>
      rule.id === id ? { ...rule, ...updates } : rule
    );
    onChange(updatedRules);
  }, [rules, onChange]);

  const deleteRule = useCallback((id: string) => {
    const newRules = rules.filter(rule => rule.id !== id);

    if (newRules.length > 0) {
      newRules[0] = { ...newRules[0], logicalOperator: undefined };
    }

    onChange(newRules);
  }, [rules, onChange]);

  // Memoize the rules to prevent unnecessary re-renders
  const memoizedRules = useMemo(() => rules, [rules]);

  const moveRule = useCallback((index: number, direction: 'up' | 'down') => {
    const newRules = [...rules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < rules.length) {
      [newRules[index], newRules[targetIndex]] = [newRules[targetIndex], newRules[index]];
      onChange(newRules);
    }
  }, [rules, onChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Filter Rules
          <Button size="sm" onClick={addRule}>
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {memoizedRules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No filter rules defined</p>
            <p className="text-sm mt-2">Click "Add Rule" to create your first filter</p>
          </div>
        ) : (
          memoizedRules.map((rule, index) => (
            <div key={rule.id} className="space-y-3">
              {index > 0 && rule.logicalOperator && (
                <div className="flex items-center justify-center">
                  <Badge variant="outline" className="font-mono">
                    {rule.logicalOperator}
                  </Badge>
                </div>
              )}
              <Card className="border-2">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 cursor-move"
                      >
                        <GripVertical className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label>Field</Label>
                        <Select
                          value={rule.field}
                          onValueChange={value => updateRule(rule.id, { field: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FILTER_FIELDS.map(field => (
                              <SelectItem key={field.value} value={field.value}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Operator</Label>
                        <Select
                          value={rule.operator}
                          onValueChange={value =>
                            updateRule(rule.id, { operator: value as any })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {OPERATORS.map(op => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Value</Label>
                        <Input
                          value={rule.value}
                          onChange={e => updateRule(rule.id, { value: e.target.value })}
                          placeholder="Enter value..."
                        />
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {index < rules.length - 1 && (
                    <div className="mt-3 pt-3">
                      <Label className="text-xs">Logical Operator for Next Rule</Label>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant={rules[index + 1]?.logicalOperator === 'AND' ? 'default' : 'outline'}
                          onClick={() =>
                            updateRule(rules[index + 1].id, { logicalOperator: 'AND' })
                          }
                        >
                          AND
                        </Button>
                        <Button
                          size="sm"
                          variant={rules[index + 1]?.logicalOperator === 'OR' ? 'default' : 'outline'}
                          onClick={() =>
                            updateRule(rules[index + 1].id, { logicalOperator: 'OR' })
                          }
                        >
                          OR
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))
        )}

        {memoizedRules.length > 0 && (
          <div className="pt-4 border-t">
            <Label className="text-sm font-semibold">Filter Preview</Label>
            <div className="mt-2 p-3 bg-muted rounded-md font-mono text-sm">
              {memoizedRules.map((rule, index) => (
                <span key={rule.id}>
                  {index > 0 && rule.logicalOperator && (
                    <span className="text-primary font-bold"> {rule.logicalOperator} </span>
                  )}
                  <span className="text-blue-600">{rule.field}</span>
                  <span className="text-muted-foreground"> {rule.operator} </span>
                  <span className="text-green-600">"{rule.value}"</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VisualFilterBuilder;
