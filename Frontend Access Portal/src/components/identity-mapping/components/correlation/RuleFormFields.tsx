import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CorrelationRule, IdentityType } from "../../types/index";
import {
  CORRELATION_TARGET_ATTRIBUTES_BY_TYPE,
  CONFLICT_RESOLUTION_OPTIONS,
} from "../../data/correlationConstants";

interface RuleFormFieldsProps {
  rule: CorrelationRule;
  identityType: IdentityType;
  onUpdateRule: (updates: Partial<CorrelationRule>) => void;
}

export const RuleFormFields: React.FC<RuleFormFieldsProps> = ({
  rule,
  identityType,
  onUpdateRule,
}) => {
  const targetAttributes = CORRELATION_TARGET_ATTRIBUTES_BY_TYPE[identityType];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Source Attribute</Label>
          <Input
            value={rule.sourceAttribute}
            onChange={(e) => onUpdateRule({ sourceAttribute: e.target.value })}
            placeholder="e.g., employeeId, email"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Target Attribute</Label>
          <Select
            value={rule.targetAttribute}
            onValueChange={(value) => onUpdateRule({ targetAttribute: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select target attribute" />
            </SelectTrigger>
            <SelectContent>
              {targetAttributes.map((attr) => (
                <SelectItem key={attr} value={attr}>
                  {attr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4">
        <Label className="text-sm font-medium">Join Condition</Label>
        <Input
          value={rule.joinCondition}
          onChange={(e) => onUpdateRule({ joinCondition: e.target.value })}
          placeholder="e.g., employeeId == employeeId AND status == 'Active'"
          className="font-mono"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <Label className="text-sm font-medium">Conflict Resolution</Label>
          <Select
            value={rule.conflictResolution}
            onValueChange={(
              value: "first-wins" | "last-wins" | "manual-review"
            ) => onUpdateRule({ conflictResolution: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONFLICT_RESOLUTION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};
