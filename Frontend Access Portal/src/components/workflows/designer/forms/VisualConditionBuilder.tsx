"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface ConditionRule {
  id: string;
  leftOperand: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  rightOperand: string;
  logicalOp?: 'AND' | 'OR';
}

interface VisualConditionBuilderProps {
  conditions?: ConditionRule[];
  onChange: (conditions: ConditionRule[]) => void;
}

export const VisualConditionBuilder: React.FC<VisualConditionBuilderProps> = ({
  conditions = [],
  onChange
}) => {
  const [localConditions, setLocalConditions] = useState<ConditionRule[]>(
    conditions.length > 0 ? conditions : [{
      id: `rule-${Date.now()}`,
      leftOperand: '',
      operator: 'equals',
      rightOperand: '',
    }]
  );

  const updateConditions = (updated: ConditionRule[]) => {
    setLocalConditions(updated);
    onChange(updated);
  };

  const addCondition = (logicalOp: 'AND' | 'OR' = 'AND') => {
    updateConditions([...localConditions, {
      id: `rule-${Date.now()}`,
      leftOperand: '',
      operator: 'equals',
      rightOperand: '',
      logicalOp
    }]);
  };

  const removeCondition = (id: string) => {
    updateConditions(localConditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, updates: Partial<ConditionRule>) => {
    updateConditions(
      localConditions.map(c => c.id === id ? { ...c, ...updates } : c)
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Condition Rules</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => addCondition('AND')}>
              <Plus className="h-3 w-3 mr-1" />
              AND
            </Button>
            <Button variant="outline" size="sm" onClick={() => addCondition('OR')}>
              <Plus className="h-3 w-3 mr-1" />
              OR
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {localConditions.map((condition, index) => (
          <div key={condition.id} className="space-y-2">
            {index > 0 && (
              <div className="text-center text-sm text-muted-foreground">
                {condition.logicalOp}
              </div>
            )}
            <Card className="border-l-4 border-l-blue-400">
              <CardContent className="p-3">
                <div className="grid grid-cols-7 gap-2 items-end">
                  <div className="col-span-2">
                    <Label className="text-xs">Variable</Label>
                    <Input
                      value={condition.leftOperand}
                      onChange={(e) => updateCondition(condition.id, { leftOperand: e.target.value })}
                      placeholder="identity.department"
                      className="text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Operator</Label>
                    <Select
                      value={condition.operator}
                      onValueChange={(value: any) => updateCondition(condition.id, { operator: value })}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">equals</SelectItem>
                        <SelectItem value="not_equals">not equals</SelectItem>
                        <SelectItem value="contains">contains</SelectItem>
                        <SelectItem value="greater_than">greater than</SelectItem>
                        <SelectItem value="less_than">less than</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Value</Label>
                    <Input
                      value={condition.rightOperand}
                      onChange={(e) => updateCondition(condition.id, { rightOperand: e.target.value })}
                      placeholder="Value"
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCondition(condition.id)}
                      disabled={localConditions.length === 1}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
