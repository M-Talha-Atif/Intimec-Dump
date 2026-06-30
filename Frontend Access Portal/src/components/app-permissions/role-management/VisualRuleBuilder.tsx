import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';
import {
  USER_FIELDS,
  getOperatorsForFieldType,
  getOperatorLabel,
  type UserField,
  type OperatorType,
} from '@/types/userFields';

export interface RuleCondition {
  id: string;
  field: string;
  operator: OperatorType;
  value: string;
  logicalOperator?: 'AND' | 'OR'; // Connects to next condition
}

interface VisualRuleBuilderProps {
  initialConditions?: RuleCondition[];
  onChange: (script: string) => void;
}

export const VisualRuleBuilder: React.FC<VisualRuleBuilderProps> = ({
  initialConditions = [],
  onChange,
}) => {
  const [conditions, setConditions] = useState<RuleCondition[]>(
    initialConditions.length > 0
      ? initialConditions
      : [
          {
            id: crypto.randomUUID(),
            field: '',
            operator: '==' as OperatorType,
            value: '',
            logicalOperator: 'AND',
          },
        ]
  );

  const generateScript = (currentConditions: RuleCondition[]): string => {
    const validConditions = currentConditions.filter(
      (c) => c.field && c.operator
    );

    if (validConditions.length === 0) {
      return '';
    }

    const scriptParts = validConditions.map((condition, index) => {
      const field = USER_FIELDS.find((f) => f.name === condition.field);
      if (!field) return '';

      const fieldPath = field.path;
      let conditionScript = '';

      // Handle null checks
      if (condition.operator === 'isNull') {
        conditionScript = `${fieldPath} == null`;
      } else if (condition.operator === 'isNotNull') {
        conditionScript = `${fieldPath} != null`;
      } else {
        // Handle value formatting based on field type
        let formattedValue = condition.value;

        if (field.type === 'string' || field.type === 'enum') {
          formattedValue = `'${condition.value}'`;
        } else if (field.type === 'boolean') {
          formattedValue = condition.value.toLowerCase();
        } else if (field.type === 'timestamp') {
          // For timestamps, keep as string for comparison
          formattedValue = `'${condition.value}'`;
        }

        // Handle string operators
        if (condition.operator === 'contains') {
          conditionScript = `${fieldPath}.contains(${formattedValue})`;
        } else if (condition.operator === 'startsWith') {
          conditionScript = `${fieldPath}.startsWith(${formattedValue})`;
        } else if (condition.operator === 'endsWith') {
          conditionScript = `${fieldPath}.endsWith(${formattedValue})`;
        } else {
          conditionScript = `${fieldPath} ${condition.operator} ${formattedValue}`;
        }
      }

      // Add logical operator if not the last condition
      if (index < validConditions.length - 1) {
        const logicalOp = condition.logicalOperator === 'OR' ? '||' : '&&';
        conditionScript += ` ${logicalOp} `;
      }

      return conditionScript;
    });

    return scriptParts.join('');
  };

  const updateConditions = (newConditions: RuleCondition[]) => {
    setConditions(newConditions);
    const script = generateScript(newConditions);
    onChange(script);
  };

  const addCondition = () => {
    const newCondition: RuleCondition = {
      id: crypto.randomUUID(),
      field: '',
      operator: '==' as OperatorType,
      value: '',
      logicalOperator: 'AND',
    };
    updateConditions([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    if (conditions.length > 1) {
      updateConditions(conditions.filter((c) => c.id !== id));
    }
  };

  const updateCondition = (
    id: string,
    updates: Partial<RuleCondition>
  ) => {
    const newConditions = conditions.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    updateConditions(newConditions);
  };

  const getSelectedField = (fieldName: string): UserField | undefined => {
    return USER_FIELDS.find((f) => f.name === fieldName);
  };

  const renderValueInput = (condition: RuleCondition) => {
    const field = getSelectedField(condition.field);
    if (!field) return null;

    // No value input for null checks
    if (condition.operator === 'isNull' || condition.operator === 'isNotNull') {
      return null;
    }

    // Enum select
    if (field.type === 'enum' && field.enumValues) {
      return (
        <Select
          value={condition.value}
          onValueChange={(value) =>
            updateCondition(condition.id, { value })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {field.enumValues.map((enumValue) => (
              <SelectItem key={enumValue} value={enumValue}>
                {enumValue}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Boolean select
    if (field.type === 'boolean') {
      return (
        <Select
          value={condition.value}
          onValueChange={(value) =>
            updateCondition(condition.id, { value })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    // Number input
    if (field.type === 'number') {
      return (
        <Input
          type="number"
          value={condition.value}
          onChange={(e) =>
            updateCondition(condition.id, { value: e.target.value })
          }
          placeholder="Enter number"
          className="w-full"
        />
      );
    }

    // Timestamp input
    if (field.type === 'timestamp') {
      return (
        <Input
          type="datetime-local"
          value={condition.value}
          onChange={(e) =>
            updateCondition(condition.id, { value: e.target.value })
          }
          className="w-full"
        />
      );
    }

    // Default string input
    return (
      <Input
        type="text"
        value={condition.value}
        onChange={(e) =>
          updateCondition(condition.id, { value: e.target.value })
        }
        placeholder="Enter value"
        className="w-full"
      />
    );
  };

  return (
    <div className="space-y-4">
      {conditions.map((condition, index) => (
        <Card key={condition.id}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                {/* Field Select */}
                <div className="md:col-span-3">
                  <label className="text-sm font-medium mb-2 block">
                    Field
                  </label>
                  <Select
                    value={condition.field}
                    onValueChange={(value) => {
                      const field = USER_FIELDS.find((f) => f.name === value);
                      const operators = field
                        ? getOperatorsForFieldType(field.type)
                        : [];
                      updateCondition(condition.id, {
                        field: value,
                        operator: operators[0],
                        value: '',
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_FIELDS.map((field) => (
                        <SelectItem key={field.name} value={field.name}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Operator Select */}
                <div className="md:col-span-3">
                  <label className="text-sm font-medium mb-2 block">
                    Operator
                  </label>
                  <Select
                    value={condition.operator}
                    onValueChange={(value) =>
                      updateCondition(condition.id, {
                        operator: value as OperatorType,
                      })
                    }
                    disabled={!condition.field}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {condition.field &&
                        getOperatorsForFieldType(
                          getSelectedField(condition.field)!.type
                        ).map((op) => (
                          <SelectItem key={op} value={op}>
                            {getOperatorLabel(op)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Value Input */}
                <div className="md:col-span-4">
                  <label className="text-sm font-medium mb-2 block">
                    Value
                  </label>
                  {renderValueInput(condition)}
                </div>

                {/* Logical Operator (if not last) */}
                {index < conditions.length - 1 && (
                  <div className="md:col-span-1">
                    <label className="text-sm font-medium mb-2 block">
                      Join
                    </label>
                    <Select
                      value={condition.logicalOperator || 'AND'}
                      onValueChange={(value: 'AND' | 'OR') =>
                        updateCondition(condition.id, {
                          logicalOperator: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Delete Button */}
                <div className={`md:col-span-1 ${index < conditions.length - 1 ? '' : 'md:col-start-9'}`}>
                  <label className="text-sm font-medium mb-2 block opacity-0">
                    Delete
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCondition(condition.id)}
                    disabled={conditions.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Field Description */}
              {condition.field && getSelectedField(condition.field)?.description && (
                <p className="text-xs text-muted-foreground">
                  {getSelectedField(condition.field)?.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addCondition}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Condition
      </Button>

      {/* Generated Script Preview */}
      {generateScript(conditions) && (
        <Card className="bg-muted">
          <CardContent className="pt-6">
            <label className="text-sm font-medium mb-2 block">
              Generated Script
            </label>
            <code className="text-xs break-all">
              {generateScript(conditions)}
            </code>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
